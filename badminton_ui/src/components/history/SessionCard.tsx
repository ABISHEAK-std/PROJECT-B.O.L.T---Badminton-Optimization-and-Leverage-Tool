import { Calendar, Clock, Play, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ArchivedSession } from '../../services/liveDataService';

interface SessionCardProps {
    session: ArchivedSession;
    onViewBreakdown: (session: ArchivedSession) => void;
}

export function SessionCard({ session, onViewBreakdown }: SessionCardProps) {
    const hasVideo = !!session.videoUrl;
    const hasTranscript = !!session.transcriptUrl || !!session.transcriptContent;
    
    // Generate a gradient background based on session ID for variety
    const gradientColors = [
        'from-primary/20 to-primary/5',
        'from-blue-500/20 to-blue-500/5',
        'from-purple-500/20 to-purple-500/5',
        'from-green-500/20 to-green-500/5',
        'from-orange-500/20 to-orange-500/5',
    ];
    const gradientIndex = session.sessionId ? session.sessionId.charCodeAt(session.sessionId.length - 1) % gradientColors.length : 0;
    
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="group glass-panel rounded-2xl overflow-hidden flex flex-col cursor-pointer hover:shadow-[0_0_20px_rgba(223,255,0,0.1)] transition-all duration-300"
        >
            {/* Thumbnail / Header */}
            <div className={`h-32 w-full relative overflow-hidden bg-gradient-to-br ${gradientColors[gradientIndex]}`}>
                <div className="absolute inset-0 flex items-center justify-center">
                    {hasVideo ? (
                        <div className="w-16 h-16 rounded-full bg-black/40 flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                            <Play size={24} className="text-primary ml-1" />
                        </div>
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-black/40 flex items-center justify-center border border-white/20">
                            <FileText size={24} className="text-gray-400" />
                        </div>
                    )}
                </div>
                
                {/* Session ID Badge */}
                <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 rounded text-xs font-mono text-gray-300 backdrop-blur-sm">
                    {session.sessionId?.replace('session_', '#') || 'Session'}
                </div>
                
                {/* Status indicators */}
                <div className="absolute top-3 right-3 flex gap-1">
                    {hasVideo && (
                        <span className="px-2 py-0.5 bg-green-900/60 text-green-400 text-[10px] font-bold rounded backdrop-blur-sm">
                            VIDEO
                        </span>
                    )}
                    {hasTranscript && (
                        <span className="px-2 py-0.5 bg-blue-900/60 text-blue-400 text-[10px] font-bold rounded backdrop-blur-sm">
                            TRANSCRIPT
                        </span>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400 text-xs">
                        <Calendar size={12} />
                        <span>{session.date || 'Unknown date'}</span>
                    </div>
                    {session.durationFormatted && (
                        <div className="flex items-center gap-1 text-gray-500 text-xs">
                            <Clock size={12} />
                            <span>{session.durationFormatted}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <div className="text-primary font-mono text-xl">
                        ✦ <span className="font-bold">BOLT Score: {session.score || '--'}</span>
                    </div>
                </div>
                
                {/* Insights count */}
                {session.insights && Object.keys(session.insights).length > 0 && (
                    <div className="text-xs text-gray-500">
                        {Object.keys(session.insights).length} coaching insights recorded
                    </div>
                )}

                <button 
                    onClick={() => onViewBreakdown(session)}
                    className="w-full mt-2 py-2 bg-[#2a2a2a] text-primary rounded-lg font-bold text-sm hover:bg-primary hover:text-black transition-colors duration-300"
                >
                    View Breakdown
                </button>
            </div>
        </motion.div>
    );
}
