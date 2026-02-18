'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../components/layout/DashboardLayout';
import { UserSettings, Platform } from '@/types';

const PLATFORM_OPTIONS: { value: Platform; label: string; icon: string }[] = [
    { value: 'youtube', label: 'YouTube', icon: '📺' },
    { value: 'behance', label: 'Behance', icon: '🎨' },
    { value: 'vimeo', label: 'Vimeo', icon: '🎬' },
];

const SORT_OPTIONS = [
    { value: 'views', label: 'Most Views' },
    { value: 'likes', label: 'Most Likes' },
    { value: 'recent', label: 'Most Recent' },
    { value: 'relevance', label: 'Most Relevant' },
];

const TOPIC_PRESETS = [
    'Motion Design',
    'Color Grading',
    'Transitions',
    'Typography Animation',
    'Visual Effects',
    'Compositing',
    '3D Animation',
    'Character Animation',
];

const TOOL_OPTIONS = [
    'After Effects',
    'Cinema 4D',
    'Blender',
    'Houdini',
    'Maya',
    '3ds Max',
    'Unreal Engine',
    'Unity',
];

const GENRE_OPTIONS = [
    'Motion Graphics',
    'VFX',
    '3D Animation',
    '2D Animation',
    'Compositing',
    'Character Animation',
    'Product Visualization',
];

const STYLE_OPTIONS = [
    'Kinetic Typography',
    'Liquid Motion',
    'Glitch Art',
    'Minimalist',
    'Abstract',
    'Isometric',
    'Cel Shading',
    'Photorealistic',
];

const TIME_PERIOD_OPTIONS = [
    { value: 'day', label: 'Last 24 hours' },
    { value: 'week', label: 'Last week' },
    { value: 'month', label: 'Last month' },
    { value: 'year', label: 'Last year' },
    { value: 'all', label: 'All time' },
];

export default function SettingsPage() {
    const router = useRouter();
    const [settings, setSettings] = useState<UserSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Form state
    const [topic, setTopic] = useState('');
    const [keywords, setKeywords] = useState<string[]>([]);
    const [keywordInput, setKeywordInput] = useState('');
    const [platforms, setPlatforms] = useState<Platform[]>([]);
    const [collectionLimit, setCollectionLimit] = useState(5);
    const [sortBy, setSortBy] = useState<'views' | 'likes' | 'recent' | 'relevance'>('views');
    const [autoAnalyze, setAutoAnalyze] = useState(true);

    // Advanced filters
    const [tools, setTools] = useState<string[]>([]);
    const [genres, setGenres] = useState<string[]>([]);
    const [styles, setStyles] = useState<string[]>([]);
    const [timePeriod, setTimePeriod] = useState<'day' | 'week' | 'month' | 'year' | 'all'>('all');

    // Load settings on mount
    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/settings');
            const data = await response.json();

            if (data.success && data.data) {
                const s = data.data;
                setSettings(s);
                setTopic(s.topic);
                setKeywords(s.keywords);
                setPlatforms(s.platforms);
                setCollectionLimit(s.collectionLimit);
                setSortBy(s.sortBy);
                setAutoAnalyze(s.autoAnalyze);
                setTools(s.tools || []);
                setGenres(s.genres || []);
                setStyles(s.styles || []);
                setTimePeriod(s.timePeriod || 'all');
            }
        } catch (err) {
            setError('Failed to load settings');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            setError(null);
            setSuccessMessage(null);

            const updatedSettings: Partial<UserSettings> = {
                topic,
                keywords,
                platforms,
                collectionLimit,
                sortBy,
                autoAnalyze,
                tools,
                genres,
                styles,
                timePeriod,
            };

            const response = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedSettings),
            });

            const data = await response.json();

            if (data.success) {
                setSuccessMessage('Settings saved successfully!');
                setTimeout(() => setSuccessMessage(null), 3000);
            } else {
                setError(data.error || 'Failed to save settings');
            }
        } catch (err) {
            setError('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddKeyword = () => {
        if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
            setKeywords([...keywords, keywordInput.trim()]);
            setKeywordInput('');
        }
    };

    const handleRemoveKeyword = (keyword: string) => {
        setKeywords(keywords.filter(k => k !== keyword));
    };

    const togglePlatform = (platform: Platform) => {
        if (platforms.includes(platform)) {
            setPlatforms(platforms.filter(p => p !== platform));
        } else {
            setPlatforms([...platforms, platform]);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary mx-auto mb-4"></div>
                        <p className="text-dark-text-muted">Loading settings...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-dark-text">Settings</h1>
                        <p className="text-dark-text-muted mt-1">
                            Configure your video learning preferences
                        </p>
                    </div>
                    <button
                        onClick={() => router.push('/')}
                        className="btn-secondary"
                    >
                        ← Back to Dashboard
                    </button>
                </div>

                {/* Success/Error Messages */}
                {successMessage && (
                    <div className="bg-accent-success/10 border border-accent-success text-accent-success px-4 py-3 rounded-lg">
                        {successMessage}
                    </div>
                )}
                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Learning Topic */}
                <div className="card">
                    <h2 className="text-xl font-bold text-dark-text mb-4">Learning Topic</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-dark-text mb-2">
                                What do you want to learn?
                            </label>
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                className="w-full bg-dark-surface-light border border-dark-border rounded-lg px-4 py-2 text-dark-text focus:outline-none focus:border-accent-primary"
                                placeholder="e.g., Motion Design, Color Grading"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-dark-text mb-2">
                                Quick Presets
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {TOPIC_PRESETS.map((preset) => (
                                    <button
                                        key={preset}
                                        onClick={() => setTopic(preset)}
                                        className={`px-3 py-1 rounded-lg text-sm transition-all ${topic === preset
                                            ? 'bg-accent-primary text-white'
                                            : 'bg-dark-surface-light text-dark-text hover:bg-dark-border'
                                            }`}
                                    >
                                        {preset}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-dark-text mb-2">
                                Additional Keywords
                            </label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={keywordInput}
                                    onChange={(e) => setKeywordInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                                    className="flex-1 bg-dark-surface-light border border-dark-border rounded-lg px-4 py-2 text-dark-text focus:outline-none focus:border-accent-primary"
                                    placeholder="Add keyword and press Enter"
                                />
                                <button onClick={handleAddKeyword} className="btn-primary">
                                    Add
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {keywords.map((keyword) => (
                                    <span
                                        key={keyword}
                                        className="px-3 py-1 bg-dark-surface-light rounded-lg text-sm flex items-center gap-2"
                                    >
                                        {keyword}
                                        <button
                                            onClick={() => handleRemoveKeyword(keyword)}
                                            className="text-red-500 hover:text-red-400"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Platforms */}
                <div className="card">
                    <h2 className="text-xl font-bold text-dark-text mb-4">Video Sources</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {PLATFORM_OPTIONS.map((platform) => (
                            <button
                                key={platform.value}
                                onClick={() => togglePlatform(platform.value)}
                                className={`p-4 rounded-lg border-2 transition-all ${platforms.includes(platform.value)
                                    ? 'border-accent-primary bg-accent-primary/10'
                                    : 'border-dark-border bg-dark-surface-light hover:border-dark-text-muted'
                                    }`}
                            >
                                <div className="text-3xl mb-2">{platform.icon}</div>
                                <div className="font-medium text-dark-text">{platform.label}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Advanced Filters */}
                <div className="card">
                    <h2 className="text-xl font-bold text-dark-text mb-4">🎯 Advanced Filters</h2>

                    {/* Tools */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-dark-text mb-2">
                            Creation Tools
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {TOOL_OPTIONS.map((tool) => (
                                <button
                                    key={tool}
                                    onClick={() => {
                                        if (tools.includes(tool)) {
                                            setTools(tools.filter(t => t !== tool));
                                        } else {
                                            setTools([...tools, tool]);
                                        }
                                    }}
                                    className={`px-3 py-1 rounded-lg text-sm transition-all ${tools.includes(tool)
                                            ? 'bg-accent-primary text-white'
                                            : 'bg-dark-surface-light text-dark-text hover:bg-dark-border'
                                        }`}
                                >
                                    {tool}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Genres */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-dark-text mb-2">
                            Genres
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {GENRE_OPTIONS.map((genre) => (
                                <button
                                    key={genre}
                                    onClick={() => {
                                        if (genres.includes(genre)) {
                                            setGenres(genres.filter(g => g !== genre));
                                        } else {
                                            setGenres([...genres, genre]);
                                        }
                                    }}
                                    className={`px-3 py-1 rounded-lg text-sm transition-all ${genres.includes(genre)
                                            ? 'bg-accent-primary text-white'
                                            : 'bg-dark-surface-light text-dark-text hover:bg-dark-border'
                                        }`}
                                >
                                    {genre}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Styles */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-dark-text mb-2">
                            Styles
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {STYLE_OPTIONS.map((style) => (
                                <button
                                    key={style}
                                    onClick={() => {
                                        if (styles.includes(style)) {
                                            setStyles(styles.filter(s => s !== style));
                                        } else {
                                            setStyles([...styles, style]);
                                        }
                                    }}
                                    className={`px-3 py-1 rounded-lg text-sm transition-all ${styles.includes(style)
                                            ? 'bg-accent-primary text-white'
                                            : 'bg-dark-surface-light text-dark-text hover:bg-dark-border'
                                        }`}
                                >
                                    {style}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Time Period */}
                    <div>
                        <label className="block text-sm font-medium text-dark-text mb-2">
                            Time Period
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {TIME_PERIOD_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setTimePeriod(option.value as any)}
                                    className={`px-4 py-2 rounded-lg text-sm transition-all ${timePeriod === option.value
                                            ? 'bg-accent-primary text-white'
                                            : 'bg-dark-surface-light text-dark-text hover:bg-dark-border'
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Collection Settings */}
                <div className="card">
                    <h2 className="text-xl font-bold text-dark-text mb-4">Collection Settings</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-dark-text mb-2">
                                Videos per Collection: {collectionLimit}
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="20"
                                value={collectionLimit}
                                onChange={(e) => setCollectionLimit(parseInt(e.target.value))}
                                className="w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-dark-text mb-2">
                                Sort By
                            </label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="w-full bg-dark-surface-light border border-dark-border rounded-lg px-4 py-2 text-dark-text focus:outline-none focus:border-accent-primary"
                            >
                                {SORT_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="autoAnalyze"
                                checked={autoAnalyze}
                                onChange={(e) => setAutoAnalyze(e.target.checked)}
                                className="w-5 h-5"
                            />
                            <label htmlFor="autoAnalyze" className="text-dark-text">
                                Automatically analyze collected videos
                            </label>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex gap-4">
                    <button
                        onClick={handleSave}
                        disabled={isSaving || platforms.length === 0 || !topic}
                        className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
}
