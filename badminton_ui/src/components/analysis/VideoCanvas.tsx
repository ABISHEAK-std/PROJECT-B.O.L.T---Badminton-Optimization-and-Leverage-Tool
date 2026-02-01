import { useState, useEffect, useRef } from 'react';
import { Maximize, Video, VideoOff, RefreshCw } from 'lucide-react';
import { useSessionStatus } from '../../hooks/useLiveData';

const STREAM_URL = 'http://localhost:5001/video_feed';
const HEALTH_URL = 'http://localhost:5001/health';

export function VideoCanvas() {
    const { status } = useSessionStatus();
    const imgRef = useRef<HTMLImageElement>(null);
    const [streamError, setStreamError] = useState(false);
    const [streamLoading, setStreamLoading] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Check if stream is available
    useEffect(() => {
        const checkStream = async () => {
            if (!status.isActive) {
                setStreamLoading(false);
                return;
            }
            
            try {
                const response = await fetch(HEALTH_URL, { 
                    method: 'GET',
                    mode: 'cors'
                });
                if (response.ok) {
                    setStreamError(false);
                    setStreamLoading(false);
                } else {
                    setStreamError(true);
                    setStreamLoading(false);
                }
            } catch {
                // Stream server not ready yet, will retry
                setStreamLoading(true);
            }
        };

        // Check immediately and then every 2 seconds
        checkStream();
        const interval = setInterval(checkStream, 2000);
        
        return () => clearInterval(interval);
    }, [status.isActive]);

    // Handle fullscreen
    const toggleFullscreen = () => {
        if (!containerRef.current) return;
        
        if (!isFullscreen) {
            if (containerRef.current.requestFullscreen) {
                containerRef.current.requestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
        setIsFullscreen(!isFullscreen);
    };

    // Listen for fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    return (
        <div 
            ref={containerRef}
            className="relative w-full h-full bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl group"
        >
            {status.isActive ? (
                // Live Stream View
                <>
                    {streamLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10">
                            <RefreshCw className="w-12 h-12 text-primary animate-spin mb-4" />
                            <p className="text-gray-400 text-sm">Connecting to live stream...</p>
                        </div>
                    )}
                    
                    {streamError ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90">
                            <VideoOff size={64} className="text-red-500/50 mb-4" />
                            <p className="text-gray-400 text-lg">Stream Unavailable</p>
                            <p className="text-gray-500 text-sm mt-2">Make sure the BOLT analyzer is running</p>
                            <button 
                                onClick={() => {
                                    setStreamError(false);
                                    setStreamLoading(true);
                                }}
                                className="mt-4 px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
                            >
                                Retry Connection
                            </button>
                        </div>
                    ) : (
                        <img
                            ref={imgRef}
                            src={STREAM_URL}
                            alt="Live BOLT Analysis"
                            className="w-full h-full object-contain"
                            onLoad={() => setStreamLoading(false)}
                            onError={() => {
                                setStreamError(true);
                                setStreamLoading(false);
                            }}
                        />
                    )}
                    
                    {/* Live Badge */}
                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600/90 text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                        LIVE
                    </div>
                    
                    {/* Session Info */}
                    <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-mono">
                        Session: {status.sessionId?.replace('session_', '#') || 'Active'}
                    </div>
                    
                    {/* Controls */}
                    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Video size={20} className="text-green-400" />
                                <span className="text-xs font-mono text-gray-300">
                                    Frame: {status.currentFrame || 0}
                                </span>
                            </div>
                            <button 
                                onClick={toggleFullscreen}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <Maximize size={20} className="text-gray-300 hover:text-white" />
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                // No Active Session - Show placeholder
                <>
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                        <div className="relative">
                            {/* Animated rings */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-32 h-32 rounded-full border-2 border-primary/20 animate-ping" style={{ animationDuration: '2s' }}></div>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-24 h-24 rounded-full border border-primary/30 animate-pulse"></div>
                            </div>
                            
                            <div className="relative w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border border-primary/50">
                                <Video size={36} className="text-primary" />
                            </div>
                        </div>
                        
                        <h3 className="text-xl font-bold text-white mt-8 mb-2">No Active Session</h3>
                        <p className="text-gray-500 text-sm text-center max-w-xs">
                            Start the BOLT analyzer to see live video feed with pose detection overlay
                        </p>
                        
                        <div className="mt-6 flex items-center gap-2 text-xs text-gray-600 bg-white/5 px-4 py-2 rounded-full">
                            <code className="text-primary">python main.py</code>
                            <span>to start</span>
                        </div>
                    </div>
                    
                    {/* Decorative skeleton overlay */}
                    <svg className="absolute inset-0 w-full h-full opacity-5 pointer-events-none" viewBox="0 0 400 300">
                        <g stroke="#DFFF00" strokeWidth="2" fill="none">
                            {/* Simple stick figure */}
                            <circle cx="200" cy="50" r="20" />
                            <line x1="200" y1="70" x2="200" y2="150" />
                            <line x1="200" y1="90" x2="150" y2="130" />
                            <line x1="200" y1="90" x2="250" y2="130" />
                            <line x1="200" y1="150" x2="160" y2="250" />
                            <line x1="200" y1="150" x2="240" y2="250" />
                        </g>
                    </svg>
                </>
            )}
        </div>
    );
}
