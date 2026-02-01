import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Ruler, 
  Award, 
  Calendar, 
  Clock, 
  Activity, 
  LogOut, 
  Edit2, 
  Check, 
  X, 
  Loader2,
  Trophy,
  Target
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ref, onValue, database } from '../config/firebase';

interface SessionStats {
  totalSessions: number;
  totalDuration: number; // in milliseconds
  avgScore: number;
}

const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Pro'] as const;

export default function Profile() {
  const { user, userProfile, loading, signOut, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editHeight, setEditHeight] = useState('');
  const [editSkillLevel, setEditSkillLevel] = useState<typeof SKILL_LEVELS[number]>('Beginner');
  const [isSaving, setIsSaving] = useState(false);
  const [sessionStats, setSessionStats] = useState<SessionStats>({ 
    totalSessions: 0, 
    totalDuration: 0, 
    avgScore: 0 
  });

  useEffect(() => {
    if (userProfile) {
      setEditHeight(userProfile.height.toString());
      setEditSkillLevel(userProfile.skillLevel);
    }
  }, [userProfile]);

  // Fetch session stats from Firebase
  useEffect(() => {
    if (!user) return;

    const sessionsRef = ref(database, 'sessions');
    const unsubscribe = onValue(sessionsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const sessions = Object.values(data) as Array<{ duration?: number; score?: number }>;
        const totalSessions = sessions.length;
        const totalDuration = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);
        const totalScore = sessions.reduce((acc, s) => acc + (s.score || 0), 0);
        const avgScore = totalSessions > 0 ? Math.round(totalScore / totalSessions) : 0;
        
        setSessionStats({ totalSessions, totalDuration, avgScore });
      }
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!user || !userProfile) {
    return <Navigate to="/login" replace />;
  }

  const handleSave = async () => {
    const heightNum = parseInt(editHeight);
    if (isNaN(heightNum) || heightNum < 100 || heightNum > 250) {
      return;
    }

    setIsSaving(true);
    try {
      await updateUserProfile({
        height: heightNum,
        skillLevel: editSkillLevel,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditHeight(userProfile.height.toString());
    setEditSkillLevel(userProfile.skillLevel);
    setIsEditing(false);
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Profile</h1>
          <p className="text-gray-400 text-sm">Manage your account settings</p>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/20"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Profile Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
      >
        {/* Cover/Header Section */}
        <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgZmlsbD0iIzAwMDAwMCIgb3BhY2l0eT0iMC4wNSIgY3g9IjIwIiBjeT0iMjAiIHI9IjIiLz48L2c+PC9zdmc+')] opacity-50" />
        </div>

        {/* Profile Info */}
        <div className="px-6 pb-6 -mt-16 relative">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            {/* Avatar */}
            <div className="relative">
              {userProfile.photoURL ? (
                <img 
                  src={userProfile.photoURL} 
                  alt="Profile" 
                  className="w-28 h-28 rounded-2xl border-4 border-background object-cover shadow-xl"
                />
              ) : (
                <div className="w-28 h-28 rounded-2xl border-4 border-background bg-primary/20 flex items-center justify-center shadow-xl">
                  <User className="w-12 h-12 text-primary" />
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg">
                <Activity className="w-4 h-4 text-background" />
              </div>
            </div>

            {/* Name and Email */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">{userProfile.displayName}</h2>
              <div className="flex items-center gap-2 text-gray-400 mt-1">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{userProfile.email}</span>
              </div>
            </div>

            {/* Edit Button */}
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 transition-all border border-white/10"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { 
            icon: Ruler, 
            label: 'Height', 
            value: `${userProfile.height} cm`,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20'
          },
          { 
            icon: Award, 
            label: 'Skill Level', 
            value: userProfile.skillLevel,
            color: 'text-primary',
            bg: 'bg-primary/10',
            border: 'border-primary/20'
          },
          { 
            icon: Trophy, 
            label: 'Sessions', 
            value: sessionStats.totalSessions.toString(),
            color: 'text-orange-400',
            bg: 'bg-orange-500/10',
            border: 'border-orange-500/20'
          },
          { 
            icon: Target, 
            label: 'Avg Score', 
            value: `${sessionStats.avgScore}%`,
            color: 'text-green-400',
            bg: 'bg-green-500/10',
            border: 'border-green-500/20'
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${stat.bg} border ${stat.border} rounded-xl p-4`}
          >
            <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-gray-400 text-xs mb-1">{stat.label}</p>
            <p className="text-white font-semibold text-lg">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Edit Form */}
      {isEditing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Edit Profile</h3>
          
          <div className="space-y-4">
            {/* Height */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Height (cm)</label>
              <input
                type="number"
                value={editHeight}
                onChange={(e) => setEditHeight(e.target.value)}
                min="100"
                max="250"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
              />
            </div>

            {/* Skill Level */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Skill Level</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {SKILL_LEVELS.map((level) => (
                  <button
                    key={level}
                    onClick={() => setEditSkillLevel(level)}
                    className={`py-2 px-4 rounded-xl border transition-all ${
                      editSkillLevel === level
                        ? 'bg-primary/10 border-primary/50 text-white'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleCancel}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition-all"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-background font-semibold py-3 px-4 rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Account Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-white/5">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="text-gray-400">Member Since</span>
            </div>
            <span className="text-white">{formatDate(userProfile.createdAt)}</span>
          </div>
          
          <div className="flex items-center justify-between py-3 border-b border-white/5">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <span className="text-gray-400">Total Training Time</span>
            </div>
            <span className="text-white">{formatDuration(sessionStats.totalDuration)}</span>
          </div>
          
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-gray-400" />
              <span className="text-gray-400">Account Status</span>
            </div>
            <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-sm border border-green-500/20">
              Active
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
