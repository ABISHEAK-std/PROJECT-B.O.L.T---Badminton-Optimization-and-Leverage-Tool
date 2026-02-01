import { AthleteRadarChart } from '../components/stats/AthleteRadarChart';
import { QuickStatCard } from '../components/stats/QuickStatCard';
import { TrendChart } from '../components/stats/TrendChart';
import { BenchmarkCard } from '../components/stats/BenchmarkCard';
import { BarChart2, Zap, Activity, Dumbbell, Target } from 'lucide-react';

const TREND_DATA_1 = [65, 59, 80, 81, 56, 55, 40, 70, 60, 75, 80, 90];
const TREND_DATA_2 = [60, 65, 60, 70, 75, 80, 85, 80, 75, 70, 75, 80];
const TREND_DATA_3 = [40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95];
const TREND_DATA_4 = [80, 75, 70, 75, 80, 85, 80, 75, 80, 85, 90, 92];

export default function Stats() {
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
                        <AthleteRadarChart />
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
                    <div className="glass-panel p-4 rounded-xl mb-2">
                        <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Quick Stats</h2>
                    </div>
                    <QuickStatCard icon={BarChart2} label="Total Sessions" value="124" trend="+15% vs last month" index={0} />
                    <QuickStatCard icon={Zap} label="Avg. BOLT Score" value="84.2" trend="+7.1 pts vs last month" index={1} />
                    <QuickStatCard icon={Activity} label="Peak Smash Speed" value="223 km/h" trend="New personal best" index={2} />
                    <QuickStatCard icon={Dumbbell} label="Hours Trained" value="38.5" trend="+7 hrs vs last month" index={3} />
                    <QuickStatCard icon={Target} label="Shots Analyzed" value="14,580" trend="+1,700 vs last month" index={4} />
                </div>

                {/* Middle Row: Trend Sparklines */}
                {[
                    { label: 'Power Trend (Last 30 Days)', data: TREND_DATA_1 },
                    { label: 'Accuracy Trend (Last 30 Days)', data: TREND_DATA_2 },
                    { label: 'Footwork Trend (Last 30 Days)', data: TREND_DATA_3 },
                    { label: 'Consistency Trend (Last 30 Days)', data: TREND_DATA_4 },
                ].map((item, idx) => (
                    <div key={idx} className="col-span-12 md:col-span-6 lg:col-span-3 glass-panel p-5 rounded-xl">
                        <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">{item.label}</h3>
                        <TrendChart data={item.data} color={idx % 2 === 0 ? '#DFFF00' : '#4ADE80'} />
                    </div>
                ))}

                {/* Bottom Row: Pro Benchmark Comparison */}
                <div className="col-span-12 glass-panel rounded-2xl p-6">
                    <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-6">Pro Benchmark Comparison</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <BenchmarkCard label="Serve Power" unit="km/h" value="215" eliteValue="220" max={250} />
                        <BenchmarkCard label="Smash Accuracy" unit="%" value="88" eliteValue="92" max={100} />
                        <BenchmarkCard label="Net Play Wins" unit="%" value="75" eliteValue="70" max={100} />
                        <BenchmarkCard label="Drop Shot Success" unit="%" value="68" eliteValue="75" max={100} />

                        {/* Second Row of benchmarks if needed, or just 4 as per image space, image has 4 cards visible clearly, maybe more */}
                        <BenchmarkCard label="Clear Depth" unit="%" value="95" eliteValue="98" max={100} />
                        <BenchmarkCard label="Footwork Speed" unit="m/s" value="3.2" eliteValue="3.5" max={5} />
                        <BenchmarkCard label="Reaction Time" unit="s" value="0.18" eliteValue="0.15" max={0.5} />
                        <BenchmarkCard label="Consistency Score" unit="" value="89" eliteValue="94" max={100} />
                    </div>
                </div>
            </div>
        </div>
    );
}
