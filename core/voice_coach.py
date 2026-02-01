import pyttsx3
import threading
from queue import Queue

class VoiceCoach:
    """
    Text-to-Speech engine for live badminton coaching feedback.
    Runs in a separate thread to avoid blocking video processing.
    """
    
    def __init__(self):
        self.engine = pyttsx3.init()
        
        self.engine.setProperty('rate', 150)  
        self.engine.setProperty('volume', 0.9)  
        
        voices = self.engine.getProperty('voices')
        if voices:
            self.engine.setProperty('voice', voices[1].id if len(voices) > 1 else voices[0].id)
        
        self.speech_queue = Queue()
        self.is_speaking = False
        self.enabled = True
        
        self.thread = threading.Thread(target=self._speech_loop, daemon=True)
        self.thread.start()
    
    def _speech_loop(self):
        """Background thread that speaks queued messages"""
        while True:
            if not self.speech_queue.empty() and self.enabled:
                message = self.speech_queue.get()
                self.is_speaking = True
                self.engine.say(message)
                self.engine.runAndWait()
                self.is_speaking = False
    
    def speak(self, text, priority=False):
        """
        Add text to speech queue.
        
        Args:
            text: Text to speak
            priority: If True, clear queue and speak immediately
        """
        if not self.enabled:
            return
        
        if priority:
            # Clear queue for urgent messages
            while not self.speech_queue.empty():
                try:
                    self.speech_queue.get_nowait()
                except:
                    break
        
        # Add to queue
        self.speech_queue.put(text)
    
    def speak_status(self, shot_label, status, alerts, good_indicators, score):
        """
        Speak comprehensive shot analysis.
        
        Args:
            shot_label: Current shot type
            status: Main status message
            alerts: List of error alerts
            good_indicators: List of good form indicators
            score: Performance score
        """
        if shot_label == "IDLE":
            # Don't spam during idle
            return
        
        # Build speech message
        parts = []
        
        # Announce shot
        parts.append(f"{shot_label} detected.")
        
        # Score
        if score < 50:
            parts.append(f"Score: {score} out of 100.")
        
        # Read alerts (max 2 to avoid overwhelming)
        if alerts:
            alert_text = alerts[0].replace("[X]", "").strip()
            parts.append(f"Alert: {alert_text}")
            
            if len(alerts) > 1:
                alert_text_2 = alerts[1].replace("[X]", "").strip()
                parts.append(f"Also: {alert_text_2}")
        
        # Read good indicators (max 1)
        elif good_indicators:
            good_text = good_indicators[0].replace("[OK]", "").strip()
            parts.append(f"Good form: {good_text}")
        
        # Join and speak
        message = " ".join(parts)
        self.speak(message)
    
    def speak_transition(self, from_pose, to_pose):
        """Announce pose transitions"""
        if from_pose == "IDLE" and to_pose != "IDLE":
            self.speak("Session started", priority=True)
        elif from_pose != "IDLE" and to_pose == "IDLE":
            self.speak("Session ended", priority=True)
    
    def toggle(self):
        """Toggle voice on/off"""
        self.enabled = not self.enabled
        status = "enabled" if self.enabled else "disabled"
        print(f"Voice coaching {status}")
    
    def cleanup(self):
        """Stop TTS engine"""
        self.engine.stop()
