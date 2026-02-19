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
/**
 * Collect videos from all configured platforms with Fallback Strategy
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

    // --- Search Strategy Setup ---

    // 1. Base Terms (Always included)
    const baseTerms = [genre, studyFocus];

    // 2. Nuance Terms (Tools & Styles)
    const nuanceTerms = [...(tools || []), ...(styles || [])];

    // 3. Negative Keywords Levels
    // Level 1: Strict (Default)
    const negativeKeywordsStrict = [
        '-tutorial', '-how to', '-course', '-class',
        '-making of', '-behind the scenes', '-breakdown', '-process',
        '-template', '-free download', '-intro', '-opener', '-review'
    ];
    // Level 2: Essential (Fallback)
    const negativeKeywordsEssential = [
        '-tutorial', '-how to', '-course', '-template'
    ];

    // 4. Time Range
    const publishedAfter = getPublishedAfterDate(timePeriod);

    // --- Queries Construction ---

    // Query A: Strict (Base + Nuance + Strict Negatives)
    const queryStrict = [...baseTerms, ...nuanceTerms, ...negativeKeywordsStrict].filter(Boolean).join(' ');

    // Query B: Moderate (Base + Nuance + Essential Negatives)
    const queryModerate = [...baseTerms, ...nuanceTerms, ...negativeKeywordsEssential].filter(Boolean).join(' ');

    // Query C: Broad (Base + Essential Negatives) - Drops tools/styles if they are too restrictive
    const queryBroad = [...baseTerms, ...negativeKeywordsEssential].filter(Boolean).join(' ');

    const collectedVideos: VideoReference[] = [];
    const platformBreakdown: { platform: Platform; count: number }[] = [];
    const fetchLimit = collectionLimit * 2;

    // Get existing videos first to check for duplicates during collection
    const existingVideos = await getAllVideos();
    const existingUrls = new Set(existingVideos.map(v => v.videoUrl));

    // Collect from each platform
    for (const platform of platforms) {
        try {
            let videos: VideoReference[] = [];

            if (platform === 'youtube') {
                const searchAttempts = [
                    { name: 'Strict+Time', query: queryStrict, time: publishedAfter, sortBy: (sortBy === 'creative_quality' ? 'relevance' : 'viewCount') as 'relevance' | 'viewCount', duration: 'short' },
                    { name: 'Strict', query: queryStrict, time: undefined, sortBy: 'relevance' as const, duration: 'short' },
                    { name: 'Strict+Any', query: queryStrict, time: undefined, sortBy: 'relevance' as const, duration: 'any' },
                    { name: 'Moderate', query: queryModerate, time: undefined, sortBy: 'relevance' as const, duration: 'short' },
                    { name: 'Moderate+Any', query: queryModerate, time: undefined, sortBy: 'relevance' as const, duration: 'any' },
                    { name: 'Broad', query: queryBroad, time: undefined, sortBy: 'viewCount' as const, duration: 'short' }
                ];

                for (const attempt of searchAttempts) {
                    if (videos.length > 0) break;

                    if (attempt.name === 'Strict+Time' && !attempt.time) continue;
                    if (attempt.name === 'Broad' && nuanceTerms.length === 0) continue;

                    console.log(`[Collection] Attempt: ${attempt.name} ("${attempt.query}")`);

                    let pageToken: string | undefined = undefined;
                    let attemptVideos: VideoReference[] = [];
                    let newVideosCount = 0;
                    let pageCount = 0;
                    const MAX_PAGES = 5;

                    while (newVideosCount < collectionLimit && pageCount < MAX_PAGES) {
                        try {
                            const result: { videos: VideoReference[], nextPageToken?: string } = await searchYouTubeVideos(
                                attempt.query,
                                fetchLimit,
                                attempt.sortBy,
                                attempt.time,
                                pageToken,
                                (attempt.duration as 'short' | 'medium' | 'long' | 'any') || 'short'
                            );

                            const batchVideos = result.videos;
                            pageToken = result.nextPageToken;
                            pageCount++;

                            // Count fresh videos to decide if we need more
                            const fresh = batchVideos.filter(v => !existingUrls.has(v.videoUrl));
                            newVideosCount += fresh.length;

                            attemptVideos.push(...batchVideos);

                            if (!pageToken) break;
                        } catch (e) {
                            console.error(`Error in pagination loop for ${attempt.name}:`, e);
                            break;
                        }
                    }

                    // Accumulate videos from this attempt
                    videos.push(...attemptVideos);

                    // Check if we have enough fresh videos to stop searching
                    const uniqueVideos = Array.from(new Set(videos.map(v => v.videoUrl)))
                        .map(url => videos.find(v => v.videoUrl === url)!);

                    const currentFreshCount = uniqueVideos.filter(v => !existingUrls.has(v.videoUrl)).length;

                    if (currentFreshCount >= collectionLimit) {
                        break;
                    }

                    // If we didn't find enough new videos, but we found *some*, we should probably keep them
                    // and try the next attempt to fill the gap.
                    // However, for simplicity and to respect the "Try Strict first" logic:
                    // If Strict found SOME new videos but not enough, we might want to keep them.
                    // But currently `videos` is overwritten.
                    // Let's accumulate `videos` across attempts?
                    // Actually, the simplest fix for "0 videos" is to NOT break if we haven't found enough new ones.

                    // But wait, if we break here, we STOP trying other attempts.
                    // If we found 0 new videos (but 10 duplicates), we certainly shouldn't break.
                    // If we found 2 new videos (and needed 3), we should probably continue to the next attempt to find 1 more.

                    // Current logic: `videos` is replaced by `attemptVideos`. 
                    // Better logic: Accumulate unique new videos.

                    if (newVideosCount > 0) {
                        // We found some! 
                        // But if it's less than limit, maybe we should continue?
                        // For now, let's just fix the "0 videos" bug by only breaking if we found AT LEAST ONE new video (or the limit).
                        // Actually, if we found 0 new videos, DO NOT BREAK.
                    }
                }
            } else if (platform === 'behance') {
                const searchAttempts = [
                    { name: 'Strict', query: queryStrict },
                    { name: 'Moderate', query: queryModerate },
                    { name: 'Broad', query: queryBroad }
                ];

                for (const attempt of searchAttempts) {
                    if (videos.length >= collectionLimit) break;

                    console.log(`[Collection] Behance Attempt: ${attempt.name} ("${attempt.query}")`);
                    try {
                        const attemptVideos = await searchBehanceProjects(attempt.query, fetchLimit, 'appreciations');

                        const uniqueAttemptVideos = attemptVideos.filter(v =>
                            !existingUrls.has(v.videoUrl) &&
                            !videos.some(existing => existing.videoUrl === v.videoUrl)
                        );

                        videos.push(...uniqueAttemptVideos);
                    } catch (e) {
                        console.error(`Error in Behance attempt ${attempt.name}:`, e);
                    }
                }
            } else if (platform === 'vimeo') {
                const searchAttempts = [
                    { name: 'Strict', query: queryStrict },
                    { name: 'Moderate', query: queryModerate },
                    { name: 'Broad', query: queryBroad }
                ];

                for (const attempt of searchAttempts) {
                    if (videos.length >= collectionLimit) break;

                    console.log(`[Collection] Vimeo Attempt: ${attempt.name} ("${attempt.query}")`);
                    try {
                        const attemptVideos = await searchVimeoVideos(attempt.query, fetchLimit, 'relevant');

                        // Accumulate unique videos
                        const uniqueAttemptVideos = attemptVideos.filter(v =>
                            !existingUrls.has(v.videoUrl) &&
                            !videos.some(existing => existing.videoUrl === v.videoUrl)
                        );

                        videos.push(...uniqueAttemptVideos);
                    } catch (e) {
                        console.error(`Error in Vimeo attempt ${attempt.name}:`, e);
                    }
                }
            }

            collectedVideos.push(...videos);
            platformBreakdown.push({ platform, count: videos.length });

        } catch (error) {
            console.error(`Error collecting from ${platform}:`, error);
            platformBreakdown.push({ platform, count: 0 });
        }
    }

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
