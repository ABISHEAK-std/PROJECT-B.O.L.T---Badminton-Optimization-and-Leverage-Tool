import { MessageSquare, Wifi, WifiOff } from 'lucide-react';
import { useCoachingInsights, useSessionStatus } from '../../hooks/useLiveData';
import { motion, AnimatePresence } from 'framer-motion';

const fallbackInsights = [
    { id: '1', time: '--:--', videoTime: '0.00s', shot: 'WAITING', error: '', advice: 'Start a session to see live coaching insights...', timestamp: 0 },
];

export function AICoachPanel() {
    const { insights, loading } = useCoachingInsights();
    const { status } = useSessionStatus();
    
    const displayInsights = insights.length > 0 ? insights : fallbackInsights;
    
    const formatTime = (timestamp: number) => {
        if (!timestamp) return '--:--';
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    return (
        <div className="h-full flex flex-col glass-panel rounded-2xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold font-mono"> Postures and Shots Insights</h2>
                    {status.isActive ? (
                        <span className="flex items-center gap-1 text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded-full">
                            <Wifi size={12} className="animate-pulse" />
                            LIVE
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-800/50 px-2 py-1 rounded-full">
                            <WifiOff size={12} />
                            OFFLINE
                        </span>
                    )}
                </div>
                <MessageSquare size={20} className="text-gray-400" />
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <AnimatePresence>
                        {displayInsights.map((insight, idx) => (
                            <motion.div 
                                key={insight.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3, delay: idx * 0.05 }}
                                className={`bg-white/5 p-4 rounded-xl border-l-2 hover:bg-white/10 transition-colors ${
                                    insight.error ? 'border-red-500/50' : 'border-primary/50'
                                }`}
                            >
                                {/* Shot type badge */}
                                {insight.shot && insight.shot !== 'WAITING' && (
                                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-2 ${
                                        insight.shot === 'SMASH' ? 'bg-red-900/40 text-red-400' :
                                        insight.shot === 'SERVE' ? 'bg-blue-900/40 text-blue-400' :
                                        insight.shot === 'DROP' ? 'bg-purple-900/40 text-purple-400' :
                                        insight.shot === 'BACKHAND' ? 'bg-orange-900/40 text-orange-400' :
                                        'bg-gray-700/50 text-gray-300'
                                    }`}>
                                        {insight.shot}
                                    </span>
                                )}
                                
                                {/* Error indicator */}
                                {insight.error && (
                                    <p className="text-sm text-red-400 font-semibold mb-1">
                                        {insight.error}
                                    </p>
                                )}
                                
                                {/* Advice text */}
                                <p className="text-sm text-gray-200 leading-relaxed">
                                    {insight.advice}
                                </p>
                                
                                {/* Time info */}
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-xs text-gray-500 font-mono">
                                        {formatTime(insight.timestamp)}
                                    </span>
                                    {insight.videoTime && insight.videoTime !== '0.00s' && (
                                        <span className="text-xs text-primary/70 font-mono">
                                            Video: {insight.videoTime}
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}

                {/* Gradient overlay at bottom */}
                <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-[#0D0D0D] to-transparent pointer-events-none"></div>
            </div>
        </div>
    );
}
