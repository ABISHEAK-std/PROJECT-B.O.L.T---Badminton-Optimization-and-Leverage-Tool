import { onValue, ref, database } from '../config/firebase';

export interface LiveMetrics {
  elbow_angle: number;
  shoulder_angle: number;
  knee_angle: number;
  body_rotation: number;
  velocity: number;
  forearm_rotation: number;
  wrist_height_cm: number;
  hip_rotation: number;
  shoulder_rotation: number;
  confidence: number;
  shot_label: string;
  phase: string;
  score: number;
  timestamp: number;
}

export interface CoachingInsight {
  id: string;
  time: string;
  videoTime: string;
  shot: string;
  error: string;
  advice: string;
  timestamp: number;
}

export interface SessionStatus {
  isActive: boolean;
  sessionId: string | null;
  startTime: number | null;
  currentFrame: number;
}

export interface ArchivedSession {
  id: string;
  sessionId: string;
  date: string;
  time: string;
  startTime: number;
  endTime: number;
  duration: number;
  durationFormatted: string;
  score: number;
  insights: Record<string, CoachingInsight>;
  finalMetrics: LiveMetrics | null;
  videoUrl: string | null;
  transcriptUrl: string | null;
  transcriptContent: string | null;
  localPath: string | null;
}

export function subscribeLiveMetrics(callback: (metrics: LiveMetrics | null) => void): () => void {
  const metricsRef = ref(database, 'live/metrics');
  const unsubscribe = onValue(metricsRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
  return unsubscribe;
}

export function subscribeCoachingInsights(callback: (insights: CoachingInsight[]) => void): () => void {
  const insightsRef = ref(database, 'live/insights');
  const unsubscribe = onValue(insightsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const insightsArray = Object.entries(data).map(([key, value]) => ({
        id: key,
        ...(value as Omit<CoachingInsight, 'id'>)
      })).sort((a, b) => b.timestamp - a.timestamp);
      callback(insightsArray);
    } else {
      callback([]);
    }
  });
  return unsubscribe;
}

export function subscribeSessionStatus(callback: (status: SessionStatus) => void): () => void {
  const statusRef = ref(database, 'live/sessionStatus');
  const unsubscribe = onValue(statusRef, (snapshot) => {
    const data = snapshot.val();
    callback(data || { isActive: false, sessionId: null, startTime: null, currentFrame: 0 });
  });
  return unsubscribe;
}

export function subscribeSessions(callback: (sessions: ArchivedSession[]) => void): () => void {
  const sessionsRef = ref(database, 'sessions');
  const unsubscribe = onValue(sessionsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const sessionsArray = Object.entries(data).map(([key, value]) => ({
        id: key,
        ...(value as Omit<ArchivedSession, 'id'>)
      })).sort((a, b) => (b.endTime || 0) - (a.endTime || 0));
      callback(sessionsArray);
    } else {
      callback([]);
    }
  });
  return unsubscribe;
}

export function subscribeSession(sessionId: string, callback: (session: ArchivedSession | null) => void): () => void {
  const sessionRef = ref(database, `sessions/${sessionId}`);
  const unsubscribe = onValue(sessionRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      callback({ id: sessionId, ...data } as ArchivedSession);
    } else {
      callback(null);
    }
  });
  return unsubscribe;
}
