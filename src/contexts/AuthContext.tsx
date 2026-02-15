import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
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
  resetPassword: (email: string) => Promise<{ error: any }>;
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
      // Trim whitespace from email and log for debugging
      const trimmedEmail = email.trim().toLowerCase();
      
      console.log('Attempting sign in...', {
        email: trimmedEmail,
        emailLength: trimmedEmail.length,
        passwordLength: password.length,
        hasWhitespace: email !== trimmedEmail
      });
      
      const result = await signInWithEmailAndPassword(auth, trimmedEmail, password);
      
      console.log('Sign in successful!', {
        uid: result.user.uid,
        email: result.user.email
      });
      
      return { user: result.user, error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      console.error('Error code:', error?.code);
      console.error('Error message:', error?.message);
      
      // Provide user-friendly error messages
      let friendlyError = error;
      
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        friendlyError = { 
          ...error,
          message: 'Invalid email or password. Please check your credentials and try again.' 
        };
      } else if (error.code === 'auth/user-not-found') {
        friendlyError = { 
          ...error,
          message: 'No account found with this email address.' 
        };
      } else if (error.code === 'auth/invalid-email') {
        friendlyError = { 
          ...error,
          message: 'Invalid email format.' 
        };
      } else if (error.code === 'auth/user-disabled') {
        friendlyError = { 
          ...error,
          message: 'This account has been disabled.' 
        };
      } else if (error.code === 'auth/too-many-requests') {
        friendlyError = { 
          ...error,
          message: 'Too many failed attempts. Please try again later or reset your password.' 
        };
      }
      
      return { user: null, error: friendlyError };
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

  const resetPassword = async (email: string) => {
    try {
      const trimmedEmail = email.trim().toLowerCase();
      await sendPasswordResetEmail(auth, trimmedEmail);
      return { error: null };
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      // Provide user-friendly error messages
      if (error.code === 'auth/user-not-found') {
        return { 
          error: { message: 'No account found with this email address.' } 
        };
      }
      if (error.code === 'auth/invalid-email') {
        return { 
          error: { message: 'Invalid email address.' } 
        };
      }
      if (error.code === 'auth/too-many-requests') {
        return { 
          error: { message: 'Too many requests. Please try again later.' } 
        };
      }
      
      return { error };
    }
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
    resetPassword,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}