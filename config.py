# ==========================================
# BOLT CONFIGURATION: Biomechanical Standards
# ==========================================

class BoltConfig:
    # --- 1. ATHLETE PROFILE ---
    # These values normalize the coordinate system to the user's physique
    ATHLETE = {
        "HEIGHT_CM": 178,          # Reference height for reach calculations
        "ARM_SPAN_RATIO": 1.04,    # Average arm span vs height
        "DOMINANT_HAND": "RIGHT"   # Used to select which side to analyze
    }

    # --- 2. BIOMECHANICAL RULEBASE ---
    # Precise angle ranges and thresholds based on BWF coaching standards
    BIOMECHANICS = {
        "SMASH": {
            "ELBOW_RANGE": (160, 180),           # Degrees at contact
            "SHOULDER_RANGE": (85, 115),         # Shoulder abduction angle
            "KNEE_BEND_RANGE": (20, 45),         # Knee flexion for power
            "REACH_MULT": 1.3,                   # Must reach >1.3x height
            "MIN_VELOCITY": 0.05,                # High wrist speed
            "CONFIDENCE_THRESHOLD": 0.70,        # Minimum certainty
            "BODY_ROTATION_MIN": 10              # Degrees shoulder-hip separation
        },
        "DROP": {
            "ELBOW_RANGE": (145, 175),
            "SHOULDER_RANGE": (90, 125),
            "KNEE_BEND_RANGE": (15, 40),
            "REACH_MULT": 1.15,
            "VELOCITY_RANGE": (0.01, 0.035),     # Narrow controlled speed
            "MAX_WRIST_SNAP": 250,               # Low wrist snap (°/s)
            "DECELERATION_REQUIRED": True,       # Must slow down
            "CONFIDENCE_THRESHOLD": 0.70,
            "BODY_ROTATION_MIN": 8
        },
        "SERVE": {
            "ELBOW_RANGE": (135, 175),
            "KNEE_ANGLE_MAX": 150,               # Must have knee bend
            "KNEE_BEND_RANGE": (25, 65),
            "MAX_CONTACT_HEIGHT": 0.50,          # Below mid-body
            "MIN_UPWARD_VELOCITY": -0.01,        # Y decreasing = moving up
            "BODY_STABILITY_MAX": 12,            # Low rotation required
            "MIN_STABILITY_FRAMES": 8,
            "CONFIDENCE_THRESHOLD": 0.75,
            "UPWARD_TRAJECTORY": True
        },
        "FOREHAND_DRIVE": {
            "ELBOW_RANGE": (135, 165),
            "SHOULDER_RANGE": (70, 100),
            "CONTACT_HEIGHT_RANGE": (0.4, 0.7),
            "BODY_ROTATION_MIN": 15,
            "HORIZONTAL_PLANE_MAX": 20,
            "CONFIDENCE_THRESHOLD": 0.68
        },
        "BACKHAND": {
            "ELBOW_RANGE": (130, 170),
            "SHOULDER_RANGE": (60, 105),
            "CONTACT_HEIGHT_RANGE": (0.35, 0.75),  # Mid-body height
            "CROSS_BODY_REQUIRED": True,           # Wrist crosses midline
            "FOREARM_ROTATION_RANGE": (10, 90),    # Supinated (positive)
            "BODY_ROTATION_RANGE": (5, 25),        # Moderate rotation
            "SWING_PLANE_MAX": 35,                 # Relatively horizontal
            "THUMB_LEADING": True,                 # Supination at contact
            "CONFIDENCE_THRESHOLD": 0.68
        }
    }
    
    # Legacy compatibility (kept for backward compatibility)
    RULES = {
        "SMASH": {
            "MIN_ELBOW_ANGLE": 168.0,
            "IMPACT_HEIGHT_MULT": 1.3,
            "STEEPNESS_THRESHOLD": 45.0,
            "COOLDOWN_MS": 800
        },
        "SERVE": {
            "MAX_LEGAL_HEIGHT_CM": 115.0,
            "MIN_STABILITY_FRAMES": 10,
            "WAIST_LEVEL_RATIO": 0.65
        },
        "DROP": {
            "MIN_ELBOW_ANGLE": 155.0,
            "VELOCITY_LIMIT": 0.05
        }
    }

    # --- 3. VISION & FILTER SETTINGS ---
    # Controls the stability of the skeleton and UI feedback
    VISION = {
        "MIN_DETECTION_CONFIDENCE": 0.7,
        "MIN_TRACKING_CONFIDENCE": 0.7,
        "FILTER": {
            "MIN_CUTOFF": 1.0,  # Lower = smoother standing still
            "BETA": 0.007       # Higher = less lag during fast smashes
        }
    }

    # --- 4. DISPLAY & HUD ---
    # Aesthetics for the real-time feedback window
    UI = {
        "THEME_COLOR": (0, 255, 0),    # BOLT Green (B, G, R)
        "ALERT_COLOR": (0, 0, 255),    # Fault Red
        "LINE_THICKNESS": 3,
        "SHOW_FPS": True,
        "SHOW_ANGLES": True            # Toggle real-time angle overlays
    }

    # --- 5. DATA LOGGING ---
    PATHS = {
        "LOG_FILE": "E:/rulebased_correction/data/session_log.csv",
        "CHART_OUTPUT": "E:/rulebased_correction/data/improvement_trend.png"
    }