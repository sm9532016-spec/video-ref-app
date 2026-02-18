'use client';

import { useState } from 'react';
import { useSearch } from '@/app/context/SearchContext';

export default function Header() {
    const { searchQuery, setSearchQuery } = useSearch();
    const [isCollecting, setIsCollecting] = useState(false);
    const [collectMsg, setCollectMsg] = useState<{ text: string; ok: boolean } | null>(null);

    const handleCollect = async () => {
        try {
            setIsCollecting(true);
            setCollectMsg(null);

            const response = await fetch('/api/collect', { method: 'POST' });
            const data = await response.json();

            if (data.success) {
                const saved = data.data?.newlySaved ?? data.data?.totalCollected ?? 0;
                setCollectMsg({
                    text: saved > 0 ? `✅ ${saved}개 새로 추가됨` : '이미 최신 상태',
                    ok: true,
                });
                window.dispatchEvent(new CustomEvent('videos-updated'));
            } else {
                setCollectMsg({ text: data.error || '수집 실패', ok: false });
            }
            setTimeout(() => setCollectMsg(null), 4000);
        } catch {
            setCollectMsg({ text: '수집 중 오류 발생', ok: false });
            setTimeout(() => setCollectMsg(null), 4000);
        } finally {
            setIsCollecting(false);
        }
    };

    return (
        <header className="fixed top-0 right-0 left-0 md:left-64 h-16 bg-dark-surface/80 backdrop-blur-lg border-b border-dark-border z-10 transition-all duration-300">
            <div className="h-full px-4 md:px-6 flex items-center justify-between gap-4">
                {/* Mobile Logo */}
                <div className="md:hidden flex-shrink-0 font-bold text-gradient text-lg">
                    VR
                </div>

                {/* Search Bar */}
                <div className="flex-1 max-w-xl">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="검색..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-dark-surface-light border border-dark-border rounded-lg px-4 py-2 pl-9 md:pl-10 text-sm md:text-base text-dark-text placeholder:text-dark-text-muted focus:outline-none focus:border-accent-primary/50 transition-colors"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-text-muted text-sm md:text-base">
                            🔍
                        </span>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-text-muted hover:text-dark-text"
                            >
                                ×
                            </button>
                        )}
                    </div>
                    {collectMsg && (
                        <p className={`text-xs mt-1 absolute ${collectMsg.ok ? 'text-green-400' : 'text-red-400'}`}>
                            {collectMsg.text}
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 md:gap-4">
                    {/* Collect Videos Button */}
                    <button
                        onClick={handleCollect}
                        disabled={isCollecting}
                        className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 md:px-4 md:py-2 text-sm md:text-base whitespace-nowrap"
                    >
                        {isCollecting ? (
                            <>
                                <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-white" />
                                <span className="hidden md:inline">수집 중...</span>
                            </>
                        ) : (
                            <>
                                <span>⚡</span>
                                <span className="hidden md:inline">영상 수집</span>
                                <span className="md:hidden">수집</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
}
