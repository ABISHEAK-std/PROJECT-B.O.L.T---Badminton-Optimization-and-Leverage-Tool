
export function WeeklySummary() {
    const stats = [
        { label: 'Total Smashes Analyzed', value: '4,567' },
        { label: 'Highest BOLT Score', value: '9.8' },
        { label: 'Average Session Duration', value: '45 mins' },
        { label: 'Total Training Hours', value: '6.5 hrs' },
        { label: 'Most Frequent Shot', value: 'Clear' },
    ];

    return (
        <div className="glass-panel rounded-2xl p-6 h-fit">
            <h2 className="text-xl font-bold font-mono text-primary mb-6 uppercase tracking-wider">Weekly Summary</h2>

            <div className="space-y-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0">
                        <span className="text-sm text-gray-400 font-medium">{stat.label}</span>
                        <span className="text-lg font-bold text-white font-mono">{stat.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
