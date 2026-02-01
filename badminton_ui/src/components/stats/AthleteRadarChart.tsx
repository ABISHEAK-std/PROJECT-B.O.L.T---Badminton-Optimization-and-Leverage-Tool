import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface AthleteRadarChartProps {
    avgElbowAngle?: number;
    avgShoulderAngle?: number;
    avgKneeAngle?: number;
    avgScore?: number;
}

export function AthleteRadarChart({ 
    avgElbowAngle = 0, 
    avgShoulderAngle = 0, 
    avgKneeAngle = 0,
    avgScore = 0 
}: AthleteRadarChartProps) {
    // Normalize values to a 0-150 scale for the radar chart
    const normalizeAngle = (angle: number, target: number) => {
        if (angle === 0) return 0;
        // Score based on how close to target (closer = better)
        const diff = Math.abs(angle - target);
        const maxDiff = 90; // Max deviation
        return Math.max(0, Math.min(150, 150 - (diff / maxDiff * 150)));
    };
    
    const data = [
        { 
            subject: 'Elbow Form', 
            A: normalizeAngle(avgElbowAngle, 155), // Target ~155° for smash
            B: 130, 
            fullMark: 150 
        },
        { 
            subject: 'Shoulder Form', 
            A: normalizeAngle(avgShoulderAngle, 140), // Target ~140° for power
            B: 130, 
            fullMark: 150 
        },
        { 
            subject: 'Knee Stability', 
            A: normalizeAngle(avgKneeAngle, 110), // Target ~110° for stability
            B: 120, 
            fullMark: 150 
        },
        { 
            subject: 'BOLT Score', 
            A: avgScore > 0 ? (avgScore / 100) * 150 : 0, 
            B: 127, // Elite ~85 score
            fullMark: 150 
        },
        { 
            subject: 'Consistency', 
            A: avgScore > 0 ? Math.min(150, avgScore * 1.5) : 0, 
            B: 130, 
            fullMark: 150 
        },
    ];

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
