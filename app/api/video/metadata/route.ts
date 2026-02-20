
import { NextResponse } from 'next/server';
import { parseVideoUrl } from '@/lib/utils/urlParser';
import { getVideoMetadata as getYouTubeMetadata } from '@/lib/api/youtubeApi';
import { getVideoMetadata as getVimeoMetadata } from '@/lib/api/vimeoApi';
import { getBehanceMetadata } from '@/lib/api/behanceApi';

// getBehanceMetadata is imported above

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { url } = body;

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        const videoInfo = parseVideoUrl(url);

        if (!videoInfo) {
            return NextResponse.json({ error: 'Invalid or unsupported video URL' }, { status: 400 });
        }

        let metadata = null;

        if (videoInfo.platform === 'youtube') {
            metadata = await getYouTubeMetadata(videoInfo.id);
        } else if (videoInfo.platform === 'vimeo') {
            metadata = await getVimeoMetadata(videoInfo.id);
        } else if (videoInfo.platform === 'behance' || videoInfo.platform === 'other' || (videoInfo as any).id) {
            // For Behance/Other, we pass the full URL
            metadata = await getBehanceMetadata(url);
        }

        if (!metadata) {
            return NextResponse.json({ error: 'Failed to fetch video metadata' }, { status: 404 });
        }

        return NextResponse.json(metadata);

    } catch (error: any) {
        console.error('Metadata fetch error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
