'use client';

import { useEffect } from 'react';
import { VideoReference } from '@/types';

interface VideoPlayerModalProps {
    video: VideoReference;
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Extract video ID from URL for embedding
 */
function getEmbedUrl(video: VideoReference): string | null {
    const url = video.videoUrl;

    // YouTube
    if (video.platform === 'youtube') {
        const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(youtubeRegex);
        if (match && match[1]) {
            return `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
        }
    }

    // Vimeo
    if (video.platform === 'vimeo') {
        const vimeoRegex = /vimeo\.com\/(\d+)/;
        const match = url.match(vimeoRegex);
        if (match && match[1]) {
            return `https://player.vimeo.com/video/${match[1]}?autoplay=1`;
        }
    }

    return null;
}

export default function VideoPlayerModal({ video, isOpen, onClose }: VideoPlayerModalProps) {
    const embedUrl = getEmbedUrl(video);

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // If no embed URL, open in new tab
    if (!embedUrl) {
        window.open(video.videoUrl, '_blank');
        onClose();
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative z-10 w-full max-w-6xl mx-4">
                {/* Header */}
                <div className="bg-dark-surface rounded-t-lg px-6 py-4 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-bold text-dark-text truncate">
                            {video.title}
                        </h2>
                        <p className="text-sm text-dark-text-muted mt-1">
                            {video.brand}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="ml-4 text-dark-text-muted hover:text-dark-text transition-colors"
                        aria-label="Close"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Video Player */}
                <div className="bg-black rounded-b-lg overflow-hidden">
                    <div className="relative" style={{ paddingBottom: '56.25%' }}>
                        <iframe
                            src={embedUrl}
                            className="absolute inset-0 w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-dark-surface rounded-b-lg px-6 py-4 mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-dark-text-muted">
                        <span className="capitalize">📺 {video.platform}</span>
                        {video.metrics && (
                            <>
                                <span>👁️ {video.metrics.views.toLocaleString()} views</span>
                                <span>❤️ {video.metrics.likes.toLocaleString()} likes</span>
                            </>
                        )}
                    </div>
                    <a
                        href={video.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary text-sm"
                    >
                        Open in {video.platform === 'youtube' ? 'YouTube' : 'Vimeo'} ↗
                    </a>
                </div>
            </div>
        </div>
    );
}
