import { UserSettings } from '@/types';
import dbConnect from '@/lib/db';
import Settings from '@/models/Settings';

const DEFAULT_SETTINGS_ID = 'default';

// Default settings
const DEFAULT_SETTINGS: Omit<UserSettings, 'id' | 'createdAt' | 'updatedAt'> = {
    studyFocus: 'Motion Rhythm Analysis',
    genre: 'Motion Graphics',
    tools: ['After Effects'],
    styles: ['Minimal'],
    timePeriod: '1_year',
    collectionLimit: 3,
    autoAnalyze: true,
    sortBy: 'creative_quality',
    platforms: ['youtube', 'vimeo', 'behance'],
};

/**
 * Get user settings
 */
export async function getSettings(): Promise<UserSettings> {
    await dbConnect();

    let settings = await Settings.findOne({ id: DEFAULT_SETTINGS_ID }).lean();

    if (!settings) {
        // Create default settings if not exists
        const newSettings = await Settings.create({
            id: DEFAULT_SETTINGS_ID,
            ...DEFAULT_SETTINGS,
        });
        return newSettings.toObject() as unknown as UserSettings;
    }

    return settings as unknown as UserSettings;
}

/**
 * Save user settings
 */
export async function saveSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    await dbConnect();

    const updatedSettings = await Settings.findOneAndUpdate(
        { id: DEFAULT_SETTINGS_ID },
        {
            $set: {
                ...settings,
                updatedAt: new Date(),
            }
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    return updatedSettings as unknown as UserSettings;
}

/**
 * Reset settings to default
 */
export async function resetSettings(): Promise<UserSettings> {
    await dbConnect();

    const newSettings = await Settings.findOneAndUpdate(
        { id: DEFAULT_SETTINGS_ID },
        {
            $set: {
                ...DEFAULT_SETTINGS,
                updatedAt: new Date(),
            }
        },
        { new: true, upsert: true }
    ).lean();

    return newSettings as unknown as UserSettings;
}

