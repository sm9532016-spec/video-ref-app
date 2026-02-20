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

/**
 * Get metadata for a Behance project using web scraping (approximated)
 * Since we don't have a direct project API endoint easily without key context in this file structure,
 * we'll use a simple placeholder or try to fetch if we had the key. 
 * ideally we would use axios + cheerio here but let's stick to the pattern.
 * actually the plan involved axios/cheerio. let's add the imports if missing and implement.
 */
import * as cheerio from 'cheerio';

export async function getBehanceMetadata(url: string): Promise<Partial<VideoReference> | null> {
    try {
        const response = await axios.get(url, {
            headers: {
                // Mock UA to avoid basic blocking
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(response.data);

        // Standard OG tags usually work on Behance
        const title = $('meta[property="og:title"]').attr('content') || $('title').text() || '';
        const image = $('meta[property="og:image"]').attr('content') || '';
        const urlProperty = $('meta[property="og:url"]').attr('content') || url;

        // Try to find brand/owner
        let brand = $('meta[property="og:site_name"]').attr('content') || 'Behance';
        const author = $('meta[name="author"]').attr('content');
        const ownerName = $('.Project-ownerName-eH2').text() || $('.Owner-name-qaO').text() || author;

        if (ownerName) {
            brand = ownerName;
        }

        // --- Video Extraction Logic ---
        let embedUrl: string | undefined;

        // 1. Look for iframes (YouTube/Vimeo)
        $('iframe').each((i, el) => {
            const src = $(el).attr('src');
            if (src && (src.includes('youtube.com') || src.includes('youtu.be') || src.includes('vimeo.com'))) {
                // Determine if this is the "main" video. 
                // Behance projects might have multiple. We'll take the first one for now.
                if (!embedUrl) {
                    embedUrl = src;
                }
            }
        });

        // 2. Look for video tags (direct mp4)
        if (!embedUrl) {
            $('video').each((i, el) => {
                const src = $(el).attr('src');
                if (src && !embedUrl) {
                    embedUrl = src;
                }
                // Check sources if src attr is missing
                if (!embedUrl) {
                    $(el).find('source').each((j, source) => {
                        const sourceSrc = $(source).attr('src');
                        if (sourceSrc && !embedUrl) {
                            embedUrl = sourceSrc;
                        }
                    });
                }
            });
        }

        // 3. Look for Behance's own lazy-loaded module structure if needed (advanced)
        // (Skipped for now as iframe/video tag covers most cases)



        // 4. Extract Description / Text Content from embedded Redux state
        let description = '';
        const stateJson = $('#beconfig-store_state').html();
        if (stateJson) {
            try {
                const state = JSON.parse(stateJson);
                const project = state.project?.project;
                if (project) {
                    // Start with the main description if available
                    if (project.description) {
                        description += project.description + '\n\n';
                    }
                    // Append text from all text modules
                    const modules = project.modules || [];
                    modules.forEach((mod: any) => {
                        if (mod.type === 'text') {
                            const rawText = mod.text_plain || mod.text || '';
                            // Strip HTML tags if any remain
                            description += rawText.replace(/<[^>]*>?/gm, '') + '\n\n';
                        }
                    });
                }
            } catch (e) {
                console.error('Error parsing Behance state JSON for description:', e);
            }
        }

        // Fallback: grab all p tags if specific classes fail and no state found
        if (!description) {
            $('div.TEXT, .text-paragraph, .rich-text, p').each((i, el) => {
                const text = $(el).text().trim();
                const lowerText = text.toLowerCase();
                // Filter out short UI labels and common footer texts
                if (text.length > 20 &&
                    !lowerText.includes('do not sell or share my personal information') &&
                    !lowerText.includes('sell freelance services')) {
                    description += text + '\n\n';
                }
            });
        }

        return {
            title: title.replace(' on Behance', ''),
            brand: brand,
            thumbnailUrl: image,
            duration: 0,
            platform: 'behance',
            videoUrl: urlProperty,
            embedUrl: embedUrl,
            description: description.trim().substring(0, 5000) // Limit length
        };

    } catch (error) {
        console.error('Error fetching Behance metadata:', error);
        return null;
    }
}
