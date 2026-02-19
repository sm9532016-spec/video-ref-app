'use client';

import { useState } from 'react';
import { videoApi, handleApiError } from '@/lib/api/client';

interface VideoUploadFormProps {
    onSuccess?: () => void;
}

export default function VideoUploadForm({ onSuccess }: VideoUploadFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        videoUrl: '',
        thumbnailUrl: '',
        brand: '',
        platform: 'youtube' as 'meta' | 'tiktok' | 'youtube' | 'other',
        duration: 30,
    });


    const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);

    const handleUrlBlur = async () => {
        if (!formData.videoUrl) return;

        // Simple check if it looks like a supported URL before calling API
        if (!formData.videoUrl.includes('youtube.com') && !formData.videoUrl.includes('youtu.be') && !formData.videoUrl.includes('vimeo.com')) {
            return;
        }

        setIsFetchingMetadata(true);
        try {
            const response = await fetch('/api/video/metadata', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: formData.videoUrl }),
            });

            if (response.ok) {
                const metadata = await response.json();
                setFormData(prev => ({
                    ...prev,
                    title: metadata.title || prev.title,
                    brand: metadata.brand || prev.brand,
                    thumbnailUrl: metadata.thumbnailUrl || prev.thumbnailUrl,
                    duration: metadata.duration || prev.duration,
                    platform: metadata.platform || prev.platform,
                }));
            }
        } catch (error) {
            console.error('Failed to fetch metadata:', error);
        } finally {
            setIsFetchingMetadata(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await videoApi.create({
                ...formData,
                thumbnailUrl: formData.thumbnailUrl || undefined,
            });

            // Reset form
            setFormData({
                title: '',
                videoUrl: '',
                thumbnailUrl: '',
                brand: '',
                platform: 'youtube',
                duration: 0,
            });

            setIsOpen(false);
            onSuccess?.();
        } catch (err) {
            setError(handleApiError(err));
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="btn-primary"
            >
                + Add Video
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-dark-text">Add New Video</h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-dark-text-muted hover:text-dark-text text-2xl"
                    >
                        ×
                    </button>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-dark-text mb-2">
                            Video URL *
                        </label>
                        <div className="relative">
                            <input
                                type="url"
                                required
                                value={formData.videoUrl}
                                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                                onBlur={handleUrlBlur}
                                className="w-full bg-dark-surface-light border border-dark-border rounded-lg px-4 py-2 text-dark-text focus:outline-none focus:border-accent-primary pr-10"
                                placeholder="https://www.youtube.com/watch?v=... (Paste to auto-fill)"
                            />
                            {isFetchingMetadata && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <div className="w-4 h-4 border-2 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-dark-text-muted mt-1">
                            Paste a YouTube or Vimeo URL to automatically fill details.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-dark-text mb-2">
                            Title *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-dark-surface-light border border-dark-border rounded-lg px-4 py-2 text-dark-text focus:outline-none focus:border-accent-primary"
                            placeholder="Video Title"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-dark-text mb-2">
                            Thumbnail URL (optional)
                        </label>
                        <input
                            type="url"
                            value={formData.thumbnailUrl}
                            onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                            className="w-full bg-dark-surface-light border border-dark-border rounded-lg px-4 py-2 text-dark-text focus:outline-none focus:border-accent-primary"
                            placeholder="https://example.com/thumbnail.jpg"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-dark-text mb-2">
                                Brand *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.brand}
                                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                className="w-full bg-dark-surface-light border border-dark-border rounded-lg px-4 py-2 text-dark-text focus:outline-none focus:border-accent-primary"
                                placeholder="Channel Name / Brand"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-dark-text mb-2">
                                Platform *
                            </label>
                            <select
                                required
                                value={formData.platform}
                                onChange={(e) => setFormData({ ...formData, platform: e.target.value as any })}
                                className="w-full bg-dark-surface-light border border-dark-border rounded-lg px-4 py-2 text-dark-text focus:outline-none focus:border-accent-primary"
                            >
                                <option value="youtube">YouTube</option>
                                <option value="vimeo">Vimeo</option>
                                <option value="meta">Meta (Facebook/Instagram)</option>
                                <option value="tiktok">TikTok</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-dark-text mb-2">
                            Duration (seconds)
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={formData.duration}
                            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                            className="w-full bg-dark-surface-light border border-dark-border rounded-lg px-4 py-2 text-dark-text focus:outline-none focus:border-accent-primary"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Adding...' : 'Add Video'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="btn-secondary"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
