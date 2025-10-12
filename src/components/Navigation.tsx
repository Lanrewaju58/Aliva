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
import { Menu, X, MessageCircle, ChefHat, MapPin, MoreHorizontal, User, Settings, LogOut, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { profileService } from "@/services/profileService";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [accountPlan, setAccountPlan] = useState<string>('');
  const [accountExpiry, setAccountExpiry] = useState<string>('');
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
        setAccountExpiry('');
        return;
      }
      try {
        const profile = await profileService.getProfile(user.uid);
        const plan = (profile as any)?.plan || 'FREE';
        let expires = '';
        const exp = (profile as any)?.planExpiresAt;
        if (exp) {
          const d = typeof exp?.toDate === 'function' ? exp.toDate() : (exp instanceof Date ? exp : new Date(exp));
          if (!Number.isNaN(d.getTime())) expires = d.toLocaleDateString();
        }
        setAccountPlan(plan);
        setAccountExpiry(expires);
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

  // Quotes data (text + gradient)
  const quotes = [
    { t: "Eat well, live well.", g: "from-primary to-primary-dark" },
    { t: "Small choices, big changes.", g: "from-secondary to-primary" },
    { t: "Food is fuel. Choose quality.", g: "from-accent to-primary" },
    { t: "Healthy today, stronger tomorrow.", g: "from-lavender to-primary" },
    { t: "Good food, good mood.", g: "from-primary to-secondary" },
    { t: "Eat simple, feel amazing.", g: "from-primary-dark to-primary" },
    { t: "Healthy plate, happy life.", g: "from-secondary to-primary" },
    { t: "Choose greens, gain energy.", g: "from-accent to-primary" },
    { t: "Nourish to flourish.", g: "from-lavender to-primary" },
    { t: "Better bites, better days.", g: "from-primary to-primary-dark" },
    { t: "Whole foods, whole you.", g: "from-secondary to-primary" },
    { t: "Eat natural, feel powerful.", g: "from-accent to-primary" },
  ];

  // Quote index controlled by page scroll direction
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [lineH, setLineH] = useState(40); // default h-10
  const lineRef = useRef<HTMLDivElement | null>(null);
  const lastScrollRef = useRef<number>(0);
  const touchStartYRef = useRef<number | null>(null);

  useEffect(() => {
    if (lineRef.current) {
      const rect = lineRef.current.getBoundingClientRect();
      setLineH(rect.height || 40);
    }
  }, []);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      const now = Date.now();
      if (now - lastScrollRef.current < 350) return; // throttle ~0.35s
      lastScrollRef.current = now;
      setQuoteIdx((prev) => {
        const dir = e.deltaY > 0 ? 1 : -1;
        const next = (prev + dir + quotes.length) % quotes.length;
        return next;
      });
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0].clientY;
    };
    const onTouchEnd = (e: TouchEvent) => {
      const startY = touchStartYRef.current;
      if (startY == null) return;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dy) < 24) return; // small swipe ignored
      const now = Date.now();
      if (now - lastScrollRef.current < 350) return;
      lastScrollRef.current = now;
      setQuoteIdx((prev) => {
        const dir = dy < 0 ? 1 : -1; // swipe up -> next
        const next = (prev + dir + quotes.length) % quotes.length;
        return next;
      });
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('wheel', onWheel as any);
      window.removeEventListener('touchstart', onTouchStart as any);
      window.removeEventListener('touchend', onTouchEnd as any);
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
        <div className="h-14 sm:h-16 rounded-full bg-white shadow-xl border border-black/5 flex items-center justify-between px-2 sm:px-3 md:px-6 overflow-hidden">
          {/* Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
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
                className="h-8 sm:h-10 w-auto shrink-0"
                onError={(e) => {
                  // Fallback in case logo.svg is not found
                  console.warn("Logo image not found, check if /logo.svg exists in public folder");
                }}
              />
            </div>
          </div>

          {/* Animated quotes (desktop only) */}
          <div className="hidden md:flex flex-1 min-w-0 justify-center text-base sm:text-lg md:text-2xl font-semibold">
            <div ref={lineRef} className="overflow-hidden h-8 sm:h-10 md:h-12 relative w-full max-w-[1000px] text-center min-w-0">
              <div
                className="absolute left-0 right-0 top-0"
                style={{ transform: `translateY(-${quoteIdx * lineH}px)`, transition: 'transform 320ms ease' }}
              >
                {quotes.map((q, i) => (
                  <div key={i} className={`h-8 sm:h-10 md:h-12 flex items-center justify-center bg-gradient-to-r ${q.g} bg-clip-text text-transparent`}>
                    {`"${q.t}"`}
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
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold mr-2">
                      {userInitials}
                    </div>
                    {user.displayName || user.email}
                    {accountPlan && (
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full border">
                        {accountPlan}
                        {accountExpiry && <span className="ml-1 opacity-70">(exp {accountExpiry})</span>}
                      </span>
                    )}
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

          {/* Mobile upgrade button and menu */}
          <div className="lg:hidden flex items-center gap-1 sm:gap-2">
            {/* Upgrade button - only show if user is not on paid plan */}
            {user && (!accountPlan || accountPlan === 'FREE') && (
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white text-xs px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-full min-w-0"
                onClick={() => navigate('/upgrade')}
              >
                <Crown className="w-3 h-3 sm:mr-1" />
                <span className="hidden sm:inline">Upgrade</span>
                <span className="sm:hidden">Pro</span>
              </Button>
            )}
            
            {/* Show plan status for paid users */}
            {user && accountPlan && accountPlan !== 'FREE' && (
              <div className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                {accountPlan}
              </div>
            )}
            
            {/* Mobile menu icon */}
            <button
              className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-primary" />
              ) : (
                <Menu className="w-6 h-6 text-primary" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile flyout with multiple action buttons */}
        {isMenuOpen && (
          <div className="lg:hidden absolute right-3 top-full mt-2 bg-white border border-black/5 rounded-xl shadow-xl p-3 min-w-[200px]">
            {user ? (
              <div className="space-y-2">
                {/* User info */}
                <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
                    {userInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {user.displayName || user.email}
                    </div>
                    {accountPlan && (
                      <div className="text-xs text-gray-500">
                        {accountPlan}
                        {accountExpiry && <span className="ml-1">(exp {accountExpiry})</span>}
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