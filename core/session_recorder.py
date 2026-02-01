import cv2
import os
import shutil
from datetime import datetime

# Try to import imageio for H.264 encoding (web-compatible)
try:
    import imageio
    HAS_IMAGEIO = True
except ImportError:
    HAS_IMAGEIO = False

class SessionRecorder:
    """
    Records annotated video sessions and archives them with transcripts.
    
    Features:
    - Records video with all annotations (skeleton, angles, status)
    - Uses H.264 codec for web browser compatibility (when imageio available)
    - Creates timestamped session folders
    - Archives video + transcript together
    - Clears log for next session
    """
    
    def __init__(self, output_dir="processed_data", fps=30.0):
        self.output_dir = output_dir
        self.fps = fps
        self.temp_video_path = "temp_session.mp4"
        self.log_path = "correct.txt"
        
        self.writer = None
        self.imageio_writer = None
        self.is_recording = False
        self.use_imageio = HAS_IMAGEIO
        
        self.session_start_time = None
        self.session_folder = None
        
    def start_recording(self, frame_width, frame_height):
        """Initialize video recording and create session folder"""
        self.session_start_time = datetime.now()
        
        timestamp = self.session_start_time.strftime('%Y%m%d_%H%M%S')
        self.session_folder = os.path.join(self.output_dir, f"session_{timestamp}")
        os.makedirs(self.session_folder, exist_ok=True)
        print(f"📁 Session folder created: {self.session_folder}")
        
        transcript_path = os.path.join(self.session_folder, "transcript.txt")
        with open(transcript_path, 'w') as f:
            f.write("=== Badminton Coaching Session Log ===\n")
            f.write(f"Started: {self.session_start_time.strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        print(f"📝 Live transcript: {transcript_path}")
        
        try:
            if self.use_imageio:
                # Use imageio with H.264 for web-compatible video
                # Store frame dimensions for later
                self.frame_width = frame_width
                self.frame_height = frame_height
                self.imageio_writer = imageio.get_writer(
                    self.temp_video_path,
                    fps=self.fps,
                    codec='libx264',
                    quality=8,
                    output_params=['-pix_fmt', 'yuv420p']  # Web-compatible pixel format
                )
                self.is_recording = True
                print(f"📹 Recording started (H.264 codec): {self.session_start_time.strftime('%H:%M:%S')}")
            else:
                # Fallback to OpenCV (mp4v codec, less compatible)
                fourcc = cv2.VideoWriter_fourcc(*'mp4v')
                self.writer = cv2.VideoWriter(
                    self.temp_video_path,
                    fourcc,
                    self.fps,
                    (frame_width, frame_height)
                )
                
                if self.writer is None or not self.writer.isOpened():
                    raise Exception("VideoWriter failed to initialize")
                
                self.is_recording = True
                print(f"📹 Recording started (mp4v codec): {self.session_start_time.strftime('%H:%M:%S')}")
                print(f"   ⚠️ Note: Install 'imageio imageio-ffmpeg' for better web compatibility")
            
        except Exception as e:
            print(f"⚠️  Video recording failed: {e}")
            print(f"⚠️  Continuing with transcript-only mode")
            self.writer = None
            self.imageio_writer = None
            self.is_recording = False  
    def write_frame(self, frame):
        """Write annotated frame to video"""
        if self.is_recording:
            if self.imageio_writer is not None:
                # imageio expects RGB, OpenCV uses BGR
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                self.imageio_writer.append_data(frame_rgb)
            elif self.writer is not None:
                self.writer.write(frame)
    
    def stop_and_archive(self):
        """
        Stop recording and finalize session.
        Always saves transcript, video only if recording was successful.
        """
        print(f"\n{'='*80}")
        print("Finalizing session...")
        print(f"{'='*80}")
        
        # Close video writers first
        if self.is_recording:
            try:
                if self.imageio_writer is not None:
                    print("  Closing imageio writer...")
                    self.imageio_writer.close()
                    self.imageio_writer = None
                    print("✅ Video recording stopped (H.264)")
                elif self.writer is not None:
                    print("  Closing OpenCV writer...")
                    self.writer.release()
                    self.writer = None
                    print("✅ Video recording stopped")
            except Exception as e:
                print(f"⚠️ Error closing video writer: {e}")
            finally:
                self.is_recording = False
        
        # Small delay to ensure file is fully written
        import time
        time.sleep(0.5)
        
        video_saved = False
        if os.path.exists(self.temp_video_path):
            video_dest = os.path.join(self.session_folder, "video.mp4")
            try:
                # Check file size first
                temp_size = os.path.getsize(self.temp_video_path)
                print(f"  Temp video size: {temp_size / (1024*1024):.2f} MB")
                
                if temp_size > 0:
                    shutil.move(self.temp_video_path, video_dest)
                    file_size = os.path.getsize(video_dest) / (1024 * 1024)  # MB
                    print(f"✅ Video saved: {video_dest} ({file_size:.1f} MB)")
                    video_saved = True
                else:
                    print(f"⚠️ Temp video file is empty, skipping")
                    os.remove(self.temp_video_path)
            except Exception as e:
                print(f"⚠️  Failed to save video: {e}")
                import traceback
                traceback.print_exc()
        else:
            print(f"⚠️ No temp video file found at: {self.temp_video_path}")
        
        transcript_path = os.path.join(self.session_folder, "transcript.txt")
        if os.path.exists(transcript_path):
            print(f"✅ Transcript saved: {transcript_path}")
        else:
            print(f"⚠️  Transcript not found (this shouldn't happen)")
        
        duration = (datetime.now() - self.session_start_time).total_seconds()
        print(f"\n{'='*80}")
        print(f"📁 Session archived: {self.session_folder}")
        print(f"   Duration: {duration:.1f}s")
        print(f"   Video: {'✅ Saved' if video_saved else '❌ Not recorded'}")
        print(f"   Transcript: ✅ Saved")
        print(f"{'='*80}\n")
    
    def get_transcript_path(self):
        """Get the path to the current session's transcript file"""
        if self.session_folder:
            return os.path.join(self.session_folder, "transcript.txt")
        return None
    
    def get_session_folder(self):
        """Get the path to the current session folder"""
        return self.session_folder
    
    def get_session_id(self):
        """Get the session ID (folder name) for Firebase"""
        if self.session_folder:
            return os.path.basename(self.session_folder)
        return None
    
    def is_session_active(self):
        """Check if a session is currently active (folder created)"""
        return self.session_folder is not None
    
    def get_recording_status(self):
        """Get current recording status for debugging"""
        return {
            "session_active": self.is_session_active(),
            "video_recording": self.is_recording,
            "session_folder": self.session_folder,
            "duration": (datetime.now() - self.session_start_time).total_seconds() if self.session_start_time else 0
        }
    
    def cleanup(self):
        """Emergency cleanup if needed"""
        if self.imageio_writer is not None:
            try:
                self.imageio_writer.close()
            except:
                pass
        if self.writer is not None:
            self.writer.release()
        
        # Remove temp file if exists
        if os.path.exists(self.temp_video_path):
            try:
                os.remove(self.temp_video_path)
            except:
                pass
