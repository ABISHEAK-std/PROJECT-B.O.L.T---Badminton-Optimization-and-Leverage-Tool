# How to Run the Real-Time Badminton Analysis System

## Prerequisites
✅ Frontend already running on port 5173 (npm run dev)
✅ All dependencies installed

## Step-by-Step Instructions

### Option 1: Simple Run (Recommended)

**Just run this command:**
```bash
python main_with_websocket.py
```

**Then open your browser:**
```
http://localhost:5173
```

That's it! You should see the live dashboard.

---

### Option 2: Step-by-Step (If you want to understand)

**Terminal 1 - Frontend (Already Running):**
```bash
cd badminton_ui
npm run dev
```
Leave this running. You already have this!

**Terminal 2 - Backend:**
```bash
python main_with_websocket.py
```

**Browser:**
Open `http://localhost:5173`

---

## What You'll See

### Terminal Output:
```
🚀 Starting WebSocket server...
================================================================================
🎾 BOLT SYSTEM WITH LIVE FRONTEND
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
