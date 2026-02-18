'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../components/layout/DashboardLayout';
import { UserSettings } from '@/types';

// --- Constants & Options ---

const STUDY_FOCUS_OPTIONS = [
    { value: 'Motion Rhythm', label: '모션 리듬 분석', desc: '타이밍과 속도감 연구' },
    { value: 'Transition', label: '트랜지션 연구', desc: '장면 전환 기법 분석' },
    { value: 'Ad Structure', label: '광고 설득 구조', desc: '훅과 스토리텔링' },
    { value: 'Product Shot', label: '제품샷 연출', desc: '매력적인 제품 보여주기' },
    { value: 'Camera Move', label: '카메라 무브', desc: '역동적인 앵글 분석' },
    { value: 'Color/Lighting', label: '컬러/조명 연구', desc: '분위기와 톤앤매너' },
    { value: 'Typo Animation', label: '타이포 애니메이션', desc: '텍스트 움직임 연구' },
];

const GENRE_OPTIONS = [
    { value: 'Motion Graphics', label: 'Motion Graphics', icon: '🎨' },
    { value: 'Advertising', label: 'Advertising', icon: '📢' },
    { value: 'Film', label: 'Film', icon: '🎬' },
    { value: 'Media Art', label: 'Media Art', icon: '🌌' },
];

const TOOL_OPTIONS = ['After Effects', 'Blender', 'Unreal Engine', 'Cinema 4D'];
const STYLE_OPTIONS = ['Minimal', 'Abstract', 'Photorealistic', 'Liquid Motion', 'Glitch'];

const TIME_PERIOD_OPTIONS = [
    { value: '3_months', label: 'Last 3 Months', desc: '최신 트렌드' },
    { value: '6_months', label: 'Last 6 Months', desc: '' },
    { value: '1_year', label: 'Last 1 Year', desc: '표준' },
    { value: 'all', label: 'All Time', desc: '레전드' },
];

const SORT_OPTIONS = [
    { value: 'creative_quality', label: 'Creative Quality' },
    { value: 'editors_pick', label: 'Editors Pick' },
];

// --- Main Component ---

export default function SettingsPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    // State matching UserSettings interface
    const [settings, setSettings] = useState<Partial<UserSettings>>({
        studyFocus: 'Motion Rhythm',
        genre: 'Motion Graphics',
        tools: ['After Effects'],
        styles: ['Minimal'],
        timePeriod: '1_year',
        collectionLimit: 3,
        autoAnalyze: true,
        sortBy: 'creative_quality',
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/settings');
            const data = await response.json();
            if (data.success && data.data) {
                // Ensure defaults if fields are missing in migration
                setSettings({
                    ...data.data,
                    tools: data.data.tools || [],
                    styles: data.data.styles || [],
                });
            }
        } catch (err) {
            setMessage({ text: '설정을 불러오는데 실패했습니다.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            setMessage(null);

            const response = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });
            const data = await response.json();

            if (data.success) {
                setMessage({ text: '오늘의 학습 루틴이 저장되었습니다!', type: 'success' });
                // Optional: Redirect to dashboard after short delay
                setTimeout(() => setMessage(null), 3000);
            } else {
                throw new Error(data.error);
            }
        } catch (err) {
            setMessage({ text: '저장 실패. 다시 시도해주세요.', type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const toggleArrayItem = (field: 'tools' | 'styles', value: string, max: number) => {
        const current = settings[field] || [];
        if (current.includes(value)) {
            setSettings({ ...settings, [field]: current.filter(item => item !== value) });
        } else {
            if (current.length < max) {
                setSettings({ ...settings, [field]: [...current, value] });
            }
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-screen">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto pb-20 space-y-8">
                {/* Header */}
                <div className="text-center space-y-2 pt-8">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Daily Study Routine
                    </h1>
                    <p className="text-dark-text-muted">
                        오늘의 집중 훈련 목표를 설계하세요
                    </p>
                </div>

                {/* Message Toast */}
                {message && (
                    <div className={`fixed top-24 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-lg z-50 animate-fade-in ${message.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-red-500/20 text-red-400 border border-red-500/50'
                        }`}>
                        {message.text}
                    </div>
                )}

                {/* Stage 1: Study Focus */}
                <section className="space-y-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-accent-primary/20 flex items-center justify-center text-accent-primary font-bold">1</div>
                        <h2 className="text-xl font-bold text-white">오늘의 훈련 목표 (Study Focus)</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {STUDY_FOCUS_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setSettings({ ...settings, studyFocus: option.value })}
                                className={`text-left p-4 rounded-xl border transition-all duration-200 group relative overflow-hidden ${settings.studyFocus === option.value
                                        ? 'bg-accent-primary/10 border-accent-primary'
                                        : 'bg-dark-surface border-dark-border hover:border-gray-600'
                                    }`}
                            >
                                <div className="relative z-10">
                                    <div className={`font-bold mb-1 ${settings.studyFocus === option.value ? 'text-accent-primary' : 'text-gray-200'}`}>
                                        {option.label}
                                    </div>
                                    <div className="text-xs text-gray-500">{option.desc}</div>
                                </div>
                                {settings.studyFocus === option.value && (
                                    <div className="absolute inset-0 bg-accent-primary/5 pointer-events-none" />
                                )}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Stage 2: Genre */}
                <section className="space-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">2</div>
                        <h2 className="text-xl font-bold text-white">장르 선택 (Genre)</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {GENRE_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setSettings({ ...settings, genre: option.value })}
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 gap-2 ${settings.genre === option.value
                                        ? 'bg-purple-500/10 border-purple-500 text-purple-400'
                                        : 'bg-dark-surface border-dark-border hover:border-gray-600 text-gray-400'
                                    }`}
                            >
                                <span className="text-2xl">{option.icon}</span>
                                <span className="font-medium text-sm">{option.label}</span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Stage 3: Scope */}
                <section className="space-y-6 animate-slide-up bg-dark-surface/50 p-6 rounded-2xl border border-dark-border" style={{ animationDelay: '0.3s' }}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">3</div>
                        <h2 className="text-xl font-bold text-white">검색 범위 (Scope)</h2>
                    </div>

                    {/* Tools */}
                    <div>
                        <label className="text-sm text-gray-400 mb-3 block">Tools (최대 2개)</label>
                        <div className="flex flex-wrap gap-2">
                            {TOOL_OPTIONS.map(tool => (
                                <button
                                    key={tool}
                                    onClick={() => toggleArrayItem('tools', tool, 2)}
                                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors border ${settings.tools?.includes(tool)
                                            ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                                            : 'bg-dark-surface border-dark-border text-gray-400 hover:border-gray-600'
                                        }`}
                                >
                                    {tool}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Styles */}
                    <div>
                        <label className="text-sm text-gray-400 mb-3 block">Styles (최대 2개)</label>
                        <div className="flex flex-wrap gap-2">
                            {STYLE_OPTIONS.map(style => (
                                <button
                                    key={style}
                                    onClick={() => toggleArrayItem('styles', style, 2)}
                                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors border ${settings.styles?.includes(style)
                                            ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                                            : 'bg-dark-surface border-dark-border text-gray-400 hover:border-gray-600'
                                        }`}
                                >
                                    {style}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Time Period */}
                    <div>
                        <label className="text-sm text-gray-400 mb-3 block">Time Range</label>
                        <div className="flex flex-wrap gap-2">
                            {TIME_PERIOD_OPTIONS.map(time => (
                                <button
                                    key={time.value}
                                    onClick={() => setSettings({ ...settings, timePeriod: time.value as any })}
                                    className={`px-4 py-2 rounded-lg text-sm transition-colors border ${settings.timePeriod === time.value
                                            ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                                            : 'bg-dark-surface border-dark-border text-gray-400 hover:border-gray-600'
                                        }`}
                                >
                                    {time.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Stage 4: Daily Plan */}
                <section className="space-y-4 animate-slide-up bg-dark-surface p-6 rounded-2xl border border-dark-border" style={{ animationDelay: '0.4s' }}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold">4</div>
                        <h2 className="text-xl font-bold text-white">하루 수집 전략 (Daily Plan)</h2>
                    </div>

                    <div className="space-y-6">
                        {/* Count */}
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-400">이번 세션 수집량</span>
                                <span className="text-green-400 font-bold">{settings.collectionLimit}개</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="5"
                                value={settings.collectionLimit}
                                onChange={(e) => setSettings({ ...settings, collectionLimit: parseInt(e.target.value) })}
                                className="w-full h-2 bg-dark-bg rounded-lg appearance-none cursor-pointer accent-green-500"
                            />
                            <p className="text-xs text-gray-500 mt-2 text-right">최대 5개 제한 (깊이 있는 분석을 위해)</p>
                        </div>

                        {/* Options */}
                        <div className="flex items-center justify-between p-3 bg-dark-bg/50 rounded-lg">
                            <span className="text-gray-300 text-sm">자동 분석 (AI Analysis)</span>
                            <div
                                onClick={() => setSettings({ ...settings, autoAnalyze: !settings.autoAnalyze })}
                                className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${settings.autoAnalyze ? 'bg-green-500' : 'bg-gray-700'}`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${settings.autoAnalyze ? 'translate-x-6' : 'translate-x-0'}`} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">정렬 기준</label>
                            <div className="grid grid-cols-2 gap-2">
                                {SORT_OPTIONS.map(sort => (
                                    <button
                                        key={sort.value}
                                        onClick={() => setSettings({ ...settings, sortBy: sort.value as any })}
                                        className={`py-2 text-sm rounded-lg border transition-all ${settings.sortBy === sort.value
                                                ? 'bg-green-500/10 border-green-500 text-green-400'
                                                : 'bg-dark-bg border-dark-border text-gray-400'
                                            }`}
                                    >
                                        {sort.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Save Action */}
                <div className="sticky bottom-4 pt-4 animate-slide-up" style={{ animationDelay: '0.5s' }}>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full py-4 bg-gradient-to-r from-accent-primary to-accent-secondary text-white font-bold rounded-xl shadow-lg shadow-accent-primary/20 hover:shadow-accent-primary/40 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? '루틴 저장 중...' : '오늘의 루틴 시작하기 ✨'}
                    </button>
                    <p className="text-center text-xs text-gray-500 mt-3">
                        설정된 내용은 다음 수집 시 바로 반영됩니다.
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
}
