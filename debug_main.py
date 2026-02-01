import cv2
import os
import sys

print("DEBUG: Script started")

project_root = os.path.dirname(os.path.abspath(__file__))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

print("DEBUG: Imports starting")
try:
    print("DEBUG: Importing config...")
    from config import BoltConfig as cfg
    print("DEBUG: Importing geometry...")
    from utils.geometry import BoltGeometry
    print("DEBUG: Importing classifier...")
    from core.classifier import BoltActionClassifier
    print("DEBUG: Importing engine...")
    from core.engine import BoltMasterEngine
    print("DEBUG: Importing vision processor (MediaPipe)...")
    from core.vission_processor import BoltVisionProcessor
    print("DEBUG: Imports successful")
except ImportError as e:
    print(f"Import Error: {e}")
    sys.exit(1)
except Exception as e:
    print(f"General Error during imports: {e}")
    sys.exit(1)

def run_bolt_analyzer(video_source=0):
    print("DEBUG: Inside run_bolt_analyzer")
    
    print("DEBUG: Initializing Vision...")
    vision = BoltVisionProcessor()
    print("DEBUG: Vision Initialized")
    
    print("DEBUG: Initializing Classifier...")
    classifier = BoltActionClassifier()
    print("DEBUG: Classifier Initialized")
    
    print("DEBUG: Initializing Engine...")
    engine = BoltMasterEngine(user_height_cm=cfg.ATHLETE["HEIGHT_CM"])
    print("DEBUG: Engine Initialized")
    
    print(f"DEBUG: Opening video source: {video_source}")
    cap = cv2.VideoCapture(video_source)
    print("DEBUG: VideoCapture created")
    
    if not cap.isOpened():
        print(f"CRITICAL ERROR: Could not open source {video_source}")
        return

    print(f"--- BOLT SYSTEM ACTIVE ---")
    
    frame_count = 0
    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            if frame_count == 0:
                print("No frames could be read from the video.")
            break
        frame_count += 1
        
        if frame_count == 1:
            print("DEBUG: First frame read successfully")
            print("DEBUG: Processing frame...")
            results, landmarks = vision.process_frame(frame)
            print("DEBUG: Frame processed")
            break
            
    cap.release()
    cv2.destroyAllWindows()
    print("DEBUG: Finished")

if __name__ == "__main__":
    TEST_PATH = r"E:\\batminton dataset\\multiple.mp4"
    if os.path.exists(TEST_PATH):
        print(f"Loading video file: {TEST_PATH}")
        video_source = TEST_PATH
    else:
        video_source = 0
    
    run_bolt_analyzer(video_source)
