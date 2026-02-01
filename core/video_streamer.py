"""
Video Streaming Server for BOLT System
Streams live webcam feed with skeleton overlay to frontend
"""

import cv2
import threading
import time
from flask import Flask, Response
from flask_cors import CORS

class VideoStreamer:
    """Handles video streaming to frontend via HTTP MJPEG"""
    
    def __init__(self, port=5001):
        self.port = port
        self.app = Flask(__name__)
        CORS(self.app)  # Allow cross-origin requests from frontend
        
        self.current_frame = None
        self.frame_lock = threading.Lock()
        self.is_streaming = False
        self.server_thread = None
        
        # Setup routes
        self._setup_routes()
    
    def _setup_routes(self):
        """Setup Flask routes for video streaming"""
        
        @self.app.route('/video_feed')
        def video_feed():
            """MJPEG stream endpoint"""
            return Response(
                self._generate_frames(),
                mimetype='multipart/x-mixed-replace; boundary=frame'
            )
        
        @self.app.route('/status')
        def status():
            """Check if stream is active"""
            return {'streaming': self.is_streaming, 'has_frame': self.current_frame is not None}
        
        @self.app.route('/health')
        def health():
            """Health check endpoint"""
            return {'status': 'ok', 'streaming': self.is_streaming}
    
    def _generate_frames(self):
        """Generator function for MJPEG stream"""
        while self.is_streaming:
            with self.frame_lock:
                if self.current_frame is not None:
                    # Encode frame to JPEG with lower quality for faster streaming
                    _, buffer = cv2.imencode('.jpg', self.current_frame, [cv2.IMWRITE_JPEG_QUALITY, 60])
                    frame_bytes = buffer.tobytes()
                    
                    yield (b'--frame\r\n'
                           b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
            
            # Faster frame rate (~60 fps) - reduced sleep time
            time.sleep(0.010)
    
    def update_frame(self, frame):
        """Update the current frame (called from main loop)"""
        with self.frame_lock:
            self.current_frame = frame.copy()
    
    def start(self):
        """Start the streaming server in a background thread"""
        if self.server_thread is not None and self.server_thread.is_alive():
            return
        
        self.is_streaming = True
        self.server_thread = threading.Thread(target=self._run_server, daemon=True)
        self.server_thread.start()
        print(f"📺 Video stream server started on http://localhost:{self.port}/video_feed")
    
    def _run_server(self):
        """Run Flask server (in background thread)"""
        # Suppress Flask logs
        import logging
        log = logging.getLogger('werkzeug')
        log.setLevel(logging.ERROR)
        
        try:
            self.app.run(host='0.0.0.0', port=self.port, threaded=True, use_reloader=False)
        except Exception as e:
            print(f"⚠️ Video stream server error: {e}")
    
    def stop(self):
        """Stop the streaming server"""
        self.is_streaming = False
        print("📺 Video stream server stopped")


# Global instance
_video_streamer = None

def get_video_streamer(port=5001) -> VideoStreamer:
    """Get or create the global VideoStreamer instance"""
    global _video_streamer
    if _video_streamer is None:
        _video_streamer = VideoStreamer(port=port)
    return _video_streamer
