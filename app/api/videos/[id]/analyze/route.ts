import { NextRequest, NextResponse } from 'next/server';
import { getVideoById, updateVideo } from '@/lib/services/videoService';
import { analyzeVideo } from '@/lib/services/analysisService';

/**
 * POST /api/videos/[id]/analyze - Analyze a video using Gemini AI
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Get the video
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

        // Check if already analyzed
        if (video.analysis) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Video already has an analysis. Delete the existing analysis first if you want to re-analyze.',
                },
                { status: 400 }
            );
        }

        // Analyze the video
        const analysis = await analyzeVideo(video);

        // Update the video with the analysis
        const updatedVideo = await updateVideo(id, {
            analysis,
        });

        if (!updatedVideo) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Failed to save analysis',
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: updatedVideo,
        });
    } catch (error) {
        console.error('Error analyzing video:', error);

        // Check if it's a Gemini API error
        const errorMessage = error instanceof Error ? error.message : 'Failed to analyze video';

        return NextResponse.json(
            {
                success: false,
                error: errorMessage,
            },
            { status: 500 }
        );
    }
}
