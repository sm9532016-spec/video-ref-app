
import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables
dotenv.config({ path: '.env.local' });

const VIMEO_ACCESS_TOKEN = process.env.VIMEO_ACCESS_TOKEN;
const VIMEO_API_BASE = 'https://api.vimeo.com';

if (!VIMEO_ACCESS_TOKEN) {
    console.error("❌ Error: VIMEO_ACCESS_TOKEN is missing in .env.local");
    process.exit(1);
}

async function runDiagnosis() {
    console.log("🔍 Starting Vimeo Diagnosis...");
    console.log(`🔑 Token: ${VIMEO_ACCESS_TOKEN.substring(0, 5)}...`);

    // Mock Settings (Default)
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

    const queryStrict = [...baseTerms, ...nuanceTerms, ...negativeKeywordsStrict].join(' '); // Vimeo might handle complex queries differently?
    // Vimeo search documentation: https://developer.vimeo.com/api/reference/videos#search_videos
    // "query" parameter. 

    const scenarios = [
        { name: "Strict Query", q: queryStrict },
        { name: "Broad Query", q: "Motion Graphics" }
    ];

    for (const s of scenarios) {
        console.log(`\n🧪 Testing: ${s.name}`);
        console.log(`   Query: "${s.q}"`);

        try {
            const response = await axios.get(`${VIMEO_API_BASE}/videos`, {
                headers: {
                    'Authorization': `Bearer ${VIMEO_ACCESS_TOKEN}`,
                    'Accept': 'application/vnd.vimeo.*+json;version=3.4',
                },
                params: {
                    query: s.q,
                    per_page: 3,
                    sort: 'relevant',
                    filter: 'embeddable',
                    filter_embeddable: true,
                },
            });

            const data = response.data;
            const items = data.data || [];
            console.log(`   Result: ${items.length} videos found.`);

            if (items.length > 0) {
                console.log(`   Sample: ${items[0].name} (${items[0].link})`);
            } else {
                console.warn("   ⚠️ No results.");
            }

        } catch (error: any) {
            console.error("   ❌ API Error:", error.response?.status, error.response?.data || error.message);
        }
    }
}

runDiagnosis();
