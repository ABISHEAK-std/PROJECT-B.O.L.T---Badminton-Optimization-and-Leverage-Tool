import { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import { motion } from 'framer-motion';

export function VideoCanvas() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [progress] = useState(30); // Mock progress

    // Mock skeletal overlay drawing
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Resize canvas to match video (mocking size for now since video might not load)
        canvas.width = canvas.parentElement?.clientWidth || 800;
        canvas.height = canvas.parentElement?.clientHeight || 450;

        // Draw some mock skeletal lines
        const drawMockSkeleton = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = '#DFFF00';
            ctx.lineWidth = 3;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#DFFF00';

            // Mock stick figure
            ctx.beginPath();
            const w = canvas.width;
            const h = canvas.height;
            ctx.moveTo(w * 0.4, h * 0.8); // Left foot
            ctx.lineTo(w * 0.45, h * 0.6); // Left knee
            ctx.lineTo(w * 0.5, h * 0.5); // Hips
            ctx.lineTo(w * 0.55, h * 0.6); // Right knee
            ctx.lineTo(w * 0.6, h * 0.8); // Right foot

            ctx.moveTo(w * 0.5, h * 0.5); // Hips
            ctx.lineTo(w * 0.5, h * 0.3); // Spine top

            ctx.lineTo(w * 0.4, h * 0.35); // Left elbow
            ctx.lineTo(w * 0.35, h * 0.2); // Left hand (racket)

            ctx.moveTo(w * 0.5, h * 0.3); // Spine top
            ctx.lineTo(w * 0.6, h * 0.35); // Right elbow
            ctx.lineTo(w * 0.65, h * 0.45); // Right hand view

            ctx.stroke();

            // Racket mock
            ctx.beginPath();
            ctx.strokeStyle = 'cyan';
            ctx.arc(w * 0.35, h * 0.15, 30, 0, Math.PI * 2);
            ctx.stroke();
        };

        // Animation loop (flicker effect)
        let animationId: number;
        const render = () => {
            drawMockSkeleton();
            animationId = requestAnimationFrame(render);
        };
        render();

        return () => cancelAnimationFrame(animationId);
    }, []);

    return (
        <div className="relative w-full h-full bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
            {/* Video Element */}
            <video
                ref={videoRef}
                className="w-full h-full object-cover opacity-80"
                src="https://assets.mixkit.co/videos/preview/mixkit-playing-badminton-4028-large.mp4"
                loop
                muted={isMuted}
                poster="https://images.pexels.com/photos/3660204/pexels-photo-3660204.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
            // Using Pexels badminton image as poster fallback
            />

            {/* Overlay Canvas */}
            <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
            />

            {/* Controls Overlay (appears on hover) */}
            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 to-transparent p-6 flex flex-col gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">

                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer relative overflow-hidden">
                    <motion.div
                        className="h-full bg-primary"
                        initial={{ width: '0%' }}
                        animate={{ width: `${progress}%` }}
                    />
                    <div className="absolute top-1/2 -translate-y-1/2 bg-white w-3 h-3 rounded-full shadow-lg pointer-events-none" style={{ left: `${progress}%` }} />
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => {
                                const v = videoRef.current;
                                if (v) {
                                    if (v.paused) { v.play(); setIsPlaying(true); }
                                    else { v.pause(); setIsPlaying(false); }
                                }
                            }}
                            className="text-primary hover:text-white transition-colors"
                        >
                            {isPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
                        </button>
                        <span className="text-xs font-mono text-gray-300">2:00 / 5:00</span>
                    </div>

                    <div className="flex items-center gap-4 text-gray-300">
                        <button onClick={() => setIsMuted(!isMuted)}>
                            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                        </button>
                        <Maximize size={20} className="hover:text-white cursor-pointer" />
                    </div>
                </div>
            </div>

            {/* Play Overlay if paused */}
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center border border-white/10">
                        <Play size={32} className="ml-1 text-primary" fill="currentColor" />
                    </div>
                </div>
            )}
        </div>
    );
}
