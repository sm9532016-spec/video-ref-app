import { VideoReference, CollectionResult, Platform } from '@/types';
import { searchYouTubeVideos } from '../api/youtubeApi';
import { searchBehanceProjects } from '../api/behanceApi';
import { searchVimeoVideos } from '../api/vimeoApi';
import { getSettings } from './settingsService';
import { getAllVideos, createVideo, updateVideo } from './videoService';

/**
 * Collect videos from all configured platforms
 */
// Helper to get date from timePeriod
function getPublishedAfterDate(period: string): Date | undefined {
    const now = new Date();
    switch (period) {
        case '3_months':
            return new Date(now.setMonth(now.getMonth() - 3));
        case '6_months':
            return new Date(now.setMonth(now.getMonth() - 6));
        case '1_year':
            return new Date(now.setFullYear(now.getFullYear() - 1));
        case 'all':
        default:
            return undefined;
    }
}

/**
 * Collect videos from all configured platforms
 */
export async function collectVideos(): Promise<CollectionResult> {
    const settings = await getSettings();
    // Use new fields with fallbacks
    const {
        studyFocus = 'Motion Design',
        genre = 'Motion Graphics',
        tools = [],
        styles = [],
        timePeriod = '1_year',
        platforms = ['youtube'],
        collectionLimit = 3,
        sortBy = 'creative_quality'
    } = settings;

    // 1. Construct Quality-Focused Query
    // Base: "Motion Graphics" + "Motion Rhythm"
    const baseTerms = [genre, studyFocus];

    // Tools & Styles: "After Effects", "Minimal"
    const nuanceTerms = [...(tools || []), ...(styles || [])];

    // Negative Keywords (Crucial for "Finished Work Only")
    const negativeKeywords = [
        '-tutorial', '-how to', '-course', '-class', // Education
        '-making of', '-behind the scenes', '-breakdown', '-process', // Meta
        '-template', '-free download', '-intro', '-opener' // Assets
    ];

    // Combine: "Motion Graphics Motion Rhythm After Effects Minimal -tutorial ..."
    const searchQuery = [
        ...baseTerms,
        ...nuanceTerms,
        ...negativeKeywords
    ].filter(Boolean).join(' ');

    // 2. Determine Time Range
    const publishedAfter = getPublishedAfterDate(timePeriod);

    console.log(`[Collection] Query: "${searchQuery}" | After: ${publishedAfter?.toISOString() ?? 'ALL'}`);

    const collectedVideos: VideoReference[] = [];
    const platformBreakdown: { platform: Platform; count: number }[] = [];

    // Fetch 'collectionLimit' * 2 to filter and pick best
    const fetchLimit = collectionLimit * 2;

    // Collect from each platform
    for (const platform of platforms) {
        try {
            let videos: VideoReference[] = [];

            if (platform === 'youtube') {
                videos = await searchYouTubeVideos(
                    searchQuery,
                    fetchLimit,
                    sortBy === 'creative_quality' ? 'relevance' : 'viewCount', // 'relevance' implies likely to match quality focus
                    publishedAfter
                );
            } else if (platform === 'behance') {
                // Behance API update skipped for now, using existing signature
                videos = await searchBehanceProjects(
                    searchQuery,
                    fetchLimit,
                    'appreciations' // Default to quality metric
                );
            } else if (platform === 'vimeo') {
                videos = await searchVimeoVideos(
                    searchQuery,
                    fetchLimit,
                    'relevant'
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
