import { VideoCanvas } from '../components/analysis/VideoCanvas';
import { MetricCard } from '../components/analysis/MetricCard';
import { AICoachPanel } from '../components/analysis/AICoachPanel';
import { BoltScore } from '../components/analysis/BoltScore';
import { useLiveMetrics, useSessionStatus } from '../hooks/useLiveData';
import { Wifi, WifiOff, Activity } from 'lucide-react';

export default function AnalysisHub() {
    const { metrics, loading: metricsLoading } = useLiveMetrics();
    const { status } = useSessionStatus();
    
    const formatMetric = (value: number | undefined, decimals: number = 0) => {
        if (value === undefined || value === null) return '--';
        return decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString();
    };
    
    const getAngleStatus = (angle: number | undefined, optimalMin: number, optimalMax: number) => {
        if (angle === undefined) return { status: 'WAITING', color: 'neutral' as const };
        if (angle >= optimalMin && angle <= optimalMax) return { status: 'OPTIMAL', color: 'green' as const };
        if (Math.abs(angle - optimalMin) < 15 || Math.abs(angle - optimalMax) < 15) return { status: 'GOOD', color: 'neutral' as const };
        return { status: 'ADJUST', color: 'neon' as const };
    };

    return (
        <div className="flex flex-col h-full gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold font-mono uppercase tracking-wider">B.O.L.T Hub: Live Session</h1>
                <div className="flex items-center gap-2">
                    {status.isActive ? (
                        <span className="flex items-center gap-2 text-sm text-green-400 bg-green-900/30 px-3 py-1.5 rounded-full">
                            <Wifi size={14} className="animate-pulse" />
                            Session Active
                        </span>
                    ) : (
                        <span className="flex items-center gap-2 text-sm text-gray-500 bg-gray-800/50 px-3 py-1.5 rounded-full">
                            <WifiOff size={14} />
                            No Active Session
                        </span>
                    )}
                </div>
            </div>

            <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">

                {/* Left Column (Video + Metrics) */}
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 h-full">
                    {/* Video Section */}
                    <div className="flex-[2] min-h-[400px]">
                        <VideoCanvas />
                    </div>

                    {/* Metrics Section - Now Live! */}
                    <div className="flex-1 glass-panel rounded-2xl p-6 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold font-mono">Live Metrics</h2>
                            {metricsLoading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            ) : (
                                <Activity size={18} className={status.isActive ? "text-green-400 animate-pulse" : "text-gray-500"} />
                            )}
                        </div>
                        
                        {/* Current Shot Badge */}
                        {metrics?.shot_label && metrics.shot_label !== 'IDLE' && (
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-lg text-sm font-bold uppercase ${
                                    metrics.shot_label === 'SMASH' ? 'bg-red-900/40 text-red-400 border border-red-700/50' :
                                    metrics.shot_label === 'SERVE' ? 'bg-blue-900/40 text-blue-400 border border-blue-700/50' :
                                    metrics.shot_label === 'DROP' ? 'bg-purple-900/40 text-purple-400 border border-purple-700/50' :
                                    metrics.shot_label === 'BACKHAND' ? 'bg-orange-900/40 text-orange-400 border border-orange-700/50' :
                                    metrics.shot_label === 'FOREHAND_DRIVE' ? 'bg-yellow-900/40 text-yellow-400 border border-yellow-700/50' :
                                    'bg-gray-700/50 text-gray-300 border border-gray-600'
                                }`}>
                                    {metrics.shot_label}
                                </span>
                                <span className="text-sm text-gray-400">
                                    Phase: <span className="text-primary font-mono">{metrics.phase || 'N/A'}</span>
                                </span>
                                <span className="text-sm text-gray-400">
                                    Confidence: <span className="text-green-400 font-mono">{formatMetric((metrics.confidence || 0) * 100)}%</span>
                                </span>
                            </div>
                        )}
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            <MetricCard
                                label="Elbow Angle"
                                value={formatMetric(metrics?.elbow_angle)}
                                unit="°"
                                {...getAngleStatus(metrics?.elbow_angle, 90, 150)}
                            />
                            <MetricCard
                                label="Shoulder Angle"
                                value={formatMetric(metrics?.shoulder_angle)}
                                unit="°"
                                {...getAngleStatus(metrics?.shoulder_angle, 120, 180)}
                            />
                            <MetricCard
                                label="Knee Angle"
                                value={formatMetric(metrics?.knee_angle)}
                                unit="°"
                                {...getAngleStatus(metrics?.knee_angle, 120, 170)}
                            />
                            <MetricCard
                                label="Body Rotation"
                                value={formatMetric(metrics?.body_rotation, 1)}
                                unit="°"
                                status={metrics?.body_rotation !== undefined ? (metrics.body_rotation > 30 ? 'GOOD' : 'LOW') : 'WAITING'}
                                statusColor={metrics?.body_rotation !== undefined ? (metrics.body_rotation > 30 ? 'green' : 'neutral') : 'neutral'}
                            />
                            <MetricCard
                                label="Wrist Height"
                                value={formatMetric(metrics?.wrist_height_cm)}
                                unit="cm"
                                status={metrics?.wrist_height_cm !== undefined ? 'TRACKING' : 'WAITING'}
                                statusColor="neon"
                            />
                        </div>
                        
                        {/* Secondary Metrics Row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                            <MetricCard
                                label="Hip Rotation"
                                value={formatMetric(metrics?.hip_rotation, 1)}
                                unit="°"
                                status={metrics?.hip_rotation !== undefined ? 'ACTIVE' : 'WAITING'}
                                statusColor="neutral"
                                className="h-24"
                            />
                            <MetricCard
                                label="Shoulder Rotation"
                                value={formatMetric(metrics?.shoulder_rotation, 1)}
                                unit="°"
                                status={metrics?.shoulder_rotation !== undefined ? 'ACTIVE' : 'WAITING'}
                                statusColor="neutral"
                                className="h-24"
                            />
                            <MetricCard
                                label="Forearm Rotation"
                                value={formatMetric(metrics?.forearm_rotation, 1)}
                                unit="°"
                                status={metrics?.forearm_rotation !== undefined ? 'TRACKING' : 'WAITING'}
                                statusColor="neon"
                                className="h-24"
                            />
                            <MetricCard
                                label="Velocity"
                                value={formatMetric((metrics?.velocity || 0) * 1000, 2)}
                                unit="px/s"
                                status={metrics?.velocity !== undefined ? 'LIVE' : 'WAITING'}
                                statusColor="green"
                                className="h-24"
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column (AI Coach + Score) */}
                <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 h-full">
                    {/* AI Coach */}
                    <div className="flex-[2] min-h-[300px]">
                        <AICoachPanel />
                    </div>

                    {/* Bolt Score */}
                    <div className="flex-1 glass-panel rounded-2xl p-6 flex items-center justify-center min-h-[250px]">
                        <BoltScore score={metrics?.score || 0} />
                    </div>
                </div>

            </div>
        </div>
    );
}
