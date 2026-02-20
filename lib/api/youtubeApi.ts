import axios from 'axios';
import { VideoReference, PopularityMetrics, CollectionSource } from '@/types';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

interface YouTubeVideo {
    id: { videoId: string };
    snippet: {
        title: string;
        description: string;
        thumbnails: {
            high: { url: string };
        };
        channelTitle: string;
        publishedAt: string;
    };
}

interface YouTubeVideoDetails {
    id: string;
    contentDetails: {
        duration: string; // ISO 8601 format (PT1M30S)
    };
    statistics: {
        viewCount: string;
        likeCount: string;
        commentCount: string;
    };
}

/**
 * Convert ISO 8601 duration to seconds
 */
function parseDuration(duration: string): number {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return 0;

    const hours = parseInt(match[1]) || 0;
    const minutes = parseInt(match[2]) || 0;
    const seconds = parseInt(match[3]) || 0;

    return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Calculate popularity score based on views and likes
 */
function calculatePopularityScore(views: number, likes: number): number {
    // Weighted formula: 70% views, 30% likes
    const viewScore = Math.log10(views + 1) * 0.7;
    const likeScore = Math.log10(likes + 1) * 0.3;
    return Math.round((viewScore + likeScore) * 100) / 100;
}

/**
 * Search YouTube videos by keywords
 */
/**
 * Search YouTube videos by keywords
 */
export async function searchYouTubeVideos(
    query: string,
    maxResults: number = 10,
    sortBy: 'viewCount' | 'relevance' | 'date' = 'viewCount',
    publishedAfter?: Date,
    pageToken?: string,
    videoDuration: 'short' | 'medium' | 'long' | 'any' = 'short'
): Promise<{ videos: VideoReference[]; nextPageToken?: string }> {
    if (!YOUTUBE_API_KEY) {
        throw new Error('YouTube API key is not configured');
    }

    try {
        // Step 1: Search for videos
        const searchResponse = await axios.get(`${YOUTUBE_API_BASE}/search`, {
            params: {
                key: YOUTUBE_API_KEY,
                q: query,
                part: 'snippet',
                type: 'video',
                maxResults,
                order: sortBy,
                videoDefinition: 'high',
                videoDuration: videoDuration === 'any' ? undefined : videoDuration,
                publishedAfter: publishedAfter ? publishedAfter.toISOString() : undefined,
                pageToken: pageToken,
            },
        });

        const videos: YouTubeVideo[] = searchResponse.data.items;
        const nextPageToken = searchResponse.data.nextPageToken;

        if (!videos || videos.length === 0) {
            return { videos: [] };
        }

        // Step 2: Get video details (duration and statistics)
        const videoIds = videos.map((v) => v.id.videoId).join(',');
        const detailsResponse = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
            params: {
                key: YOUTUBE_API_KEY,
                id: videoIds,
                part: 'contentDetails,statistics',
            },
        });

        const videoDetails: YouTubeVideoDetails[] = detailsResponse.data.items;

        // Step 3: Combine data and create VideoReference objects
        const videoReferences: VideoReference[] = videos.map((video, index) => {
            const details = videoDetails.find((d) => d.id === video.id.videoId);
            const views = parseInt(details?.statistics.viewCount || '0');
            const likes = parseInt(details?.statistics.likeCount || '0');
            const comments = parseInt(details?.statistics.commentCount || '0');

            const metrics: PopularityMetrics = {
                views,
                likes,
                comments,
                score: calculatePopularityScore(views, likes),
            };

            const source: CollectionSource = {
                platform: 'youtube',
                originalUrl: `https://www.youtube.com/watch?v=${video.id.videoId}`,
                collectedBy: 'auto',
                collectionDate: new Date(),
            };

            return {
                id: `yt-${video.id.videoId}-${Date.now()}`,
                title: video.snippet.title,
                description: video.snippet.description,
                thumbnailUrl: video.snippet.thumbnails.high.url,
                videoUrl: `https://www.youtube.com/watch?v=${video.id.videoId}`,
                brand: video.snippet.channelTitle,
                platform: 'youtube',
                duration: parseDuration(details?.contentDetails.duration || 'PT0S'),
                collectedAt: new Date(),
                source,
                metrics,
                tags: [query],
            };
        });

        // Sort by popularity score
        const sortedVideos = videoReferences.sort((a, b) => (b.metrics?.score || 0) - (a.metrics?.score || 0));

        return {
            videos: sortedVideos,
            nextPageToken
        };
    } catch (error) {
        console.error('Error searching YouTube:', error);
        throw new Error('Failed to search YouTube videos');
    }
}

/**
 * Get trending videos from YouTube
 */
export async function getTrendingVideos(
    category: string,
    maxResults: number = 10
): Promise<VideoReference[]> {
    // For now, use search with specific keywords
    // YouTube's trending API requires different authentication
    const result = await searchYouTubeVideos(`${category} tutorial`, maxResults, 'viewCount');
    return result.videos;
}

/**
 * Get metadata for a single YouTube video
 */
export async function getVideoMetadata(videoId: string): Promise<Partial<VideoReference> | null> {
    if (!YOUTUBE_API_KEY) return null;

    try {
        const response = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
            params: {
                key: YOUTUBE_API_KEY,
                id: videoId,
                part: 'snippet,contentDetails,statistics',
            },
        });

        const items = response.data.items;
        if (!items || items.length === 0) return null;

        const video = items[0];
        const duration = parseDuration(video.contentDetails?.duration || 'PT0S');

        return {
            title: video.snippet.title,
            brand: video.snippet.channelTitle,
            description: video.snippet.description,
            thumbnailUrl: video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.medium?.url,
            duration: duration,
            platform: 'youtube',
            videoUrl: `https://www.youtube.com/watch?v=${videoId}`
        };
    } catch (error) {
        console.error('Error fetching YouTube metadata:', error);
        return null;
    }
}
