import cv2
import os
import sys
import signal

# --- STEP 1: ROBUST PATH INJECTION ---
# We force the absolute path of the project root into sys.path
# This must happen BEFORE the local 'from core...' imports.
project_root = os.path.dirname(os.path.abspath(__file__))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# --- STEP 2: IMPORTS (Now safe) ---
try:
    from core.vission_processor import BoltVisionProcessor
    from core.classifier import BoltActionClassifier
    from core.engine import BoltMasterEngine
    from core.coach_feedback import CoachFeedbackSystem
    from core.session_recorder import SessionRecorder
    from utils.geometry import BoltGeometry
    from config import BoltConfig as cfg
except ImportError as e:
    print(f"Import Error: {e}")
    print("\n[DEBUG INFO]")
    print(f"Project Root: {project_root}")
    print(f"System Path: {sys.path[:3]}")
    sys.exit(1)

def run_bolt_analyzer(video_source=0):
    """
    Main execution loop for BOLT.
    video_source: 0 for webcam, or "path/to/video.mp4" for testing.
    """
    # Signal handler for Ctrl+C
    def signal_handler(sig, frame_obj):
        print("\n\n⚠️  Ctrl+C detected - Archiving session...")
        # Always try to archive, even if video recording failed
        if recorder.is_session_active():
            recorder.stop_and_archive()
        coach.cleanup()
        cap.release()
        cv2.destroyAllWindows()
        sys.exit(0)
    
    # Initialize Core Modules
    vision = BoltVisionProcessor()
    classifier = BoltActionClassifier()
    # Pull user height from config.py
    engine = BoltMasterEngine(user_height_cm=cfg.ATHLETE["HEIGHT_CM"])
    coach = CoachFeedbackSystem("corrections.json", "correct.txt")  # Initialize coach feedback
    recorder = SessionRecorder("processed_data", fps=30.0)  # Initialize session recorder
    
    # Register Ctrl+C handler (must be after recorder init)
    signal.signal(signal.SIGINT, signal_handler)
    
    cap = cv2.VideoCapture(video_source)
    
    if not cap.isOpened():
        print(f"CRITICAL ERROR: Could not open source {video_source}")
        print("Try closing other applications using the webcam (Zoom, Teams, etc.)")
        coach.cleanup()
        return

    print(f"--- BOLT SYSTEM ACTIVE ---")
    print(f"Mode: {'Webcam' if video_source == 0 else 'Video File'}")
    print(f"Target Height: {cfg.ATHLETE['HEIGHT_CM']}cm")
    
    # Give webcam time to initialize and retry reading first frame
    import time
    first_frame = None
    for attempt in range(10):  # Try 10 times
        time.sleep(0.2)  # 200ms between attempts
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
    
    # Start recording immediately
    height, width = first_frame.shape[:2]
    recorder.start_recording(width, height)
    
    # Connect coach to session transcript for live logging
    transcript_path = recorder.get_transcript_path()
    if transcript_path:
        coach.set_transcript_path(transcript_path)
    
    print(f"📹 Session recording started (Resolution: {width}x{height})")

    frame_count = 0
    is_start = True  # Toggle flag: True=START, False=END
    prev_was_idle = False  # Track if previous frame was IDLE
    
    # Process first frame
    results, landmarks = vision.process_frame(first_frame)
    frame = first_frame
    
    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            break

        frame_count += 1

        # A. Processing Phase (MediaPipe + Smoothing)
        results, landmarks = vision.process_frame(frame)
        
        status = "IDLE"
        shot_label = "NONE"
        confidence = 0
        metrics = {}

        if landmarks:
            # B. Prediction Phase (Classifier with enhanced biomechanics)
            shot_label, confidence, metrics = classifier.classify(landmarks, user_height_px=500)
            
            # C. Correction Phase (Rule Engine)
            # Use metrics from classifier (which already calculated angles)
            current_data = {
                'elbow_angle': metrics.get('elbow_angle', 0),
                'shoulder_angle': metrics.get('shoulder_angle', 0),
                'knee_angle': metrics.get('knee_angle', 0),
                'body_rotation': metrics.get('body_rotation', 0),
                'reach_cm': metrics.get('wrist_height', 0) * cfg.ATHLETE["HEIGHT_CM"],
                'wrist_height_cm': metrics.get('wrist_height', 0) * cfg.ATHLETE["HEIGHT_CM"],
                'velocity': metrics.get('velocity', 0),
                'forearm_rotation': metrics.get('forearm_rotation', 0),
                'wrist_x': landmarks[16].x,
                'shoulder_x': landmarks[12].x,
                'hip_x': landmarks[24].x,
                'l_shoulder_z': landmarks[11].z,
                'r_shoulder_z': landmarks[12].z
            }

            # Map the prediction to the specific Rule Engine function
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

            #  Alert Handling
            alerts = analysis.get("alerts", [])
            good_indicators = analysis.get("good", [])
            status_msg = analysis.get("status", "")
            score = analysis.get("score", 0)
            
            # Prioritize status field from analysis
            if shot_label == "IDLE":
                status = "STANDING STILL"
                
                # Toggle START/END on IDLE detection (only once per IDLE sequence)
                if not prev_was_idle:
                    # ANSI Color codes
                    GREEN = "\033[92m"
                    RED = "\033[91m"
                    RESET = "\033[0m"
                    
                    if is_start:
                        print("\n" + "="*80)
                        print(f"{GREEN}START{RESET}")
                        print("="*80 + "\n")
                        is_start = False  # Toggle to END for next time
                    else:
                        print("\n" + "="*80)
                        print(f"{RED}END{RESET}")
                        print("="*80 + "\n")
                        is_start = True  # Toggle back to START
                    
                    prev_was_idle = True
            else:
                # Non-IDLE state
                if status_msg:
                    status = status_msg
                else:
                    status = "ANALYZING"
                prev_was_idle = False  # Reset when not idle
            
            # Coach feedback system (handles live voice + post-shot corrections)
            coach.update(shot_label, status, metrics.get('timestamp', 0))
                
            # E. TERMINAL OUTPUT - Professional RAG Format (REDUCED FREQUENCY)
            # Only print every 10 frames to reduce lag
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
                
                # ANSI Color codes
                RED = "\033[91m"
                GREEN = "\033[92m"
                RESET = "\033[0m"
                
                # Color the status
                if status.startswith("[X]"):
                    colored_status = f"{RED}{status}{RESET}"
                elif status.startswith("[OK]"):
                    colored_status = f"{GREEN}{status}{RESET}"
                else:
                    colored_status = status
                
                print(f"STATUS: {colored_status}")
                print(f"SCORE:  {score}/100")
                
                # Print alerts
                if alerts:
                    alert_str = ", ".join([f"{RED}{a}{RESET}" for a in alerts])
                    print(f"ALERTS: {alert_str}")
                
                # Print good form indicators
                if good_indicators:
                    good_str = ", ".join([f"{GREEN}{g}{RESET}" for g in good_indicators])
                    print(f"GOOD FORM: {good_str}")
                
                print(f"{'='*80}\n")

        # F. Rendering Phase
        # Draw skeleton and HUD (vission_processor handles the HUD background)
        frame = vision.draw_visuals(frame, results, shot_label, status)
        
        # Record annotated frame
        recorder.write_frame(frame)
        
        # Add detailed angle display on video
        if landmarks and cfg.UI.get("SHOW_ANGLES", True):
            y_offset = 110
            cv2.putText(frame, f"Elbow: {int(metrics.get('elbow_angle', 0))}deg", 
                       (10, y_offset), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 0), 1)
            cv2.putText(frame, f"Shoulder: {int(metrics.get('shoulder_angle', 0))}deg", 
                       (10, y_offset+20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 0), 1)
            cv2.putText(frame, f"Confidence: {confidence:.0%}", 
                       (10, y_offset+40), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 1)

        cv2.imshow('BOLT: Biomechanical Correction', frame)

        # Controls: 'q' to quit, 's' to save screenshot, 'v' to toggle voice
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('s'):
            cv2.imwrite("bolt_capture.png", frame)
            print("Screenshot saved.")
        elif key == ord('v'):
            coach.toggle()


    # Cleanup and Archive Session
    if recorder.is_session_active():
        recorder.stop_and_archive()
    coach.cleanup()
    cap.release()
    cv2.destroyAllWindows()
    print("Shutting down...")

if __name__ == "__main__":
    # Use laptop camera (0) or video file path
    USE_WEBCAM = True  # Set to False to use video file instead
    VIDEO_PATH = r"E:\batminton dataset\multiple.mp4"
    
    if USE_WEBCAM:
        print("Starting live camera feed from laptop webcam...")
        video_source = 0
    elif os.path.exists(VIDEO_PATH):
        print(f"Loading video file: {VIDEO_PATH}")
        video_source = VIDEO_PATH
    else:
        print(f"Video file not found at: {VIDEO_PATH}\nFalling back to webcam (0).")
        video_source = 0
    
    run_bolt_analyzer(video_source)