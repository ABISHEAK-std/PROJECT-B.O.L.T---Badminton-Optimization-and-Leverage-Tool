import numpy as np
from collections import deque, Counter

class BoltActionClassifier:
    def __init__(self):
        self.prev_wrist_pos = None
        self.velocity_buffer = deque(maxlen=5)
        self.pose_history = deque(maxlen=10)
        self.phase = "READY"
        self.phase_start_time = 0
        self.frame_count = 0
        self.fps = 30  
        
        self.prev_forearm_rotation = None
        self.prev_hip_angle = None
        self.prev_shoulder_angle = None
        self.prev_frame_time = 0
        
        self.current_state = "IDLE"  
        self.active_shot = None  
        self.shot_lock_frames = 0  
        self.idle_frame_count = 0  
        self.shot_window = deque(maxlen=7)  
        
    def calculate_angle(self, a, b, c):
        """Calculate angle at point b formed by points a-b-c"""
        a = np.array([a.x, a.y, a.z]) if hasattr(a, 'x') else np.array(a)
        b = np.array([b.x, b.y, b.z]) if hasattr(b, 'x') else np.array(b)
        c = np.array([c.x, c.y, c.z]) if hasattr(c, 'x') else np.array(c)
        
        ba = a - b
        bc = c - b
        
        cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-6)
        angle = np.degrees(np.arccos(np.clip(cosine_angle, -1.0, 1.0)))
        return angle
    
    def calculate_metrics(self, landmarks):
        """Calculate all biomechanical metrics"""
        nose = landmarks[0]
        l_shoulder = landmarks[11]
        r_shoulder = landmarks[12]
        l_elbow = landmarks[13]
        r_elbow = landmarks[14]
        l_wrist = landmarks[15]
        r_wrist = landmarks[16]
        l_hip = landmarks[23]
        r_hip = landmarks[24]
        l_knee = landmarks[25]
        r_knee = landmarks[26]
        l_ankle = landmarks[27]
        r_ankle = landmarks[28]
        
        metrics = {}
        
        metrics['elbow_angle'] = self.calculate_angle(r_shoulder, r_elbow, r_wrist)
        metrics['shoulder_angle'] = self.calculate_angle(
            [r_shoulder.x, r_shoulder.y + 0.1, r_shoulder.z],  
            r_shoulder,
            r_elbow
        )
        metrics['knee_angle'] = self.calculate_angle(r_hip, r_knee, r_ankle)
        
        shoulder_mid_x = (l_shoulder.x + r_shoulder.x) / 2
        hip_mid_x = (l_hip.x + r_hip.x) / 2
        metrics['body_rotation'] = abs(shoulder_mid_x - hip_mid_x) * 100  
        
        metrics['wrist_height'] = 1 - r_wrist.y  
        metrics['contact_height_ratio'] = (1 - r_wrist.y) / (1 - r_hip.y + 0.01)
        
        current_wrist = np.array([r_wrist.x, r_wrist.y, r_wrist.z])
        if self.prev_wrist_pos is not None:
            velocity = np.linalg.norm(current_wrist - self.prev_wrist_pos)
            self.velocity_buffer.append(velocity)
        self.prev_wrist_pos = current_wrist
        
        metrics['velocity'] = np.mean(self.velocity_buffer) if len(self.velocity_buffer) > 0 else 0
        
        if len(self.velocity_buffer) >= 2:
            wrist_dy = abs(current_wrist[1] - self.prev_wrist_pos[1])
            wrist_dx = abs(current_wrist[0] - self.prev_wrist_pos[0])
            metrics['swing_plane_angle'] = np.degrees(np.arctan2(wrist_dy, wrist_dx + 1e-6))
        else:
            metrics['swing_plane_angle'] = 0
            
        
        
       
        try:
            r_index = landmarks[20]  
            r_pinky = landmarks[18]  
            
            forearm_vec = np.array([r_wrist.x - r_elbow.x, 
                                   r_wrist.y - r_elbow.y, 
                                   r_wrist.z - r_elbow.z])
            
            hand_vec = np.array([r_index.x - r_pinky.x,
                               r_index.y - r_pinky.y,
                               r_index.z - r_pinky.z])
            
            cross_prod = np.cross(forearm_vec, hand_vec)
            
            metrics['forearm_rotation'] = np.degrees(np.arctan2(cross_prod[1], cross_prod[2]))
            
            if metrics['forearm_rotation'] < -15:
                metrics['rotation_type'] = "Pronation"
            elif metrics['forearm_rotation'] > 15:
                metrics['rotation_type'] = "Supination"
            else:
                metrics['rotation_type'] = "Neutral"
        except:
            metrics['forearm_rotation'] = 0
            metrics['rotation_type'] = "Unknown"
        
       
        try:
            hand_direction = np.array([r_index.x - r_wrist.x,
                                      r_index.y - r_wrist.y,
                                      r_index.z - r_wrist.z])
            
            hand_dir_norm = hand_direction / (np.linalg.norm(hand_direction) + 1e-6)
            
            estimated_racket_tip = current_wrist + (hand_dir_norm * 0.3)
            
            metrics['racket_vs_hand'] = (estimated_racket_tip[1] - current_wrist[1]) * 100
            
            if metrics['racket_vs_hand'] > 5:
                metrics['racket_position'] = "Raised"
            elif metrics['racket_vs_hand'] < -5:
                metrics['racket_position'] = "Dropped"
            else:
                metrics['racket_position'] = "Level"
        except:
            metrics['racket_vs_hand'] = 0
            metrics['racket_position'] = "Unknown"
        
        
        try:
            hip_vec = np.array([r_hip.x - l_hip.x, r_hip.y - l_hip.y])
            hip_angle = np.degrees(np.arctan2(hip_vec[1], hip_vec[0]))
            
            shoulder_vec = np.array([r_shoulder.x - l_shoulder.x, 
                                    r_shoulder.y - l_shoulder.y])
            shoulder_angle = np.degrees(np.arctan2(shoulder_vec[1], shoulder_vec[0]))
            
            metrics['kinetic_separation'] = abs(shoulder_angle - hip_angle)
            
            if metrics['kinetic_separation'] > 20:
                metrics['power_generation'] = "Excellent"
            elif metrics['kinetic_separation'] > 10:
                metrics['power_generation'] = "Good"
            else:
                metrics['power_generation'] = "Weak"
        except:
            metrics['kinetic_separation'] = 0
            metrics['power_generation'] = "Unknown"
        
        
        velocity = metrics.get('velocity', 0)
        wrist_height = metrics.get('wrist_height', 0)
        
        if self.prev_wrist_pos is not None and len(self.velocity_buffer) >= 2:
            wrist_x_velocity = current_wrist[0] - self.prev_wrist_pos[0]
        else:
            wrist_x_velocity = 0
        
        if velocity < 0.01:  
            self.phase = "READY"
        elif wrist_x_velocity < -0.01 and velocity > 0.02:  
            self.phase = "BACKSWING"
        elif velocity > 0.05 or wrist_height > 0.65:  
            self.phase = "CONTACT"
        elif wrist_x_velocity > 0.01 and velocity > 0.02:  
            self.phase = "FOLLOW_THROUGH"
        elif velocity < 0.02:  
            self.phase = "RECOVERY"
        
        metrics['phase'] = self.phase
        
        current_time = self.frame_count / self.fps
        if self.phase != metrics.get('prev_phase', self.phase):
            self.phase_start_time = current_time
        metrics['time_in_phase'] = current_time - self.phase_start_time
        metrics['timestamp'] = current_time
        
        dt = 1.0 / self.fps if self.fps > 0 else 0.033
        
        if self.prev_forearm_rotation is not None:
            metrics['forearm_rot_velocity'] = (metrics['forearm_rotation'] - self.prev_forearm_rotation) / dt
        else:
            metrics['forearm_rot_velocity'] = 0
        self.prev_forearm_rotation = metrics['forearm_rotation']
        
        try:
            hip_vec = np.array([r_hip.x - l_hip.x, r_hip.y - l_hip.y])
            current_hip_angle = np.degrees(np.arctan2(hip_vec[1], hip_vec[0]))
            
            if self.prev_hip_angle is not None:
                metrics['hip_rot_velocity'] = (current_hip_angle - self.prev_hip_angle) / dt
            else:
                metrics['hip_rot_velocity'] = 0
            self.prev_hip_angle = current_hip_angle
            metrics['hip_rotation'] = current_hip_angle
        except:
            metrics['hip_rot_velocity'] = 0
            metrics['hip_rotation'] = 0
        
        try:
            shoulder_vec = np.array([r_shoulder.x - l_shoulder.x, r_shoulder.y - l_shoulder.y])
            current_shoulder_angle = np.degrees(np.arctan2(shoulder_vec[1], shoulder_vec[0]))
            
            if self.prev_shoulder_angle is not None:
                metrics['shoulder_rot_velocity'] = (current_shoulder_angle - self.prev_shoulder_angle) / dt
            else:
                metrics['shoulder_rot_velocity'] = 0
            self.prev_shoulder_angle = current_shoulder_angle
            metrics['shoulder_rotation'] = current_shoulder_angle
        except:
            metrics['shoulder_rot_velocity'] = 0
            metrics['shoulder_rotation'] = 0
        
        hip_vel = abs(metrics.get('hip_rot_velocity', 0))
        shoulder_vel = abs(metrics.get('shoulder_rot_velocity', 0))
        
        if hip_vel > 50 and shoulder_vel < 20:
            metrics['kinetic_sequence'] = "HIP_INITIATED"
        elif shoulder_vel > 50 and hip_vel < 20:
            metrics['kinetic_sequence'] = "SHOULDER_INITIATED"
        elif abs(hip_vel - shoulder_vel) < 30:
            metrics['kinetic_sequence'] = "SIMULTANEOUS"
        else:
            metrics['kinetic_sequence'] = "SEQUENTIAL"
        
        if hip_vel > shoulder_vel:
            metrics['timing_delta_ms'] = 0 
        else:
            metrics['timing_delta_ms'] = int((shoulder_vel - hip_vel) * 10)  
        
        try:
            hand_direction = np.array([r_index.x - r_wrist.x,
                                      r_index.y - r_wrist.y,
                                      r_index.z - r_wrist.z])
            racket_elevation = np.degrees(np.arctan2(-hand_direction[1], 
                                                     np.sqrt(hand_direction[0]**2 + hand_direction[2]**2)))
            metrics['racket_elevation'] = racket_elevation
        except:
            metrics['racket_elevation'] = 0
        
        self.frame_count += 1
            
        return metrics

    def classify(self, landmarks, user_height_px):
        """
        Enhanced classification with biomechanical analysis and confidence scoring.
        Includes refined DROP/SERVE detection and BACKHAND support.
        """
        metrics = self.calculate_metrics(landmarks)
        
        wrist = landmarks[16]
        shoulder = landmarks[12]
        l_shoulder = landmarks[11]
        hip = landmarks[24]
        
        body_midline_x = (landmarks[11].x + landmarks[12].x) / 2
        
        confidence_scores = {
            'SMASH': 0,
            'DROP': 0,
            'SERVE': 0,
            'FOREHAND_DRIVE': 0,
            'BACKHAND': 0,
            'IDLE': 0,
            'PREPARATION': 0
        }
        
       
        if self.shot_lock_frames > 0:
            self.shot_lock_frames -= 1
            
            avg_velocity = np.mean(self.velocity_buffer) if len(self.velocity_buffer) > 0 else 0
            if avg_velocity < 0.008 and self.shot_lock_frames < 5:
                self.shot_lock_frames = 0
                self.active_shot = None
                self.idle_frame_count = 0
            else:
                self.pose_history.append({
                    'pose': self.active_shot,
                    'confidence': 0.95,
                    'metrics': metrics
                })
                return self.active_shot, 0.95, metrics
        
        avg_velocity = np.mean(self.velocity_buffer) if len(self.velocity_buffer) > 0 else 0
        current_velocity = metrics.get('velocity', 0)
        
        wrist_near_hip = wrist.y >= hip.y - 0.05  
        hands_at_rest = abs(wrist.x - hip.x) < 0.2  
        if avg_velocity < 0.012 and current_velocity < 0.015:
            if len(self.pose_history) >= 5:
                recent_poses = list(self.pose_history)[-5:]
                elbow_variance = np.std([p['metrics'].get('elbow_angle', 0) for p in recent_poses])
                shoulder_variance = np.std([p['metrics'].get('shoulder_angle', 0) for p in recent_poses])
                
                is_stable = elbow_variance < 3 and shoulder_variance < 3
                is_resting_pose = wrist_near_hip and hands_at_rest
                
                if is_stable or is_resting_pose:
                    self.idle_frame_count += 1
                    
                    required_idle_frames = 5 if is_resting_pose else 10
                    
                    if self.idle_frame_count >= required_idle_frames or self.active_shot is None:
                        self.current_state = "IDLE"
                        self.active_shot = None
                        self.shot_lock_frames = 0
                        
                        self.pose_history.append({
                            'pose': 'IDLE',
                            'confidence': 1.0,
                            'metrics': metrics
                        })
                        
                        return 'IDLE', 1.0, metrics
                else:
                    self.idle_frame_count = 0
            else:
                self.idle_frame_count += 1
        else:
            self.idle_frame_count = 0
        
        if len(self.velocity_buffer) >= 3:
            prev_velocities = list(self.velocity_buffer)
            is_decelerating = prev_velocities[-1] < prev_velocities[-2]
        else:
            is_decelerating = False
        
        if wrist.y > hip.y:  
            confidence_scores['SERVE'] += 0.4
            
            if metrics['knee_angle'] < 150:
                confidence_scores['SERVE'] += 0.25
            
            if self.prev_wrist_pos is not None:
                wrist_y_velocity = wrist.y - self.prev_wrist_pos[1]
                if wrist_y_velocity < -0.005:  
                    confidence_scores['SERVE'] += 0.2
            
            if metrics.get('body_rotation', 0) < 12:
                confidence_scores['SERVE'] += 0.15
                
        elif wrist.y < shoulder.y:  
            if metrics['contact_height_ratio'] > 1.15:  
                confidence_scores['SMASH'] += 0.25
                confidence_scores['DROP'] += 0.25
                
            if metrics['velocity'] > 0.05:
                confidence_scores['SMASH'] += 0.4
                if metrics['elbow_angle'] > 160:
                    confidence_scores['SMASH'] += 0.35
                    
            elif 0.01 < metrics['velocity'] < 0.035:
                confidence_scores['DROP'] += 0.35
                
                if is_decelerating:
                    confidence_scores['DROP'] += 0.2
                
                if abs(metrics.get('forearm_rot_velocity', 0)) < 250:
                    confidence_scores['DROP'] += 0.2
                    
        elif shoulder.y < wrist.y < hip.y:  
            wrist_crosses_midline = wrist.x < body_midline_x
            
            if wrist_crosses_midline:
                confidence_scores['BACKHAND'] += 0.35
                
                if metrics.get('forearm_rotation', 0) > 10:
                    confidence_scores['BACKHAND'] += 0.25
                
                if metrics.get('swing_plane_angle', 90) < 35:
                    confidence_scores['BACKHAND'] += 0.2
                
                if 5 < metrics.get('body_rotation', 0) < 25:
                    confidence_scores['BACKHAND'] += 0.2
                    
            else:
                if abs(wrist.x - shoulder.x) > 0.15:
                    confidence_scores['FOREHAND_DRIVE'] += 0.4
                    
                if metrics['body_rotation'] > 10:
                    confidence_scores['FOREHAND_DRIVE'] += 0.3
                    
                if metrics['swing_plane_angle'] < 30:
                    confidence_scores['FOREHAND_DRIVE'] += 0.3
                
        if max(confidence_scores.values()) < 0.3:
            confidence_scores['PREPARATION'] = 1.0
        
       
        current_best = max(confidence_scores, key=confidence_scores.get)
        current_confidence = confidence_scores[current_best]
        
        self.shot_window.append(current_best)
        
        if len(self.shot_window) == 7:
            shot_counts = Counter(self.shot_window)
            most_common = shot_counts.most_common(1)[0]
            
            if most_common[1] >= 4:
                best_pose = most_common[0]
                confidence = 0.85 + (most_common[1] - 4) * 0.05 
                
                if best_pose not in ['IDLE', 'PREPARATION'] and self.active_shot != best_pose:
                    self.active_shot = best_pose
                    self.shot_lock_frames = 15
                    self.idle_frame_count = 0
            else:
                best_pose = 'PREPARATION'
                confidence = 0.5
        else:
            best_pose = current_best
            confidence = current_confidence
            
        self.pose_history.append({
            'pose': best_pose,
            'confidence': confidence,
            'metrics': metrics
        })
        
        return best_pose, confidence, metrics

    def get_contact_point(self, landmarks):
        """Returns the highest point (min Y) reached during the current action."""
        return landmarks[16].y