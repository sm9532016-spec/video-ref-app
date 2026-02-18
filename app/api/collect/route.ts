import { NextResponse } from 'next/server';
import { collectVideos } from '@/lib/services/collectionService';
import { ApiResponse, CollectionResult } from '@/types';

/**
 * POST /api/collect
 * Trigger video collection from configured platforms
 */
export async function POST() {
    try {
        const result = await collectVideos();

        const response: ApiResponse<CollectionResult> = {
            success: true,
            data: result,
        };

        return NextResponse.json(response);
    } catch (error: any) {
        console.error('Error collecting videos:', error);

        const response: ApiResponse<CollectionResult> = {
            success: false,
            error: error.message || 'Failed to collect videos',
        };

        return NextResponse.json(response, { status: 500 });
    }
}
