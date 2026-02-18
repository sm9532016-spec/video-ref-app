import { VideoReference, CollectionResult, Platform } from '@/types';
import { searchYouTubeVideos } from '../api/youtubeApi';
import { searchBehanceProjects } from '../api/behanceApi';
import { searchVimeoVideos } from '../api/vimeoApi';
import { getSettings } from './settingsService';
import { getAllVideos, createVideo, updateVideo } from './videoService';

/**
 * Collect videos from all configured platforms
 */
export async function collectVideos(): Promise<CollectionResult> {
    const settings = await getSettings();
    const { topic, keywords, tools, genres, styles, timePeriod, platforms, collectionLimit, sortBy } = settings;

    // Build enhanced search query with advanced filters
    const searchTerms = [
        topic,
        ...keywords,
        ...(tools || []),
        ...(genres || []),
        ...(styles || []),
    ].filter(Boolean); // Remove empty values

    const searchQuery = searchTerms.join(' ');
    const collectedVideos: VideoReference[] = [];
    const platformBreakdown: { platform: Platform; count: number }[] = [];

    // Calculate videos per platform - fetch more to ensure we find new ones
    // Fetch 'collectionLimit' from EACH platform to have a large pool
    const videosPerPlatform = collectionLimit;

    // Collect from each platform
    for (const platform of platforms) {
        try {
            let videos: VideoReference[] = [];

            if (platform === 'youtube') {
                videos = await searchYouTubeVideos(
                    searchQuery,
                    videosPerPlatform,
                    sortBy === 'views' ? 'viewCount' : sortBy === 'recent' ? 'date' : 'relevance'
                );
            } else if (platform === 'behance') {
                videos = await searchBehanceProjects(
                    searchQuery,
                    videosPerPlatform,
                    sortBy === 'views' ? 'views' : sortBy === 'recent' ? 'recent' : 'appreciations'
                );
            } else if (platform === 'vimeo') {
                videos = await searchVimeoVideos(
                    searchQuery,
                    videosPerPlatform,
                    sortBy === 'views' ? 'plays' : sortBy === 'recent' ? 'date' : sortBy === 'likes' ? 'likes' : 'relevant'
                );
            }

            collectedVideos.push(...videos);
            platformBreakdown.push({
                platform,
                count: videos.length,
            });
        } catch (error) {
            console.error(`Error collecting from ${platform}:`, error);
            platformBreakdown.push({
                platform,
                count: 0,
            });
        }
    }

    // Get existing videos to filter out duplicates
    const existingVideos = await getAllVideos();
    const existingUrls = new Set(existingVideos.map(v => v.videoUrl));

    // Filter out ANY video that has been collected before
    const newVideos = collectedVideos.filter(v => !existingUrls.has(v.videoUrl));

    // Sort new videos by popularity score within each platform
    const videosByPlatform: Record<string, VideoReference[]> = {};
    for (const video of newVideos) {
        if (!videosByPlatform[video.platform]) {
            videosByPlatform[video.platform] = [];
        }
        videosByPlatform[video.platform].push(video);
    }

    // Sort each platform's videos by score
    for (const platform in videosByPlatform) {
        videosByPlatform[platform].sort((a, b) => (b.metrics?.score || 0) - (a.metrics?.score || 0));
    }

    // Round-robin selection to ensure diversity
    const sortedNewVideos: VideoReference[] = [];
    const activePlatforms = Object.keys(videosByPlatform);
    let iterations = 0;

    while (sortedNewVideos.length < collectionLimit && activePlatforms.length > 0 && iterations < collectionLimit * 2) {
        const platformIndex = iterations % activePlatforms.length;
        const platform = activePlatforms[platformIndex];
        const platformVideos = videosByPlatform[platform];

        if (platformVideos && platformVideos.length > 0) {
            sortedNewVideos.push(platformVideos.shift()!);
        } else {
            // No more videos for this platform, remove from rotation
            activePlatforms.splice(platformIndex, 1);
            // Adjust iteration count if we removed an item at or before current index
            if (iterations > 0) iterations--;
            continue;
        }
        iterations++;
    }

    // Save only the new videos
    let savedCount = 0;
    for (const video of sortedNewVideos) {
        const { id, collectedAt, ...videoData } = video;
        await createVideo({
            ...videoData,
            collectedAt: new Date(), // Reset collection time to now
            collectionHistory: []
        });
        savedCount++;
    }

    return {
        videos: sortedNewVideos,
        totalCollected: sortedNewVideos.length,
        newlySaved: savedCount,
        platformBreakdown,
        collectionDate: new Date(),
    };
}

/**
 * Get collection statistics
 */
export async function getCollectionStats() {
    const videos = await getAllVideos();
    const autoCollected = videos.filter(v => v.source?.collectedBy === 'auto');

    return {
        total: videos.length,
        autoCollected: autoCollected.length,
        manual: videos.length - autoCollected.length,
        lastCollection: autoCollected.length > 0
            ? autoCollected[0].collectedAt
            : null,
    };
}
