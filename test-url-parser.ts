
import { parseVideoUrl, getEmbedUrl } from './lib/utils/urlParser';

const testUrl = "https://www.behance.net/gallery/222784831/HONOR-Magic-Vs2-Wallpaper-Series";

console.log("Testing URL:", testUrl);
const info = parseVideoUrl(testUrl);
console.log("Parsed Info:", info);

const embedUrl = getEmbedUrl(testUrl, true);
console.log("Embed URL:", embedUrl);
