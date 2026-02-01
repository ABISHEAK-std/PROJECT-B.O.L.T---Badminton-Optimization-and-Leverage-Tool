import { motion } from 'framer-motion';

export function BoltScore({ score }: { score: number }) {
    const circumference = 2 * Math.PI * 120; 
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <div className="relative w-full h-full flex items-center justify-center">
            {/* SVG Container */}
            <svg className="w-64 h-64 rotate-[-90deg]" viewBox="0 0 260 260">
                {/* Background Circle */}
                <circle
                    cx="130"
                    cy="130"
                    r="120"
                    stroke="#1A1A1A"
                    strokeWidth="2"
                    fill="none"
                />
                {/* Progress Circle */}
                <motion.circle
                    cx="130"
                    cy="130"
                    r="120"
                    stroke="#DFFF00"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: strokeDashoffset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_10px_rgba(223,255,0,0.5)]"
                />
            </svg>

            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-6xl font-bold font-mono text-primary drop-shadow-[0_0_15px_rgba(223,255,0,0.8)]"
                >
                    {score}
                </motion.div>
                <p className="text-gray-500 text-sm mt-2 uppercase tracking-widest">BOLT Score</p>
            </div>
        </div>
    );
}
