import { motion } from 'framer-motion';

interface BenchmarkCardProps {
    label: string;
    value: string; // e.g., "215"
    eliteValue: string; // e.g., "220"
    unit?: string;
    max?: number;
}

export function BenchmarkCard({ label, value, eliteValue, unit, max = 100 }: BenchmarkCardProps) {
    const valNum = parseFloat(value);
    const eliteNum = parseFloat(eliteValue);

    // Simple calc for bar width relative to max (or elite value if we assume elite is near max)
    // If max is not provided, we can assume eliteValue is the goal/max roughly
    const barMax = max > eliteNum ? max : eliteNum * 1.2;

    const valPercent = (valNum / barMax) * 100;
    const elitePercent = (eliteNum / barMax) * 100;

    return (
        <div className="glass-panel p-5 rounded-xl flex flex-col justify-between">
            <h4 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-4">{label} {unit && `(${unit})`}</h4>

            <div className="space-y-3">
                {/* User Row */}
                <div className="flex items-end justify-between">
                    <div className="flex flex-col gap-1 w-full">
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-2xl font-bold font-mono text-white">{value}</span>
                            <span className="text-[10px] text-gray-500 font-bold uppercase">You</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${valPercent}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                className="h-full bg-primary"
                            />
                        </div>
                    </div>
                </div>

                {/* Elite Row */}
                <div className="flex items-end justify-between opacity-60">
                    <div className="flex flex-col gap-1 w-full">
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-lg font-bold font-mono text-white">{eliteValue}</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase">Pro Elite</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white"
                                style={{ width: `${elitePercent}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
