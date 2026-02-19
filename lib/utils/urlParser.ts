
/**
 * Extracts video ID and platform from a given URL.
 * Supports YouTube and Vimeo.
 */
export interface VideoInfo {
    platform: 'youtube' | 'vimeo' | 'other';
    id: string;
}

export function parseVideoUrl(url: string): VideoInfo | null {
    if (!url) return null;

    // YouTube
    const youtubeRegex = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch && youtubeMatch[1]) {
        return { platform: 'youtube', id: youtubeMatch[1] };
    }

    // Vimeo
    const vimeoRegex = /^(?:https?:\/\/)?(?:www\.)?(?:vimeo\.com\/)(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch && vimeoMatch[1]) {
        return { platform: 'vimeo', id: vimeoMatch[1] };
    }

    // Behance
    const behanceRegex = /^(?:https?:\/\/)?(?:www\.)?behance\.net\/(?:gallery|project)\/(\d+)/;
    const behanceMatch = url.match(behanceRegex);
    if (behanceMatch && behanceMatch[1]) {
        return { platform: 'other', id: behanceMatch[1] }; // Using 'other' as generic platform for now
    }

    return null;
}
