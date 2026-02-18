import { NextRequest, NextResponse } from 'next/server';
import { getSettings, saveSettings, resetSettings } from '@/lib/services/settingsService';
import { ApiResponse, UserSettings } from '@/types';

/**
 * GET /api/settings
 * Get user settings
 */
export async function GET() {
    try {
        const settings = await getSettings();

        const response: ApiResponse<UserSettings> = {
            success: true,
            data: settings,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching settings:', error);

        const response: ApiResponse<UserSettings> = {
            success: false,
            error: 'Failed to fetch settings',
        };

        return NextResponse.json(response, { status: 500 });
    }
}

/**
 * POST /api/settings
 * Update user settings
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const updatedSettings = await saveSettings(body);

        const response: ApiResponse<UserSettings> = {
            success: true,
            data: updatedSettings,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error saving settings:', error);

        const response: ApiResponse<UserSettings> = {
            success: false,
            error: 'Failed to save settings',
        };

        return NextResponse.json(response, { status: 500 });
    }
}

/**
 * DELETE /api/settings
 * Reset settings to default
 */
export async function DELETE() {
    try {
        const defaultSettings = await resetSettings();

        const response: ApiResponse<UserSettings> = {
            success: true,
            data: defaultSettings,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error resetting settings:', error);

        const response: ApiResponse<UserSettings> = {
            success: false,
            error: 'Failed to reset settings',
        };

        return NextResponse.json(response, { status: 500 });
    }
}
