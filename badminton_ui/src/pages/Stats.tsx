import { AthleteRadarChart } from '../components/stats/AthleteRadarChart';
import { QuickStatCard } from '../components/stats/QuickStatCard';
import { TrendChart } from '../components/stats/TrendChart';
import { BenchmarkCard } from '../components/stats/BenchmarkCard';
import { BarChart2, Zap, Activity, Dumbbell, Target, Loader2 } from 'lucide-react';
import { useSessionStats } from '../hooks/useLiveData';

export default function Stats() {
    const { stats, loading } = useSessionStats();
    
    // Generate trend data from recent scores, padded to 12 values
    const scoreTrendData = stats.recentScores.length > 0 
        ? [...stats.recentScores, ...Array(Math.max(0, 12 - stats.recentScores.length)).fill(0)].slice(0, 12)
        : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div className="flex flex-col gap-6 pb-10">
            <div className="mb-4">
                <h1 className="text-2xl font-bold font-mono uppercase tracking-wider">Athlete Growth & Analytics</h1>
                <p className="text-gray-400 text-sm mt-1">Track your progress and benchmark against elite players to elevate your game.</p>
            </div>

            <div className="grid grid-cols-12 gap-6">

                {/* Top Row: Spider Chart + Quick Stats */}
                <div className="col-span-12 lg:col-span-8 glass-panel rounded-2xl p-6 min-h-[400px] flex flex-col">
                    <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-6">Athlete Skill Profile</h2>
                    <div className="flex-1 flex items-center justify-center">
                        <AthleteRadarChart 
                            avgElbowAngle={stats.avgElbowAngle}
                            avgShoulderAngle={stats.avgShoulderAngle}
                            avgKneeAngle={stats.avgKneeAngle}
                            avgScore={stats.avgScore}
                        />
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
                    <div className="glass-panel p-4 rounded-xl mb-2">
                        <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Quick Stats</h2>
                    </div>
                    <QuickStatCard 
                        icon={BarChart2} 
                        label="Total Sessions" 
                        value={stats.totalSessions.toString()} 
                        trend={stats.totalSessions > 0 ? `${stats.totalSessions} sessions recorded` : 'No sessions yet'} 
                        index={0} 
                    />
                    <QuickStatCard 
                        icon={Zap} 
                        label="Avg. BOLT Score" 
                        value={stats.avgScore > 0 ? stats.avgScore.toString() : '--'} 
                        trend={stats.avgScore > 0 ? `Based on ${stats.totalSessions} sessions` : 'No score data yet'} 
                        index={1} 
                    />
                    <QuickStatCard 
                        icon={Activity} 
                        label="Total Insights" 
                        value={stats.totalInsights.toString()} 
                        trend={stats.totalInsights > 0 ? `Coaching feedback provided` : 'No insights yet'} 
                        index={2} 
                    />
                    <QuickStatCard 
                        icon={Dumbbell} 
                        label="Time Trained" 
                        value={stats.totalDurationMinutes > 60 
                            ? `${Math.round(stats.totalDurationMinutes / 60 * 10) / 10}h` 
                            : `${Math.round(stats.totalDurationMinutes)}m`} 
                        trend={stats.totalDurationMinutes > 0 ? 'Total training time' : 'No sessions yet'} 
                        index={3} 
                    />
                    <QuickStatCard 
                        icon={Target} 
                        label="Shot Types" 
                        value={Object.keys(stats.shotDistribution).length.toString()} 
                        trend={Object.keys(stats.shotDistribution).length > 0 
                            ? Object.entries(stats.shotDistribution)
                                .sort((a, b) => b[1] - a[1])
                                .slice(0, 2)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(', ') 
                            : 'No shots recorded'} 
                        index={4} 
                    />
                </div>

                {/* Middle Row: Dynamic Stats */}
                <div className="col-span-12 md:col-span-6 lg:col-span-3 glass-panel p-5 rounded-xl">
                    <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">BOLT Score Trend</h3>
                    <TrendChart data={scoreTrendData} color="#DFFF00" />
                    <p className="text-xs text-gray-500 mt-2">Last {Math.min(12, stats.totalSessions)} sessions</p>
                </div>
                <div className="col-span-12 md:col-span-6 lg:col-span-3 glass-panel p-5 rounded-xl">
                    <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">Elbow Angle Avg</h3>
                    <div className="text-4xl font-bold font-mono text-primary">{stats.avgElbowAngle > 0 ? `${stats.avgElbowAngle}°` : '--'}</div>
                    <p className="text-xs text-gray-500 mt-2">Target: 140-170° for smash</p>
                </div>
                <div className="col-span-12 md:col-span-6 lg:col-span-3 glass-panel p-5 rounded-xl">
                    <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">Shoulder Angle Avg</h3>
                    <div className="text-4xl font-bold font-mono text-green-400">{stats.avgShoulderAngle > 0 ? `${stats.avgShoulderAngle}°` : '--'}</div>
                    <p className="text-xs text-gray-500 mt-2">Target: 120-180° for power</p>
                </div>
                <div className="col-span-12 md:col-span-6 lg:col-span-3 glass-panel p-5 rounded-xl">
                    <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">Knee Angle Avg</h3>
                    <div className="text-4xl font-bold font-mono text-blue-400">{stats.avgKneeAngle > 0 ? `${stats.avgKneeAngle}°` : '--'}</div>
                    <p className="text-xs text-gray-500 mt-2">Target: 90-120° for stability</p>
                </div>

                {/* Bottom Row: Shot Distribution */}
                <div className="col-span-12 glass-panel rounded-2xl p-6">
                    <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-6">Shot Type Distribution</h2>
                    {Object.keys(stats.shotDistribution).length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {Object.entries(stats.shotDistribution)
                                .sort((a, b) => b[1] - a[1])
                                .map(([shot, count]) => (
                                    <div key={shot} className="bg-white/5 rounded-xl p-4 text-center">
                                        <div className={`text-2xl font-bold font-mono ${
                                            shot === 'SMASH' ? 'text-red-400' :
                                            shot === 'SERVE' ? 'text-blue-400' :
                                            shot === 'DROP' ? 'text-purple-400' :
                                            shot === 'BACKHAND' ? 'text-orange-400' :
                                            shot === 'FOREHAND_DRIVE' ? 'text-green-400' :
                                            'text-gray-300'
                                        }`}>
                                            {count}
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1 uppercase">{shot.replace('_', ' ')}</p>
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <p>No shot data available yet</p>
                            <p className="text-xs mt-1">Complete a session to see shot distribution</p>
                        </div>
                    )}
                </div>
                
                {/* Form Benchmarks */}
                {stats.totalSessions > 0 && (
                    <div className="col-span-12 glass-panel rounded-2xl p-6">
                        <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-6">Form Benchmarks (Based on Your Sessions)</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <BenchmarkCard 
                                label="Elbow Extension" 
                                unit="°" 
                                value={stats.avgElbowAngle.toString()} 
                                eliteValue="165" 
                                max={180} 
                            />
                            <BenchmarkCard 
                                label="Shoulder Lift" 
                                unit="°" 
                                value={stats.avgShoulderAngle.toString()} 
                                eliteValue="150" 
                                max={180} 
                            />
                            <BenchmarkCard 
                                label="Knee Bend" 
                                unit="°" 
                                value={stats.avgKneeAngle.toString()} 
                                eliteValue="110" 
                                max={180} 
                            />
                            <BenchmarkCard 
                                label="Average Score" 
                                unit="" 
                                value={stats.avgScore.toString()} 
                                eliteValue="85" 
                                max={100} 
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
