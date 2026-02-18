'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const navigation = [
    { name: '대시보드', href: '/', icon: '📊' },
    { name: '설정', href: '/settings', icon: '⚙️' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [todayCount, setTodayCount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);

    const loadStats = async () => {
        try {
            const response = await fetch('/api/videos');
            const data = await response.json();
            if (data.success && data.data) {
                const videos = data.data;
                setTotalCount(videos.length);

                // Count today's videos
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const todayVideos = videos.filter((v: any) => {
                    return new Date(v.collectedAt) >= today;
                });
                setTodayCount(todayVideos.length);
            }
        } catch (err) {
            // Silently fail
        }
    };

    useEffect(() => {
        loadStats();

        // Listen for video updates from Header collect button
        const handleUpdate = () => loadStats();
        window.addEventListener('videos-updated', handleUpdate);
        return () => window.removeEventListener('videos-updated', handleUpdate);
    }, []);

    // Refresh when navigating back to dashboard
    useEffect(() => {
        if (pathname === '/') {
            loadStats();
        }
    }, [pathname]);

    const dailyLimit = 5;
    const progressPercent = Math.min((todayCount / dailyLimit) * 100, 100);

    return (
        <>
            {/* Desktop Sidebar (Hidden on Mobile/Tablet/Laptop) */}
            {/* Desktop Sidebar (Hidden on Mobile/Tablet/Laptop) */}
            <aside className="hidden xl:flex fixed left-0 top-0 h-screen w-64 bg-dark-surface border-r border-dark-border flex-col z-20 mobile-hide-sidebar">
                {/* Logo */}
                <div className="p-6 border-b border-dark-border">
                    <h1 className="text-2xl font-bold text-gradient">
                        Video Ref (Mobile Fix V2)
                    </h1>
                    <p className="text-sm text-dark-text-muted mt-1">
                        크리에이티브 분석
                    </p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                                    'hover:bg-dark-surface-light',
                                    isActive && 'bg-accent-primary/10 text-accent-primary border border-accent-primary/20'
                                )}
                            >
                                <span className="text-xl">{item.icon}</span>
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer Stats */}
                <div className="p-4 border-t border-dark-border space-y-3">
                    <div className="glass-dark rounded-lg p-4">
                        <p className="text-sm text-dark-text-muted">
                            오늘 수집
                        </p>
                        <p className="text-2xl font-bold text-accent-primary mt-1">
                            {todayCount} / {dailyLimit}
                        </p>
                        <div className="w-full bg-dark-border rounded-full h-2 mt-3">
                            <div
                                className="bg-gradient-to-r from-accent-primary to-accent-secondary h-2 rounded-full transition-all duration-500"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>
                    <div className="glass-dark rounded-lg p-3">
                        <p className="text-xs text-dark-text-muted">전체 영상</p>
                        <p className="text-lg font-bold text-dark-text mt-0.5">{totalCount}개</p>
                    </div>
                </div>
            </aside>

            {/* Mobile Bottom Navigation (Hidden on Desktop) */}
            <nav className="xl:hidden fixed bottom-0 left-0 w-full h-16 bg-dark-surface border-t border-dark-border z-50 flex items-center justify-around px-2 pb-safe">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                'flex flex-col items-center justify-center w-full h-full gap-1',
                                isActive ? 'text-accent-primary' : 'text-dark-text-muted'
                            )}
                        >
                            <span className="text-2xl">{item.icon}</span>
                            <span className="text-xs font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </>
    );
}
