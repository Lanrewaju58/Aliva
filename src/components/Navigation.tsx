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
import { User, Settings, LogOut, Crown, Sun, Moon, ChevronDown, LayoutDashboard, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { profileService } from "@/services/profileService";

const Navigation = () => {
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
    const trxRef = params.get('trxref');

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
              const apiBase = import.meta.env.VITE_API_BASE_URL || '';
              const verifyResponse = await fetch(`${apiBase}/api/payments/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reference, userId: user.uid })
              });

              if (!verifyResponse.ok) {
                const error = await verifyResponse.json().catch(() => ({}));
                throw new Error(error.error || 'Payment verification failed');
              }

              const verifyData = await verifyResponse.json();

              if (!verifyData.verified || !verifyData.plan) {
                throw new Error('Payment verification unsuccessful');
              }

              const plan = verifyData.plan;
              const planExpiresAt = new Date(verifyData.planExpiresAt);

              await profileService.upsertProfile(user.uid, { plan, planExpiresAt });

              toast({
                title: 'Upgrade successful!',
                description: `${plan} plan activated. Expires on ${planExpiresAt.toLocaleDateString()}`
              });

              localStorage.removeItem('upgrade_plan_intent');

              const url = new URL(window.location.href);
              url.searchParams.delete('upgrade');
              url.searchParams.delete('trxref');
              window.history.replaceState({}, '', url.toString());
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
      } catch { }
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
      return name.trim().split(' ').map(part => part.charAt(0).toUpperCase()).slice(0, 2).join('');
    }
    if (email && email.trim()) {
      return email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const userInitials = getUserInitials(user?.displayName, user?.email);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAuthAction = () => {
    if (user) {
      signOut();
      toast({ title: "Signed out successfully", description: "See you next time!" });
    } else {
      navigate('/auth');
    }
  };

  const isPremiumUser = accountPlan === 'PRO';
  const isLandingPage = location.pathname === '/';

  // Navigation links for landing page
  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'About', href: '/about' },
    { label: 'Pricing', href: '/upgrade' },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className={`rounded-2xl transition-all duration-300 ${isScrolled
            ? 'bg-background/80 backdrop-blur-xl shadow-lg border border-border/50'
            : isLandingPage
              ? 'bg-primary/80 backdrop-blur-md'
              : 'bg-background/60 backdrop-blur-md border border-border/30'
            }`}>
            <div className="h-16 flex items-center justify-between px-6">
              {/* Logo */}
              <button
                onClick={() => {
                  if (location.pathname !== '/') {
                    navigate('/');
                  } else {
                    scrollToSection('home');
                  }
                }}
                className="flex items-center gap-2 group"
              >
                <img
                  src="/logo.svg"
                  alt="Aliva"
                  className="h-8 w-auto transition-transform group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />

              </button>

              {/* Center Navigation - Desktop */}
              <div className="hidden lg:flex items-center gap-1">
                {navLinks.map((link) => (
                  <button
                    key={link.label}
                    onClick={() => {
                      if (link.href.startsWith('#')) {
                        if (location.pathname !== '/') {
                          navigate('/' + link.href);
                        } else {
                          scrollToSection(link.href.slice(1));
                        }
                      } else {
                        navigate(link.href);
                      }
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isScrolled || !isLandingPage
                      ? 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                      }`}
                  >
                    {link.label}
                  </button>
                ))}
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-2">
                {/* Theme Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                  className={`rounded-full h-9 w-9 p-0 transition-all duration-200 ${isScrolled || !isLandingPage
                    ? 'hover:bg-muted text-foreground'
                    : 'hover:bg-white/10 text-white'
                    }`}
                  title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                  {theme === 'light' ? (
                    <Moon className="h-4 w-4" />
                  ) : (
                    <Sun className="h-4 w-4" />
                  )}
                </Button>

                {user ? (
                  <>

                    {/* User Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 rounded-full p-1 pr-2 transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/5">
                          <div className="relative">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ring-2 transition-all ${isPremiumUser
                              ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white ring-amber-300/50'
                              : isScrolled || !isLandingPage
                                ? 'bg-primary text-primary-foreground ring-primary/20'
                                : 'bg-white text-primary ring-white/30'
                              }`}>
                              {userInitials}
                            </div>
                            {isPremiumUser && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center shadow-sm">
                                <Crown className="w-2.5 h-2.5 text-white" />
                              </div>
                            )}
                          </div>
                          <ChevronDown className={`w-3.5 h-3.5 transition-colors ${isScrolled || !isLandingPage ? 'text-muted-foreground' : 'text-white/70'
                            }`} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 p-2">
                        <div className="px-2 py-3 mb-2 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${isPremiumUser
                              ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
                              : 'bg-primary text-primary-foreground'
                              }`}>
                              {userInitials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {user.displayName || 'User'}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {user.email}
                              </p>
                            </div>
                          </div>
                          {isPremiumUser && (
                            <div className="mt-3 flex items-center gap-2 px-2 py-1.5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-md border border-amber-500/20">
                              <Crown className="w-3.5 h-3.5 text-amber-500" />
                              <span className="text-xs font-medium text-amber-600">Pro Member</span>
                            </div>
                          )}
                        </div>

                        <DropdownMenuItem
                          onClick={() => navigate('/profile')}
                          className="cursor-pointer rounded-lg h-10"
                        >
                          <Settings className="w-4 h-4 mr-3 text-muted-foreground" />
                          Settings
                        </DropdownMenuItem>

                        {!isPremiumUser && (
                          <>
                            <DropdownMenuSeparator className="my-2" />
                            <DropdownMenuItem
                              onClick={() => navigate('/upgrade')}
                              className="cursor-pointer rounded-lg h-10 bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20"
                            >
                              <Sparkles className="w-4 h-4 mr-3 text-amber-500" />
                              <span className="text-amber-600 font-medium">Upgrade to Pro</span>
                            </DropdownMenuItem>
                          </>
                        )}

                        <DropdownMenuSeparator className="my-2" />
                        <DropdownMenuItem
                          onClick={handleAuthAction}
                          className="cursor-pointer rounded-lg h-10 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Sign Out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/auth')}
                      className={`hidden sm:flex rounded-lg h-9 px-4 font-medium transition-all duration-200 ${isScrolled || !isLandingPage
                        ? 'text-foreground hover:bg-muted'
                        : 'text-white hover:bg-white/10'
                        }`}
                    >
                      Sign In
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => navigate('/auth')}
                      className={`rounded-lg h-9 px-4 font-medium shadow-lg transition-all duration-200 ${isScrolled || !isLandingPage
                        ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                        : 'bg-white hover:bg-white/95 text-primary'
                        }`}
                    >
                      Get Started
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav >

      {/* Spacer */}
      < div className="h-24" />
    </>
  );
};

export default Navigation;