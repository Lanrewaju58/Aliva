import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, User, Settings, LogOut, Crown, Sun, Moon, Sparkles, ChevronDown, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { profileService } from "@/services/profileService";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [accountPlan, setAccountPlan] = useState<string>('');

  // Handle post-payment activation with verification
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const upgradeOk = params.get('upgrade');
    const trxRef = params.get('trxref'); // Paystack transaction reference
    
    if (upgradeOk === 'success' && user?.uid) {
      const raw = localStorage.getItem('upgrade_plan_intent');
      if (raw) {
        try {
          const intent = JSON.parse(raw);
          const reference = trxRef || intent.reference;
          
          if (!reference) {
            console.error('No transaction reference found');
            toast({ 
              title: 'Payment verification failed', 
              description: 'Transaction reference not found. Please contact support.', 
              variant: 'destructive' 
            });
            localStorage.removeItem('upgrade_plan_intent');
            return;
          }

          (async () => {
            try {
              // Verify payment with Paystack before activating
              const apiBase = import.meta.env.VITE_API_BASE_URL || '';
              const verifyResponse = await fetch(`${apiBase}/api/payments/verify`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  reference,
                  userId: user.uid
                })
              });

              if (!verifyResponse.ok) {
                const error = await verifyResponse.json().catch(() => ({}));
                throw new Error(error.error || 'Payment verification failed');
              }

              const verifyData = await verifyResponse.json();
              
              if (!verifyData.verified || !verifyData.plan) {
                throw new Error('Payment verification unsuccessful');
              }

              // Payment verified - activate the plan
              const plan = verifyData.plan;
              const planExpiresAt = new Date(verifyData.planExpiresAt);
              
              await profileService.upsertProfile(user.uid, { 
                plan, 
                planExpiresAt 
              });
              
              toast({ 
                title: 'Upgrade successful!', 
                description: `${plan} plan activated. Expires on ${planExpiresAt.toLocaleDateString()}` 
              });
              
              localStorage.removeItem('upgrade_plan_intent');
              
              // Clean up URL
              const url = new URL(window.location.href);
              url.searchParams.delete('upgrade');
              url.searchParams.delete('trxref');
              window.history.replaceState({}, '', url.toString());
              
              // Reload to show updated plan status
              window.location.reload();
              
            } catch (e: any) {
              console.error('Payment verification/activation error:', e);
              toast({ 
                title: 'Activation failed', 
                description: e.message || 'Please contact support if payment was completed.', 
                variant: 'destructive' 
              });
              localStorage.removeItem('upgrade_plan_intent');
            }
          })();
        } catch (e) {
          console.error('Error parsing upgrade intent:', e);
          localStorage.removeItem('upgrade_plan_intent');
        }
      }
    }
  }, [location.search, user, toast]);

  // Load profile
  useEffect(() => {
    (async () => {
      if (!user?.uid) {
        setAccountPlan('');
        return;
      }
      try {
        const profile = await profileService.getProfile(user.uid);
        const plan = (profile as any)?.plan || 'FREE';
        setAccountPlan(plan);
      } catch {}
    })();
  }, [user]);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Entrance animation
  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const getUserInitials = (name: string | null, email: string | null): string => {
    if (name && name.trim()) {
      return name
        .trim()
        .split(' ')
        .map(part => part.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
    }
    if (email && email.trim()) {
      return email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const userInitials = getUserInitials(user?.displayName, user?.email);

  const quotes = [
    { t: "Nutrition guidance tailored to your goals", g: "from-emerald-400 via-green-500 to-teal-500" },
    { t: "Track meals and discover healthy recipes", g: "from-blue-400 via-cyan-500 to-sky-500" },
    { t: "Personalized dietary recommendations", g: "from-purple-400 via-violet-500 to-pink-500" },
  ];

  const [quoteIdx, setQuoteIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIdx((prev) => (prev + 1) % quotes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [quotes.length]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  const handleAuthAction = () => {
    if (user) {
      signOut();
      toast({
        title: "Signed out successfully",
        description: "See you next time!",
      });
    } else {
      navigate('/auth');
    }
  };

  const isPremiumUser = accountPlan === 'PRO' || accountPlan === 'PREMIUM';

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 pt-4 sm:pt-6">
          <div className={`relative rounded-2xl sm:rounded-3xl transition-all duration-500 ${
            isScrolled 
              ? 'bg-card/95 backdrop-blur-xl shadow-2xl border-2 border-border' 
              : 'bg-card/80 backdrop-blur-md shadow-xl border border-border/50'
          }`}>
            {/* Gradient glow effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-2xl sm:rounded-3xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

            <div className="relative h-14 sm:h-16 md:h-18 flex items-center justify-between px-4 sm:px-6 md:px-8">
              {/* Logo Section */}
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                <button
                  onClick={() => {
                    if (location.pathname !== '/') {
                      navigate('/#home');
                    } else {
                      scrollToSection('home');
                    }
                  }}
                  className="group flex items-center gap-2 sm:gap-3 hover:scale-105 transition-transform duration-300 shrink-0"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <img
                      src="/logo.svg"
                      alt="Aliva"
                      className="h-7 sm:h-9 md:h-10 w-auto relative z-10 drop-shadow-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                </button>

                {/* Animated Quote - Hidden on small mobile */}
                <div className="hidden sm:flex items-center min-w-0 flex-1 overflow-hidden">
                  <div className="relative w-full">
                    {quotes.map((quote, idx) => (
                      <div
                        key={idx}
                        className={`absolute inset-0 flex items-center transition-all duration-700 ${
                          idx === quoteIdx 
                            ? 'opacity-100 translate-y-0' 
                            : idx < quoteIdx 
                              ? 'opacity-0 -translate-y-4' 
                              : 'opacity-0 translate-y-4'
                        }`}
                      >
                        <span className={`text-xs sm:text-sm md:text-base lg:text-lg font-bold bg-gradient-to-r ${quote.g} bg-clip-text text-transparent truncate animate-gradient`}>
                          "{quote.t}"
                        </span>
                      </div>
                    ))}
                    {/* Spacer to maintain height */}
                    <span className="invisible text-xs sm:text-sm md:text-base lg:text-lg font-bold">
                      "{quotes[0].t}"
                    </span>
                  </div>
                </div>
              </div>

              {/* Desktop Actions */}
              <div className="hidden md:flex items-center gap-2 lg:gap-3 shrink-0">
                {/* Theme Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                  className="rounded-full h-9 w-9 p-0 hover:bg-primary/10 hover:scale-110 transition-all duration-300"
                  title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                  {theme === 'light' ? (
                    <Moon className="h-4 w-4" />
                  ) : (
                    <Sun className="h-4 w-4" />
                  )}
                </Button>

                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="group rounded-full pl-2 pr-3 hover:bg-primary/10 transition-all duration-300 hover:scale-105"
                      >
                        <div className="relative">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                            isPremiumUser 
                              ? 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 text-white shadow-lg' 
                              : 'bg-gradient-to-br from-primary to-primary/70 text-primary-foreground'
                          }`}>
                            {userInitials}
                          </div>
                          {isPremiumUser && (
                            <Crown className="w-3.5 h-3.5 absolute -top-0.5 -right-0.5 text-yellow-300 drop-shadow-lg animate-pulse" />
                          )}
                        </div>
                        <ChevronDown className="w-3.5 h-3.5 ml-1 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="end" 
                      className="w-56 animate-in fade-in-0 zoom-in-95 duration-300"
                    >
                      <DropdownMenuLabel className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        My Account
                        {isPremiumUser && (
                          <Crown className="w-3.5 h-3.5 text-yellow-500 ml-auto" />
                        )}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => navigate('/profile')}
                        className="cursor-pointer"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Profile Settings
                      </DropdownMenuItem>
                      {!isPremiumUser && (
                        <DropdownMenuItem 
                          onClick={() => navigate('/upgrade')}
                          className="cursor-pointer text-yellow-600 focus:text-yellow-700"
                        >
                          <Crown className="w-4 h-4 mr-2" />
                          Upgrade to Pro
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={handleAuthAction}
                        className="cursor-pointer text-red-600 focus:text-red-700"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button 
                    size="sm" 
                    onClick={() => navigate('/auth')} 
                    className="rounded-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                )}
              </div>

              {/* Mobile Actions */}
              <div className="flex md:hidden items-center gap-1 sm:gap-2 shrink-0">
                {/* Theme Toggle Mobile */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                  className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 transition-all duration-300"
                >
                  {theme === 'light' ? (
                    <Moon className="h-3.5 w-3.5" />
                  ) : (
                    <Sun className="h-3.5 w-3.5" />
                  )}
                </Button>

                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="relative group">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 hover:scale-110 ${
                          isPremiumUser 
                            ? 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 text-white shadow-md' 
                            : 'bg-gradient-to-br from-primary to-primary/70 text-primary-foreground'
                        }`}>
                          {userInitials}
                        </div>
                        {isPremiumUser && (
                          <Crown className="w-2.5 h-2.5 absolute -top-0.5 -right-0.5 text-yellow-300 drop-shadow animate-pulse" />
                        )}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="end" 
                      className="w-48 animate-in fade-in-0 zoom-in-95 duration-300"
                    >
                      <DropdownMenuLabel className="flex items-center gap-2 text-sm">
                        <User className="w-3.5 h-3.5" />
                        My Account
                        {isPremiumUser && (
                          <Crown className="w-3 h-3 text-yellow-500 ml-auto" />
                        )}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => navigate('/profile')}
                        className="cursor-pointer text-sm"
                      >
                        <Settings className="w-3.5 h-3.5 mr-2" />
                        Profile
                      </DropdownMenuItem>
                      {!isPremiumUser && (
                        <DropdownMenuItem 
                          onClick={() => navigate('/upgrade')}
                          className="cursor-pointer text-yellow-600 text-sm"
                        >
                          <Crown className="w-3.5 h-3.5 mr-2" />
                          Upgrade
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={handleAuthAction}
                        className="cursor-pointer text-red-600 text-sm"
                      >
                        <LogOut className="w-3.5 h-3.5 mr-2" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button 
                    size="sm" 
                    onClick={() => navigate('/auth')} 
                    className="rounded-full h-8 text-xs px-3 bg-gradient-to-r from-primary to-primary/80 hover:scale-105 transition-all duration-300"
                  >
                    <User className="w-3 h-3 mr-1" />
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer to prevent content jump */}
      <div className="h-20 sm:h-24 md:h-26" />

      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </>
  );
};

export default Navigation;