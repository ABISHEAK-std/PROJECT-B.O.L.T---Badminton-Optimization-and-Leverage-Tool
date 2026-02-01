"""
Test Firebase connection and push sample data for frontend testing
"""
import os
import sys
import time

project_root = os.path.dirname(os.path.abspath(__file__))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

import warnings
warnings.filterwarnings('ignore')

from core.firebase_sync import get_firebase_sync

def test_firebase_connection():
    """Test Firebase connection by pushing sample data"""
    print("🔥 Testing Firebase Connection...")
    
    firebase = get_firebase_sync()
    
    if not firebase.initialized:
        print("❌ Firebase failed to initialize. Check privatekey.json")
        return False
    
    test_session_id = f"test_session_{int(time.time())}"
    firebase.start_session(test_session_id)
    
    print("\n📊 Pushing test metrics...")
    test_metrics = {
        'elbow_angle': 135.5,
        'shoulder_angle': 152.3,
        'knee_angle': 145.0,
        'body_rotation': 28.5,
        'velocity': 0.0024,
        'forearm_rotation': 15.2,
        'wrist_height_cm': 185.0,
        'hip_rotation': 22.4,
        'shoulder_rotation': 35.6,
        'phase': 'PREPARATION'
    }
    
    firebase.push_metrics(test_metrics, 'SMASH', 0.87, 85, 100)
    print("✅ Metrics pushed")
    
    print("\n💬 Pushing test coaching insights...")
    firebase.push_insight(1.5, 'SMASH', '[X] LOW ELBOW: Raise racket arm', 'Raise your elbow higher for more power!')
    time.sleep(0.5)
    firebase.push_insight(2.3, 'SERVE', '', 'Good serve technique! Maintain that follow-through.')
    time.sleep(0.5)
    firebase.push_insight(3.1, 'BACKHAND', '[X] TURN YOUR BACK', 'Rotate your shoulders away from the net for better torque.')
    print("✅ Insights pushed")
    
    print(f"\n🎉 Test data pushed successfully!")
    print(f"   Session ID: {test_session_id}")
    print(f"   Check your frontend at http://localhost:5175/")
    print(f"   - Analysis Hub: http://localhost:5175/")
    print(f"   - History: http://localhost:5175/history")
    print(f"\n   Press Ctrl+C to stop and archive session...")
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n\n⏹️ Stopping test session...")
        # Simulate a session folder with transcript
        test_folder = os.path.join(project_root, "processed_data", test_session_id)
        os.makedirs(test_folder, exist_ok=True)
        
        # Create a test transcript
        transcript_path = os.path.join(test_folder, "transcript.txt")
        with open(transcript_path, 'w') as f:
            f.write("=== Badminton Coaching Session Log ===\n")
            f.write(f"Started: {time.strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            f.write("[2026-02-01 07:00:32] Video Time: 1.5s\n")
            f.write("  Shot: SMASH\n")
            f.write("  Error: [X] LOW ELBOW: Raise racket arm\n")
            f.write("  Advice: Raise your elbow higher for more power!\n\n")
        
        firebase.stop_session(test_folder)
        print("✅ Session archived to Firebase")
        print(f"   Check history page to see the archived session!")

if __name__ == "__main__":
    test_firebase_connection()
