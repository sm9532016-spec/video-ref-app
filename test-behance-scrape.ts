
import axios from 'axios';
import * as cheerio from 'cheerio';

const url = "https://www.behance.net/gallery/222784831/HONOR-Magic-Vs2-Wallpaper-Series"; // Replace with a known video project if this fails
// Trying to find a random 'motion graphics' project if I could, but let's test this one first.
// If this one is just images, I might need another URL. 
// A known video project example would be better. 
// Let's try searching for one via existing API or just use a generic one if I knew it.
// I'll stick to the one I have, and print EVERYTHING interesting.

async function scrapeBehance(projectUrl: string) {
    console.log(`Scraping: ${projectUrl}`);
    try {
        const response = await axios.get(projectUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(response.data);

        console.log("--- Iframes ---");
        $('iframe').each((i, el) => {
            console.log($(el).attr('src'));
        });

        console.log("--- Video Tags ---");
        $('video').each((i, el) => {
            console.log($(el).attr('src'));
            $(el).find('source').each((j, source) => {
                console.log(`Source: ${$(source).attr('src')}`);
            });
        });

        console.log("--- Embed Modules ---");
        // Behance often puts embeds in divs with specific classes
        // Accessing the page source often reveals raw JSON data in a script tag too.
        // Let's look for 'beconfig' or state.

    } catch (error) {
        console.error("Error:", error);
    }
}

scrapeBehance(url);
