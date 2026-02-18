'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from './components/layout/DashboardLayout';
import VideoCard from './components/dashboard/VideoCard';
import VideoUploadForm from './components/VideoUploadForm';
import CollectButton from './components/CollectButton';
import { VideoReference } from '@/types';
import { videoApi, handleApiError } from '@/lib/api/client';
import { useSearch } from './context/SearchContext';

// ─── Date helpers ────────────────────────────────────────────────────────────

function getDateKey(date: Date | string): string {
  const d = new Date(date);
  // Use local timezone, not UTC — so KST users see dates in KST
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateLabel(dateKey: string): string {
  const today = getDateKey(new Date());
  const yesterday = getDateKey(new Date(Date.now() - 86400000));

  if (dateKey === today) return '오늘';
  if (dateKey === yesterday) return '어제';

  const d = new Date(dateKey);
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
}

function formatDateFull(dateKey: string): string {
  const d = new Date(dateKey);
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
}

// ─── DateFolder component ─────────────────────────────────────────────────────

interface DateFolderProps {
  dateKey: string;
  videos: VideoReference[];
  defaultOpen: boolean;
  onDelete: (id: string) => void;
  onVideoUpdate: (video: VideoReference) => void;
  isAnalyzingAll: boolean;
  onAnalyzeAll: (videos: VideoReference[]) => void;
}

function DateFolder({
  dateKey,
  videos,
  defaultOpen,
  onDelete,
  onVideoUpdate,
  isAnalyzingAll,
  onAnalyzeAll,
}: DateFolderProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const isToday = dateKey === getDateKey(new Date());
  const unanalyzed = videos.filter(v => !v.analysis);
  const analyzedCount = videos.filter(v => v.analysis).length;

  return (
    <div className={`rounded-xl border transition-all duration-300 ${isToday
      ? 'border-accent-primary/40 bg-accent-primary/5'
      : 'border-dark-border bg-dark-surface/50'
      }`}>
      {/* Folder Header */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors rounded-xl"
      >
        <div className="flex items-center gap-3">
          {/* Folder icon */}
          <span className="text-2xl">{isOpen ? '📂' : '📁'}</span>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className={`font-bold text-lg ${isToday ? 'text-accent-primary' : 'text-dark-text'}`}>
                {formatDateLabel(dateKey)}
              </span>
              {isToday && (
                <span className="px-2 py-0.5 bg-accent-primary text-white text-xs font-bold rounded-full animate-pulse">
                  NEW
                </span>
              )}
            </div>
            {!isToday && (
              <p className="text-xs text-dark-text-muted">{formatDateFull(dateKey)}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Stats badges */}
          <div className="flex items-center gap-2 text-sm">
            <span className="px-2.5 py-1 bg-dark-surface-light rounded-lg text-dark-text-muted">
              🎬 {videos.length}개
            </span>
            {analyzedCount > 0 && (
              <span className="px-2.5 py-1 bg-accent-primary/10 text-accent-primary rounded-lg">
                ✅ {analyzedCount}개 분석
              </span>
            )}
            {unanalyzed.length > 0 && (
              <span className="px-2.5 py-1 bg-yellow-500/10 text-yellow-400 rounded-lg">
                ⏳ {unanalyzed.length}개 미분석
              </span>
            )}
          </div>
          {/* Chevron */}
          <span className={`text-dark-text-muted transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </div>
      </button>

      {/* Folder Content */}
      {isOpen && (
        <div className="px-5 pb-5">
          {/* Analyze All button for this date */}
          {unanalyzed.length > 0 && (
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => onAnalyzeAll(unanalyzed)}
                disabled={isAnalyzingAll}
                className="btn-secondary flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzingAll ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                    분석 중...
                  </>
                ) : (
                  <>🤖 {unanalyzed.length}개 일괄 분석</>
                )}
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map(video => (
              <VideoCard
                key={video.id}
                video={video}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

function DashboardContent() {
  const router = useRouter();
  const { searchQuery } = useSearch();
  const [videos, setVideos] = useState<VideoReference[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzingAll, setIsAnalyzingAll] = useState(false);

  const loadVideos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await videoApi.getAll();
      setVideos(data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  useEffect(() => {
    const handleUpdate = () => loadVideos();
    window.addEventListener('videos-updated', handleUpdate);
    return () => window.removeEventListener('videos-updated', handleUpdate);
  }, [loadVideos]);

  const handleDelete = (id: string) => {
    setVideos(prev => prev.filter(v => v.id !== id));
  };

  const handleVideoUpdate = (updated: VideoReference) => {
    setVideos(prev => prev.map(v => v.id === updated.id ? updated : v));
  };

  const handleAnalyzeGroup = async (group: VideoReference[]) => {
    setIsAnalyzingAll(true);
    try {
      for (const video of group) {
        try {
          const updated = await videoApi.analyze(video.id);
          setVideos(prev => prev.map(v => v.id === video.id ? updated : v));
        } catch (err) {
          console.error(`Failed to analyze video ${video.id}:`, err);
        }
      }
    } finally {
      setIsAnalyzingAll(false);
    }
  };

  // Filter videos based on search query
  const filteredVideos = useMemo(() => {
    if (!searchQuery.trim()) return videos;
    const q = searchQuery.toLowerCase();
    return videos.filter(video =>
      video.title.toLowerCase().includes(q) ||
      video.brand.toLowerCase().includes(q) ||
      video.platform.toLowerCase().includes(q) ||
      (video.analysis?.keyTakeaways?.some(t => t.toLowerCase().includes(q))) ||
      (video.tags?.some(t => t.toLowerCase().includes(q)))
    );
  }, [videos, searchQuery]);

  // Group videos by date, sorted newest first
  const groupedByDate = useMemo(() => {
    const groups: Record<string, VideoReference[]> = {};
    filteredVideos.forEach(video => {
      // Create a set of unique date keys for this video
      // This ensures the video appears in every date folder it was collected in
      const dateKeys = new Set<string>();

      // Add current collection date
      dateKeys.add(getDateKey(video.collectedAt));

      // Add historical collection dates
      if (video.collectionHistory && Array.isArray(video.collectionHistory)) {
        video.collectionHistory.forEach(date => {
          dateKeys.add(getDateKey(date));
        });
      }

      // Add video to all relevant groups
      dateKeys.forEach(key => {
        if (!groups[key]) groups[key] = [];
        groups[key].push(video);
      });
    });

    // Sort each group by collectedAt descending (within the folder, show newest version top)
    // Or maybe sort by the date relevant to that folder? 
    // Actually, if a video is in "Yesterday", but its collectedAt is "Today", it might look odd if sorted by collectedAt?
    // But VideoReference only has one collectedAt. 
    // Ideally user sees the state of the video.
    Object.values(groups).forEach(g => g.sort((a, b) =>
      new Date(b.collectedAt).getTime() - new Date(a.collectedAt).getTime()
    ));

    // Return sorted date keys (newest first)
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [filteredVideos]);

  const todayKey = getDateKey(new Date());
  const totalCount = videos.length;
  const analyzedCount = videos.filter(v => v.analysis).length;
  const avgScore = analyzedCount > 0
    ? (videos.filter(v => v.analysis).reduce((acc, v) => acc + (v.analysis?.overallScore || 0), 0) / analyzedCount).toFixed(1)
    : null;
  const totalDays = groupedByDate.length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-text">영상 레퍼런스</h1>
          <p className="text-dark-text-muted mt-1">
            크리에이티브 영상을 수집하고 AI로 분석하세요
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/settings')}
            className="btn-secondary flex items-center gap-2"
          >
            ⚙️ 설정
          </button>
          <CollectButton onSuccess={loadVideos} />
          <VideoUploadForm onSuccess={loadVideos} />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary mx-auto mb-4" />
            <p className="text-dark-text-muted">영상 불러오는 중...</p>
          </div>
        </div>
      )}

      {!isLoading && !error && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-dark-text-muted">전체 영상</p>
                  <p className="text-2xl font-bold text-dark-text mt-1">{totalCount}</p>
                </div>
                <span className="text-4xl">🎬</span>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-dark-text-muted">수집 일수</p>
                  <p className="text-2xl font-bold text-dark-text mt-1">{totalDays}일</p>
                </div>
                <span className="text-4xl">📅</span>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-dark-text-muted">분석 완료</p>
                  <p className="text-2xl font-bold text-accent-primary mt-1">{analyzedCount}</p>
                </div>
                <span className="text-4xl">✅</span>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-dark-text-muted">평균 점수</p>
                  <p className="text-2xl font-bold text-accent-primary mt-1">{avgScore ?? 'N/A'}</p>
                </div>
                <span className="text-4xl">⭐</span>
              </div>
            </div>
          </div>

          {/* Date-grouped video sections */}
          {groupedByDate.length === 0 ? (
            <div className="card text-center py-16">
              {searchQuery ? (
                <>
                  <p className="text-5xl mb-4">🔍</p>
                  <p className="text-dark-text-muted mb-2">"{searchQuery}"에 대한 검색 결과가 없습니다.</p>
                  <p className="text-sm text-dark-text-muted">다른 검색어를 시도해보세요.</p>
                </>
              ) : (
                <>
                  <p className="text-5xl mb-4">🎬</p>
                  <p className="text-dark-text-muted mb-4">아직 영상이 없습니다. 첫 번째 영상을 추가해보세요!</p>
                  <div className="flex justify-center gap-3">
                    <CollectButton onSuccess={loadVideos} />
                    <VideoUploadForm onSuccess={loadVideos} />
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Section label */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-dark-text">
                  {searchQuery
                    ? `"${searchQuery}" 검색 결과 — ${filteredVideos.length}개`
                    : `날짜별 영상 보관함 — ${totalDays}일치`}
                </h2>
              </div>

              {groupedByDate.map(([dateKey, dateVideos]) => (
                <DateFolder
                  key={dateKey}
                  dateKey={dateKey}
                  videos={dateVideos}
                  defaultOpen={dateKey === todayKey}
                  onDelete={handleDelete}
                  onVideoUpdate={handleVideoUpdate}
                  isAnalyzingAll={isAnalyzingAll}
                  onAnalyzeAll={handleAnalyzeGroup}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <DashboardLayout>
      <DashboardContent />
    </DashboardLayout>
  );
}
