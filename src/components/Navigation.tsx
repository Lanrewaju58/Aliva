import { useEffect, useRef, useState } from "react";
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
import { Menu, X, MessageCircle, ChefHat, MapPin, MoreHorizontal, User, Settings, LogOut, Crown, Sun, Moon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { profileService } from "@/services/profileService";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [accountPlan, setAccountPlan] = useState<string>('');
  // Handle post-payment activation on redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const upgradeOk = params.get('upgrade');
    if (upgradeOk === 'success' && user?.uid) {
      const raw = localStorage.getItem('upgrade_plan_intent');
      if (raw) {
        try {
          const intent = JSON.parse(raw);
          const plan = (intent.plan || 'PRO').toString().toUpperCase();
          const interval = (intent.interval || 'monthly').toString().toLowerCase();
          const now = new Date();
          const expires = new Date(now);
          if (interval === 'yearly') {
            expires.setFullYear(expires.getFullYear() + 1);
          } else {
            expires.setMonth(expires.getMonth() + 1);
          }
          (async () => {
            try {
              await profileService.upsertProfile(user.uid, { plan, planExpiresAt: expires });
              toast({ title: 'Upgrade successful', description: `${plan} activated. Expires on ${expires.toLocaleDateString()}` });
              localStorage.removeItem('upgrade_plan_intent');
              // Remove the query param without full reload
              const url = new URL(window.location.href);
              url.searchParams.delete('upgrade');
              window.history.replaceState({}, '', url.toString());
            } catch (e) {
              toast({ title: 'Activation failed', description: 'Please contact support.', variant: 'destructive' });
            }
          })();
        } catch {}
      }
    }
  }, [location.search, user, toast]);

  // Load profile to show plan status in nav
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

  // Helper function to get user initials
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
    return 'U'; // fallback to 'U' for User
  };

  const userInitials = getUserInitials(user?.displayName, user?.email);

  // Quotes data (text + gradient) - vibrant colors that work in both light and dark modes
  const quotes = [
    { t: "Eat well, live well.", g: "from-emerald-400 via-green-500 to-teal-500" },
    { t: "Small choices, big changes.", g: "from-blue-400 via-cyan-500 to-sky-500" },
    { t: "Food is fuel. Choose quality.", g: "from-purple-400 via-violet-500 to-pink-500" },
    { t: "Healthy today, stronger tomorrow.", g: "from-orange-400 via-red-500 to-rose-500" },
    { t: "Good food, good mood.", g: "from-teal-400 via-emerald-500 to-green-500" },
    { t: "Eat simple, feel amazing.", g: "from-indigo-400 via-purple-500 to-violet-500" },
    { t: "Healthy plate, happy life.", g: "from-green-400 via-emerald-500 to-teal-500" },
    { t: "Choose greens, gain energy.", g: "from-lime-400 via-green-500 to-emerald-500" },
    { t: "Nourish to flourish.", g: "from-rose-400 via-pink-500 to-fuchsia-500" },
    { t: "Better bites, better days.", g: "from-cyan-400 via-sky-500 to-blue-500" },
    { t: "Whole foods, whole you.", g: "from-violet-400 via-purple-500 to-indigo-500" },
    { t: "Eat natural, feel powerful.", g: "from-amber-400 via-orange-500 to-red-500" },
  ];

  // Quote index controlled by page scroll direction
  const [quoteIdx, setQuoteIdx] = useState(0);
  
  // Auto-rotate quotes every 3 seconds as fallback
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIdx((prev) => (prev + 1) % quotes.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [quotes.length]);
  const [lineH, setLineH] = useState(40); // default h-10
  const [mobileLineH, setMobileLineH] = useState(24); // default h-6
  const lineRef = useRef<HTMLDivElement | null>(null);
  const mobileLineRef = useRef<HTMLDivElement | null>(null);
  const lastScrollRef = useRef<number>(0);
  const touchStartYRef = useRef<number | null>(null);

  useEffect(() => {
    const updateLineHeight = () => {
      if (lineRef.current) {
        const rect = lineRef.current.getBoundingClientRect();
        setLineH(rect.height || 32);
      }
      if (mobileLineRef.current) {
        const rect = mobileLineRef.current.getBoundingClientRect();
        setMobileLineH(rect.height || 24);
      }
    };
    
    updateLineHeight();
    
    // Update on window resize
    window.addEventListener('resize', updateLineHeight);
    return () => window.removeEventListener('resize', updateLineHeight);
  }, []);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      const now = Date.now();
      if (now - lastScrollRef.current < 350) return; // throttle ~0.35s
      lastScrollRef.current = now;
      setQuoteIdx((prev) => {
        const dir = e.deltaY > 0 ? 1 : -1;
        return Math.max(0, Math.min(quotes.length - 1, prev + dir));
      });
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0].clientY;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (touchStartYRef.current === null) return;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaY = touchStartYRef.current - touchEndY;
      
      if (Math.abs(deltaY) > 50) { // minimum swipe distance
        const now = Date.now();
        if (now - lastScrollRef.current < 350) return;
        lastScrollRef.current = now;
        setQuoteIdx((prev) => {
          const dir = deltaY > 0 ? 1 : -1;
          return Math.max(0, Math.min(quotes.length - 1, prev + dir));
        });
      }
      touchStartYRef.current = null;
    };

    document.addEventListener('wheel', onWheel, { passive: true });
    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('wheel', onWheel);
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [quotes.length]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  const handleGetStarted = () => {
    toast({
      title: "Welcome to Aliva! 🎉",
      description: "AI consultation is starting soon. Get ready for personalized nutrition advice!",
    });
    scrollToSection('consultation');
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

  const handleFeatureClick = (feature: string) => {
    toast({
      title: `${feature}`,
      description: `Section coming soon`,
    });
  };

  return (
    <nav className="fixed top-6 left-0 right-0 z-50">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 relative">
        <div className="h-14 sm:h-16 rounded-full bg-card shadow-xl border border-border flex items-center px-2 sm:px-3 md:px-6 overflow-hidden">
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer group shrink-0"
            onClick={() => {
              if (location.pathname !== '/') {
                navigate('/#home');
              } else {
                scrollToSection('home');
              }
            }}
          >
            <div className="flex items-center justify-center group-hover:scale-110 transition-transform">
              <img 
                src="/logo.svg" 
                alt="Aliva Logo" 
                className="h-8 sm:h-10 w-auto"
                onError={(e) => {
                  // Fallback in case logo.svg is not found
                  console.warn("Logo image not found, check if /logo.svg exists in public folder");
                }}
              />
            </div>
          </div>

          {/* Animated quotes - Center */}
          <div className="flex flex-1 min-w-0 justify-center items-center text-sm sm:text-base md:text-lg lg:text-xl font-semibold mx-4">
            <div ref={lineRef} className="overflow-hidden h-8 sm:h-10 md:h-12 relative w-full text-center min-w-0 flex items-center justify-center">
              <div
                className="absolute left-1/2 top-0 transform -translate-x-1/2 w-full"
                style={{ transform: `translateX(-50%) translateY(-${quoteIdx * lineH}px)`, transition: 'transform 320ms ease' }}
              >
                {quotes.map((q, i) => (
                  <div key={i} className={`h-8 sm:h-10 md:h-12 flex items-center justify-center font-semibold opacity-100 bg-gradient-to-r ${q.g} bg-clip-text text-transparent text-[10px] xs:text-xs sm:text-sm md:text-base lg:text-lg px-2 w-full`}>
                    <span className="text-center truncate max-w-full">{`"${q.t}"`}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Profile button (desktop only) */}
          <div className="hidden md:flex items-center space-x-3 shrink-0">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="rounded-full">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold relative">
                      {userInitials}
                      {(accountPlan === 'PRO' || accountPlan === 'PREMIUM') && (
                        <Crown className="w-3 h-3 absolute -top-1 -right-1 text-yellow-400" />
                      )}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <Settings className="w-4 h-4 mr-2" />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/upgrade')}>
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade to Pro
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleAuthAction}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button size="sm" onClick={() => navigate('/auth')} className="rounded-full">
                <User className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile navigation with quotes */}
          <div className="lg:hidden flex items-center gap-0.5 sm:gap-1 flex-1 min-w-0 max-w-full">
            
            {/* Mobile quotes - between logo and user initials */}
            <div className="flex flex-1 min-w-0 justify-center items-center mx-0.5 sm:mx-1">
              <div className="overflow-hidden h-6 sm:h-8 relative w-full text-center min-w-0 flex items-center justify-center">
                <div className="flex items-center justify-center h-6 sm:h-8">
                  <span className="text-[7px] xs:text-[8px] sm:text-[9px] font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent truncate max-w-full px-0.5 sm:px-1">
                    {`"${quotes[quoteIdx]?.t || 'Loading...'}"`}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Mobile right section - compact */}
            <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
              {/* Upgrade button - only show if user is not on paid plan */}
              {user && (!accountPlan || accountPlan === 'FREE') && (
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white text-[10px] xs:text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded-full min-w-0 shrink-0"
                  onClick={() => navigate('/upgrade')}
                >
                  <Crown className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:mr-1" />
                  <span className="hidden xs:inline sm:hidden">Pro</span>
                  <span className="hidden sm:inline">Upgrade</span>
                </Button>
              )}
              
              {/* Show user initials as dropdown */}
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="text-[10px] xs:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-primary/10 text-primary font-medium shrink-0 relative hover:bg-primary/20 transition-colors">
                      {userInitials}
                      {(accountPlan === 'PRO' || accountPlan === 'PREMIUM') && (
                        <Crown className="w-2.5 h-2.5 absolute -top-1 -right-1 text-yellow-400" />
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <Settings className="w-4 h-4 mr-2" />
                      Profile Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/upgrade')}>
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade to Pro
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleAuthAction}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
            </div>
          </div>
        </div>

        {/* Mobile flyout removed - using dropdown on initials instead */}
        {false && (
          <div className="lg:hidden absolute right-3 top-full mt-2 bg-card border border-border rounded-xl shadow-xl p-3 min-w-[200px]">
            {user ? (
              <div className="space-y-2">
                {/* User info */}
                <div className="flex items-center gap-3 pb-2 border-b border-border">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold relative">
                    {userInitials}
                    {(accountPlan === 'PRO' || accountPlan === 'PREMIUM') && (
                      <Crown className="w-3 h-3 absolute -top-1 -right-1 text-yellow-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {user.displayName || user.email}
                    </div>
                    {accountPlan && (
                      <div className="text-xs text-muted-foreground">
                        {accountPlan}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="space-y-1">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => { setIsMenuOpen(false); navigate('/profile'); }}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Profile Settings
                  </Button>
                  
                  {/* Theme toggle in mobile menu */}
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => { toggleTheme(); setIsMenuOpen(false); }}
                  >
                    {theme === 'light' ? (
                      <Moon className="w-4 h-4 mr-2" />
                    ) : (
                      <Sun className="w-4 h-4 mr-2" />
                    )}
                    {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                  </Button>
                  
                  <Button 
                    size="sm" 
                    className="w-full justify-start bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white" 
                    onClick={() => { setIsMenuOpen(false); navigate('/upgrade'); }}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade to Pro
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" 
                    onClick={() => { setIsMenuOpen(false); handleAuthAction(); }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Button 
                  size="sm" 
                  className="w-full" 
                  onClick={() => { setIsMenuOpen(false); navigate('/auth'); }}
                >
                  <User className="w-4 h-4 mr-2" /> Sign In
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => { setIsMenuOpen(false); navigate('/upgrade'); }}
                >
                  <Crown className="w-4 h-4 mr-2" />
                  View Plans
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;