
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

/**
 * Generates an embed URL for the given video URL.
 * Supports YouTube, Vimeo, and Behance.
 * @param videoUrl The full video URL
 * @param autoplay Whether to start playing automatically (default: false)
 */
export function getEmbedUrl(videoUrl: string, autoplay: boolean = false): string | null {
    const info = parseVideoUrl(videoUrl);
    if (!info) return null;

    const autoplayValue = autoplay ? '1' : '0';

    if (info.platform === 'youtube') {
        return `https://www.youtube.com/embed/${info.id}?autoplay=${autoplayValue}&rel=0`;
    }

    if (info.platform === 'vimeo') {
        return `https://player.vimeo.com/video/${info.id}?title=0&byline=0&portrait=0&autoplay=${autoplayValue}`;
    }

    if (info.platform === 'other') {
        if (videoUrl.includes('behance.net')) {
            // Behance doesn't standardly support autoplay param in embed usually, but we can try
            return `https://www.behance.net/embed/project/${info.id}?ilo0=1`;
        }
    }

    return null;
}
