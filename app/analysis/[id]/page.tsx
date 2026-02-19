'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import { VideoReference } from '@/types';
import { formatDuration, getPlatformInfo } from '@/lib/utils';
import { getEmbedUrl } from '@/lib/utils/urlParser';
import AnalysisSection from '@/app/components/analysis/AnalysisSection';
import DetailedReport from '@/app/components/analysis/DetailedReport';
import ColorPalette from '@/app/components/analysis/ColorPalette';
import ScoreCard from '@/app/components/analysis/ScoreCard';
import { videoApi, handleApiError } from '@/lib/api/client';

export default function AnalysisDetailPage() {
    const params = useParams();
    const router = useRouter();
    const videoId = params.id as string;

    const [video, setVideo] = useState<VideoReference | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadVideo = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await videoApi.getById(videoId);
            setVideo(data);
        } catch (err) {
            setError(handleApiError(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnalyze = async () => {
        if (!video) return;

        try {
            setIsAnalyzing(true);
            setError(null);
            const updatedVideo = await videoApi.analyze(videoId);
            setVideo(updatedVideo);
        } catch (err) {
            setError(handleApiError(err));
        } finally {
            setIsAnalyzing(false);
        }
    };

    useEffect(() => {
        loadVideo();
    }, [videoId]);

    // Loading state
    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary mx-auto mb-4"></div>
                        <p className="text-dark-text-muted">Loading video...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // Error or not found state
    if (error || !video) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-dark-text mb-2">
                            {error ? 'Error' : 'Video not found'}
                        </h1>
                        <p className="text-dark-text-muted mb-4">
                            {error || "The video you're looking for doesn't exist."}
                        </p>
                        <button onClick={() => router.push('/')} className="btn-primary">
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // No analysis yet
    if (!video.analysis) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-dark-text mb-2">Analysis not available</h1>
                        <p className="text-dark-text-muted mb-4">This video hasn't been analyzed yet.</p>
                        {isAnalyzing ? (
                            <div className="flex flex-col items-center gap-4">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div>
                                <p className="text-dark-text">Analyzing video... This may take 10-30 seconds.</p>
                            </div>
                        ) : (
                            <button onClick={handleAnalyze} className="btn-primary">
                                Analyze Now
                            </button>
                        )}
                        <button onClick={() => router.push('/')} className="btn-secondary mt-4">
                            ← Back to Dashboard
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    const platformInfo = getPlatformInfo(video.platform);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <span
                                className="px-3 py-1 rounded-lg text-sm font-medium"
                                style={{ backgroundColor: `${platformInfo.color}20`, color: platformInfo.color }}
                            >
                                {platformInfo.icon} {video.platform.toUpperCase()}
                            </span>
                            <span className="text-dark-text-muted text-sm">
                                {formatDuration(video.duration)}
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold text-dark-text mb-2">
                            {video.title}
                        </h1>
                        <p className="text-lg text-dark-text-muted">{video.brand}</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-gradient">
                                {video.analysis.overallScore}
                            </div>
                            <div className="text-sm text-dark-text-muted mt-1">종합 점수</div>
                        </div>
                        <button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing}
                            className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isAnalyzing ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                                    재분석 중...
                                </>
                            ) : (
                                <>🔄 재분석</>
                            )}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Video Player (1/3 width) - Made sticky */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="card sticky top-6">
                            <div className="aspect-video bg-dark-surface-light rounded-lg overflow-hidden relative">
                                {/* Embedded Video Player */}
                                {/* Embedded Video Player */}
                                {(() => {
                                    const embedUrl = getEmbedUrl(video.videoUrl);
                                    if (embedUrl) {
                                        return (
                                            <iframe
                                                src={embedUrl}
                                                title={video.title}
                                                className="w-full h-full"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            />
                                        );
                                    }
                                    return (
                                        // Fallback for unsupported platforms
                                        <>
                                            <img
                                                src={video.thumbnailUrl}
                                                alt={video.title}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                                                <a
                                                    href={video.videoUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-16 h-16 bg-accent-primary rounded-full flex items-center justify-center hover:bg-accent-primary/90 transition-all hover:scale-110"
                                                >
                                                    <span className="text-3xl ml-1">▶️</span>
                                                </a>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Overall Score Card - Kept as it is valid */}
                        <div className="card text-center p-6">
                            <h3 className="text-lg font-bold text-dark-text-muted mb-2">종합 제작 완성도</h3>
                            <div className="text-5xl font-bold text-gradient mb-2">
                                {video.analysis.overallScore}
                                <span className="text-2xl text-dark-text-muted">/10</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Detailed Analysis Report (2/3 width) */}
                    <div className="lg:col-span-2">
                        <DetailedReport analysis={video.analysis} />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
