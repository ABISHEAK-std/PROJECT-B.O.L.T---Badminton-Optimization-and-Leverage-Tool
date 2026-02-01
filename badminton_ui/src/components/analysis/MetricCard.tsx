import { cn } from '../../lib/utils';

interface MetricCardProps {
    label: string;
    value: string;
    unit?: string;
    status?: string;
    statusColor?: 'green' | 'red' | 'neutral' | 'blue' | 'neon';
    className?: string;
}

export function MetricCard({ label, value, unit, status, statusColor = 'green', className }: MetricCardProps) {
    return (
        <div className={cn("glass-panel p-4 rounded-xl flex flex-col justify-between h-32 relative overflow-hidden", className)}>
            <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold z-10">{label}</p>

            <div className="z-10">
                <h3 className="text-2xl font-bold font-mono text-white inline-block">
                    {value}
                    {unit && <span className="text-sm text-gray-500 ml-1 font-sans">{unit}</span>}
                </h3>
            </div>

            {status && (
                <div className={cn("inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border w-fit z-10",
                    statusColor === 'green' ? "bg-green-900/40 text-green-400 border-green-700/50" :
                        statusColor === 'neon' ? "bg-primary/10 text-primary border-primary/20" :
                            statusColor === 'neutral' ? "bg-gray-700/50 text-gray-300 border-gray-600" :
                                ""
                )}>
                    {status}
                </div>
            )}

            {/* Decorative Glow */}
            <div className={cn("absolute -bottom-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-20",
                statusColor === 'green' ? "bg-green-500" :
                    statusColor === 'neon' ? "bg-primary" :
                        "bg-white"
            )}></div>
        </div>
    );
}
