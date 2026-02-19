
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

if (!YOUTUBE_API_KEY) {
    console.error("❌ Error: YOUTUBE_API_KEY is missing");
    process.exit(1);
}

async function runDiagnosis() {
    console.log("🔍 Starting Diagnosis...");

    // Mock Settings
    const settings = {
        genre: 'Motion Graphics',
        studyFocus: 'Motion Rhythm',
        tools: ['After Effects'],
        styles: ['Minimal'],
    };

    const baseTerms = [settings.genre, settings.studyFocus];
    const nuanceTerms = [...settings.tools, ...settings.styles];

    // Explicitly add negatives
    const negativeKeywordsStrict = [
        '-tutorial', '-how to', '-course', '-class',
        '-making of', '-behind the scenes', '-breakdown', '-process',
        '-template', '-free download', '-intro', '-opener', '-review'
    ];

    const queryStrict = [...baseTerms, ...nuanceTerms, ...negativeKeywordsStrict].join(' ');

    const scenarios = [
        { name: "Strict + Short", q: queryStrict, duration: 'short' },
        { name: "Strict + Any", q: queryStrict, duration: 'any' },
        { name: "Moderate + Short", q: [...baseTerms, ...nuanceTerms, '-tutorial', '-template'].join(' '), duration: 'short' },
        { name: "Broad + Short", q: [...baseTerms, '-tutorial'].join(' '), duration: 'short' }
    ];

    for (const s of scenarios) {
        console.log(`\n🧪 Testing: ${s.name} ...`);
        console.log(`   Query: "${s.q}"`);

        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(s.q)}&maxResults=3&type=video&videoDuration=${s.duration}&key=${YOUTUBE_API_KEY}`;

        try {
            const res = await fetch(url);
            if (!res.ok) {
                console.error(`   Status: ${res.status}`);
                continue;
            }
            const data = await res.json();
            const count = data.items?.length || 0;
            console.log(`   Result: ${count} videos found.`);
            if (count > 0) {
                console.log(`   Sample: ${data.items[0].snippet.title}`);
            }
        } catch (e: any) {
            console.error("   Error:", e.message);
        }
    }
}

runDiagnosis();
