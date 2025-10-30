import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff, Sparkles, Shield, Zap } from 'lucide-react';

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
  SIGN_IN_ERROR_DESC: 'Wrong credentials',
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
  { icon: Sparkles, text: "AI-Powered Nutrition" },
  { icon: Shield, text: "Secure & Private" },
  { icon: Zap, text: "Instant Results" }
];

// Sub-components
const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
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
  onTogglePassword 
}: { 
  id: string; 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showPassword: boolean;
  onTogglePassword: () => void;
}) => (
  <div className="relative">
    <Input
      id={id}
      type={showPassword ? "text" : "password"}
      placeholder="••••••••"
      value={value}
      onChange={onChange}
      required
      minLength={VALIDATION.MIN_PASSWORD_LENGTH}
      className="pr-10"
    />
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
      onClick={onTogglePassword}
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      {showPassword ? (
        <EyeOff className="h-4 w-4 text-muted-foreground" />
      ) : (
        <Eye className="h-4 w-4 text-muted-foreground" />
      )}
    </Button>
  </div>
);

const Divider = ({ text }: { text: string }) => (
  <div className="relative my-6">
    <div className="absolute inset-0 flex items-center">
      <span className="w-full border-t" />
    </div>
    <div className="relative flex justify-center text-xs uppercase">
      <span className="bg-card px-2 text-muted-foreground">{text}</span>
    </div>
  </div>
);

// Main Component
const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
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
          description: MESSAGES.SIGN_IN_ERROR_DESC,
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
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5 flex items-center justify-center p-3 sm:p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-6xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Branding */}
          <div className={`hidden lg:block transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
          }`}>
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <img src="/logo.svg" alt="Aliva Logo" className="h-12 w-auto" />
              </div>
              
              <div>
                <h2 className="text-4xl font-bold text-foreground mb-4">
                  Your AI-Powered<br />Nutrition Companion
                </h2>
                <p className="text-muted-foreground text-lg">
                  Start your journey to better health with personalized meal plans, smart tracking, and AI-powered insights.
                </p>
              </div>

              <div className="space-y-4">
                {features.map((feature, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center gap-3 p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:scale-105"
                    style={{ animationDelay: `${idx * 150}ms` }}
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <feature.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-medium text-foreground">{feature.text}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-6 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">10K+</div>
                  <div className="text-sm text-muted-foreground">Active Users</div>
                </div>
                <div className="w-px h-12 bg-border" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">1M+</div>
                  <div className="text-sm text-muted-foreground">Meals Tracked</div>
                </div>
                <div className="w-px h-12 bg-border" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">4.9⭐</div>
                  <div className="text-sm text-muted-foreground">User Rating</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Auth Form */}
          <div className={`transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
          }`}>
            {/* Mobile header */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <img src="/logo.svg" alt=" Logo" className="h-10 w-auto" />
              </div>
              <p className="text-muted-foreground">Your AI-powered nutrition companion</p>
            </div>

            <Card className="bg-card/80 backdrop-blur-xl border-2 border-primary/20 shadow-2xl">
              <CardHeader className="text-center space-y-2">
                <CardTitle className="text-2xl font-bold">Welcome</CardTitle>
                <CardDescription>Sign in or create a new account to get started</CardDescription>
              </CardHeader>

              <CardContent>
                <Tabs defaultValue="signin" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>

                  {/* Sign In Tab */}
                  <TabsContent value="signin">
                    {showForgotPassword ? (
                      <form onSubmit={handleForgotPassword} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="reset-email">Email</Label>
                          <Input
                            id="reset-email"
                            type="email"
                            placeholder="your@email.com"
                            value={formData.email}
                            onChange={(e) => updateFormData('email', e.target.value)}
                            required
                          />
                        </div>

                        <Button
                          type="submit"
                          className="w-full rounded-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-lg hover:shadow-primary/20 transition-all duration-300"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sending reset link...
                            </>
                          ) : (
                            'Send Reset Link'
                          )}
                        </Button>

                        <Button
                          type="button"
                          variant="link"
                          className="w-full text-sm"
                          onClick={() => setShowForgotPassword(false)}
                          disabled={isLoading}
                        >
                          Back to Sign In
                        </Button>
                      </form>
                    ) : (
                      <>
                        <form onSubmit={handleSignIn} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="signin-email">Email</Label>
                            <Input
                              id="signin-email"
                              type="email"
                              placeholder="your@email.com"
                              value={formData.email}
                              onChange={(e) => updateFormData('email', e.target.value)}
                              required
                              className="h-11"
                            />
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between mb-1">
                              <Label htmlFor="signin-password">Password</Label>
                              <Button
                                type="button"
                                variant="link"
                                className="h-auto p-0 text-xs text-primary hover:underline"
                                onClick={() => setShowForgotPassword(true)}
                              >
                                Forgot password?
                              </Button>
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
                            className="w-full rounded-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:scale-[1.02]"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Signing in...
                              </>
                            ) : (
                              'Sign In'
                            )}
                          </Button>
                        </form>

                        <Divider text="Or continue with" />

                        <Button
                          type="button"
                          variant="outline"
                          className="w-full h-11 hover:bg-muted/50 transition-all duration-300"
                          onClick={handleGoogleSignIn}
                          disabled={isLoading}
                        >
                          <GoogleIcon />
                          Sign in with Google
                        </Button>
                      </>
                    )}
                  </TabsContent>

                  {/* Sign Up Tab */}
                  <TabsContent value="signup">
                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-name">Full Name</Label>
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="Your full name"
                          value={formData.fullName}
                          onChange={(e) => updateFormData('fullName', e.target.value)}
                          required
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="your@email.com"
                          value={formData.email}
                          onChange={(e) => updateFormData('email', e.target.value)}
                          required
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <PasswordInput
                          id="signup-password"
                          value={formData.password}
                          onChange={(e) => updateFormData('password', e.target.value)}
                          showPassword={showPassword}
                          onTogglePassword={togglePasswordVisibility}
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full rounded-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:scale-[1.02]"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          'Create Account'
                        )}
                      </Button>
                    </form>

                    <Divider text="Or continue with" />

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-11 hover:bg-muted/50 transition-all duration-300"
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                    >
                      <GoogleIcon />
                      Sign up with Google
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <p className="text-center text-sm text-muted-foreground mt-6">
              By continuing, you agree to our{' '}
              <a href="/terms" className="text-primary hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.6; }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Auth;