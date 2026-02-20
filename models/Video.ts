import mongoose, { Schema, Model } from 'mongoose';
import { VideoReference, VideoAnalysis } from '@/types';

// Define sub-schemas for complex types
const TimecodeSegmentSchema = new Schema({
    timestamp: String,
    content: String,
    productionPoint: String,
});

const ShotAnalysisSchema = new Schema({
    averageCutLength: String,
    shortestCut: String,
    longestCut: String,
    rhythmPattern: String,
});

const VisualAnalysisSchema = new Schema({
    colorStrategy: String,
    compositionRules: String,
    spatialDepth: String,
    textureExpress: String,
});

const SoundAnalysisSchema = new Schema({
    hasMusic: Boolean,
    soundEffectsRole: String,
    silenceUsage: String,
});

const ReplicationRecipeSchema = new Schema({
    recommendedTools: [String],
    keyFunctions: [String],
    settings: String,
    difficultyPoint: String,
    corePoints: [String],
});

const GenreSpecificsSchema = new Schema({
    genre: String,
    // Add specific fields as mixed or map them if strictly needed, using mixed for flexibility
}, { strict: false });

const LearningPointsSchema = new Schema({
    experiments: [String],
    difficultyLevel: String,
    difficultyReason: String,
    mustWatchPoint: String,
});

// Main Analysis Schema
const VideoAnalysisSchema = new Schema<VideoAnalysis>({
    id: String,
    videoId: String,
    oneLineSummary: String,
    overallScore: Number,
    keyTakeaways: [String],

    timecodeAnalysis: [TimecodeSegmentSchema],
    shotAnalysis: ShotAnalysisSchema,
    visualAnalysis: VisualAnalysisSchema,
    soundAnalysis: SoundAnalysisSchema,
    replicationRecipe: ReplicationRecipeSchema,
    genreSpecifics: GenreSpecificsSchema,
    learningPoints: LearningPointsSchema,

    // Legacy mapping support
    hookAnalysis: { type: Schema.Types.Mixed, required: false },
    colorGrading: { type: Schema.Types.Mixed, required: false },
    transitions: { type: Schema.Types.Mixed, required: false },
    audio: { type: Schema.Types.Mixed, required: false },
    visualEffects: { type: Schema.Types.Mixed, required: false },
    storytelling: { type: Schema.Types.Mixed, required: false },
    callToAction: { type: Schema.Types.Mixed, required: false },

    createdAt: { type: Date, default: Date.now },
});

// Video Reference Schema
const VideoSchema = new Schema<VideoReference>({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: String,
    // channelName removed to match interface
    videoUrl: { type: String, required: true, unique: true },
    thumbnailUrl: String,
    duration: Number,
    // uploadDate removed to match interface
    platform: { type: String, required: true },
    brand: String,
    collectedAt: { type: Date, default: Date.now },
    collectionHistory: [Date],
    analysis: VideoAnalysisSchema,
});

// Check if model already exists to avoid overwrite error in dev
const Video: Model<VideoReference> = mongoose.models.Video || mongoose.model('Video', VideoSchema);

export default Video;
