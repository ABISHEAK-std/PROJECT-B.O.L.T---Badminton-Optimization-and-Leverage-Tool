# Example integration into main.py

"""
HOW TO INTEGRATE INTO YOUR MAIN LOOP:

1. Import at the top:
   from core.coach_feedback import CoachFeedbackSystem

2. Initialize in run_bolt_analyzer():
   coach = CoachFeedbackSystem("corrections.json", "correct.txt")

3. Inside the while cap.isOpened() loop, after you have pose and status:
   
   # Your existing code gets pose and status
   shot_label, confidence, metrics = classifier.classify(landmarks, user_height_px)
   analysis = engine.evaluate_smash(current_data)  # or other shot
   status = analysis.get("status", "")
   
   # Add this single line:
   coach.update(shot_label, status, metrics.get('timestamp', 0))

4. On exit:
   coach.cleanup()

COMPLETE EXAMPLE:
"""

import cv2
from core.vission_processor import BoltVisionProcessor
from core.classifier import BoltActionClassifier
from core.engine import BoltMasterEngine
from core.coach_feedback import CoachFeedbackSystem  # NEW
from config import BoltConfig as cfg

def run_bolt_analyzer(video_source=0):
    # Initialize
    vision = BoltVisionProcessor()
    classifier = BoltActionClassifier()
    engine = BoltMasterEngine(user_height_cm=cfg.ATHLETE["HEIGHT_CM"])
    
    # NEW: Initialize coach feedback system
    coach = CoachFeedbackSystem("corrections.json", "correct.txt")
    
    cap = cv2.VideoCapture(video_source)
    
    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            break
        
        # Process frame
        results, landmarks = vision.process_frame(frame)
        
        if landmarks:
            # Get pose and analysis
            shot_label, confidence, metrics = classifier.classify(landmarks, 178)
            
            # Get status from engine
            if shot_label == "SMASH":
                analysis = engine.evaluate_smash(metrics)
            # ... other shots ...
            
            status = analysis.get("status", "")
            
            # NEW: Update coach with current pose and status
            coach.update(shot_label, status, metrics.get('timestamp', 0))
        
        # Display
        cv2.imshow('Badminton Coach', frame)
        
        # Controls
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('v'):
            coach.toggle()  # Toggle voice on/off
    
    # Cleanup
    coach.cleanup()
    cap.release()
    cv2.destroyAllWindows()
