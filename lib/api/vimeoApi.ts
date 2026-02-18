import axios from 'axios';
import { VideoReference, PopularityMetrics, CollectionSource } from '@/types';

const VIMEO_ACCESS_TOKEN = process.env.VIMEO_ACCESS_TOKEN;
const VIMEO_API_BASE = 'https://api.vimeo.com';

interface VimeoVideo {
    uri: string;
    name: string;
    link: string;
    duration: number;
    pictures: {
        sizes: Array<{
            width: number;
            link: string;
        }>;
    };
    user: {
        name: string;
    };
    stats: {
        plays: number;
    };
    metadata: {
        connections: {
            likes: {
                total: number;
            };
            comments: {
                total: number;
            };
        };
    };
    created_time: string;
}

/**
 * Calculate popularity score for Vimeo videos
 */
function calculatePopularityScore(plays: number, likes: number): number {
    const playScore = Math.log10(plays + 1) * 0.7;
    const likeScore = Math.log10(likes + 1) * 0.3;
    return Math.round((playScore + likeScore) * 100) / 100;
}

/**
 * Search Vimeo videos by keywords
 */
export async function searchVimeoVideos(
    query: string,
    maxResults: number = 10,
    sortBy: 'plays' | 'likes' | 'date' | 'relevant' = 'plays'
): Promise<VideoReference[]> {
    if (!VIMEO_ACCESS_TOKEN) {
        console.warn('Vimeo access token is not configured');
        return [];
    }

    try {
        const response = await axios.get(`${VIMEO_API_BASE}/videos`, {
            headers: {
                'Authorization': `Bearer ${VIMEO_ACCESS_TOKEN}`,
                'Accept': 'application/vnd.vimeo.*+json;version=3.4',
            },
            params: {
                query,
                per_page: maxResults,
                sort: sortBy === 'plays' ? 'plays' : sortBy === 'date' ? 'date' : sortBy === 'likes' ? 'likes' : 'relevant',
                filter: 'embeddable',
                filter_embeddable: true,
                fields: 'uri,name,link,duration,pictures.sizes,user.name,stats.plays,metadata.connections.likes,metadata.connections.comments,created_time',
            },
        });

        const videos: VimeoVideo[] = response.data.data || [];

        // Convert to VideoReference format
        const videoReferences: VideoReference[] = videos.map((video) => {
            const plays = video.stats?.plays || 0;
            const likes = video.metadata?.connections?.likes?.total || 0;
            const comments = video.metadata?.connections?.comments?.total || 0;

            const metrics: PopularityMetrics = {
                views: plays,
                likes,
                comments,
                score: calculatePopularityScore(plays, likes),
            };

            // Get largest thumbnail
            const thumbnail = video.pictures?.sizes?.sort((a, b) => b.width - a.width)[0]?.link || '';

            const source: CollectionSource = {
                platform: 'vimeo',
                originalUrl: video.link,
                collectedBy: 'auto',
                collectionDate: new Date(),
            };

            // Extract video ID from URI (e.g., "/videos/123456" -> "123456")
            const videoId = video.uri.split('/').pop() || '';

            return {
                id: `vimeo-${videoId}-${Date.now()}`,
                title: video.name,
                thumbnailUrl: thumbnail,
                videoUrl: video.link,
                brand: video.user?.name || 'Unknown',
                platform: 'vimeo',
                duration: video.duration,
                collectedAt: new Date(),
                source,
                metrics,
                tags: [query],
            };
        });

        return videoReferences.sort((a, b) => (b.metrics?.score || 0) - (a.metrics?.score || 0));
    } catch (error) {
        console.error('Error searching Vimeo:', error);
        return [];
    }
}
