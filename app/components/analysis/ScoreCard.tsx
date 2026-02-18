interface ScoreCardProps {
    title: string;
    score: number;
    icon: string;
}

export default function ScoreCard({ title, score, icon }: ScoreCardProps) {
    const getScoreColor = (score: number) => {
        if (score >= 8) return 'text-accent-success';
        if (score >= 6) return 'text-accent-warning';
        return 'text-accent-danger';
    };

    const getScoreBarColor = (score: number) => {
        if (score >= 8) return 'bg-accent-success';
        if (score >= 6) return 'bg-accent-warning';
        return 'bg-accent-danger';
    };

    return (
        <div className="card">
            <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{icon}</span>
                <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
                    {score}
                </span>
            </div>
            <h4 className="text-sm font-medium text-dark-text mb-2">{title}</h4>
            <div className="w-full bg-dark-border rounded-full h-2">
                <div
                    className={`h-2 rounded-full transition-all ${getScoreBarColor(score)}`}
                    style={{ width: `${score * 10}%` }}
                />
            </div>
        </div>
    );
}
