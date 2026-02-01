import numpy as np

class BoltGeometry:
    @staticmethod
    def calculate_angle(a, b, c):
        """Calculates the angle at joint 'b' given points a, b, and c."""
        a = np.array(a) 
        b = np.array(b) 
        c = np.array(c) 

        # Vector math to find the interior angle
        radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - \
                  np.arctan2(a[1] - b[1], a[0] - b[0])
        angle = np.abs(radians * 180.0 / np.pi)

        if angle > 180.0:
            angle = 360 - angle
            
        return round(float(angle), 2)

    @staticmethod
    def get_displacement(p1, p2):
        """Calculates Euclidean distance between two points."""
        # Check if p1/p2 are objects with .x/.y or simple lists
        try:
            return np.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2)
        except AttributeError:
            return np.sqrt((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2)

    @staticmethod
    def get_smash_steepness(wrist_start, wrist_impact):
        dx = wrist_impact.x - wrist_start.x
        dy = wrist_impact.y - wrist_start.y
        angle = np.degrees(np.arctan2(dy, dx))
        return round(float(angle), 2)

    @staticmethod
    def is_static(buffer, threshold=0.01):
        if len(buffer) < 5: return False
        return np.std(buffer) < threshold