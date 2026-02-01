import { useState, useEffect, useMemo } from 'react';
import { 
  subscribeLiveMetrics, 
  subscribeCoachingInsights, 
  subscribeSessionStatus,
  subscribeSessions,
  subscribeSession
} from '../services/liveDataService';
import type { 
  LiveMetrics, 
  CoachingInsight,
  SessionStatus,
  ArchivedSession
} from '../services/liveDataService';

export function useLiveMetrics() {
  const [metrics, setMetrics] = useState<LiveMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeLiveMetrics((data) => {
      setMetrics(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { metrics, loading };
}

export function useCoachingInsights() {
  const [insights, setInsights] = useState<CoachingInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeCoachingInsights((data) => {
      setInsights(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { insights, loading };
}

export function useSessionStatus() {
  const [status, setStatus] = useState<SessionStatus>({ 
    isActive: false, 
    sessionId: null, 
    startTime: null,
    currentFrame: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeSessionStatus((data) => {
      setStatus(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { status, loading };
}

export function useSessions() {
  const [sessions, setSessions] = useState<ArchivedSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeSessions((data) => {
      setSessions(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { sessions, loading };
}

export function useSession(sessionId: string | null) {
  const [session, setSession] = useState<ArchivedSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setSession(null);
      setLoading(false);
      return;
    }
    
    const unsubscribe = subscribeSession(sessionId, (data) => {
      setSession(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [sessionId]);

  return { session, loading };
}

export interface SessionStats {
  totalSessions: number;
  avgScore: number;
  totalInsights: number;
  totalDurationMinutes: number;
  recentScores: number[];
  shotDistribution: Record<string, number>;
  avgElbowAngle: number;
  avgShoulderAngle: number;
  avgKneeAngle: number;
}

export function useSessionStats() {
  const { sessions, loading } = useSessions();
  
  const stats = useMemo<SessionStats>(() => {
    if (!sessions || sessions.length === 0) {
      return {
        totalSessions: 0,
        avgScore: 0,
        totalInsights: 0,
        totalDurationMinutes: 0,
        recentScores: [],
        shotDistribution: {},
        avgElbowAngle: 0,
        avgShoulderAngle: 0,
        avgKneeAngle: 0
      };
    }

    const totalSessions = sessions.length;
    
    // Calculate average score
    const scores = sessions.filter(s => s.score).map(s => s.score);
    const avgScore = scores.length > 0 
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 
      : 0;
    
    // Total insights
    let totalInsights = 0;
    const shotDistribution: Record<string, number> = {};
    
    sessions.forEach(session => {
      if (session.insights) {
        const insightCount = Object.keys(session.insights).length;
        totalInsights += insightCount;
        
        // Count shot types
        Object.values(session.insights).forEach(insight => {
          if (insight.shot) {
            shotDistribution[insight.shot] = (shotDistribution[insight.shot] || 0) + 1;
          }
        });
      }
    });
    
    // Total duration in minutes
    const totalDurationMs = sessions.reduce((total, s) => total + (s.duration || 0), 0);
    const totalDurationMinutes = Math.round(totalDurationMs / 60000 * 10) / 10;
    
    // Recent scores for trend (last 12 sessions)
    const recentScores = sessions
      .slice(0, 12)
      .reverse()
      .map(s => s.score || 0);
    
    // Average angles from final metrics
    const metricsWithAngles = sessions.filter(s => s.finalMetrics);
    const avgElbowAngle = metricsWithAngles.length > 0 
      ? Math.round(metricsWithAngles.reduce((sum, s) => sum + (s.finalMetrics?.elbow_angle || 0), 0) / metricsWithAngles.length)
      : 0;
    const avgShoulderAngle = metricsWithAngles.length > 0 
      ? Math.round(metricsWithAngles.reduce((sum, s) => sum + (s.finalMetrics?.shoulder_angle || 0), 0) / metricsWithAngles.length)
      : 0;
    const avgKneeAngle = metricsWithAngles.length > 0 
      ? Math.round(metricsWithAngles.reduce((sum, s) => sum + (s.finalMetrics?.knee_angle || 0), 0) / metricsWithAngles.length)
      : 0;
    
    return {
      totalSessions,
      avgScore,
      totalInsights,
      totalDurationMinutes,
      recentScores,
      shotDistribution,
      avgElbowAngle,
      avgShoulderAngle,
      avgKneeAngle
    };
  }, [sessions]);
  
  return { stats, sessions, loading };
}
