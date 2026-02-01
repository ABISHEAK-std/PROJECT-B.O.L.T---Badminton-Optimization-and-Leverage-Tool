import numpy as np
import time

class OneEuroFilter:
    def __init__(self, min_cutoff=1.0, beta=0.007, d_cutoff=1.0):
        self.min_cutoff = min_cutoff
        self.beta = beta
        self.d_cutoff = d_cutoff
        self.x_prev = None
        self.dx_prev = 0
        self.t_prev = None

    def _alpha(self, cutoff, dt):
        tau = 1.0 / (2 * np.pi * cutoff)
        return 1.0 / (1.0 + tau / dt)

    def apply(self, x, t=None):
        """Applies the filter to a single coordinate (x, y, or z)."""
        t = t if t is not None else time.time()
        
        if self.x_prev is None:
            self.x_prev = x
            self.t_prev = t
            return x

        dt = t - self.t_prev
        if dt <= 0: return x

        # 1. Filter the derivative (velocity)
        dx = (x - self.x_prev) / dt
        a_d = self._alpha(self.d_cutoff, dt)
        dx_hat = a_d * dx + (1 - a_d) * self.dx_prev

        # 2. Update cutoff based on velocity
        cutoff = self.min_cutoff + self.beta * abs(dx_hat)
        
        # 3. Filter the actual signal
        a = self._alpha(cutoff, dt)
        x_hat = a * x + (1 - a) * self.x_prev

        # Update memory
        self.x_prev = x_hat
        self.dx_prev = dx_hat
        self.t_prev = t

        return x_hat

class BoltSkeletonSmoother:
    def __init__(self):
        # We need a separate filter for X and Y of every landmark
        # For a demo, we usually only filter key joints (Shoulder, Elbow, Wrist)
        self.filters = {}

    def smooth(self, landmark_id, x, y):
        """Retrieves or creates filters for a specific joint."""
        if landmark_id not in self.filters:
            self.filters[landmark_id] = {
                'x': OneEuroFilter(),
                'y': OneEuroFilter()
            }
        
        sm_x = self.filters[landmark_id]['x'].apply(x)
        sm_y = self.filters[landmark_id]['y'].apply(y)
        return sm_x, sm_y