# How to Run the Real-Time Badminton Analysis System

## Prerequisites
✅ Frontend already running (npm run dev)
✅ All dependencies installed
✅ Google account for authentication

## Quick Start

### 1. Start the Frontend
```bash
cd badminton_ui
npm run dev
```

### 2. Sign In (First Time)
1. Open browser: `http://localhost:5173`
2. Click "Continue with Google"
3. Enter your height when prompted
4. Select your skill level

### 3. Start the Backend
```bash
# Use height from your profile
python main.py --height YOUR_HEIGHT_CM

# Example for 175cm tall user:
python main.py --height 175
```

---

## Command Line Options

```bash
# Basic usage with custom height
python main.py --height 175

# Using a video file instead of webcam
python main.py --height 175 --video "path/to/video.mp4"

# Default (uses config height, webcam)
python main.py
```

---

## What You'll See

### Terminal Output:
```
🚀 Starting Video Streamer on port 5001...
--- BOLT SYSTEM ACTIVE ---
Mode: Webcam
User Height: 175cm
================================================================================
📱 Frontend: http://localhost:5173
🔌 WebSocket: ws://localhost:8000
================================================================================

Starting live camera feed from laptop webcam...
✅ Webcam initialized (attempt 1)
📁 Session folder created: processed_data\session_20260201_055000
📝 Live transcript: processed_data\session_20260201_055000\transcript.txt
📹 Recording started: 05:50:00
📝 Coach writing to: processed_data\session_20260201_055000\transcript.txt
📹 Session recording started (Resolution: 640x480)

🎬 Starting main loop...
```

### Browser (http://localhost:5173):
- **Left side:** Live video feed with skeleton overlay
- **Right side:** AI coaching insights appearing in real-time
- **Bottom:** Live metrics (angles, scores)
- **Bottom right:** BOLT score circular gauge

---

## Controls

**To stop the session:**
- Press `Ctrl+C` in Terminal 2 (backend)
- OR press `q` while the OpenCV window is focused

**To restart:**
- Just run `python main_with_websocket.py` again

---

## Troubleshooting

### "Webcam may be in use"
Close other apps using webcam (Zoom, Teams, etc.)

### "Frontend not connecting"
Make sure Terminal 1 (npm run dev) is still running

### "No video in browser"
1. Check webcam permissions
2. Refresh browser page
3. Check browser console (F12) for errors

---

## Firebase (Optional)

**Without Firebase:**
- Everything works except cloud uploads
- You'll see: "⚠️ Firebase not initialized"
- This is normal and OK!

**With Firebase:**
1. Download service account key from Firebase Console
2. Save as `serviceAccountKey.json` in project root
3. Restart backend

---

## Quick Test

1. Run: `python main_with_websocket.py`
2. Open: `http://localhost:5173`
3. Wave at webcam
4. See live video + metrics update
5. Press Ctrl+C to stop

**That's it!**
