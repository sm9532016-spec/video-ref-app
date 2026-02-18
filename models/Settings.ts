import mongoose, { Schema, Model } from 'mongoose';
import { UserSettings } from '@/types';

const UserSettingsSchema = new Schema<UserSettings>({
    id: { type: String, default: 'default' },
    topic: { type: String, default: 'motion design' },
    keywords: [String],
    platforms: [String],
    collectionLimit: { type: Number, default: 5 },
    sortBy: { type: String, default: 'views' },
    autoAnalyze: { type: Boolean, default: true },
    tools: [String],
    genres: [String],
    styles: [String],
    timePeriod: { type: String, default: 'all' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const Settings: Model<UserSettings> = mongoose.models.Settings || mongoose.model('Settings', UserSettingsSchema);

export default Settings;
