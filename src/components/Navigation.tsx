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
  // Simplified quote display - no complex animation needed

  // No scroll/touch handlers needed since we're using simple quote display

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
          {/* Logo and Quotes */}
          <div className="flex items-center gap-3 shrink-0">
            <div 
              className="flex items-center cursor-pointer group"
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
            
            {/* Animated quotes - Right after logo */}
            <div className="hidden md:flex items-center text-sm sm:text-base md:text-lg lg:text-xl font-semibold">
              <span className={`text-[10px] xs:text-xs sm:text-sm md:text-base lg:text-lg font-semibold bg-gradient-to-r ${quotes[quoteIdx]?.g || 'from-primary to-secondary'} bg-clip-text text-transparent truncate max-w-full px-2`}>
                {`"${quotes[quoteIdx]?.t || 'Loading...'}"`}
              </span>
            </div>
          </div>

          {/* Spacer to push user section to the right */}
          <div className="flex-1"></div>

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

          {/* Mobile navigation */}
          <div className="lg:hidden flex items-center gap-0.5 sm:gap-1 shrink-0">
              {/* Theme toggle button for mobile */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </Button>
              
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