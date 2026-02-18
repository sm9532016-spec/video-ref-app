import { VideoReference, ApiResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * API Client for video operations
 */
export const videoApi = {
    /**
     * Get all videos
     */
    async getAll(platform?: string): Promise<VideoReference[]> {
        const url = new URL(`${API_BASE_URL}/api/videos`);
        if (platform) {
            url.searchParams.set('platform', platform);
        }

        const response = await fetch(url.toString());
        const data: ApiResponse<VideoReference[]> = await response.json();

        if (!data.success || !data.data) {
            throw new Error(data.error || 'Failed to fetch videos');
        }

        return data.data;
    },

    /**
     * Get a single video by ID
     */
    async getById(id: string): Promise<VideoReference> {
        const response = await fetch(`${API_BASE_URL}/api/videos/${id}`);
        const data: ApiResponse<VideoReference> = await response.json();

        if (!data.success || !data.data) {
            throw new Error(data.error || 'Failed to fetch video');
        }

        return data.data;
    },

    /**
     * Create a new video
     */
    async create(videoData: {
        title: string;
        videoUrl: string;
        thumbnailUrl?: string;
        brand: string;
        platform: 'meta' | 'tiktok' | 'youtube' | 'other';
        duration?: number;
    }): Promise<VideoReference> {
        const response = await fetch(`${API_BASE_URL}/api/videos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(videoData),
        });

        const data: ApiResponse<VideoReference> = await response.json();

        if (!data.success || !data.data) {
            throw new Error(data.error || 'Failed to create video');
        }

        return data.data;
    },

    /**
     * Delete a video
     */
    async delete(id: string): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/api/videos/${id}`, {
            method: 'DELETE',
        });

        const data: ApiResponse<void> = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to delete video');
        }
    },

    /**
     * Analyze a video
     */
    async analyze(id: string): Promise<VideoReference> {
        const response = await fetch(`${API_BASE_URL}/api/videos/${id}/analyze`, {
            method: 'POST',
        });

        const data: ApiResponse<VideoReference> = await response.json();

        if (!data.success || !data.data) {
            throw new Error(data.error || 'Failed to analyze video');
        }

        return data.data;
    },
};

/**
 * Handle API errors consistently
 */
export function handleApiError(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unexpected error occurred';
}
