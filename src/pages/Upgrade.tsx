import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Check, Sparkles, Crown, X, ArrowRight, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
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

  // Load user profile to check current plan
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
      const apiBase = import.meta.env.VITE_API_BASE_URL || '';
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

  const freeFeatures = [
    "Basic AI nutrition advice",
    "5 recipe recommendations/month",
    "Community support",
    "Basic meal planning"
  ];

  const proFeatures = [
    "Unlimited AI consultations",
    "Unlimited recipe recommendations",
    "Personalized meal plans",
    "Priority support",
    "Advanced nutrition tracking",
    "Restaurant recommendations",

    "1-on-1 nutritionist access",
    "Custom diet plans",
    "Meal calendar export",
    "AI photo food scanning"
  ];

  const freeExcluded = [
    "Unlimited consultations",
    "Personalized plans",
    "Priority support"
  ];

  const faqs = [
    { q: "Can I cancel anytime?", a: "Yes, you can cancel your subscription at any time. Your access continues until the end of your billing period." },
    { q: "What payment methods do you accept?", a: "We accept all major cards (Visa, Mastercard, Verve) and bank transfers via Paystack." },
    { q: "Is my payment secure?", a: "Absolutely. All payments are processed securely through Paystack with bank-level encryption." }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-8 pb-20">
        {/* Hero Section */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Pricing Plans
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Choose Your Plan
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Unlock premium features and take your nutrition journey to the next level with personalized guidance.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Free Plan */}
            <Card className="border-border bg-card relative overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <span className="text-sm font-semibold text-muted-foreground">Free</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">Free</h3>
                    <p className="text-sm text-muted-foreground">Perfect for getting started</p>
                  </div>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">$0</span>
                  <span className="text-muted-foreground ml-1">forever</span>
                </div>

                <Button
                  variant="outline"
                  className="w-full h-11 mb-6"
                  disabled
                >
                  {currentPlan === 'FREE' ? 'Current Plan' : 'Free Plan'}
                </Button>

                <div className="space-y-3 mb-6">
                  {freeFeatures.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-border space-y-3">
                  {freeExcluded.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3 opacity-50">
                      <X className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-primary bg-card relative overflow-hidden shadow-lg">
              {/* Popular badge */}
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-bl-lg">
                Most Popular
              </div>

              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">Pro</h3>
                    <p className="text-sm text-muted-foreground">Unlock all premium features</p>
                  </div>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">₦6,500</span>
                  <span className="text-muted-foreground ml-1">/month</span>
                </div>

                <Button
                  className="w-full h-11 mb-6"
                  onClick={() => !isPro && handleUpgrade('Pro')}
                  disabled={isPro || loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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

                <div className="space-y-3">
                  {proFeatures.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-2">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">Have questions? We've got answers.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <Card key={i} className="border-border">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-foreground mb-1">{faq.q}</h4>
                      <p className="text-sm text-muted-foreground">{faq.a}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-muted-foreground mb-4">Still have questions?</p>
            <Button variant="outline" onClick={() => navigate('/contact')}>
              Contact Support
            </Button>
          </div>
        </section>
      </main>

      <FooterSection />
    </div>
  );
};

export default Upgrade;