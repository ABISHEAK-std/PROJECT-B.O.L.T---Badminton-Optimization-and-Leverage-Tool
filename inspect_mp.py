import mediapipe as mp
print("MediaPipe file:", mp.__file__)
print("MediaPipe dir:", dir(mp))
try:
    import mediapipe.python.solutions as solutions
    print("Solutions found via sub-import")
except ImportError:
    print("Solutions not found via sub-import")
