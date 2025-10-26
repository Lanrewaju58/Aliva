import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  User
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { profileService } from '@/services/profileService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ user: User | null; error: any }>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: any }>;
  signInWithGoogle: () => Promise<{ user: User | null; error: any }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      await updateProfile(result.user, {
        displayName: fullName
      });
      
      await profileService.createProfile(result.user.uid, {
        fullName,
        userId: result.user.uid
      });
      
      return { user: result.user, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { user: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { user: result.user, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { user: null, error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      
      // These settings help with popup reliability
      provider.setCustomParameters({
        prompt: 'select_account',
        // Use localhost for redirect during development
        redirect_uri: window.location.origin
      });
      
      console.log('Opening Google sign-in popup...');
      const result = await signInWithPopup(auth, provider);
      console.log('Sign-in successful!');
      
      // Create profile in background (don't block sign-in)
      setTimeout(async () => {
        try {
          const userProfile = await profileService.getProfile(result.user.uid);
          if (!userProfile) {
            await profileService.createProfile(result.user.uid, {
              fullName: result.user.displayName || '',
              userId: result.user.uid
            });
          }
        } catch (error) {
          console.error('Profile creation error:', error);
        }
      }, 0);
      
      return { user: result.user, error: null };
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      
      // Provide user-friendly error messages
      if (error.code === 'auth/popup-blocked') {
        return { 
          user: null, 
          error: { message: 'Popup blocked. Please allow popups for this site.' } 
        };
      }
      if (error.code === 'auth/popup-closed-by-user') {
        return { 
          user: null, 
          error: { message: 'Sign-in cancelled.' } 
        };
      }
      if (error.code === 'auth/network-request-failed') {
        return { 
          user: null, 
          error: { message: 'Network error. Please check your connection.' } 
        };
      }
      
      return { user: null, error };
    }
  };

  const logout = async () => {
    return signOut(auth);
  };

  const refreshUser = async () => {
    try {
      if (auth.currentUser) {
        await auth.currentUser.reload();
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    } finally {
      setUser(auth.currentUser);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut: logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}