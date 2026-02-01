import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Activity, Chrome, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const { user, loading, signInWithGoogle, isNewUser } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to sign in. Please try again.');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // User is logged in but needs to complete profile
  if (user && isNewUser) {
    return <Navigate to="/onboarding" replace />;
  }

  // User is fully logged in
  if (user && !isNewUser) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Animated floating background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Orb 1 - Larger, slower */}
        <motion.div 
          className="absolute w-96 h-96 bg-primary/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, -50, 80, 0],
            y: [0, -80, 60, -40, 0],
          }}
          transition={{
            duration: 20,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse"
          }}
          style={{ top: '15%', left: '10%' }}
        />
        
        {/* Orb 2 - Medium, different path */}
        <motion.div 
          className="absolute w-80 h-80 bg-primary/25 rounded-full blur-3xl"
          animate={{
            x: [0, -120, 60, -80, 0],
            y: [0, 100, -50, 70, 0],
          }}
          transition={{
            duration: 25,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse"
          }}
          style={{ bottom: '20%', right: '15%' }}
        />
        
        {/* Orb 3 - Smaller, faster accent */}
        <motion.div 
          className="absolute w-64 h-64 bg-primary/30 rounded-full blur-2xl"
          animate={{
            x: [0, 150, -100, 50, 0],
            y: [0, -60, 100, -80, 0],
          }}
          transition={{
            duration: 15,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse"
          }}
          style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        />
        
        {/* Orb 4 - Extra subtle floating */}
        <motion.div 
          className="absolute w-72 h-72 bg-primary/15 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 120, -60, 0],
            y: [0, 70, -90, 40, 0],
          }}
          transition={{
            duration: 18,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse"
          }}
          style={{ top: '60%', left: '20%' }}
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-2xl mb-6 border border-primary/30"
          >
            <Activity className="w-10 h-10 text-primary" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-2">B.O.L.T</h1>
          <p className="text-gray-400 text-lg">Badminton Optimized Live Tracking</p>
        </div>

        {/* Login Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
        >
          <h2 className="text-xl font-semibold text-white text-center mb-2">Welcome Back</h2>
          <p className="text-gray-400 text-center mb-8">Sign in to continue your training</p>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-6"
            >
              <p className="text-red-400 text-sm text-center">{error}</p>
            </motion.div>
          )}

          <button
            onClick={handleGoogleSignIn}
            disabled={isSigningIn}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-medium py-3 px-4 rounded-xl hover:bg-gray-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isSigningIn ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Chrome className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <p className="text-gray-500 text-xs text-center mt-6">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
