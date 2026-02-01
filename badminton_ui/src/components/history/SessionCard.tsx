import { Calendar, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface SessionCardProps {
    date: string;
    score: string; // e.g. "8.7"
    thumbnail: string;
    id: number;
}

export function SessionCard({ date, score, thumbnail, id: _id }: SessionCardProps) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="group glass-panel rounded-2xl overflow-hidden flex flex-col cursor-pointer hover:shadow-[0_0_20px_rgba(223,255,0,0.1)] transition-all duration-300"
        >
            {/* Thumbnail */}
            <div className="h-40 w-full relative overflow-hidden">
                <img
                    src={thumbnail}
                    alt="Session Thumbnail"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60"></div>

                {/* Overlay Icon */}
                <div className="absolute bottom-3 right-3 p-2 bg-black/60 rounded-full backdrop-blur-sm border border-white/20">
                    <User size={14} className="text-primary" />
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-gray-400 text-xs">
                    <Calendar size={12} />
                    <span>{date}</span>
                </div>

                <div className="flex items-center gap-2">
                    <div className="text-primary font-mono text-xl">
                        ✦ <span className="font-bold">BOLT Score: {score}</span>
                    </div>
                </div>

                <button className="w-full mt-2 py-2 bg-[#2a2a2a] text-primary rounded-lg font-bold text-sm hover:bg-primary hover:text-black transition-colors duration-300">
                    View Breakdown
                </button>
            </div>
        </motion.div>
    );
}
