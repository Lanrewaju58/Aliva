import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Check, Sparkles, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
      const interval = 'monthly'; // Monthly billing
      if (!user?.email) {
        toast({
          title: 'Sign in required',
          description: 'Please sign in to continue with payment.',
          variant: 'destructive'
        });
        navigate('/auth');
        return;
      }

      // Normalize plan name: "Premium" -> "PREMIUM"
      const normalizedPlan = planType.toUpperCase();
      
      // Debug logging
      console.log('💳 Upgrade request:', { planType, normalizedPlan, interval });

      const apiBase = import.meta.env.VITE_API_BASE_URL || '';
      const response = await fetch(`${apiBase}/api/payments/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
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
        // Mark intent with reference so we can verify and activate plan on return
        localStorage.setItem('upgrade_plan_intent', JSON.stringify({ 
          plan: planType, 
          interval, 
          reference: data.reference,
          ts: Date.now() 
        }));
        window.location.assign(data.authorizationUrl);
        return;
      }

      // Fallback if URL not present
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
    }
  };

  // Determine current plan
  const currentPlan = profile?.plan || 'FREE';
  const isPro = currentPlan === 'PRO';

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started",
      features: [
        "Basic AI nutrition advice",
        "5 recipe recommendations/month",
        "Community support",
        "Basic meal planning",
      ],
      buttonText: currentPlan === 'FREE' ? "Current Plan" : "Downgrade to Free",
      buttonVariant: "outline" as const,
      icon: Sparkles,
      isCurrentPlan: currentPlan === 'FREE',
    },
    {
      name: "Pro",
      price: "₦6,500",
      period: "monthly",
      description: "Unlock all premium features",
      popular: true,
      features: [
        "Unlimited AI consultations",
        "Unlimited recipe recommendations",
        "Personalized meal plans",
        "Priority support",
        "Advanced nutrition tracking",
        "Restaurant recommendations",
        "Progress analytics",
        "Family accounts (up to 5 members)",
        "1-on-1 nutritionist consultations",
        "Custom diet plans",
        "Meal calendar export & download",
        "AI-powered photo food scanning",
      ],
      buttonText: isPro ? "Current Plan" : "Upgrade to Pro",
      buttonVariant: isPro ? "outline" as const : "default" as const,
      icon: Crown,
      isCurrentPlan: isPro,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background">
      <Navigation />

      <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <Badge className="mb-4" variant="secondary">
            <Sparkles className="w-3 h-3 mr-1" />
            Upgrade Your Experience
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Unlock premium features and take your nutrition journey to the next level
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card
                key={plan.name}
                className={`relative transition-all hover:shadow-xl ${
                  plan.popular
                    ? 'border-primary shadow-lg scale-105'
                    : 'border-black/5'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader>
                  <div className="mb-2">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground ml-1">{plan.period}</span>
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    variant={plan.buttonVariant}
                    className="w-full"
                    onClick={() => plan.isCurrentPlan ? undefined : handleUpgrade(plan.name)}
                    disabled={plan.isCurrentPlan || plan.name === "Free"}
                  >
                    {plan.buttonText}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">
            Have questions about our plans?
          </p>
          <Button variant="outline" onClick={() => navigate('/contact')}>
            Contact Support
          </Button>
        </div>
      </div>

      <FooterSection />
    </div>
  );
};

export default Upgrade;