import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Activity, Loader2, ChevronRight, User, Ruler } from 'lucide-react';
import { motion } from 'framer-motion';

const SKILL_LEVELS = [
  { value: 'Beginner', label: 'Beginner', description: 'Just starting out' },
  { value: 'Intermediate', label: 'Intermediate', description: '1-2 years experience' },
  { value: 'Advanced', label: 'Advanced', description: '3+ years experience' },
  { value: 'Pro', label: 'Pro', description: 'Competitive player' },
] as const;

export default function Onboarding() {
  const { user, userProfile, isNewUser, updateUserProfile, loading } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [height, setHeight] = useState('170');
  const [skillLevel, setSkillLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Pro'>('Beginner');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Already has profile
  if (userProfile && !isNewUser) {
    return <Navigate to="/" replace />;
  }

  const handleNext = () => {
    if (step === 1) {
      const heightNum = parseInt(height);
      if (isNaN(heightNum) || heightNum < 100 || heightNum > 250) {
        setError('Please enter a valid height between 100-250 cm');
        return;
      }
      setError(null);
      setStep(2);
    }
  };

  const handleComplete = async () => {
    setIsSaving(true);
    setError(null);
    
    try {
      await updateUserProfile({
        displayName: user.displayName || 'Player',
        email: user.email || '',
        photoURL: user.photoURL || '',
        height: parseInt(height),
        skillLevel,
      });
      navigate('/');
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-lg"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4 border border-primary/30">
            <Activity className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-white">Complete Your Profile</h1>
          <p className="text-gray-400 mt-1">Step {step} of 2</p>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-white/10 rounded-full mb-8 overflow-hidden">
          <motion.div 
            initial={{ width: '50%' }}
            animate={{ width: step === 1 ? '50%' : '100%' }}
            className="h-full bg-primary rounded-full"
          />
        </div>

        {/* Welcome message with user info */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card/30 backdrop-blur-xl border border-white/10 rounded-xl p-4 mb-6 flex items-center gap-4"
        >
          {user.photoURL ? (
            <img 
              src={user.photoURL} 
              alt="Profile" 
              className="w-12 h-12 rounded-full border-2 border-primary/50"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
          )}
          <div>
            <p className="text-white font-medium">{user.displayName || 'Welcome!'}</p>
            <p className="text-gray-400 text-sm">{user.email}</p>
          </div>
        </motion.div>

        {/* Form Card */}
        <motion.div 
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
        >
          {step === 1 ? (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Ruler className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Your Height</h2>
                  <p className="text-gray-400 text-sm">Used for accurate pose analysis</p>
                </div>
              </div>

              <div className="relative mb-6">
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="Enter height"
                  min="100"
                  max="250"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white text-2xl font-medium text-center focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">cm</span>
              </div>

              {/* Height guide */}
              <div className="flex justify-between text-xs text-gray-500 mb-6">
                <span>100 cm</span>
                <span>170 cm (avg)</span>
                <span>250 cm</span>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4"
                >
                  <p className="text-red-400 text-sm text-center">{error}</p>
                </motion.div>
              )}

              <button
                onClick={handleNext}
                className="w-full flex items-center justify-center gap-2 bg-primary text-background font-semibold py-3 px-4 rounded-xl hover:bg-primary/90 transition-all duration-300"
              >
                <span>Continue</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Skill Level</h2>
                  <p className="text-gray-400 text-sm">Help us personalize your coaching</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {SKILL_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => setSkillLevel(level.value)}
                    className={`w-full p-4 rounded-xl border transition-all duration-300 text-left ${
                      skillLevel === level.value
                        ? 'bg-primary/10 border-primary/50 text-white'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{level.label}</p>
                        <p className="text-sm text-gray-400">{level.description}</p>
                      </div>
                      {skillLevel === level.value && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <svg className="w-3 h-3 text-background" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4"
                >
                  <p className="text-red-400 text-sm text-center">{error}</p>
                </motion.div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 px-4 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleComplete}
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary text-background font-semibold py-3 px-4 rounded-xl hover:bg-primary/90 transition-all duration-300 disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Get Started</span>
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
