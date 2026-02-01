import cv2

# Test webcam access
print("Testing webcam access...")

# Try different camera indices
for camera_index in [0, 1, 2]:
    print(f"\nTrying camera index {camera_index}...")
    cap = cv2.VideoCapture(camera_index)
    
    if cap.isOpened():
        print(f"  ✓ Camera {camera_index} opened successfully")
        
        # Try to read a frame
        ret, frame = cap.read()
        if ret:
            print(f"  ✓ Frame read successful: {frame.shape}")
            print(f"  → Use camera index {camera_index} in main.py")
        else:
            print(f"  ✗ Could not read frame from camera {camera_index}")
        
        cap.release()
    else:
        print(f"  ✗ Could not open camera {camera_index}")

print("\nTest complete. Close any other applications using the webcam and try again.")
