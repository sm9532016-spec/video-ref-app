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
    const [showAllFields, setShowAllFields] = useState(false); // Quick Add Mode State

    const [formData, setFormData] = useState({
        title: '',
        videoUrl: '',
        thumbnailUrl: '',
        brand: '',
        platform: 'youtube' as 'meta' | 'tiktok' | 'youtube' | 'other' | 'vimeo',
        duration: 0,
    });

    const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);

    // Reset form state when closed
    const handleClose = () => {
        setIsOpen(false);
        setShowAllFields(false);
        setFormData({
            title: '',
            videoUrl: '',
            thumbnailUrl: '',
            brand: '',
            platform: 'youtube',
            duration: 0,
        });
        setError(null);
    };

    const handleQuickAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        setIsFetchingMetadata(true);

        try {
            // 1. Fetch Metadata
            const metaResponse = await fetch('/api/video/metadata', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: formData.videoUrl }),
            });

            if (!metaResponse.ok) {
                // If metadata fetch fails, show all fields for manual entry
                setShowAllFields(true);
                throw new Error('Could not auto-fetch details. Please enter manually.');
            }

            const metadata = await metaResponse.json();

            // 2. Prepare Data for Creation
            const newVideoData = {
                ...formData,
                title: metadata.title || '',
                brand: metadata.brand || '',
                thumbnailUrl: metadata.thumbnailUrl || '',
                duration: metadata.duration || 0,
                platform: metadata.platform || 'youtube',
            };

            // Update form data in case we need to fallback to manual edit later (if create fails)
            setFormData(newVideoData);

            // 3. Create Video immediately
            await videoApi.create({
                ...newVideoData,
                thumbnailUrl: newVideoData.thumbnailUrl || undefined,
            });

            // Success!
            handleClose();
            onSuccess?.();

        } catch (err: any) {
            console.error('Quick Add Error:', err);
            setError(err.message || 'Failed to add video. Please try manual entry.');
            setShowAllFields(true); // Always show fields on error so user can fix/fill
        } finally {
            setIsLoading(false);
            setIsFetchingMetadata(false);
        }
    };

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await videoApi.create({
                ...formData,
                thumbnailUrl: formData.thumbnailUrl || undefined,
            });
            handleClose();
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
            <div className={`card max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-all duration-300 ${showAllFields ? 'scale-100' : 'scale-95'}`}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-dark-text">Add New Video</h2>
                    <button
                        onClick={handleClose}
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

                <form onSubmit={showAllFields ? handleManualSubmit : handleQuickAdd} className="space-y-4">

                    {/* URL Input - Always Visible */}
                    <div>
                        <label className="block text-sm font-medium text-dark-text mb-2">
                            Video URL *
                        </label>
                        <div className="relative">
                            <input
                                type="url"
                                required
                                autoFocus={!showAllFields}
                                value={formData.videoUrl}
                                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                                className="w-full bg-dark-surface-light border border-dark-border rounded-lg px-4 py-2 text-dark-text focus:outline-none focus:border-accent-primary pr-10"
                                placeholder="https://www.youtube.com/watch?v=..."
                            />
                            {isFetchingMetadata && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <div className="w-4 h-4 border-2 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                        </div>
                        {!showAllFields && (
                            <p className="text-xs text-dark-text-muted mt-1">
                                Paste a URL and press Enter (or click Add). We'll auto-fill the rest.
                            </p>
                        )}
                    </div>

                    {/* Hidden Fields - Shown only if showAllFields is true */}
                    {showAllFields && (
                        <div className="space-y-4 border-t border-dark-border pt-4 animate-in fade-in slide-in-from-top-2">
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
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (isFetchingMetadata ? 'Fetching Info...' : 'Adding...') : (showAllFields ? 'Add Video' : 'Add Video (Auto-Fill)')}
                        </button>

                        {!showAllFields && (
                            <button
                                type="button"
                                onClick={() => setShowAllFields(true)}
                                className="px-4 py-2 rounded-lg border border-dark-border text-dark-text hover:bg-dark-surface-light transition-colors"
                            >
                                Edit Manually
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={handleClose}
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
