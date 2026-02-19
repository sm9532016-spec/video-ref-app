
const { collectVideos } = require('../lib/services/collectionService');
const { getAllVideos } = require('../lib/services/videoService');

// Mock environment variables if needed, or rely on dotenv
// We need to load .env.local
require('dotenv').config({ path: '.env.local' });

async function run() {
    console.log("Starting collection test...");
    try {
        const result = await collectVideos();
        console.log("Collection result:", JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("Test failed with error:", error);
    }
}

run();
