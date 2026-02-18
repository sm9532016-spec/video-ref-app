import React from 'react';
import { VideoAnalysis } from '@/types';
import AnalysisSection from './AnalysisSection';

export default function DetailedReport({ analysis }: { analysis: VideoAnalysis }) {
    if (!analysis) return null;

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* 1. Basic Info & One Line Summary */}
            <div className="bg-gradient-to-r from-accent-primary/10 to-transparent p-6 rounded-2xl border border-accent-primary/20">
                <h2 className="text-xl font-bold text-accent-primary mb-2">📌 한 줄 요약</h2>
                <p className="text-2xl font-bold text-white">{analysis.oneLineSummary || "요약 정보 없음"}</p>
            </div>

            {/* 2. Timecode Analysis */}
            <AnalysisSection title="타임코드 분해" icon="⏱️">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 text-dark-text-muted text-sm">
                                <th className="py-3 px-4 w-24">구간</th>
                                <th className="py-3 px-4 w-32">내용</th>
                                <th className="py-3 px-4">제작 포인트</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {analysis.timecodeAnalysis?.map((segment, idx) => (
                                <tr key={idx} className="hover:bg-white/5 transition-colors">
                                    <td className="py-3 px-4 font-mono text-accent-primary">{segment.timestamp}</td>
                                    <td className="py-3 px-4 font-semibold">{segment.content}</td>
                                    <td className="py-3 px-4 text-dark-text-muted">{segment.productionPoint}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </AnalysisSection>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 3. Shot Analysis */}
                <AnalysisSection title="샷/컷 분석" icon="🎬">
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-dark-text-muted">평균 컷 길이</span>
                            <span className="font-mono">{analysis.shotAnalysis?.averageCutLength}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-dark-text-muted">가장 짧은 컷</span>
                            <span className="font-mono">{analysis.shotAnalysis?.shortestCut}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-dark-text-muted">가장 긴 컷</span>
                            <span className="font-mono">{analysis.shotAnalysis?.longestCut}</span>
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/10">
                            <p className="text-sm text-dark-text-muted mb-1">편집 리듬 패턴</p>
                            <p className="font-semibold">{analysis.shotAnalysis?.rhythmPattern}</p>
                        </div>
                    </div>
                </AnalysisSection>

                {/* 4. Visual Analysis */}
                <AnalysisSection title="시각 설계 분석" icon="🎨">
                    <ul className="space-y-4">
                        <li>
                            <span className="text-xs text-dark-text-muted block mb-1">컬러 전략</span>
                            <p>{analysis.visualAnalysis?.colorStrategy}</p>
                        </li>
                        <li>
                            <span className="text-xs text-dark-text-muted block mb-1">구도 규칙</span>
                            <p>{analysis.visualAnalysis?.compositionRules}</p>
                        </li>
                        <li>
                            <span className="text-xs text-dark-text-muted block mb-1">공간 깊이감</span>
                            <p>{analysis.visualAnalysis?.spatialDepth}</p>
                        </li>
                        <li>
                            <span className="text-xs text-dark-text-muted block mb-1">텍스처/질감</span>
                            <p>{analysis.visualAnalysis?.textureExpress}</p>
                        </li>
                    </ul>
                </AnalysisSection>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 5. Sound Analysis */}
                <AnalysisSection title="사운드 분석" icon="🔊">
                    <ul className="space-y-4">
                        <li className="flex items-center justify-between">
                            <span className="text-dark-text-muted">음악 유무</span>
                            <span className={analysis.soundAnalysis?.hasMusic ? "text-green-400" : "text-dark-text-muted"}>
                                {analysis.soundAnalysis?.hasMusic ? "있음" : "없음"}
                            </span>
                        </li>
                        <li>
                            <span className="text-xs text-dark-text-muted block mb-1">효과음 역할</span>
                            <p>{analysis.soundAnalysis?.soundEffectsRole}</p>
                        </li>
                        <li>
                            <span className="text-xs text-dark-text-muted block mb-1">침묵의 사용</span>
                            <p>{analysis.soundAnalysis?.silenceUsage}</p>
                        </li>
                    </ul>
                </AnalysisSection>

                {/* 7. Genre Specifics */}
                <AnalysisSection title={`장르별 분석: ${analysis.genreSpecifics?.genre || '기타'}`} icon="🏷️">
                    <div className="space-y-4">
                        {analysis.genreSpecifics?.genre === 'Motion Graphics' && (
                            <>
                                <div><span className="text-dark-text-muted text-sm block">Ease 패턴</span><p>{analysis.genreSpecifics.easePattern}</p></div>
                                <div><span className="text-dark-text-muted text-sm block">반복/루프</span><p>{analysis.genreSpecifics.loopStructure}</p></div>
                                <div><span className="text-dark-text-muted text-sm block">속도 변화 구간</span><p className="font-mono text-accent-primary">{analysis.genreSpecifics.speedChangeSegment}</p></div>
                            </>
                        )}
                        {analysis.genreSpecifics?.genre === 'Advertisement' && (
                            <>
                                <div><span className="text-dark-text-muted text-sm block">0-3초 훅</span><p>{analysis.genreSpecifics.hookMechanism}</p></div>
                                <div><span className="text-dark-text-muted text-sm block">브랜드 노출 시간</span><p className="font-mono text-accent-primary">{analysis.genreSpecifics.brandExposureDuration}</p></div>
                                <div><span className="text-dark-text-muted text-sm block">CTA 등장</span><p>{analysis.genreSpecifics.ctaTiming}</p></div>
                            </>
                        )}
                        {analysis.genreSpecifics?.genre === 'Movie' && (
                            <>
                                <div><span className="text-dark-text-muted text-sm block">카메라 무브먼트</span><p>{analysis.genreSpecifics.cameraMovement}</p></div>
                                <div><span className="text-dark-text-muted text-sm block">조명 대비</span><p>{analysis.genreSpecifics.lightingContrast}</p></div>
                                <div><span className="text-dark-text-muted text-sm block">감정 전환 구간</span><p className="font-mono text-accent-primary">{analysis.genreSpecifics.emotionShiftTiming}</p></div>
                            </>
                        )}
                        {analysis.genreSpecifics?.genre === 'Media Art' && (
                            <>
                                <div><span className="text-dark-text-muted text-sm block">공간 추정</span><p>{analysis.genreSpecifics.spaceEstimation}</p></div>
                                <div><span className="text-dark-text-muted text-sm block">관람자 위치</span><p>{analysis.genreSpecifics.viewerPosition}</p></div>
                                <div><span className="text-dark-text-muted text-sm block">공간 인식 장면</span><p className="font-mono text-accent-primary">{analysis.genreSpecifics.spaceRecognitionSegment}</p></div>
                            </>
                        )}
                    </div>
                </AnalysisSection>
            </div>

            {/* 6. Replication Recipe */}
            <AnalysisSection title="재현 레시피 (How-to)" icon="🛠️">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <h4 className="text-sm font-bold text-dark-text-muted mb-2 uppercase tracking-wider">추천 툴</h4>
                        <div className="flex flex-wrap gap-2">
                            {analysis.replicationRecipe?.recommendedTools?.map((tool, i) => (
                                <span key={i} className="px-3 py-1 bg-white/10 rounded-full text-sm">{tool}</span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-dark-text-muted mb-2 uppercase tracking-wider">핵심 기능</h4>
                        <div className="flex flex-wrap gap-2">
                            {analysis.replicationRecipe?.keyFunctions?.map((func, i) => (
                                <span key={i} className="px-3 py-1 bg-accent-primary/20 text-accent-primary rounded-full text-sm">{func}</span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-dark-surface p-4 rounded-xl border border-white/5 mb-4">
                    <h4 className="text-sm font-bold text-dark-text-muted mb-2">세팅 값 추정</h4>
                    <p className="font-mono text-sm">{analysis.replicationRecipe?.settings}</p>
                </div>

                <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/20 mb-6">
                    <h4 className="text-sm font-bold text-red-400 mb-1">⚠️ 가장 어려운 부분</h4>
                    <p>{analysis.replicationRecipe?.difficultyPoint}</p>
                </div>

                <div>
                    <h4 className="text-sm font-bold text-dark-text-muted mb-3">핵심 포인트 3가지</h4>
                    <ol className="list-decimal list-inside space-y-2">
                        {analysis.replicationRecipe?.corePoints?.map((point, i) => (
                            <li key={i} className="text-lg text-white/90">{point}</li>
                        ))}
                    </ol>
                </div>
            </AnalysisSection>

            {/* 8. Educational Points */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card bg-accent-primary/5 border border-accent-primary/20 p-6 rounded-2xl">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-accent-primary">
                        <span>🧪</span> 실험 제안
                    </h3>
                    <ul className="space-y-3">
                        {analysis.learningPoints?.experiments?.map((exp, i) => (
                            <li key={i} className="flex gap-3">
                                <span className="text-accent-primary font-bold">{i + 1}.</span>
                                <p>{exp}</p>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="card bg-dark-card border border-white/5 p-6 rounded-2xl">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <span>🎯</span> 제작 난이도 & 포인트
                    </h3>
                    <div className="bg-white/5 p-4 rounded-xl mb-4 flex items-center justify-between">
                        <span className="text-sm text-dark-text-muted">난이도</span>
                        <div className="text-right">
                            <span className={`text-2xl font-bold ${analysis.learningPoints?.difficultyLevel === 'High' ? 'text-red-500' :
                                    analysis.learningPoints?.difficultyLevel === 'Medium' ? 'text-yellow-500' : 'text-green-500'
                                }`}>
                                {analysis.learningPoints?.difficultyLevel || 'Medium'}
                            </span>
                            <p className="text-xs text-dark-text-muted mt-1">{analysis.learningPoints?.difficultyReason}</p>
                        </div>
                    </div>
                    <div className="pt-4 border-t border-white/10">
                        <span className="text-xs text-accent-primary font-bold uppercase tracking-wider block mb-2">Must Watch Point</span>
                        <p className="text-lg font-bold leading-relaxed">{analysis.learningPoints?.mustWatchPoint}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
