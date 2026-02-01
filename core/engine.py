import numpy as np

class BoltMasterEngine:
    def __init__(self, user_height_cm):
        self.user_height = user_height_cm

    def _compute_score(self, current_data):
        elbow_angle = current_data.get("elbow_angle", 0)
        reach_cm = current_data.get("reach_cm", 0)

        elbow_score = max(0, min(100, ((elbow_angle - 120) / 60) * 100))

        reach_target = max(1, self.user_height)
        reach_score = max(0, min(100, (reach_cm / reach_target) * 100))

        return int(0.6 * elbow_score + 0.4 * reach_score)

    def evaluate_smash(self, current_data):
        """
        Comprehensive SMASH posture analysis.
        Detects newbie errors and pro posture indicators.
        """
        alerts = []
        good_indicators = []
        
        elbow = current_data.get("elbow_angle", 0)
        shoulder = current_data.get("shoulder_angle", 0)
        knee = current_data.get("knee_angle", 0)
        kinetic_sep = current_data.get("kinetic_separation", 0)
        contact_ratio = current_data.get("contact_height_ratio", 0)
        
        
        if shoulder < 120:
            alerts.append("[X] LOW ELBOW: Raise racket arm to shoulder level")
        if kinetic_sep < 8:
            alerts.append("[X] KINETIC CHAIN COLLAPSED: Keep non-racket arm up")
        if knee > 165:
            alerts.append("[X] FLAT-FOOTED: Use scissor kick or weight transfer")
        if elbow < 160:
            alerts.append("[X] BENT ARM: Extend fully at contact")
        
        
        if elbow >= 175 and contact_ratio > 1.3:
            good_indicators.append("[OK] EXCELLENT EXTENSION: Pro-level reach")
        if kinetic_sep > 20:
            good_indicators.append("[OK] PERFECT KINETIC CHAIN: Great power generation")
        if 120 < knee < 165:
            good_indicators.append("[OK] ACTIVE LEGS: Good weight transfer")
        
        if alerts:
            status = alerts[0]
        elif good_indicators:
            status = good_indicators[0]
        else:
            status = "GOOD SMASH FORM"
        
        return {"alerts": alerts, "good": good_indicators, "status": status, "score": self._compute_score(current_data)}

    def evaluate_drop(self, current_data):
        """
        Comprehensive DROP SHOT posture analysis.
        """
        alerts = []
        good_indicators = []
        
        velocity = current_data.get("velocity", 0)
        forearm_rot_vel = current_data.get("forearm_rot_velocity", 0)
        body_rotation = current_data.get("body_rotation", 0)
        shoulder_angle = current_data.get("shoulder_angle", 0)
        wrist_x = current_data.get("wrist_x", 0)
        shoulder_x = current_data.get("shoulder_x", 0)
        elbow = current_data.get("elbow_angle", 0)
        
        # === NEWBIE ERRORS ===
        if velocity < 0.02:
            alerts.append("[X] TELEGRAPHING: Match smash swing speed")
        if abs(forearm_rot_vel) < 100:
            alerts.append("[X] STIFF WRIST: Add wrist snap for sharp angle")
        if wrist_x < shoulder_x:
            alerts.append("[X] LEANING BACK: Move forward toward net")
        if elbow > 175:
            alerts.append("[X] TOO STIFF: Soften elbow for control")
        
        # === PRO POSTURE ===
        if shoulder_angle > 50 and body_rotation > 15:
            good_indicators.append("[OK] PERFECT DISGUISE: Looks like smash")
        if wrist_x > shoulder_x + 0.05:
            good_indicators.append("[OK] GOOD FORWARD MOMENTUM")
        if 150 < abs(forearm_rot_vel) < 300:
            good_indicators.append("[OK] EXCELLENT WRIST CONTROL")
        
        if alerts:
            status = alerts[0]
        elif good_indicators:
            status = good_indicators[0]
        else:
            status = "GOOD DROP SHOT"
        
        return {"alerts": alerts, "good": good_indicators, "status": status, "score": self._compute_score(current_data)}

    def evaluate_serve(self, current_data):
        """
        Comprehensive SERVE posture analysis.
        """
        alerts = []
        good_indicators = []
        
        shoulder = current_data.get("shoulder_angle", 0)
        knee = current_data.get("knee_angle", 0)
        wrist_height = current_data.get("wrist_height_cm", 0)
        body_rotation = current_data.get("body_rotation", 0)
        forearm_rot_vel = current_data.get("forearm_rot_velocity", 0)
        elbow = current_data.get("elbow_angle", 0)
        
        # === NEWBIE ERRORS ===
        if shoulder < 30:
            alerts.append("[X] ELBOW TOO HIGH: Lower for better control")
        if knee > 160:
            alerts.append("[X] UNSTABLE STANCE: Bend knees, widen feet")
        if wrist_height > 120:
            alerts.append("[X] SERVICE FAULT RISK: Contact below waist")
        if body_rotation > 12:
            alerts.append("[X] EXCESSIVE MOVEMENT: Keep body stable")
        if elbow < 140:
            alerts.append("[X] COLLAPSED ELBOW: Keep elbow extended")
        
        # === PRO POSTURE ===
        if abs(forearm_rot_vel) > 200 and body_rotation < 10:
            good_indicators.append("[OK] PERFECT WRIST ACTION: Clean short serve")
        if knee < 150:
            good_indicators.append("[OK] GOOD STANCE: Low and stable")
        if 60 < wrist_height < 100:
            good_indicators.append("[OK] PERFECT CONTACT HEIGHT")
        
        if alerts:
            status = alerts[0]
        elif good_indicators:
            status = good_indicators[0]
        else:
            status = "GOOD SERVE"
        
        return {"alerts": alerts, "good": good_indicators, "status": status, "score": self._compute_score(current_data)}


    def evaluate_forehand(self, current_data):
        """
        Comprehensive FOREHAND posture analysis.
        """
        alerts = []
        good_indicators = []
        
        wrist_x = current_data.get("wrist_x", 0)
        shoulder_x = current_data.get("shoulder_x", 0)
        body_rotation = current_data.get("body_rotation", 0)
        hip_rot_vel = current_data.get("hip_rot_velocity", 0)
        shoulder_angle = current_data.get("shoulder_angle", 0)
        elbow = current_data.get("elbow_angle", 0)
        
        # === NEWBIE ERRORS ===
        if wrist_x < shoulder_x - 0.1:
            alerts.append("[X] CONTACT TOO LATE: Hit in front of body")
        if body_rotation < 5 and abs(hip_rot_vel) < 20:
            alerts.append("[X] USE YOUR CORE: Rotate hips and torso")
        if elbow < 150:
            alerts.append("[X] EXTEND ARM: Reach through contact")
        
        # === PRO POSTURE ===
        if shoulder_angle > 50 and body_rotation > 10:
            good_indicators.append("[OK] PERFECT PREPARATION: Early racket up")
        if abs(hip_rot_vel) > 50:
            good_indicators.append("[OK] EXCELLENT WEIGHT TRANSFER")
        if wrist_x > shoulder_x + 0.05:
            good_indicators.append("[OK] GREAT CONTACT POINT: In front of body")
        
        if alerts:
            status = alerts[0]
        elif good_indicators:
            status = good_indicators[0]
        else:
            status = "GOOD FOREHAND"
        
        return {"alerts": alerts, "good": good_indicators, "status": status, "score": self._compute_score(current_data)}
    
    def evaluate_backhand(self, current_data):
        """
        Comprehensive BACKHAND posture analysis.
        """
        alerts = []
        good_indicators = []
        
        elbow = current_data.get("elbow_angle", 0)
        body_rotation = current_data.get("body_rotation", 0)
        forearm_rotation = current_data.get("forearm_rotation", 0)
        wrist_x = current_data.get("wrist_x", 0)
        shoulder_x = current_data.get("shoulder_x", 0)
        knee = current_data.get("knee_angle", 0)
        
        # === NEWBIE ERRORS ===
        # 1. Facing the Net
        if abs(body_rotation) < 30:
            alerts.append("[X] TURN YOUR BACK: Rotate shoulders away from net")
        # 2. Elbow Tucked
        if elbow < 90 and abs(wrist_x - shoulder_x) < 0.1:
            alerts.append("[X] ELBOW TUCKED: Lead with high elbow")
        # 3. Wrong Grip
        if forearm_rotation < 5:
            alerts.append("[X] THUMB UP: Press thumb on flat racket side")
        # 4. No Cross-Body Reach
        if abs(wrist_x - shoulder_x) < 0.1:
            alerts.append("[X] REACH ACROSS: Extend cross-body")
        
        # === PRO POSTURE ===
        # 1. Perfect V-Shape
        if 90 <= elbow <=  120 and forearm_rotation > 15:
            good_indicators.append("[OK] PERFECT V-SHAPE: Pro backhand form")
        # 2. Lead Foot Lunge
        if knee < 120:
            good_indicators.append("[OK] EXCELLENT LUNGE: Good leg drive")
        # 3. Strong Thumb Position
        if forearm_rotation > 20:
            good_indicators.append("[OK] PERFECT THUMB POSITION")
        # 4. Cross-Body Extension
        if abs(wrist_x - shoulder_x) > 0.15:
            good_indicators.append("[OK] GREAT CROSS-BODY REACH")
        
        # Priority
        if alerts:
            status = alerts[0]
        elif good_indicators:
            status = good_indicators[0]
        else:
            status = "GOOD BACKHAND"
        
        return {"alerts": alerts, "good": good_indicators, "status": status, "score": self._compute_score(current_data)}
