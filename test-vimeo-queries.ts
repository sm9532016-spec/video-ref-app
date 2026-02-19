
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config({ path: '.env.local' });

const VIMEO_ACCESS_TOKEN = process.env.VIMEO_ACCESS_TOKEN;
const VIMEO_API_BASE = 'https://api.vimeo.com';

if (!VIMEO_ACCESS_TOKEN) {
    console.error("❌ Error: VIMEO_ACCESS_TOKEN is missing in .env.local");
    process.exit(1);
}

const token = VIMEO_ACCESS_TOKEN as string;

async function testQueries() {
    // Mimic collectionService.ts settings
    const settings = {
        genre: 'Motion Graphics',
        studyFocus: 'Motion Design',
        tools: ['After Effects'],
        styles: ['Minimal'],
    };

    const baseTerms = [settings.genre, settings.studyFocus];
    const nuanceTerms = [...settings.tools, ...settings.styles];

    const negativeKeywordsStrict = [
        '-tutorial', '-how to', '-course', '-class',
        '-making of', '-behind the scenes', '-breakdown', '-process',
        '-template', '-free download', '-intro', '-opener', '-review'
    ];
    const negativeKeywordsEssential = [
        '-tutorial', '-how to', '-course', '-template'
    ];

    const queryStrict = [...baseTerms, ...nuanceTerms, ...negativeKeywordsStrict].filter(Boolean).join(' ');
    const queryModerate = [...baseTerms, ...nuanceTerms, ...negativeKeywordsEssential].filter(Boolean).join(' ');
    const queryBroad = [...baseTerms, ...negativeKeywordsEssential].filter(Boolean).join(' ');
    const querySimple = baseTerms.join(' '); // Just base terms

    const scenarios = [
        { name: "Strict", q: queryStrict },
        { name: "Moderate", q: queryModerate },
        { name: "Broad", q: queryBroad },
        { name: "Simple (Base Only)", q: querySimple }
    ];

    console.log("🔍 Testing Vimeo Query Strings...");

    for (const s of scenarios) {
        console.log(`\n🧪 Testing: ${s.name}`);
        console.log(`   Query: "${s.q}"`);

        try {
            const response = await axios.get(`${VIMEO_API_BASE}/videos`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
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

            const items = response.data.data || [];
            console.log(`   Result: ${items.length} videos found.`);
            if (items.length > 0) {
                console.log(`   Sample: ${items[0].name} (${items[0].link})`);
            }
        } catch (error: any) {
            console.error("   ❌ API Error:", error.response?.status, error.response?.data || error.message);
        }
    }
}

testQueries();
