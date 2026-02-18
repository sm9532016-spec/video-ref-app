interface AnalysisSectionProps {
    title: string;
    icon: string;
    children: React.ReactNode;
}

export default function AnalysisSection({ title, icon, children }: AnalysisSectionProps) {
    return (
        <div className="card">
            <h3 className="text-lg font-bold text-dark-text mb-4 flex items-center gap-2">
                <span>{icon}</span>
                {title}
            </h3>
            {children}
        </div>
    );
}
