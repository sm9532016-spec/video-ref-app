import { NextRequest, NextResponse } from 'next/server';
import { getVideoById, deleteVideo } from '@/lib/services/videoService';

/**
 * GET /api/videos/[id] - Get a single video by ID
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const video = await getVideoById(id);

        if (!video) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Video not found',
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: video,
        });
    } catch (error) {
        console.error('Error fetching video:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch video',
            },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/videos/[id] - Delete a video
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const success = await deleteVideo(id);

        if (!success) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Video not found',
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Video deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting video:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to delete video',
            },
            { status: 500 }
        );
    }
}
