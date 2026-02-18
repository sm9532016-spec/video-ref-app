import mongoose, { Schema, Model } from 'mongoose';
import { UserSettings } from '@/types';

const UserSettingsSchema = new Schema<UserSettings>({
    id: { type: String, default: 'default' },

    // 1. Study Focus
    studyFocus: { type: String, default: 'Motion Rhythm' },

    // 2. Genre
    genre: { type: String, default: 'Motion Graphics' },

    // 3. Scope
    tools: [String],
    styles: [String],
    timePeriod: { type: String, default: '1_year' },

    // 4. Daily Plan
    collectionLimit: { type: Number, default: 3 },
    autoAnalyze: { type: Boolean, default: true },
    sortBy: { type: String, default: 'creative_quality' },

    // Legacy / Compat
    platforms: { type: [String], default: ['youtube', 'vimeo', 'behance'] },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const Settings: Model<UserSettings> = mongoose.models.Settings || mongoose.model('Settings', UserSettingsSchema);

export default Settings;
