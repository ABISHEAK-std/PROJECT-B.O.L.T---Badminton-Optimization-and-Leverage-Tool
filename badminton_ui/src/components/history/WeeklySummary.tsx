import { useMemo } from 'react';
import type { ArchivedSession } from '../../services/liveDataService';

interface WeeklySummaryProps {
    sessions: ArchivedSession[];
}

export function WeeklySummary({ sessions }: WeeklySummaryProps) {
    // Calculate dynamic stats from sessions
    const stats = useMemo(() => {
        if (!sessions || sessions.length === 0) {
            return [
                { label: 'Total Sessions', value: '0' },
                { label: 'Highest BOLT Score', value: '--' },
                { label: 'Average Score', value: '--' },
                { label: 'Total Training Time', value: '0 mins' },
                { label: 'Total Insights', value: '0' },
            ];
        }
        
        // Calculate total sessions
        const totalSessions = sessions.length;
        
        // Calculate highest score
        const scores = sessions.map(s => s.score || 0).filter(s => s > 0);
        const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
        
        // Calculate average score
        const avgScore = scores.length > 0 
            ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) 
            : '--';
        
        // Calculate total training time
        const totalDuration = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);
        const totalMinutes = Math.round(totalDuration / 60000);
        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        const durationStr = hours > 0 ? `${hours}h ${mins}m` : `${mins} mins`;
        
        // Calculate total insights
        const totalInsights = sessions.reduce((acc, s) => {
            return acc + (s.insights ? Object.keys(s.insights).length : 0);
        }, 0);
        
        return [
            { label: 'Total Sessions', value: String(totalSessions) },
            { label: 'Highest BOLT Score', value: highestScore > 0 ? String(highestScore) : '--' },
            { label: 'Average Score', value: avgScore },
            { label: 'Total Training Time', value: durationStr },
            { label: 'Total Insights', value: String(totalInsights) },
        ];
    }, [sessions]);

    return (
        <div className="glass-panel rounded-2xl p-6 h-fit">
            <h2 className="text-xl font-bold font-mono text-primary mb-6 uppercase tracking-wider">Summary</h2>

            <div className="space-y-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0">
                        <span className="text-sm text-gray-400 font-medium">{stat.label}</span>
                        <span className="text-lg font-bold text-white font-mono">{stat.value}</span>
                    </div>
                ))}
            </div>
            
            {sessions.length === 0 && (
                <p className="text-xs text-gray-500 mt-4 text-center">
                    Start training to see your statistics
                </p>
            )}
        </div>
    );
}
