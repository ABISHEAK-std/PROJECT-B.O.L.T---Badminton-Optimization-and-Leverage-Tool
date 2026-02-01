import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, push, get, serverTimestamp } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged
} from "firebase/auth";
import type { User } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAmELKktwe7gzWd8Z8kx7KhJI7rJG9oUPQ",
  authDomain: "badmintonposecorrection.firebaseapp.com",
  databaseURL: "https://badmintonposecorrection-default-rtdb.firebaseio.com",
  projectId: "badmintonposecorrection",
  storageBucket: "badmintonposecorrection.firebasestorage.app",
  messagingSenderId: "589659121528",
  appId: "1:589659121528:web:4591e12abed839fbeaca8d",
  measurementId: "G-H6CNXFCXP7"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const storage = getStorage(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const liveMetricsRef = ref(database, 'live/metrics');
export const liveInsightsRef = ref(database, 'live/insights');
export const sessionStatusRef = ref(database, 'live/sessionStatus');
export const sessionsRef = ref(database, 'sessions');

// Auth functions
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const signOut = () => firebaseSignOut(auth);
export const onAuthChange = (callback: (user: User | null) => void) => 
  onAuthStateChanged(auth, callback);

// User profile functions
export const getUserProfile = async (uid: string) => {
  const userRef = ref(database, `users/${uid}`);
  const snapshot = await get(userRef);
  return snapshot.val();
};

export const setUserProfile = async (uid: string, data: Record<string, unknown>) => {
  const userRef = ref(database, `users/${uid}`);
  await set(userRef, data);
};

export { 
  database, 
  storage,
  auth,
  ref, 
  onValue, 
  set, 
  push, 
  get,
  serverTimestamp,
  storageRef,
  uploadBytes,
  getDownloadURL
};

export type { User };
export default app;
