// Video Reference Types

export type Platform = 'youtube' | 'behance' | 'vimeo' | 'meta' | 'tiktok' | 'other';

export interface VideoReference {
    id: string;
    title: string;
    thumbnailUrl: string;
    videoUrl: string;
    brand: string;
    platform: Platform;
    duration: number; // in seconds
    collectedAt: Date;
    analysis?: VideoAnalysis;
    // New fields for curation
    source?: CollectionSource;
    metrics?: PopularityMetrics;
    tags?: string[];
    collectionHistory?: Date[];
}

export interface CollectionSource {
    platform: Platform;
    originalUrl: string;
    collectedBy: 'manual' | 'auto';
    collectionDate: Date;
}

export interface PopularityMetrics {
    views: number;
    likes: number;
    shares?: number;
    comments?: number;
    score: number; // Calculated popularity score
}

export interface VideoAnalysis {
    id: string;
    videoId: string;

    // Basic Info
    oneLineSummary: string; // New: 핵심 콘셉트 한 줄 요약

    // New Structured Sections
    timecodeAnalysis: TimecodeSegment[];
    shotAnalysis: ShotAnalysis;
    visualAnalysis: VisualAnalysis;
    soundAnalysis: SoundAnalysis;
    replicationRecipe: ReplicationRecipe;

    // Genre Specifics (Union type or optional fields)
    genreSpecifics: GenreSpecifics;

    // Educational Points
    learningPoints: LearningPoints;

    // Legacy fields mapped or kept for compatibility
    overallScore: number;
    keyTakeaways: string[];
    createdAt: Date;

    // Legacy optional fields for strict compatibility with old code if needed
    hookAnalysis?: HookAnalysis;
    colorGrading?: ColorGradingAnalysis;
    transitions?: TransitionAnalysis;
    audio?: AudioAnalysis;
    visualEffects?: VisualEffectsAnalysis;
    storytelling?: StorytellingAnalysis;
    callToAction?: CallToActionAnalysis;
}

export interface TimecodeSegment {
    timestamp: string; // "0:00-0:03"
    content: string; // "훅"
    productionPoint: string; // "시선 잡는 장치"
}

export interface ShotAnalysis {
    averageCutLength: string; // "2.5초"
    shortestCut: string;
    longestCut: string;
    rhythmPattern: string; // "빠름→느림"
}

export interface VisualAnalysis {
    colorStrategy: string; // "컬러 전략"
    compositionRules: string; // "구도 규칙"
    spatialDepth: string; // "공간 깊이감"
    textureExpress: string; // "텍스처/질감 표현"
}

export interface SoundAnalysis {
    hasMusic: boolean;
    soundEffectsRole: string; // "효과음 역할"
    silenceUsage: string; // "침묵의 사용"
}

export interface ReplicationRecipe {
    recommendedTools: string[]; // "어떤 툴?"
    keyFunctions: string[]; // "어떤 기능?"
    settings: string; // "어떤 세팅?"
    difficultyPoint: string; // "가장 어려운 부분"
    corePoints: string[]; // "핵심 포인트 3개"
}

// Genre Specifics Base
export interface GenreSpecifics {
    genre: 'Motion Graphics' | 'Advertisement' | 'Movie' | 'Media Art';
    // Motion Graphics
    easePattern?: string; // "Ease 패턴 분석"
    loopStructure?: string; // "반복/루프 구조"
    transitionTechniques?: string; // "트랜지션 연결 문법"
    moduleSystem?: boolean; // "모듈 시스템 여부"
    rhythmSync?: string; // "리듬 싱크 지점"
    speedChangeSegment?: string; // "속도 변화 구간 타임코드" (Required for MG)

    // Advertisement
    hookMechanism?: string; // "0~3초 훅 장치"
    brandAppearanceTiming?: string; // "브랜드 첫 등장 타이밍"
    productCloseUpDuration?: string; // "제품 클로즈업 초 단위"
    emotionToFunctionPoint?: string; // "감정 -> 기능 전환 지점"
    ctaTiming?: string; // "CTA 등장 초"
    brandExposureDuration?: string; // "브랜드 노출 초 단위" (Required for Ad)

    // Movie
    cameraMovement?: string; // "장면별 카메라 위치 변화"
    lensCharacteristics?: string; // "렌즈 느낌 추정"
    characterMovement?: string; // "인물 동선"
    lightingContrast?: string; // "조명 대비 변화"
    climaxTiming?: string; // "감정 최고조 타이밍"
    emotionShiftTiming?: string; // "감정 전환 초 단위" (Required for Movie)

    // Media Art
    spaceEstimation?: string; // "카메라 움직임으로 공간 추정"
    loopLength?: string; // "루프 길이"
    repetitionStructure?: string; // "반복 구조"
    viewerPosition?: string; // "관람자가 어느 위치에 서있을지"
    contrastChangeSegment?: string; // "밝기/색 대비 변화 구간"
    spaceRecognitionSegment?: string; // "공간 인식 가능한 장면 타임코드" (Required for Media Art)
}

export interface LearningPoints {
    experiments: string[]; // "내가 당장 따라 해볼 실험 3가지"
    difficultyLevel: 'Low' | 'Medium' | 'High'; // "제작 난이도"
    difficultyReason: string; // "이유"
    mustWatchPoint: string; // "절대 놓치면 안 되는 포인트 1가지"
}

// Legacy interfaces kept for potential compatibility or remove if fully replacing
export interface HookAnalysis {
    description: string;
    effectiveness: number;
    techniques: string[];
    timestamp: number;
}

export interface ColorGradingAnalysis {
    dominantColors: string[];
    mood: string;
    colorPalette: string;
    techniques: string[];
}

export interface TransitionAnalysis {
    types: string[];
    frequency: string;
    effectiveness: number;
    examples: { timestamp: number; type: string; description: string }[];
}

export interface AudioAnalysis {
    mood: string;
    voiceover: boolean;
    soundEffects: boolean;
    effectiveness: number;
    musicGenre?: string;
}

export interface VisualEffectsAnalysis {
    types: string[];
    quality: string;
    purpose: string;
}

export interface StorytellingAnalysis {
    structure: string;
    narrative: string;
    emotionalArc: string;
    effectiveness: number;
}

export interface CallToActionAnalysis {
    present: boolean;
    type?: string;
    placement?: string;
    text?: string;
}



// Settings Types

export interface UserSettings {
    id: string;

    // 1. Study Focus (Single Select)
    studyFocus: string;

    // 2. Genre (Single Select)
    genre: string;

    // 3. Scope
    tools: string[]; // Max 2
    styles: string[]; // Max 2
    timePeriod: '3_months' | '6_months' | '1_year' | 'all'; // Default: '1_year'

    // 4. Daily Plan
    collectionLimit: number; // Default 3, Max 5
    autoAnalyze: boolean; // Default true
    sortBy: 'creative_quality' | 'editors_pick'; // Removed 'trending'

    // Legacy fields kept optional for migration or removed if verified safe
    platforms?: Platform[]; // Kept for backend compatibility for now

    createdAt: Date;
    updatedAt: Date;
}

export interface CollectionResult {
    videos: VideoReference[];
    totalCollected: number;
    newlySaved?: number;
    platformBreakdown: {
        platform: Platform;
        count: number;
    }[];
    collectionDate: Date;
}

// API Response Types

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}
