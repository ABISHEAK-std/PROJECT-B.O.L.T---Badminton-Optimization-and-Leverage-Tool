print("Testing Numpy import...")
try:
    import numpy as np
    print(f"Numpy imported successfully: {np.__version__}")
except Exception as e:
    print(f"Numpy import failed: {e}")
