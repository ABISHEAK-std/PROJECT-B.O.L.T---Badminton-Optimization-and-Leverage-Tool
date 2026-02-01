import pyttsx3
import threading
import time
from queue import Queue
from datetime import datetime
import json
import os

class CoachFeedbackSystem:
    """
    Real-time virtual coach with live voice feedback and post-shot corrections.
    
    Features:
    - Live status announcements (repeats every 3s while status persists)
    - Post-shot detailed corrections on pose transitions
    - Session logging to correct.txt
    """
    
    def __init__(self, corrections_path="corrections.json", log_path="correct.txt"):
        self.engine = pyttsx3.init()
        self.engine.setProperty('rate', 150)
        self.engine.setProperty('volume', 0.9)
        
        voices = self.engine.getProperty('voices')
        if len(voices) > 1:
            self.engine.setProperty('voice', voices[1].id)
        
        self.speech_queue = Queue()
        self.is_speaking = False
        self.enabled = True
        
        self.tts_thread = threading.Thread(target=self._speech_loop, daemon=True)
        self.tts_thread.start()
        
        self.corrections = self._load_corrections(corrections_path)
        
        self.log_path = log_path  
        
        self.current_pose = "IDLE"
        self.previous_pose = "IDLE"
        self.current_status = ""
        self.last_error_status = ""
        self.last_speak_time = 0
        self.speak_cooldown = 3.0  
    
    def set_transcript_path(self, path):
        """Set the transcript path to write to (for live session logging)"""
        self.log_path = path
        print(f"📝 Coach writing to: {path}")
        
    def _load_corrections(self, path):
        """Load corrections from JSON file"""
        if os.path.exists(path):
            with open(path, 'r') as f:
                return json.load(f)
        else:
            return {
                "smash": {
                    "LOW ELBOW": "Your elbow dropped. Remember to reach high next time.",
                    "KINETIC CHAIN COLLAPSED": "Keep your non-racket arm up for better balance and rotation.",
                    "FLAT-FOOTED": "Use a scissor kick or active weight transfer for more power.",
                    "BENT ARM": "Extend your arm fully at contact for maximum reach."
                },
                "drop_shot": {
                    "TELEGRAPHING": "Match your smash swing speed to disguise the drop shot.",
                    "STIFF WRIST": "Add wrist snap at contact for a sharper angle.",
                    "LEANING BACK": "Shift your weight forward to push the shuttle down.",
                    "TOO STIFF": "Soften your elbow for better touch and control."
                },
                "serve": {
                    "ELBOW TOO HIGH": "Lower your racket arm for better control.",
                    "UNSTABLE STANCE": "Bend your knees and widen your feet for stability.",
                    "SERVICE FAULT RISK": "Contact the shuttle below waist height.",
                    "EXCESSIVE MOVEMENT": "Keep your body stable and quiet during the serve.",
                    "COLLAPSED ELBOW": "Maintain elbow extension for a consistent pendulum motion."
                },
                "forehand": {
                    "CONTACT TOO LATE": "Hit the shuttle in front of your body, not behind.",
                    "USE YOUR CORE": "Rotate your hips and torso, don't just use your arm.",
                    "EXTEND ARM": "Reach through the contact point with full extension."
                },
                "backhand": {
                    "TURN YOUR BACK": "Rotate your shoulders away from the net for proper torque.",
                    "ELBOW TUCKED": "Lead with a high elbow, don't tuck it against your ribs.",
                    "THUMB UP": "Press your thumb on the flat side of the handle.",
                    "REACH ACROSS": "Extend your arm across your body for a full swing arc."
                }
            }
    
    def _init_log_file(self):
        """Initialize or append to log file"""
        if not os.path.exists(self.log_path):
            with open(self.log_path, 'w') as f:
                f.write("=== Badminton Coaching Session Log ===\n")
                f.write(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
    
    def _speech_loop(self):
        """Background thread for TTS"""
        while True:
            if not self.speech_queue.empty() and self.enabled:
                message = self.speech_queue.get()
                self.is_speaking = True
                self.engine.say(message)
                self.engine.runAndWait()
                self.is_speaking = False
    
    def _speak(self, text, priority=False):
        """Add text to speech queue"""
        if not self.enabled:
            return
        
        if priority:
            # Clear queue for urgent messages
            while not self.speech_queue.empty():
                try:
                    self.speech_queue.get_nowait()
                except:
                    break
        
        self.speech_queue.put(text)
    
    def _clean_status(self, status_string):
        """Extract clean status key from '[X] LOW ELBOW: ...' format"""
        if not status_string:
            return ""
        
        # Remove [X] or [OK] prefix
        clean = status_string.replace("[X]", "").replace("[OK]", "").strip()
        
        # Extract just the key before the colon
        if ":" in clean:
            clean = clean.split(":")[0].strip()
        
        return clean
    
    def _get_correction(self, pose, status):
        """Lookup detailed correction from JSON"""
        # Map pose to JSON key
        pose_key_map = {
            "SMASH": "smash",
            "DROP": "drop_shot",
            "SERVE": "serve",
            "FOREHAND": "forehand",
            "BACKHAND": "backhand"
        }
        
        pose_key = pose_key_map.get(pose.upper(), "")
        clean_status = self._clean_status(status)
        
        if pose_key in self.corrections:
            return self.corrections[pose_key].get(clean_status, "Keep practicing your form.")
        
        return "Keep practicing your form."
    
    def _log_correction(self, pose, status, correction, video_time):
        """Append correction to log file"""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        with open(self.log_path, 'a') as f:
            f.write(f"[{timestamp}] Video Time: {video_time:.2f}s\n")
            f.write(f"  Shot: {pose}\n")
            f.write(f"  Error: {status}\n")
            f.write(f"  Advice: {correction}\n\n")
    
    def update(self, pose, status, video_time):
        """
        Main update function - call this in your video loop.
        
        Args:
            pose: Current pose (e.g., "SMASH", "IDLE")
            status: Current status message (e.g., "[X] LOW ELBOW: ...")
            video_time: Current video timestamp in seconds
        """
        current_time = time.time()
        
        # Detect pose transition
        pose_changed = (pose != self.previous_pose)
        
        # === LIVE VOICE FEEDBACK ===
        # Speak current status repeatedly while it persists
        if status and status != "STANDING STILL" and status != "ANALYZING":
            if status != self.current_status or (current_time - self.last_speak_time) >= self.speak_cooldown:
                # Extract short announcement
                clean_status = self._clean_status(status)
                if clean_status:
                    self._speak(clean_status)
                    self.last_speak_time = current_time
        
        # === POST-SHOT CORRECTION ===
        # When pose changes, give detailed feedback on the previous pose
        if pose_changed and self.previous_pose not in ["IDLE", "PREPARATION", "NONE"]:
            # Use the last error status from the previous pose
            if self.last_error_status and "[X]" in self.last_error_status:
                # Get detailed correction
                correction = self._get_correction(self.previous_pose, self.last_error_status)
                
                # Speak detailed correction
                self._speak(correction, priority=True)
                
                # Log to file
                self._log_correction(self.previous_pose, self.last_error_status, correction, video_time)
            
            elif self.last_error_status and "[OK]" in self.last_error_status:
                # Good form - log success
                timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                with open(self.log_path, 'a') as f:
                    f.write(f"[{timestamp}] Video Time: {video_time:.2f}s\n")
                    f.write(f"  Shot: {self.previous_pose}\n")
                    f.write(f"  Status: SUCCESS - {self.last_error_status}\n\n")
        
        # Update state
        if status and "[X]" in status:
            self.last_error_status = status
        elif status and "[OK]" in status:
            self.last_error_status = status
        
        self.current_status = status
        self.previous_pose = self.current_pose
        self.current_pose = pose
    
    def toggle(self):
        """Toggle voice on/off"""
        self.enabled = not self.enabled
        status = "enabled" if self.enabled else "disabled"
        print(f"Coach voice {status}")
    
    def cleanup(self):
        """Stop TTS engine"""
        self.engine.stop()
