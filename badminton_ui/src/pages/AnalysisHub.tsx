import { VideoCanvas } from '../components/analysis/VideoCanvas';
import { MetricCard } from '../components/analysis/MetricCard';
import { AICoachPanel } from '../components/analysis/AICoachPanel';
import { BoltScore } from '../components/analysis/BoltScore';

export default function AnalysisHub() {
    return (
        <div className="flex flex-col h-full gap-6">
            <h1 className="text-2xl font-bold font-mono uppercase tracking-wider">Analysis Hub: Live Session</h1>

            <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">

                {/* Left Column (Video + Metrics) */}
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 h-full">
                    {/* Video Section */}
                    <div className="flex-[2] min-h-[400px]">
                        <VideoCanvas />
                    </div>

                    {/* Metrics Section */}
                    {/* TODO: Bind these metrics to real-time Firebase / sensor data */}
                    <div className="flex-1 glass-panel rounded-2xl p-6 flex flex-col gap-4">
                        <h2 className="text-xl font-bold font-mono">Live Metrics</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            <MetricCard
                                label="Smash Speed"
                                value="185"
                                unit="km/h"
                                status="OPTIMAL"
                                statusColor="green"
                            />
                            <MetricCard
                                label="Extension Angle"
                                value="170°"
                                status="GOOD"
                                statusColor="neutral"
                            />
                            <MetricCard
                                label="KCT Status"
                                value="Active"
                                status="OPTIMAL"
                                statusColor="green"
                            />
                            <MetricCard
                                label="Footwork Pace"
                                value="1.2"
                                unit="steps/sec"
                                status="GOOD"
                                statusColor="neutral"
                            />
                            <MetricCard
                                label="Reaction Time"
                                value="0.18s"
                                status="NEUTRAL"
                                statusColor="neutral"
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
                        <BoltScore score={87} />
                    </div>
                </div>

            </div>
        </div>
    );
}
