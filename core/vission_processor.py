import cv2
import mediapipe as mp
import numpy as np
import time

class BoltVisionProcessor:
    def __init__(self, model_path=r"E:\rulebased_correction\pose_landmarker_heavy.task"):
        BaseOptions = mp.tasks.BaseOptions
        PoseLandmarker = mp.tasks.vision.PoseLandmarker
        PoseLandmarkerOptions = mp.tasks.vision.PoseLandmarkerOptions
        VisionRunningMode = mp.tasks.vision.RunningMode

        options = PoseLandmarkerOptions(
            base_options=BaseOptions(model_asset_path=model_path),
            running_mode=VisionRunningMode.VIDEO)
        
        self.landmarker = PoseLandmarker.create_from_options(options)
        
       
        try:
            self.mp_drawing = mp.solutions.drawing_utils
            self.mp_pose = mp.solutions.pose 
        except AttributeError:
             self.mp_drawing = None

    def process_frame(self, frame):
        image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=image_rgb)
        
        timestamp_ms = int(time.time() * 1000)
        
        detection_result = self.landmarker.detect_for_video(mp_image, timestamp_ms)
        
        landmarks = None
        if detection_result.pose_landmarks:
            landmarks = detection_result.pose_landmarks[0]
            
        return detection_result, landmarks

    def draw_visuals(self, frame, detection_result, shot_type, status):
        
        if detection_result.pose_landmarks:
            landmarks = detection_result.pose_landmarks[0]
            
            h, w, _ = frame.shape
            
            CONNECTIONS = [
                (11, 12), (11, 23), (12, 24), (23, 24), 
                (11, 13), (13, 15), (12, 14), (14, 16), 
                (23, 25), (25, 27), (24, 26), (26, 28)  
            ]

            for start_idx, end_idx in CONNECTIONS:
                if start_idx < len(landmarks) and end_idx < len(landmarks):
                    pt1 = (int(landmarks[start_idx].x * w), int(landmarks[start_idx].y * h))
                    pt2 = (int(landmarks[end_idx].x * w), int(landmarks[end_idx].y * h))
                    cv2.line(frame, pt1, pt2, (255, 255, 255), 2)
            
            for lm in landmarks:
                cx, cy = int(lm.x * w), int(lm.y * h)
                cv2.circle(frame, (cx, cy), 4, (0, 255, 0), -1)
        
        cv2.putText(frame, f"SHOT: {shot_type}", (10, 30), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        
        color = (0, 0, 255) if "FIX" in status or "FAULT" in status else (0, 255, 255)
        cv2.putText(frame, f"STATUS: {status}", (10, 70), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
        
        return frame