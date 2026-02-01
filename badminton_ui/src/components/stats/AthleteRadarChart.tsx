import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const data = [
    { subject: 'Power', A: 120, B: 110, fullMark: 150 },
    { subject: 'Consistency', A: 98, B: 130, fullMark: 150 },
    { subject: 'Accuracy', A: 86, B: 130, fullMark: 150 },
    { subject: 'Footwork', A: 99, B: 100, fullMark: 150 },
    { subject: 'Endurance', A: 85, B: 90, fullMark: 150 },
];

export function AthleteRadarChart() {
    return (
        <div className="w-full h-[300px] relative">
            {/* Explicit Custom Legend since Recharts legend styling can be tricky to match perfectly */}
            <div className="absolute bottom-0 w-full flex justify-center gap-6 text-[10px] uppercase font-bold tracking-widest">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#DFFF00]"></div>
                    <span className="text-white">Your Performance</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-500"></div>
                    <span className="text-gray-400">Elite Average</span>
                </div>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                    <PolarGrid stroke="#333" />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: '#888', fontSize: 10, fontWeight: 'bold' }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />

                    {/* User Data */}
                    <Radar
                        name="Your Performance"
                        dataKey="A"
                        stroke="#DFFF00"
                        strokeWidth={2}
                        fill="#DFFF00"
                        fillOpacity={0.4}
                    />

                    {/* Elite Data */}
                    <Radar
                        name="Elite Average"
                        dataKey="B"
                        stroke="#666"
                        strokeWidth={1}
                        fill="#666"
                        fillOpacity={0.1}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
