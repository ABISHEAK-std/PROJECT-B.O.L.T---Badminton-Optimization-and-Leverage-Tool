import { X, Play, FileText, Download, Clock, Activity, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import type { ArchivedSession, CoachingInsight } from '../../services/liveDataService';

interface SessionBreakdownProps {
    session: ArchivedSession | null;
    isOpen: boolean;
    onClose: () => void;
}

export function SessionBreakdown({ session, isOpen, onClose }: SessionBreakdownProps) {
    const [videoError, setVideoError] = useState(false);
    const [videoLoading, setVideoLoading] = useState(true);
    
    // Reset video state when session changes
    useEffect(() => {
        setVideoError(false);
        setVideoLoading(true);
    }, [session?.sessionId]);
    
    if (!session) return null;
    
    const insights = session.insights 
        ? Object.entries(session.insights).map(([key, value]) => ({
            id: key,
            ...(value as Omit<CoachingInsight, 'id'>)
          })).sort((a, b) => a.timestamp - b.timestamp)
        : [];
    
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-[#0D0D0D] border border-white/10 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <div>
                                <h2 className="text-2xl font-bold font-mono text-primary">
                                    Session Breakdown
                                </h2>
                                <p className="text-gray-400 text-sm mt-1">
                                    {session.sessionId?.replace('session_', '#')} • {session.date} at {session.time}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X size={24} className="text-gray-400" />
                            </button>
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left: Video Player */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold font-mono flex items-center gap-2">
                                        <Play size={18} className="text-primary" />
                                        Session Recording
                                    </h3>
                                    
                                    {session.videoUrl && !videoError ? (
                                        <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
                                            {videoLoading && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                                                    <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                                                </div>
                                            )}
                                            <video
                                                key={session.videoUrl}
                                                controls
                                                playsInline
                                                preload="auto"
                                                className="w-full h-full object-contain"
                                                onLoadedData={() => setVideoLoading(false)}
                                                onCanPlay={() => setVideoLoading(false)}
                                                onError={(e) => {
                                                    console.error('Video error:', e);
                                                    setVideoError(true);
                                                    setVideoLoading(false);
                                                }}
                                            >
                                                <source src={session.videoUrl} type="video/mp4" />
                                                Your browser does not support the video tag.
                                            </video>
                                        </div>
                                    ) : (
                                        <div className="rounded-xl bg-white/5 border border-white/10 aspect-video flex items-center justify-center">
                                            <div className="text-center text-gray-500">
                                                <AlertCircle size={48} className="mx-auto mb-2 opacity-50" />
                                                <p>{videoError ? 'Video failed to load' : 'Video not available'}</p>
                                                <p className="text-xs mt-1">
                                                    {videoError 
                                                        ? 'Try opening the video directly using the download link below'
                                                        : 'Recording was not saved for this session'}
                                                </p>
                                                {session.videoUrl && videoError && (
                                                    <a 
                                                        href={session.videoUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-block mt-3 px-4 py-2 bg-primary/20 text-primary rounded-lg text-sm hover:bg-primary/30 transition-colors"
                                                    >
                                                        Open Video in New Tab
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Session Stats */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="glass-panel rounded-xl p-4 text-center">
                                            <Activity size={20} className="mx-auto text-primary mb-2" />
                                            <p className="text-2xl font-bold font-mono text-white">{session.score || '--'}</p>
                                            <p className="text-xs text-gray-500 uppercase">BOLT Score</p>
                                        </div>
                                        <div className="glass-panel rounded-xl p-4 text-center">
                                            <Clock size={20} className="mx-auto text-blue-400 mb-2" />
                                            <p className="text-2xl font-bold font-mono text-white">{session.durationFormatted || '--'}</p>
                                            <p className="text-xs text-gray-500 uppercase">Duration</p>
                                        </div>
                                        <div className="glass-panel rounded-xl p-4 text-center">
                                            <FileText size={20} className="mx-auto text-green-400 mb-2" />
                                            <p className="text-2xl font-bold font-mono text-white">{insights.length}</p>
                                            <p className="text-xs text-gray-500 uppercase">Insights</p>
                                        </div>
                                    </div>
                                    
                                    {/* Download Links */}
                                    <div className="flex gap-3">
                                        {session.videoUrl && (
                                            <a
                                                href={session.videoUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 flex items-center justify-center gap-2 py-2 bg-primary/10 text-primary rounded-lg font-semibold text-sm hover:bg-primary/20 transition-colors"
                                            >
                                                <Download size={16} />
                                                Download Video
                                            </a>
                                        )}
                                        {session.transcriptUrl && (
                                            <a
                                                href={session.transcriptUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-500/10 text-blue-400 rounded-lg font-semibold text-sm hover:bg-blue-500/20 transition-colors"
                                            >
                                                <Download size={16} />
                                                Download Transcript
                                            </a>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Right: Transcript & Insights */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold font-mono flex items-center gap-2">
                                        <FileText size={18} className="text-blue-400" />
                                        Coaching Insights & Transcript
                                    </h3>
                                    
                                    {/* Coaching Insights */}
                                    {insights.length > 0 ? (
                                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                            {insights.map((insight, idx) => (
                                                <div
                                                    key={insight.id}
                                                    className={`p-4 rounded-xl border-l-2 ${
                                                        insight.error ? 'bg-red-900/10 border-red-500/50' : 'bg-white/5 border-primary/50'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-xs text-gray-500 font-mono">#{idx + 1}</span>
                                                        {insight.shot && (
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                                insight.shot === 'SMASH' ? 'bg-red-900/40 text-red-400' :
                                                                insight.shot === 'SERVE' ? 'bg-blue-900/40 text-blue-400' :
                                                                insight.shot === 'DROP' ? 'bg-purple-900/40 text-purple-400' :
                                                                insight.shot === 'BACKHAND' ? 'bg-orange-900/40 text-orange-400' :
                                                                'bg-gray-700/50 text-gray-300'
                                                            }`}>
                                                                {insight.shot}
                                                            </span>
                                                        )}
                                                        {insight.videoTime && (
                                                            <span className="text-xs text-primary/70 font-mono">
                                                                @ {insight.videoTime}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {insight.error && (
                                                        <p className="text-sm text-red-400 font-semibold mb-1">
                                                            {insight.error}
                                                        </p>
                                                    )}
                                                    <p className="text-sm text-gray-300">
                                                        {insight.advice}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="rounded-xl bg-white/5 border border-white/10 p-8 text-center">
                                            <p className="text-gray-500">No coaching insights recorded</p>
                                        </div>
                                    )}
                                    
                                    {/* Raw Transcript */}
                                    {session.transcriptContent && (
                                        <div className="mt-4">
                                            <h4 className="text-sm font-semibold text-gray-400 mb-2">Full Transcript</h4>
                                            <div className="bg-black/50 rounded-xl p-4 max-h-[200px] overflow-y-auto custom-scrollbar">
                                                <pre className="text-xs text-gray-400 whitespace-pre-wrap font-mono">
                                                    {session.transcriptContent}
                                                </pre>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Final Metrics */}
                                    {session.finalMetrics && (
                                        <div className="mt-4">
                                            <h4 className="text-sm font-semibold text-gray-400 mb-2">Final Session Metrics</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                {session.finalMetrics.elbow_angle !== undefined && (
                                                    <div className="bg-white/5 rounded-lg p-3">
                                                        <p className="text-xs text-gray-500">Elbow Angle</p>
                                                        <p className="text-lg font-mono font-bold">{Math.round(session.finalMetrics.elbow_angle)}°</p>
                                                    </div>
                                                )}
                                                {session.finalMetrics.shoulder_angle !== undefined && (
                                                    <div className="bg-white/5 rounded-lg p-3">
                                                        <p className="text-xs text-gray-500">Shoulder Angle</p>
                                                        <p className="text-lg font-mono font-bold">{Math.round(session.finalMetrics.shoulder_angle)}°</p>
                                                    </div>
                                                )}
                                                {session.finalMetrics.knee_angle !== undefined && (
                                                    <div className="bg-white/5 rounded-lg p-3">
                                                        <p className="text-xs text-gray-500">Knee Angle</p>
                                                        <p className="text-lg font-mono font-bold">{Math.round(session.finalMetrics.knee_angle)}°</p>
                                                    </div>
                                                )}
                                                {session.finalMetrics.body_rotation !== undefined && (
                                                    <div className="bg-white/5 rounded-lg p-3">
                                                        <p className="text-xs text-gray-500">Body Rotation</p>
                                                        <p className="text-lg font-mono font-bold">{session.finalMetrics.body_rotation.toFixed(1)}°</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {/* Footer */}
                        <div className="p-4 border-t border-white/10 flex justify-end">
                            <button
                                onClick={onClose}
                                className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
