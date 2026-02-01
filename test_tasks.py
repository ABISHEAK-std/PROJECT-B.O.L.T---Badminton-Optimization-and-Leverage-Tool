import mediapipe as mp
print("Checking TASKS API...")
try:
    from mediapipe.tasks import python
    from mediapipe.tasks.python import vision
    
    print("Tasks API imported.")
    
    # Check if PoseLandmarker exists
    PoseLandmarker = vision.PoseLandmarker
    print("PoseLandmarker class found.")
    
except ImportError as e:
    print(f"Tasks API import failed: {e}")
except Exception as e:
    print(f"Error: {e}")
