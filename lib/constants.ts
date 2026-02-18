export const APP_CONFIG = {
    // Application Settings
    APP_NAME: 'Video Reference Analysis',
    APP_DESCRIPTION: 'AI-powered video analysis platform for creative professionals',

    // Video Collection Settings
    VIDEOS_PER_DAY: parseInt(process.env.VIDEOS_PER_DAY || '5', 10),

    // Analysis Categories
    ANALYSIS_CATEGORIES: [
        'Hook Analysis (0-3s)',
        'Color Grading',
        'Transitions & Editing',
        'Audio & Music',
        'Visual Effects',
        'Storytelling Structure',
        'Call-to-Action',
    ] as const,

    // Video Sources
    VIDEO_SOURCES: [
        { name: 'Meta Ad Library', url: 'https://www.facebook.com/ads/library' },
        { name: 'TikTok Creative Center', url: 'https://ads.tiktok.com/business/creativecenter' },
    ] as const,
} as const;

export type AnalysisCategory = typeof APP_CONFIG.ANALYSIS_CATEGORIES[number];
export type VideoSource = typeof APP_CONFIG.VIDEO_SOURCES[number];
