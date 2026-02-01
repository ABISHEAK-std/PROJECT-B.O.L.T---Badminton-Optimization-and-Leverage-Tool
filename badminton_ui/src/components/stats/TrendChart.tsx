import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

interface TrendChartProps {
    data: number[];
    color?: string;
}

export function TrendChart({ data, color = '#DFFF00' }: TrendChartProps) {
    const chartData = data.map((val, idx) => ({ i: idx, val }));

    return (
        <div className="h-16 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                    <YAxis domain={['dataMin - 10', 'dataMax + 10']} hide />
                    <Line
                        type="monotone"
                        dataKey="val"
                        stroke={color}
                        strokeWidth={2}
                        dot={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
