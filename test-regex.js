
const url = "https://www.behance.net/gallery/222784831/HONOR-Magic-Vs2-Wallpaper-Series";

function parseVideoUrl(url) {
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
        return { platform: 'other', id: behanceMatch[1] };
    }

    return null;
}

function getEmbedUrl(videoUrl, autoplay = false) {
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
            return `https://www.behance.net/embed/project/${info.id}?ilo0=1`;
        }
    }

    return null;
}

console.log("Testing URL:", url);
const info = parseVideoUrl(url);
console.log("Parsed Info:", info);

const embedUrl = getEmbedUrl(url, true);
console.log("Embed URL:", embedUrl);
