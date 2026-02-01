



class BoltConfig:
    
    
    ATHLETE = {
        "HEIGHT_CM": 178,          
        "ARM_SPAN_RATIO": 1.04,    
        "DOMINANT_HAND": "RIGHT"   
    }

    
    
    BIOMECHANICS = {
        "SMASH": {
            "ELBOW_RANGE": (160, 180),           
            "SHOULDER_RANGE": (85, 115),         
            "KNEE_BEND_RANGE": (20, 45),         
            "REACH_MULT": 1.3,                   
            "MIN_VELOCITY": 0.05,               
            "CONFIDENCE_THRESHOLD": 0.70,        
            "BODY_ROTATION_MIN": 10              
        },
        "DROP": {
            "ELBOW_RANGE": (145, 175),
            "SHOULDER_RANGE": (90, 125),
            "KNEE_BEND_RANGE": (15, 40),
            "REACH_MULT": 1.15,
            "VELOCITY_RANGE": (0.01, 0.035),     
            "MAX_WRIST_SNAP": 250,               
            "DECELERATION_REQUIRED": True,      
            "CONFIDENCE_THRESHOLD": 0.70,
            "BODY_ROTATION_MIN": 8
        },
        "SERVE": {
            "ELBOW_RANGE": (135, 175),
            "KNEE_ANGLE_MAX": 150,               
            "KNEE_BEND_RANGE": (25, 65),
            "MAX_CONTACT_HEIGHT": 0.50,          
            "MIN_UPWARD_VELOCITY": -0.01,        
            "BODY_STABILITY_MAX": 12,            
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
            "CONTACT_HEIGHT_RANGE": (0.35, 0.75), 
            "CROSS_BODY_REQUIRED": True,           
            "FOREARM_ROTATION_RANGE": (10, 90),    
            "BODY_ROTATION_RANGE": (5, 25),       
            "SWING_PLANE_MAX": 35,                 
            "THUMB_LEADING": True,                
            "CONFIDENCE_THRESHOLD": 0.68
        }
    }
    
    
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

    
    
    VISION = {
        "MIN_DETECTION_CONFIDENCE": 0.7,
        "MIN_TRACKING_CONFIDENCE": 0.7,
        "FILTER": {
            "MIN_CUTOFF": 1.0,  
            "BETA": 0.007       
        }
    }

    
    
    UI = {
        "THEME_COLOR": (0, 255, 0),    
        "ALERT_COLOR": (0, 0, 255),    
        "LINE_THICKNESS": 3,
        "SHOW_FPS": True,
        "SHOW_ANGLES": True            
    }

    
    PATHS = {
        "LOG_FILE": "E:/rulebased_correction/data/session_log.csv",
        "CHART_OUTPUT": "E:/rulebased_correction/data/improvement_trend.png"
    }