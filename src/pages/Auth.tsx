import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff, CheckCircle, ArrowLeft } from 'lucide-react';
import Logo from '@/components/Logo';

// Types
interface FormData {
  email: string;
  password: string;
  fullName?: string;
}

// Constants
const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
} as const;

const MESSAGES = {
  SIGN_IN_SUCCESS: 'Welcome back!',
  SIGN_IN_SUCCESS_DESC: 'Successfully signed in to Aliva.',
  SIGN_IN_ERROR: 'Sign in failed',
  SIGN_UP_SUCCESS: 'Welcome to Aliva!',
  SIGN_UP_SUCCESS_DESC: 'Your account has been created successfully.',
  SIGN_UP_ERROR: 'Sign up failed',
  GOOGLE_SIGN_IN_ERROR: 'Google sign in failed',
  GOOGLE_SIGN_IN_SUCCESS: 'Successfully signed in with Google.',
  NAME_REQUIRED: 'Full name required',
  NAME_REQUIRED_DESC: 'Please enter your full name to create an account.',
  PASSWORD_TOO_SHORT: 'Password too short',
  PASSWORD_TOO_SHORT_DESC: `Password must be at least ${VALIDATION.MIN_PASSWORD_LENGTH} characters long.`,
  RESET_EMAIL_SENT: 'Reset email sent',
  RESET_EMAIL_SENT_DESC: 'Check your email for password reset instructions.',
  RESET_EMAIL_ERROR: 'Failed to send reset email',
  EMAIL_REQUIRED: 'Email required',
  EMAIL_REQUIRED_DESC: 'Please enter your email address.',
} as const;

const features = [
  "AI-powered meal recommendations",
  "Personalized nutrition tracking",
  "Smart restaurant discovery",
  "Progress insights & analytics"
];

// Sub-components
const GoogleIcon = () => (
  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const PasswordInput = ({
  id,
  value,
  onChange,
  showPassword,
  onTogglePassword,
  placeholder = "••••••••"
}: {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showPassword: boolean;
  onTogglePassword: () => void;
  placeholder?: string;
}) => (
  <div className="relative">
    <Input
      id={id}
      type={showPassword ? "text" : "password"}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required
      minLength={VALIDATION.MIN_PASSWORD_LENGTH}
      className="h-12 pr-12 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-white/20"
    />
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-white/60 hover:text-white"
      onClick={onTogglePassword}
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      {showPassword ? (
        <EyeOff className="h-5 w-5" />
      ) : (
        <Eye className="h-5 w-5" />
      )}
    </Button>
  </div>
);

// Main Component
const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    fullName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const { signIn, signUp, signInWithGoogle, user, resetPassword } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Redirect if authenticated
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Form handlers
  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateSignUp = (): boolean => {
    if (!formData.fullName?.trim()) {
      toast({
        title: MESSAGES.NAME_REQUIRED,
        description: MESSAGES.NAME_REQUIRED_DESC,
        variant: 'destructive',
      });
      return false;
    }

    if (formData.password.length < VALIDATION.MIN_PASSWORD_LENGTH) {
      toast({
        title: MESSAGES.PASSWORD_TOO_SHORT,
        description: MESSAGES.PASSWORD_TOO_SHORT_DESC,
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(formData.email, formData.password);

      if (error) {
        toast({
          title: MESSAGES.SIGN_IN_ERROR,
          description: error.message || 'Please check your credentials and try again.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: MESSAGES.SIGN_IN_SUCCESS,
          description: MESSAGES.SIGN_IN_SUCCESS_DESC,
        });
        navigate('/dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateSignUp()) return;

    setIsLoading(true);

    try {
      const { error } = await signUp(
        formData.email,
        formData.password,
        formData.fullName!
      );

      if (error) {
        toast({
          title: MESSAGES.SIGN_UP_ERROR,
          description: error.message || 'Failed to create account. Please try again.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: MESSAGES.SIGN_UP_SUCCESS,
          description: MESSAGES.SIGN_UP_SUCCESS_DESC,
        });
        setTimeout(() => navigate('/dashboard'), 1000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);

    try {
      const { error } = await signInWithGoogle();

      if (error) {
        toast({
          title: MESSAGES.GOOGLE_SIGN_IN_ERROR,
          description: error.message || 'Failed to sign in with Google. Please try again.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: MESSAGES.SIGN_UP_SUCCESS,
          description: MESSAGES.GOOGLE_SIGN_IN_SUCCESS,
        });
        navigate('/dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email.trim()) {
      toast({
        title: MESSAGES.EMAIL_REQUIRED,
        description: MESSAGES.EMAIL_REQUIRED_DESC,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await resetPassword(formData.email);

      if (error) {
        toast({
          title: MESSAGES.RESET_EMAIL_ERROR,
          description: error.message || 'Please try again.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: MESSAGES.RESET_EMAIL_SENT,
          description: MESSAGES.RESET_EMAIL_SENT_DESC,
        });
        setShowForgotPassword(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex">
      {/* Left Panel - Branding */}
      <div className={`hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        {/* Gradient Orbs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

        {/* Logo */}
        <div className="relative z-10">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 group">
            <Logo className="h-10 w-auto transition-transform group-hover:scale-105 [&_text]:fill-white" />
          </button>
        </div>

        {/* Main Content */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
              Your AI-Powered<br />
              <span className="relative">
                Nutrition Partner
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                  <path d="M2 8C50 2 150 2 198 8" stroke="rgba(255,255,255,0.3)" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            <p className="mt-6 text-lg text-white/70 max-w-md">
              Join thousands who've transformed their health with personalized meal plans and AI-powered insights.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 text-white/80">
                <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 flex items-center gap-8">
          <div>
            <div className="text-3xl font-bold text-white">1k+</div>
            <div className="text-sm text-white/60">Active Users</div>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div>
            <div className="text-3xl font-bold text-white">10k</div>
            <div className="text-sm text-white/60">Meals Tracked</div>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div>
            <div className="text-3xl font-bold text-white">4.9★</div>
            <div className="text-sm text-white/60">User Rating</div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className={`w-full lg:w-1/2 flex flex-col justify-center p-6 sm:p-12 bg-primary lg:bg-gradient-to-br lg:from-primary lg:to-primary/95 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <button onClick={() => navigate('/')} className="inline-flex items-center gap-2">
              <Logo className="h-10 w-auto [&_text]:fill-white" />
            </button>
            <p className="text-white/70 mt-2">Your AI-powered nutrition partner</p>
          </div>

          {/* Form Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              {showForgotPassword ? 'Reset Password' : activeTab === 'signin' ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-white/60 mt-2">
              {showForgotPassword
                ? 'Enter your email to receive a reset link'
                : activeTab === 'signin'
                  ? 'Sign in to continue your journey'
                  : 'Start your health transformation today'}
            </p>
          </div>

          {/* Tab Switcher */}
          {!showForgotPassword && (
            <div className="flex bg-white/10 rounded-xl p-1 mb-6">
              <button
                onClick={() => setActiveTab('signin')}
                className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all ${activeTab === 'signin'
                  ? 'bg-white text-primary shadow-lg'
                  : 'text-white/70 hover:text-white'
                  }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setActiveTab('signup')}
                className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all ${activeTab === 'signup'
                  ? 'bg-white text-primary shadow-lg'
                  : 'text-white/70 hover:text-white'
                  }`}
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Forgot Password Form */}
          {showForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-white/80">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  required
                  className="h-12 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-white/40"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-white text-primary font-semibold hover:bg-white/90 transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>

              <button
                type="button"
                className="flex items-center justify-center gap-2 w-full py-3 text-white/70 hover:text-white transition-colors"
                onClick={() => setShowForgotPassword(false)}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </button>
            </form>
          ) : (
            <>
              {/* Sign In Form */}
              {activeTab === 'signin' && (
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-white/80">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      required
                      className="h-12 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-white/40"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="signin-password" className="text-white/80">Password</Label>
                      <button
                        type="button"
                        className="text-sm text-white/60 hover:text-white transition-colors"
                        onClick={() => setShowForgotPassword(true)}
                      >
                        Forgot password?
                      </button>
                    </div>
                    <PasswordInput
                      id="signin-password"
                      value={formData.password}
                      onChange={(e) => updateFormData('password', e.target.value)}
                      showPassword={showPassword}
                      onTogglePassword={togglePasswordVisibility}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-white text-primary font-semibold hover:bg-white/90 transition-all"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              )}

              {/* Sign Up Form */}
              {activeTab === 'signup' && (
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-white/80">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Your full name"
                      value={formData.fullName}
                      onChange={(e) => updateFormData('fullName', e.target.value)}
                      required
                      className="h-12 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-white/40"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-white/80">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      required
                      className="h-12 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-white/40"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-white/80">Password</Label>
                    <PasswordInput
                      id="signup-password"
                      value={formData.password}
                      onChange={(e) => updateFormData('password', e.target.value)}
                      showPassword={showPassword}
                      onTogglePassword={togglePasswordVisibility}
                      placeholder="At least 6 characters"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-white text-primary font-semibold hover:bg-white/90 transition-all"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              )}

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/20" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-primary px-3 text-white/50">Or continue with</span>
                </div>
              </div>

              {/* Google Sign In */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 bg-white hover:bg-white/90 text-gray-700 border-0 font-medium"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <GoogleIcon />
                Continue with Google
              </Button>
            </>
          )}

          {/* Terms */}
          <p className="text-center text-sm text-white/50 mt-8">
            By continuing, you agree to our{' '}
            <a href="/terms" className="text-white/70 hover:text-white underline">Terms</a>
            {' '}and{' '}
            <a href="/privacy" className="text-white/70 hover:text-white underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;