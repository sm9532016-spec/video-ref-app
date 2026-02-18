'use client';

import { useState } from 'react';
import { CollectionResult } from '@/types';

interface CollectButtonProps {
    onSuccess?: () => void;
}

export default function CollectButton({ onSuccess }: CollectButtonProps) {
    const [isCollecting, setIsCollecting] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [result, setResult] = useState<CollectionResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleCollect = async () => {
        try {
            setIsCollecting(true);
            setError(null);

            const response = await fetch('/api/collect', {
                method: 'POST',
            });

            const data = await response.json();

            if (data.success && data.data) {
                setResult(data.data);
                setShowResult(true);
                onSuccess?.();
            } else {
                setError(data.error || 'Failed to collect videos');
            }
        } catch (err) {
            setError('Failed to collect videos');
        } finally {
            setIsCollecting(false);
        }
    };

    if (showResult && result) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="card max-w-2xl w-full">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-dark-text">Collection Complete! 🎉</h2>
                        <button
                            onClick={() => setShowResult(false)}
                            className="text-dark-text-muted hover:text-dark-text text-2xl"
                        >
                            ×
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-accent-success/10 border border-accent-success rounded-lg p-4">
                            <p className="text-accent-success font-medium">
                                Successfully collected {result.totalCollected} videos!
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-dark-text mb-3">Platform Breakdown</h3>
                            <div className="space-y-2">
                                {result.platformBreakdown.map((item) => (
                                    <div key={item.platform} className="flex items-center justify-between bg-dark-surface-light rounded-lg p-3">
                                        <span className="text-dark-text capitalize">{item.platform}</span>
                                        <span className="text-accent-primary font-bold">{item.count} videos</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button onClick={() => setShowResult(false)} className="btn-primary w-full">
                            View Videos
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-4">
                    {error}
                </div>
            )}
            <button
                onClick={handleCollect}
                disabled={isCollecting}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
                {isCollecting ? (
                    <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Collecting Videos...
                    </>
                ) : (
                    <>
                        🎯 Collect Today's Videos
                    </>
                )}
            </button>
        </>
    );
}
