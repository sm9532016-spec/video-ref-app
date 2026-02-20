import { NextRequest, NextResponse } from 'next/server';
import { getAllVideos, createVideo } from '@/lib/services/videoService';
import { VideoReference } from '@/types';

/**
 * GET /api/videos - Get all videos
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const platform = searchParams.get('platform');

        let videos = await getAllVideos();

        // Filter by platform if specified
        if (platform) {
            videos = videos.filter(v => v.platform === platform);
        }

        // Sort by collection date (newest first)
        videos.sort((a, b) => new Date(b.collectedAt).getTime() - new Date(a.collectedAt).getTime());

        return NextResponse.json({
            success: true,
            data: videos,
        });
    } catch (error) {
        console.error('Error fetching videos:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch videos',
            },
            { status: 500 }
        );
    }
}

/**
 * POST /api/videos - Create a new video reference
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        const { title, videoUrl, thumbnailUrl, brand, platform, duration } = body;

        if (!title || !videoUrl || !brand || !platform) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Missing required fields: title, videoUrl, brand, platform',
                },
                { status: 400 }
            );
        }

        // Validate platform
        const validPlatforms = ['meta', 'tiktok', 'youtube', 'vimeo', 'behance', 'other'];
        if (!validPlatforms.includes(platform)) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Invalid platform. Must be one of: ${validPlatforms.join(', ')}`,
                },
                { status: 400 }
            );
        }

        // Create video data
        const videoData: Omit<VideoReference, 'id' | 'collectedAt'> = {
            title,
            videoUrl,
            thumbnailUrl: thumbnailUrl || generatePlaceholderThumbnail(platform),
            brand,
            platform,
            duration: duration || 30, // Default to 30 seconds if not provided
            embedUrl: body.embedUrl,
            description: body.description,
        };

        const newVideo = await createVideo(videoData);

        return NextResponse.json(
            {
                success: true,
                data: newVideo,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating video:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to create video',
            },
            { status: 500 }
        );
    }
}

/**
 * Generate a placeholder thumbnail based on platform
 */
function generatePlaceholderThumbnail(platform: string): string {
    const placeholders: Record<string, string> = {
        meta: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=450&fit=crop',
        tiktok: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&h=450&fit=crop',
        youtube: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=800&h=450&fit=crop',
        vimeo: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=800&h=450&fit=crop', // Same as YT for now
        behance: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&h=450&fit=crop',
        other: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&h=450&fit=crop',
    };

    return placeholders[platform] || placeholders.other;
}
