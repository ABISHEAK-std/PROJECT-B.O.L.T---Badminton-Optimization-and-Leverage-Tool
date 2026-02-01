import cv2
import os
import sys
import signal
import time
import argparse


project_root = os.path.dirname(os.path.abspath(__file__))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

try:
    from core.vission_processor import BoltVisionProcessor
    from core.classifier import BoltActionClassifier
    from core.engine import BoltMasterEngine
    from core.coach_feedback import CoachFeedbackSystem
    from core.session_recorder import SessionRecorder
    from core.firebase_sync import get_firebase_sync
    from core.video_streamer import get_video_streamer
    from utils.geometry import BoltGeometry
    from config import BoltConfig as cfg
except ImportError as e:
    print(f"Import Error: {e}")
    print("\n[DEBUG INFO]")
    print(f"Project Root: {project_root}")
    print(f"System Path: {sys.path[:3]}")
    sys.exit(1)

def run_bolt_analyzer(video_source=0, user_height_cm=None):
    """
    Main execution loop for BOLT.
    video_source: 0 for webcam, or "path/to/video.mp4" for testing.
    user_height_cm: User's height in cm (from profile), defaults to config value
    """
    # Use provided height or fall back to config
    height = user_height_cm if user_height_cm else cfg.ATHLETE["HEIGHT_CM"]
    
    def signal_handler(sig, frame_obj):
        print("\n\n⚠️  Ctrl+C detected - Archiving session...")
        if recorder.is_session_active():
            recorder.stop_and_archive()
        # Get session folder AFTER archiving (video is now saved)
        session_folder = recorder.get_session_folder() if hasattr(recorder, 'get_session_folder') else None
        firebase.stop_session(session_folder)
        streamer.stop()
        coach.cleanup()
        cap.release()
        cv2.destroyAllWindows()
        sys.exit(0)
    
    vision = BoltVisionProcessor()
    classifier = BoltActionClassifier()
    engine = BoltMasterEngine(user_height_cm=height)
    coach = CoachFeedbackSystem("corrections.json", "correct.txt")  
    recorder = SessionRecorder("processed_data", fps=30.0)  
    firebase = get_firebase_sync()
    streamer = get_video_streamer(port=5001) 
    
    signal.signal(signal.SIGINT, signal_handler)
    
    cap = cv2.VideoCapture(video_source)
    
   
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1) 
    cap.set(cv2.CAP_PROP_FPS, 60)  
    
    if not cap.isOpened():
        print(f"CRITICAL ERROR: Could not open source {video_source}")
        print("Try closing other applications using the webcam (Zoom, Teams, etc.)")
        coach.cleanup()
        return

    print(f"--- BOLT SYSTEM ACTIVE ---")
    print(f"Mode: {'Webcam' if video_source == 0 else 'Video File'}")
    print(f"User Height: {height}cm")
    
    import time
    first_frame = None
    for attempt in range(10):  
        time.sleep(0.2)  
        ret, first_frame = cap.read()
        if ret:
            print(f"✅ Webcam initialized (attempt {attempt + 1})")
            break
    
    if first_frame is None or not ret:
        print("ERROR: Could not read first frame after 10 attempts")
        print("Webcam may be in use by another application")
        coach.cleanup()
        cap.release()
        return
    
    height, width = first_frame.shape[:2]
    recorder.start_recording(width, height)
    
    transcript_path = recorder.get_transcript_path()
    if transcript_path:
        coach.set_transcript_path(transcript_path)
    
    session_id = recorder.get_session_id() if hasattr(recorder, 'get_session_id') else f"session_{int(time.time())}"
    firebase.start_session(session_id)
    
    # Start video streaming server for frontend
    streamer.start()
    
    print(f"📹 Session recording started (Resolution: {width}x{height})")

    frame_count = 0
    is_start = True  
    prev_was_idle = False 
    results, landmarks = vision.process_frame(first_frame)
    frame = first_frame
    
    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            break

        frame_count += 1

        results, landmarks = vision.process_frame(frame)
        
        status = "IDLE"
        shot_label = "NONE"
        confidence = 0
        metrics = {}

        if landmarks:
            shot_label, confidence, metrics = classifier.classify(landmarks, user_height_px=500)
            
           
            current_data = {
                'elbow_angle': metrics.get('elbow_angle', 0),
                'shoulder_angle': metrics.get('shoulder_angle', 0),
                'knee_angle': metrics.get('knee_angle', 0),
                'body_rotation': metrics.get('body_rotation', 0),
                'reach_cm': metrics.get('wrist_height', 0) * height,
                'wrist_height_cm': metrics.get('wrist_height', 0) * height,
                'velocity': metrics.get('velocity', 0),
                'forearm_rotation': metrics.get('forearm_rotation', 0),
                'wrist_x': landmarks[16].x,
                'shoulder_x': landmarks[12].x,
                'hip_x': landmarks[24].x,
                'l_shoulder_z': landmarks[11].z,
                'r_shoulder_z': landmarks[12].z
            }

            analysis = {"alerts": [], "score": 100}
            if shot_label == "SMASH":
                analysis = engine.evaluate_smash(current_data)
            elif shot_label == "DROP":
                analysis = engine.evaluate_drop(current_data)
            elif shot_label == "SERVE":
                analysis = engine.evaluate_serve(current_data)
            elif shot_label == "FOREHAND_DRIVE":
                analysis = engine.evaluate_forehand(current_data)
            elif shot_label == "BACKHAND":
                analysis = engine.evaluate_backhand(current_data)

            alerts = analysis.get("alerts", [])
            good_indicators = analysis.get("good", [])
            status_msg = analysis.get("status", "")
            score = analysis.get("score", 0)
            
            if shot_label == "IDLE":
                status = "STANDING STILL"
                
                if not prev_was_idle:
                    GREEN = "\033[92m"
                    RED = "\033[91m"
                    RESET = "\033[0m"
                    
                    if is_start:
                        print("\n" + "="*80)
                        print(f"{GREEN}START{RESET}")
                        print("="*80 + "\n")
                        is_start = False  
                    else:
                        print("\n" + "="*80)
                        print(f"{RED}END{RESET}")
                        print("="*80 + "\n")
                        is_start = True  
                    
                    prev_was_idle = True
            else:
                if status_msg:
                    status = status_msg
                else:
                    status = "ANALYZING"
                prev_was_idle = False  
            
            coach.update(shot_label, status, metrics.get('timestamp', 0))
            
            if frame_count % 5 == 0:
                firebase.push_metrics(metrics, shot_label, confidence, score, frame_count)
                if transcript_path:
                    firebase.parse_and_push_transcript(transcript_path)
                
            if frame_count % 10 == 0:
                timestamp = metrics.get('timestamp', 0)
                print(f"\n\nFRAME {frame_count} | TIME: {timestamp:.2f}s")
                print(f"{'='*80}")
                print(f"POSE: {shot_label:<22} | CONFIDENCE: {confidence:>5.2%} | PHASE: {metrics.get('phase', 'N/A')}")
                print(f"{'-'*80}")
                print(f"█ KINEMATICS")
                print(f"  Joint Angles:")
                print(f"    Elbow:     {metrics.get('elbow_angle', 0):>5.1f}°  |  Shoulder:    {metrics.get('shoulder_angle', 0):>5.1f}°  |  Knee:  {metrics.get('knee_angle', 0):>5.1f}°")
                print(f"  Forearm Rotation (Pronation/Supination):")
                print(f"    Angle:     {metrics.get('forearm_rotation', 0):>6.1f}°  ({metrics.get('forearm_rotation_label', 'Neutral')})")
                print(f"    Velocity:   {metrics.get('forearm_rot_velocity', 0):>5.1f}°/s")
                print(f"{'-'*80}")
                print(f"█ TIMING")
                print(f"  Phase Detection:")
                print(f"    Current:     {metrics.get('phase', 'N/A'):<18} |  Time in Phase: {metrics.get('time_in_phase', 0):.2f}s")
                print(f"    Sequence:    {metrics.get('phase_sequence', 'N/A')}")
                print(f"  Movement:")
                print(f"    Velocity:    {metrics.get('velocity', 0):.4f}  |  Swing Plane:      {metrics.get('racket_plane_angle', 0):.1f}°")
                print(f"{'-'*80}")
                print(f"█ CONTEXT (Racket-Hand Relationship)")
                print(f"  Racket Position:")
                print(f"    Elevation:     {metrics.get('racket_elevation', 0):>5.1f}°  ({metrics.get('racket_elevation_label', 'N/A')})")
                print(f"    Orientation: {metrics.get('forearm_rotation_label', 'Neutral')}")
                print(f"  Contact Point:")
                print(f"    Wrist Height:   {metrics.get('wrist_height_cm', 0)/100:>5.2f}  |  Height Ratio:   {metrics.get('contact_height_ratio', 0):>5.2f}")
                print(f"{'-'*80}")
                print(f"█ CORE (Kinetic Chain)")
                print(f"  Hip-Shoulder Separation:")
                print(f"    Hip Rotation:        {metrics.get('hip_rotation', 0):>6.1f}°  |  Velocity:   {metrics.get('hip_rot_velocity', 0):>5.1f}°/s")
                print(f"    Shoulder Rotation:   {metrics.get('shoulder_rotation', 0):>6.1f}°  |  Velocity:   {metrics.get('shoulder_rot_velocity', 0):>5.1f}°/s")
                print(f"    Sequence:          {metrics.get('kinetic_sequence', 'UNKNOWN')}")
                print(f"    Timing Delta:          +{metrics.get('timing_delta_ms', 0)}ms")
                print(f"  Body Mechanics:")
                print(f"    Body Rotation:    {metrics.get('body_rotation', 0):.1f}°")
                print(f"{'-'*80}")
                
                RED = "\033[91m"
                GREEN = "\033[92m"
                RESET = "\033[0m"
                
                if status.startswith("[X]"):
                    colored_status = f"{RED}{status}{RESET}"
                elif status.startswith("[OK]"):
                    colored_status = f"{GREEN}{status}{RESET}"
                else:
                    colored_status = status
                
                print(f"STATUS: {colored_status}")
                print(f"SCORE:  {score}/100")
                
                if alerts:
                    alert_str = ", ".join([f"{RED}{a}{RESET}" for a in alerts])
                    print(f"ALERTS: {alert_str}")
                
                if good_indicators:
                    good_str = ", ".join([f"{GREEN}{g}{RESET}" for g in good_indicators])
                    print(f"GOOD FORM: {good_str}")
                
                print(f"{'='*80}\n")

        frame = vision.draw_visuals(frame, results, shot_label, status)
        
        recorder.write_frame(frame)
        
        # Stream frame to frontend
        streamer.update_frame(frame)
        
        if landmarks and cfg.UI.get("SHOW_ANGLES", True):
            y_offset = 110
            cv2.putText(frame, f"Elbow: {int(metrics.get('elbow_angle', 0))}deg", 
                       (10, y_offset), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 0), 1)
            cv2.putText(frame, f"Shoulder: {int(metrics.get('shoulder_angle', 0))}deg", 
                       (10, y_offset+20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 0), 1)
            cv2.putText(frame, f"Confidence: {confidence:.0%}", 
                       (10, y_offset+40), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 1)

        cv2.imshow('BOLT: Biomechanical Correction', frame)

        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('s'):
            cv2.imwrite("bolt_capture.png", frame)
            print("Screenshot saved.")
        elif key == ord('v'):
            coach.toggle()


    session_folder = recorder.get_session_folder() if hasattr(recorder, 'get_session_folder') else None
    if recorder.is_session_active():
        recorder.stop_and_archive()
    firebase.stop_session(session_folder)
    streamer.stop()
    coach.cleanup()
    cap.release()
    cv2.destroyAllWindows()
    print("Shutting down...")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='BOLT - Badminton AI Coach')
    parser.add_argument('--height', type=int, default=None, 
                        help='User height in cm (e.g., --height 175)')
    parser.add_argument('--video', type=str, default=None,
                        help='Path to video file (default: webcam)')
    args = parser.parse_args()
    
    USE_WEBCAM = args.video is None
    VIDEO_PATH = args.video or r"E:\batminton dataset\multiple.mp4"
    
    if USE_WEBCAM:
        print("Starting live camera feed from laptop webcam...")
        video_source = 0
    elif os.path.exists(VIDEO_PATH):
        print(f"Loading video file: {VIDEO_PATH}")
        video_source = VIDEO_PATH
    else:
        print(f"Video file not found at: {VIDEO_PATH}\nFalling back to webcam (0).")
        video_source = 0
    
    run_bolt_analyzer(video_source, user_height_cm=args.height)