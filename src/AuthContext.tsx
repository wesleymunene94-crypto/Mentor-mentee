import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export type Role = 'mentor' | 'mentee' | 'coordinator';

export interface UserProfile {
  uid: string;
  role: Role;
  name: string;
  email: string;
  bio?: string;
  tags?: string[];
  isProfileComplete: boolean;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: (role: Role) => Promise<void>;
  signInWithEmail: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  signUpWithEmail: (email: string, password: string, role: Role) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            setProfile(null);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (role: Role) => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const currentUser = result.user;
      
      // Check if profile exists
      const docRef = doc(db, 'users', currentUser.uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        // Create initial profile
        const newProfile: UserProfile = {
          uid: currentUser.uid,
          role,
          name: currentUser.displayName || 'Anonymous User',
          email: currentUser.email || '',
          isProfileComplete: false,
        };
        await setDoc(docRef, newProfile);
        setProfile(newProfile);
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string, rememberMe: boolean) => {
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Error signing in with email:", error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, role: Role) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const currentUser = result.user;
      
      const docRef = doc(db, 'users', currentUser.uid);
      const newProfile: UserProfile = {
        uid: currentUser.uid,
        role,
        name: email.split('@')[0],
        email: currentUser.email || email,
        isProfileComplete: false,
      };
      await setDoc(docRef, newProfile);
      setProfile(newProfile);
    } catch (error) {
      console.error("Error signing up with email:", error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Error resetting password:", error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user || !profile) return;
    try {
      const docRef = doc(db, 'users', user.uid);
      const updatedProfile = { ...profile, ...data };
      await setDoc(docRef, updatedProfile, { merge: true });
      setProfile(updatedProfile);
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword, logout, updateProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
