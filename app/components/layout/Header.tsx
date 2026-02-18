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
        <header className="fixed top-0 right-0 left-64 h-16 bg-dark-surface/80 backdrop-blur-lg border-b border-dark-border z-10">
            <div className="h-full px-6 flex items-center justify-between">
                {/* Search Bar */}
                <div className="flex-1 max-w-xl">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="영상, 브랜드, 분석 내용 검색..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-dark-surface-light border border-dark-border rounded-lg px-4 py-2 pl-10 text-dark-text placeholder:text-dark-text-muted focus:outline-none focus:border-accent-primary/50 transition-colors"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-text-muted">
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
                <div className="flex items-center gap-4">
                    {/* Collect Videos Button */}
                    <button
                        onClick={handleCollect}
                        disabled={isCollecting}
                        className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isCollecting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                <span>수집 중...</span>
                            </>
                        ) : (
                            <>
                                <span>⚡</span>
                                <span>영상 수집</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
}
