"""
Firebase Realtime Database Sync Module for BOLT System
Pushes live metrics and coaching insights to Firebase for frontend consumption
Uses REST API to avoid dependency issues with firebase-admin
"""

import json
import time
import os
import re
import requests
import base64
from datetime import datetime
from typing import Optional, Dict, Any

FIREBASE_STORAGE_BUCKET = "badmintonposecorrection.firebasestorage.app"

class FirebaseSync:
    """Handles real-time synchronization with Firebase using REST API"""
    
    def __init__(self, database_url: str = "https://badmintonposecorrection-default-rtdb.firebaseio.com"):
        """Initialize Firebase connection using REST API"""
        self.initialized = False
        self.session_id = None
        self.last_transcript_position = 0
        self.database_url = database_url.rstrip('/')
        self.storage_bucket = FIREBASE_STORAGE_BUCKET
        self.session_start_time = None
        
        try:
            response = requests.get(f"{self.database_url}/.json?shallow=true", timeout=5)
            if response.status_code == 200:
                self.initialized = True
                print("✅ Firebase connected successfully (REST API)")
            else:
                print(f"⚠️ Firebase connection test failed: {response.status_code}")
                self.initialized = False
        except Exception as e:
            print(f"⚠️ Firebase initialization failed: {e}")
            print("  Frontend will show placeholder data")
            self.initialized = False
    
    def _db_write(self, path: str, data: Any) -> bool:
        """Write data to Firebase using REST API"""
        try:
            url = f"{self.database_url}/{path}.json"
            response = requests.put(url, json=data, timeout=5)
            return response.status_code == 200
        except Exception as e:
            print(f"⚠️ Firebase write failed: {e}")
            return False
    
    def _db_push(self, path: str, data: Any) -> Optional[str]:
        """Push data to Firebase (generates unique key) using REST API"""
        try:
            url = f"{self.database_url}/{path}.json"
            response = requests.post(url, json=data, timeout=5)
            if response.status_code == 200:
                result = response.json()
                return result.get('name')  
            return None
        except Exception as e:
            print(f"⚠️ Firebase push failed: {e}")
            return None
    
    def _db_read(self, path: str) -> Any:
        """Read data from Firebase using REST API"""
        try:
            url = f"{self.database_url}/{path}.json"
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                return response.json()
            return None
        except Exception as e:
            print(f"⚠️ Firebase read failed: {e}")
            return None
    
    def _db_delete(self, path: str) -> bool:
        """Delete data from Firebase using REST API"""
        try:
            url = f"{self.database_url}/{path}.json"
            response = requests.delete(url, timeout=5)
            return response.status_code == 200
        except Exception as e:
            print(f"⚠️ Firebase delete failed: {e}")
            return False
    
    def _upload_to_storage(self, file_path: str, storage_path: str) -> Optional[str]:
        """
        Upload a file to Firebase Storage using REST API
        Returns the download URL if successful
        """
        if not os.path.exists(file_path):
            print(f"⚠️ File not found: {file_path}")
            return None
            
        try:
            # Get file size for logging
            file_size = os.path.getsize(file_path)
            file_size_mb = file_size / (1024 * 1024)
            print(f"    📁 File: {os.path.basename(file_path)} ({file_size_mb:.2f} MB)")
            
            if file_path.endswith('.mp4'):
                content_type = 'video/mp4'
            elif file_path.endswith('.avi'):
                content_type = 'video/x-msvideo'
            elif file_path.endswith('.txt'):
                content_type = 'text/plain'
            else:
                content_type = 'application/octet-stream'
            
            with open(file_path, 'rb') as f:
                file_content = f.read()
            
           
            encoded_path = requests.utils.quote(storage_path, safe='')
            upload_url = f"https://firebasestorage.googleapis.com/v0/b/{self.storage_bucket}/o/{encoded_path}"
            
            headers = {
                'Content-Type': content_type,
            }
            
            # Use longer timeout for larger files (5 minutes for videos)
            timeout = 300 if file_size_mb > 1 else 120
            print(f"    ⬆️ Uploading to Storage (timeout: {timeout}s)...")
            
            response = requests.post(upload_url, data=file_content, headers=headers, timeout=timeout)
            
            if response.status_code == 200:
                result = response.json()
                download_token = result.get('downloadTokens', '')
                download_url = f"https://firebasestorage.googleapis.com/v0/b/{self.storage_bucket}/o/{encoded_path}?alt=media&token={download_token}"
                print(f"    ✅ Upload successful!")
                return download_url
            else:
                print(f"⚠️ Storage upload failed: {response.status_code}")
                print(f"    Response: {response.text[:200]}")
                return None
            
        except requests.exceptions.Timeout:
            print(f"⚠️ Storage upload timed out for {file_path}")
            return None
        except Exception as e:
            print(f"⚠️ Storage upload error: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def start_session(self, session_id: str):
        """Start a new live session"""
        if not self.initialized:
            return
            
        self.session_id = session_id
        self.last_transcript_position = 0
        self.session_start_time = int(time.time() * 1000)
        
        session_data = {
            'sessionStatus': {
                'isActive': True,
                'sessionId': session_id,
                'startTime': self.session_start_time,
                'currentFrame': 0
            },
            'metrics': None,
            'insights': {}
        }
        self._db_write('live', session_data)
        
        print(f"📡 Firebase session started: {session_id}")
    
    def push_metrics(self, metrics: Dict[str, Any], shot_label: str, confidence: float, score: int, frame_count: int):
        """Push live metrics to Firebase"""
        if not self.initialized:
            return
            
        try:
            metrics_data = {
                'elbow_angle': metrics.get('elbow_angle', 0),
                'shoulder_angle': metrics.get('shoulder_angle', 0),
                'knee_angle': metrics.get('knee_angle', 0),
                'body_rotation': metrics.get('body_rotation', 0),
                'velocity': metrics.get('velocity', 0),
                'forearm_rotation': metrics.get('forearm_rotation', 0),
                'wrist_height_cm': metrics.get('wrist_height_cm', 0),
                'hip_rotation': metrics.get('hip_rotation', 0),
                'shoulder_rotation': metrics.get('shoulder_rotation', 0),
                'confidence': confidence,
                'shot_label': shot_label,
                'phase': metrics.get('phase', 'N/A'),
                'score': score,
                'timestamp': int(time.time() * 1000)
            }
            
            self._db_write('live/metrics', metrics_data)
            self._db_write('live/sessionStatus/currentFrame', frame_count)
            
        except Exception as e:
            print(f"⚠️ Firebase metrics push failed: {e}")
    
    def push_insight(self, video_time: float, shot: str, error: str, advice: str):
        """Push a coaching insight to Firebase"""
        if not self.initialized:
            return
            
        try:
            insight_data = {
                'time': datetime.now().strftime('%H:%M:%S'),
                'videoTime': f"{video_time:.2f}s",
                'shot': shot,
                'error': error,
                'advice': advice,
                'timestamp': int(time.time() * 1000)
            }
            
            self._db_push('live/insights', insight_data)
            
        except Exception as e:
            print(f"⚠️ Firebase insight push failed: {e}")
    
    def parse_and_push_transcript(self, transcript_path: str):
        """Parse transcript file and push new entries to Firebase"""
        if not self.initialized or not os.path.exists(transcript_path):
            return
            
        try:
            with open(transcript_path, 'r', encoding='utf-8') as f:
                f.seek(self.last_transcript_position)
                new_content = f.read()
                self.last_transcript_position = f.tell()
            
            if not new_content.strip():
                return
            
            
            
            entries = re.split(r'\n(?=\[[\d-]+ [\d:]+\])', new_content)
            
            for entry in entries:
                if not entry.strip():
                    continue
                    
                video_time_match = re.search(r'Video Time: ([\d.]+)s', entry)
                shot_match = re.search(r'Shot: (\w+)', entry)
                error_match = re.search(r'Error: (.+)', entry)
                advice_match = re.search(r'Advice: (.+)', entry)
                
                if shot_match:
                    video_time = float(video_time_match.group(1)) if video_time_match else 0
                    shot = shot_match.group(1)
                    error = error_match.group(1).strip() if error_match else ''
                    advice = advice_match.group(1).strip() if advice_match else ''
                    
                    if advice:  
                        self.push_insight(video_time, shot, error, advice)
                        
        except Exception as e:
            print(f"⚠️ Transcript parsing failed: {e}")
    
    def stop_session(self, session_folder: str = None):
        """End the live session and archive to Firebase with video and transcript"""
        if not self.initialized:
            return
            
        try:
            self._db_write('live/sessionStatus/isActive', False)
            
            if self.session_id:
                start_time = self._db_read('live/sessionStatus/startTime') or self.session_start_time
                insights = self._db_read('live/insights') or {}
                final_metrics = self._db_read('live/metrics') or {}
                
                video_url = None
                transcript_url = None
                transcript_content = None
                
                if session_folder and os.path.exists(session_folder):
                    print(f"📤 Uploading session files to Firebase Storage...")
                    
                    video_files = ['video.mp4', 'recording.mp4', 'recording.avi']
                    for video_file in video_files:
                        video_path = os.path.join(session_folder, video_file)
                        if os.path.exists(video_path):
                            storage_path = f"sessions/{self.session_id}/{video_file}"
                            video_url = self._upload_to_storage(video_path, storage_path)
                            if video_url:
                                print(f"  🎥 Video uploaded: {video_file}")
                            break
                    
                    transcript_path = os.path.join(session_folder, 'transcript.txt')
                    if os.path.exists(transcript_path):
                        storage_path = f"sessions/{self.session_id}/transcript.txt"
                        transcript_url = self._upload_to_storage(transcript_path, storage_path)
                        if transcript_url:
                            print(f"  📄 Transcript uploaded")
                        
                        try:
                            with open(transcript_path, 'r', encoding='utf-8') as f:
                                transcript_content = f.read()
                        except:
                            pass
                
                end_time = int(time.time() * 1000)
                duration_ms = end_time - start_time if start_time else 0
                
                session_date = datetime.fromtimestamp(start_time / 1000).strftime('%B %d, %Y') if start_time else datetime.now().strftime('%B %d, %Y')
                session_time = datetime.fromtimestamp(start_time / 1000).strftime('%H:%M:%S') if start_time else datetime.now().strftime('%H:%M:%S')
                
                avg_score = 0
                if final_metrics and 'score' in final_metrics:
                    avg_score = final_metrics.get('score', 0)
                
                session_data = {
                    'sessionId': self.session_id,
                    'date': session_date,
                    'time': session_time,
                    'endTime': end_time,
                    'startTime': start_time,
                    'duration': duration_ms,
                    'durationFormatted': f"{duration_ms // 60000}:{(duration_ms // 1000) % 60:02d}",
                    'score': avg_score,
                    'insights': insights,
                    'finalMetrics': final_metrics,
                    'videoUrl': video_url,
                    'transcriptUrl': transcript_url,
                    'transcriptContent': transcript_content,
                    'localPath': session_folder
                }
                
                self._db_write(f'sessions/{self.session_id}', session_data)
                
                print(f"📦 Session archived to Firebase: {self.session_id}")
                if video_url:
                    print(f"   Video URL: {video_url[:80]}...")
                if transcript_url:
                    print(f"   Transcript URL: {transcript_url[:80]}...")
            
            self._db_delete('live/insights')
            self._db_delete('live/metrics')
            
        except Exception as e:
            print(f"⚠️ Firebase session stop failed: {e}")
            import traceback
            traceback.print_exc()


_firebase_sync: Optional[FirebaseSync] = None

def get_firebase_sync() -> FirebaseSync:
    """Get or create the global FirebaseSync instance"""
    global _firebase_sync
    if _firebase_sync is None:
        _firebase_sync = FirebaseSync()
    return _firebase_sync
