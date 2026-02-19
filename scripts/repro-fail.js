
// Mocking the dependencies to test logic flow
const collectionLimit = 2;
const existingUrls = new Set(['url1', 'url2', 'url3']); // These videos already exist

// Mock search function behaves like:
// Attempt 1 (Strict): Returns only 'url1' (duplicate)
// Attempt 2 (Moderate): Returns 'url4' (new/fresh)

async function mockSearch(query, pageToken) {
    if (query.includes("Strict")) {
        return { videos: [{ videoUrl: 'url1', title: 'Video 1' }], nextPageToken: undefined };
    }
    if (query.includes("Moderate")) {
        return { videos: [{ videoUrl: 'url4', title: 'Video 4' }], nextPageToken: undefined };
    }
    // Broad search to match limit 2
    if (query.includes("Broad")) {
        return { videos: [{ videoUrl: 'url5', title: 'Video 5' }], nextPageToken: undefined };
    }
    return { videos: [], nextPageToken: undefined };
}

async function testLogic() {
    console.log("Starting Logic Test (FIXED)...");

    const searchAttempts = [
        { name: 'Strict', query: 'Strict' },
        { name: 'Moderate', query: 'Moderate' },
        { name: 'Broad', query: 'Broad' }
    ];

    let videos = [];
    let existingVideos = []; // Mock existing videos

    for (const attempt of searchAttempts) {
        console.log(`Trying ${attempt.name}...`);

        let attemptVideos = [];
        let newVideosCount = 0;

        // Simulate fetch loop (simplified)
        const result = await mockSearch(attempt.query);
        const batchVideos = result.videos;

        const fresh = batchVideos.filter(v => !existingUrls.has(v.videoUrl));
        newVideosCount += fresh.length;
        attemptVideos.push(...batchVideos);

        console.log(`  Found ${attemptVideos.length} videos, ${newVideosCount} new.`);

        // THE FIXED LOGIC:
        videos.push(...attemptVideos);

        const uniqueVideos = Array.from(new Set(videos.map(v => v.videoUrl)))
            .map(url => videos.find(v => v.videoUrl === url));

        const currentFreshCount = uniqueVideos.filter(v => !existingUrls.has(v.videoUrl)).length;

        if (currentFreshCount >= collectionLimit) {
            console.log("  ✅ Breaking loop because currentFreshCount >= limit");
            break;
        } else {
            console.log(`  Continuing... (Fresh: ${currentFreshCount}/${collectionLimit})`);
        }
    }

    const finalFresh = videos.filter(v => !existingUrls.has(v.videoUrl));
    console.log(`Final Collection: ${finalFresh.length} fresh videos.`);

    if (finalFresh.length >= 1) { // We expect 1 from moderate, maybe 1 from broad if needed
        console.log("✅ SUCCESS: Collected fresh videos.");
    } else {
        console.log("❌ FAILURE: Still 0 videos.");
    }
}

testLogic();
