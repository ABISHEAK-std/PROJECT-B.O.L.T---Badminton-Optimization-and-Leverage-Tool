


import cv2
from core.vission_processor import BoltVisionProcessor
from core.classifier import BoltActionClassifier
from core.engine import BoltMasterEngine
from core.coach_feedback import CoachFeedbackSystem  # NEW
from config import BoltConfig as cfg

def run_bolt_analyzer(video_source=0):
    vision = BoltVisionProcessor()
    classifier = BoltActionClassifier()
    engine = BoltMasterEngine(user_height_cm=cfg.ATHLETE["HEIGHT_CM"])
    
    coach = CoachFeedbackSystem("corrections.json", "correct.txt")
    
    cap = cv2.VideoCapture(video_source)
    
    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            break
        
        results, landmarks = vision.process_frame(frame)
        
        if landmarks:
            shot_label, confidence, metrics = classifier.classify(landmarks, 178)
            
            if shot_label == "SMASH":
                analysis = engine.evaluate_smash(metrics)
            
            status = analysis.get("status", "")
            
            coach.update(shot_label, status, metrics.get('timestamp', 0))
        
        cv2.imshow('Badminton Coach', frame)
        
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('v'):
            coach.toggle()  
    
    coach.cleanup()
    cap.release()
    cv2.destroyAllWindows()
