import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Check, Crown, X, ArrowRight, Shield, Zap, Users, Star, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import FooterSection from "@/components/FooterSection";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { profileService } from "@/services/profileService";
import { UserProfile } from "@/types/profile";

const Upgrade = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.uid) {
        setProfile(null);
        return;
      }
      try {
        const userProfile = await profileService.getProfile(user.uid);
        setProfile(userProfile);
      } catch (error) {
        console.error('Error loading profile:', error);
        setProfile(null);
      }
    };
    loadProfile();
  }, [user]);

  const handleUpgrade = async (planType: string) => {
    try {
      setLoading(true);
      const interval = 'monthly';
      if (!user?.email) {
        toast({
          title: 'Sign in required',
          description: 'Please sign in to continue with payment.',
          variant: 'destructive'
        });
        navigate('/auth');
        return;
      }

      const normalizedPlan = planType.toUpperCase();
      const apiBase = (import.meta.env.VITE_API_BASE_URL?.includes('localhost') && import.meta.env.PROD) ? '' : (import.meta.env.VITE_API_BASE_URL || '');
      const response = await fetch(`${apiBase}/api/payments/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: normalizedPlan,
          interval,
          customerEmail: user.email,
          userId: user.uid
        })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to start checkout');
      }

      const data = await response.json();
      if (data?.authorizationUrl) {
        localStorage.setItem('upgrade_plan_intent', JSON.stringify({
          plan: planType,
          interval,
          reference: data.reference,
          ts: Date.now()
        }));
        window.location.assign(data.authorizationUrl);
        return;
      }

      toast({
        title: 'Payment initialized',
        description: 'Redirecting to Paystack...',
      });
    } catch (error: any) {
      toast({
        title: 'Payment error',
        description: error?.message || 'Unable to start checkout. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const currentPlan = profile?.plan || 'FREE';
  const isPro = currentPlan === 'PRO';

  const proFeatures = [
    { title: "Unlimited AI Consultations", desc: "Ask anything, anytime" },
    { title: "Personalized Meal Plans", desc: "Tailored to your goals" },
    { title: "AI Photo Food Scanning", desc: "Instant nutrition info" },
    { title: "Mindfulness Studio", desc: "Breathing exercises & meditation" },
    { title: "Advanced Tracking", desc: "Detailed analytics" },
    { title: "Restaurant Recommendations", desc: "Find healthy options nearby" },
    { title: "Priority Support", desc: "Get help when you need it" },
    { title: "1-on-1 Nutritionist Access", desc: "Expert guidance" },
  ];

  const comparisonFeatures = [
    { name: "AI nutrition advice", free: "5/month", pro: "Unlimited" },
    { name: "Recipe recommendations", free: "5/month", pro: "Unlimited" },
    { name: "Meal planning", free: "Basic", pro: "Advanced" },
    { name: "Photo food scanning", free: false, pro: true },
    { name: "Mindfulness Studio", free: false, pro: true },
    { name: "Nutritionist access", free: false, pro: true },
    { name: "Priority support", free: false, pro: true },
    { name: "Restaurant finder", free: false, pro: true },
    { name: "Analytics dashboard", free: "Basic", pro: "Advanced" },
    { name: "Monday Pro Access", free: true, pro: true },
  ];

  const testimonials = [
    { name: "Sarah M.", role: "Lost 12kg", text: "The personalized meal plans changed everything. Worth every naira!" },
    { name: "James O.", role: "Fitness Coach", text: "I recommend Aliva Pro to all my clients. The AI is incredibly accurate." },
    { name: "Chioma A.", role: "Busy Professional", text: "The restaurant finder saves me so much time finding healthy options." },
  ];

  return (
    <div className="min-h-screen bg-background">

      {/* Hero Section with Gradient */}
      <section className="relative pt-12 pb-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-primary/90" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6 border border-white/20">
            <Crown className="w-4 h-4" />
            Unlock Premium Features
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Transform Your Health<br />
            <span className="text-white/80">With Aliva Pro</span>
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-8">
            Join thousands of users who've achieved their nutrition goals with personalized AI guidance
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-white/60 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>Instant Access</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>1,000+ Users</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Free Plan */}
          <div className="bg-card border border-border rounded-2xl p-8 relative">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-1">Free</h3>
              <p className="text-muted-foreground text-sm">Get started with the basics</p>
            </div>

            <div className="mb-8">
              <span className="text-5xl font-bold text-foreground">₦0</span>
              <span className="text-muted-foreground ml-2">forever</span>
            </div>

            <Button
              variant="outline"
              className="w-full h-12 mb-8"
              disabled
            >
              {currentPlan === 'FREE' ? 'Current Plan' : 'Free Plan'}
            </Button>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                  <Check className="w-3 h-3 text-muted-foreground" />
                </div>
                <span className="text-foreground">5 AI consultations/month</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                  <Check className="w-3 h-3 text-muted-foreground" />
                </div>
                <span className="text-foreground">Basic meal planning</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                  <Check className="w-3 h-3 text-muted-foreground" />
                </div>
                <span className="text-foreground">Community access</span>
              </div>
              <div className="flex items-center gap-3 opacity-40">
                <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                  <X className="w-3 h-3 text-muted-foreground" />
                </div>
                <span className="text-muted-foreground line-through">Mindfulness Studio</span>
              </div>
              <div className="flex items-center gap-3 opacity-40">
                <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                  <X className="w-3 h-3 text-muted-foreground" />
                </div>
                <span className="text-muted-foreground line-through">Nutritionist access</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                  <Check className="w-3 h-3 text-muted-foreground" />
                </div>
                <span className="text-foreground">Free Pro every Monday</span>
              </div>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-primary/50 to-primary rounded-2xl blur-lg opacity-30" />

            <div className="relative bg-gradient-to-br from-primary to-primary/90 rounded-2xl p-8 text-white overflow-hidden">
              {/* Pattern */}
              <div className="absolute inset-0 opacity-5" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='20' cy='20' r='2'/%3E%3C/g%3E%3C/svg%3E")`,
              }} />

              {/* Popular badge */}
              <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                Most Popular
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Pro</h3>
                    <p className="text-white/70 text-sm">Everything unlimited</p>
                  </div>
                </div>

                <div className="mb-8">
                  <span className="text-5xl font-bold">₦6,500</span>
                  <span className="text-white/70 ml-2">/month</span>
                </div>

                <Button
                  className="w-full h-12 mb-8 bg-white text-primary hover:bg-white/90 font-semibold"
                  onClick={() => !isPro && handleUpgrade('Pro')}
                  disabled={isPro || loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </div>
                  ) : isPro ? (
                    'Current Plan'
                  ) : (
                    <>
                      Upgrade to Pro
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>

                <div className="space-y-4">
                  {proFeatures.slice(0, 5).map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <div>
                        <span className="text-white">{feature.title}</span>
                        <span className="text-white/50 text-sm ml-2">— {feature.desc}</span>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => document.getElementById('comparison')?.scrollIntoView({ behavior: 'smooth' })}
                    className="flex items-center gap-1 text-white/70 hover:text-white text-sm mt-2 transition-colors"
                  >
                    See all features <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Loved by Health Enthusiasts
          </h2>
          <p className="text-muted-foreground">See what our Pro users are saying</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-foreground mb-4">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-semibold">{t.name[0]}</span>
                </div>
                <div>
                  <div className="font-medium text-foreground">{t.name}</div>
                  <div className="text-sm text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Comparison */}
      <section id="comparison" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Compare Plans
          </h2>
          <p className="text-muted-foreground">Everything you get with Pro</p>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-3 bg-muted/50 p-4 border-b border-border">
            <div className="font-semibold text-foreground">Feature</div>
            <div className="text-center font-semibold text-muted-foreground">Free</div>
            <div className="text-center font-semibold text-primary">Pro</div>
          </div>

          {/* Rows */}
          {comparisonFeatures.map((feature, i) => (
            <div key={i} className="grid grid-cols-3 p-4 border-b border-border last:border-b-0 items-center">
              <div className="text-foreground">{feature.name}</div>
              <div className="text-center">
                {typeof feature.free === 'boolean' ? (
                  feature.free ? (
                    <Check className="w-5 h-5 text-primary mx-auto" />
                  ) : (
                    <X className="w-5 h-5 text-muted-foreground/50 mx-auto" />
                  )
                ) : (
                  <span className="text-muted-foreground">{feature.free}</span>
                )}
              </div>
              <div className="text-center">
                {typeof feature.pro === 'boolean' ? (
                  feature.pro ? (
                    <Check className="w-5 h-5 text-primary mx-auto" />
                  ) : (
                    <X className="w-5 h-5 text-muted-foreground/50 mx-auto" />
                  )
                ) : (
                  <span className="text-primary font-medium">{feature.pro}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button
            size="lg"
            className="h-12 px-8"
            onClick={() => !isPro && handleUpgrade('Pro')}
            disabled={isPro || loading}
          >
            {isPro ? 'You\'re on Pro!' : 'Get Started with Pro'}
            {!isPro && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
          <p className="text-sm text-muted-foreground mt-3">
            Secure payment via Paystack
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Health?
          </h2>
          <p className="text-white/70 text-lg mb-8">
            Join 1,000+ users who've upgraded their nutrition journey with Aliva Pro
          </p>
          <Button
            size="lg"
            className="h-14 px-10 bg-white text-primary hover:bg-white/90 font-semibold text-lg"
            onClick={() => !isPro && handleUpgrade('Pro')}
            disabled={isPro || loading}
          >
            {isPro ? 'You\'re Already Pro!' : 'Start Your Pro Journey'}
            {!isPro && <Crown className="w-5 h-5 ml-2" />}
          </Button>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default Upgrade;