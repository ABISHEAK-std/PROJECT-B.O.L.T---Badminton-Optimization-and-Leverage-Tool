import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  signInWithGoogle, 
  signOut, 
  onAuthChange, 
  getUserProfile, 
  setUserProfile 
} from '../config/firebase';
import type { User } from '../config/firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  height: number;
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Pro';
  createdAt: number;
  updatedAt: number;
  totalSessions: number;
  totalTrainingTime: number; // in minutes
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  isNewUser: boolean;
  setIsNewUser: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Fetch user profile from database
        const profile = await getUserProfile(firebaseUser.uid);
        
        if (profile) {
          setUserProfileState(profile as UserProfile);
          setIsNewUser(false);
        } else {
          // New user - needs to complete profile
          setIsNewUser(true);
          setUserProfileState(null);
        }
      } else {
        setUserProfileState(null);
        setIsNewUser(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignInWithGoogle = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setUserProfileState(null);
      setIsNewUser(false);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;

    const now = Date.now();
    const updatedProfile: UserProfile = userProfile 
      ? { ...userProfile, ...data, updatedAt: now }
      : {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          height: 170,
          skillLevel: 'Beginner',
          createdAt: now,
          updatedAt: now,
          totalSessions: 0,
          totalTrainingTime: 0,
          ...data
        };

    await setUserProfile(user.uid, updatedProfile);
    setUserProfileState(updatedProfile);
    setIsNewUser(false);
  };

  const value = {
    user,
    userProfile,
    loading,
    signInWithGoogle: handleSignInWithGoogle,
    signOut: handleSignOut,
    updateUserProfile,
    isNewUser,
    setIsNewUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
