import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface QuickStatCardProps {
    label: string;
    value: string;
    trend: string;
    icon: LucideIcon;
    index: number;
}

export function QuickStatCard({ label, value, trend, icon: Icon, index }: QuickStatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-panel p-4 rounded-xl flex items-center justify-between group hover:bg-white/5 transition-colors"
        >
            <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">{label}</p>
                <h3 className="text-2xl font-bold font-mono text-white">{value}</h3>
                <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-primary">
                    <span>↗</span>
                    <span>{trend}</span>
                </div>
            </div>

            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300 border border-white/10">
                <Icon size={18} />
            </div>
        </motion.div>
    );
}
