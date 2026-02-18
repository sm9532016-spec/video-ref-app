import axios from 'axios';
import { VideoReference, PopularityMetrics, CollectionSource } from '@/types';

const BEHANCE_API_KEY = process.env.BEHANCE_API_KEY;
const BEHANCE_API_BASE = 'https://api.behance.net/v2';

interface BehanceProject {
    id: number;
    name: string;
    covers: {
        '404': string;
    };
    url: string;
    owners: Array<{
        display_name: string;
    }>;
    stats: {
        views: number;
        appreciations: number;
        comments: number;
    };
    published_on: number;
    fields: string[];
}

/**
 * Calculate popularity score for Behance projects
 */
function calculatePopularityScore(views: number, appreciations: number): number {
    const viewScore = Math.log10(views + 1) * 0.6;
    const likeScore = Math.log10(appreciations + 1) * 0.4;
    return Math.round((viewScore + likeScore) * 100) / 100;
}

/**
 * Search Behance projects by keywords
 * Note: Behance API doesn't have direct video search, so we search projects
 * and filter for those likely to contain videos (motion graphics, animation)
 */
export async function searchBehanceProjects(
    query: string,
    maxResults: number = 10,
    sortBy: 'views' | 'appreciations' | 'recent' = 'views'
): Promise<VideoReference[]> {
    if (!BEHANCE_API_KEY) {
        console.warn('Behance API key is not configured');
        return [];
    }

    try {
        // Add motion/video related keywords to query
        const videoQuery = `${query} motion graphics animation`;

        const response = await axios.get(`${BEHANCE_API_BASE}/projects`, {
            params: {
                api_key: BEHANCE_API_KEY,
                q: videoQuery,
                sort: sortBy === 'views' ? 'views' : sortBy === 'recent' ? 'published_date' : 'appreciations',
                per_page: maxResults * 2, // Get more to filter
                field: 'motion graphics|animation|video', // Filter by relevant fields
            },
        });

        const projects: BehanceProject[] = response.data.projects || [];

        // Convert to VideoReference format
        const videoReferences: VideoReference[] = projects
            .slice(0, maxResults)
            .map((project) => {
                const views = project.stats.views;
                const likes = project.stats.appreciations;

                const metrics: PopularityMetrics = {
                    views,
                    likes,
                    comments: project.stats.comments,
                    score: calculatePopularityScore(views, likes),
                };

                const source: CollectionSource = {
                    platform: 'behance',
                    originalUrl: project.url,
                    collectedBy: 'auto',
                    collectionDate: new Date(),
                };

                return {
                    id: `behance-${project.id}-${Date.now()}`,
                    title: project.name,
                    thumbnailUrl: project.covers['404'] || '',
                    videoUrl: project.url,
                    brand: project.owners[0]?.display_name || 'Unknown',
                    platform: 'behance',
                    duration: 60, // Behance doesn't provide duration, default to 60s
                    collectedAt: new Date(),
                    source,
                    metrics,
                    tags: [query, ...project.fields],
                };
            });

        return videoReferences.sort((a, b) => (b.metrics?.score || 0) - (a.metrics?.score || 0));
    } catch (error) {
        console.error('Error searching Behance:', error);
        return [];
    }
}
