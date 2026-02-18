'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { VideoReference } from '@/types';
import { cn, formatDuration, formatRelativeTime, getPlatformInfo } from '@/lib/utils';
import VideoPlayerModal from '../VideoPlayerModal';

interface VideoCardProps {
    video: VideoReference;
    className?: string;
    onDelete?: (id: string) => void;
}

export default function VideoCard({ video, className, onDelete }: VideoCardProps) {
    const router = useRouter();
    const platformInfo = getPlatformInfo(video.platform);
    const hasAnalysis = !!video.analysis;
    const [showPlayer, setShowPlayer] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handlePlayClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowPlayer(true);
    };

    const handleAnalyzeClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        router.push(`/analysis/${video.id}`);
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            setIsDeleting(true);
            const response = await fetch(`/api/videos/${video.id}`, {
                method: 'DELETE',
            });
            const data = await response.json();
            if (data.success) {
                onDelete?.(video.id);
                window.dispatchEvent(new CustomEvent('videos-updated'));
            }
        } catch (err) {
            console.error('Failed to delete video:', err);
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    return (
        <>
            <div className={cn('card-hover group cursor-pointer relative', className)}>
                {/* Delete Confirm Overlay */}
                {showDeleteConfirm && (
                    <div
                        className="absolute inset-0 bg-dark-bg/95 backdrop-blur-sm z-20 rounded-xl flex flex-col items-center justify-center gap-4 p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <p className="text-dark-text font-semibold text-center">이 영상을 삭제할까요?</p>
                        <p className="text-dark-text-muted text-sm text-center line-clamp-2">{video.title}</p>
                        <div className="flex gap-3 w-full">
                            <button
                                onClick={handleConfirmDelete}
                                disabled={isDeleting}
                                className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium text-sm transition-all disabled:opacity-50"
                            >
                                {isDeleting ? '삭제 중...' : '삭제'}
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(false); }}
                                className="flex-1 py-2 px-4 bg-dark-surface-light text-dark-text rounded-lg font-medium text-sm transition-all hover:bg-dark-border"
                            >
                                취소
                            </button>
                        </div>
                    </div>
                )}

                {/* Thumbnail */}
                <div className="relative aspect-video rounded-lg overflow-hidden bg-dark-surface-light mb-4">
                    <Image
                        src={video.thumbnailUrl}
                        alt={video.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Play Button Overlay */}
                    <button
                        onClick={handlePlayClick}
                        className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                        aria-label="Play video"
                    >
                        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center transform hover:scale-110 transition-transform">
                            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>
                    </button>

                    {/* Duration Badge */}
                    <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium">
                        {formatDuration(video.duration)}
                    </div>

                    {/* Platform Badge */}
                    <div
                        className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium backdrop-blur-sm"
                        style={{ backgroundColor: `${platformInfo.color}20`, borderColor: platformInfo.color }}
                    >
                        <span className="mr-1">{platformInfo.icon}</span>
                        <span className="capitalize">{video.platform}</span>
                    </div>

                    {/* Analysis Status */}
                    {hasAnalysis && (
                        <div className="absolute top-2 right-2 bg-accent-success/20 backdrop-blur-sm border border-accent-success px-2 py-1 rounded text-xs font-medium text-accent-success">
                            ✓ 분석완료
                        </div>
                    )}

                    {/* Delete Button */}
                    <button
                        onClick={handleDeleteClick}
                        className="absolute bottom-2 left-2 bg-black/70 hover:bg-red-600/80 backdrop-blur-sm p-1.5 rounded text-xs opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
                        aria-label="Delete video"
                    >
                        🗑️
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-2">
                    <h3 className="font-semibold text-dark-text line-clamp-2 group-hover:text-accent-primary transition-colors">
                        {video.title}
                    </h3>

                    <p className="text-sm text-dark-text-muted">
                        {video.brand}
                    </p>

                    <div className="flex items-center justify-between text-xs text-dark-text-muted">
                        <span>{formatRelativeTime(video.collectedAt)}</span>

                        {hasAnalysis && video.analysis && (
                            <div className="flex items-center gap-1">
                                <span>⭐</span>
                                <span className="font-medium text-accent-primary">
                                    {video.analysis.overallScore}/10
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Key Takeaways Preview */}
                    {hasAnalysis && video.analysis && video.analysis.keyTakeaways.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-dark-border">
                            <p className="text-xs text-dark-text-muted mb-2">핵심 인사이트:</p>
                            <p className="text-sm text-dark-text line-clamp-2">
                                💡 {video.analysis.keyTakeaways[0]}
                            </p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-4 flex gap-2">
                        <button
                            onClick={handleAnalyzeClick}
                            className={cn(
                                'flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all',
                                hasAnalysis
                                    ? 'bg-accent-primary/10 text-accent-primary border border-accent-primary hover:bg-accent-primary hover:text-white'
                                    : 'bg-accent-primary text-white hover:bg-accent-primary-dark'
                            )}
                        >
                            {hasAnalysis ? '📊 분석 보기' : '🔍 분석하기'}
                        </button>
                        <button
                            onClick={handlePlayClick}
                            className="py-2 px-4 rounded-lg font-medium text-sm bg-dark-surface-light text-dark-text hover:bg-dark-surface-lighter transition-all border border-dark-border"
                        >
                            ▶️ 재생
                        </button>
                    </div>
                </div>
            </div>

            {/* Video Player Modal */}
            <VideoPlayerModal
                video={video}
                isOpen={showPlayer}
                onClose={() => setShowPlayer(false)}
            />
        </>
    );
}
