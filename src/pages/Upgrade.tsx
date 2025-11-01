import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Sparkles, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import FooterSection from "@/components/FooterSection";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Upgrade = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const { user } = useAuth();

  const handleUpgrade = async (planType: string) => {
    try {
      const interval = selectedPlan === 'monthly' ? 'monthly' : 'yearly';
      if (!user?.email) {
        toast({
          title: 'Sign in required',
          description: 'Please sign in to continue with payment.',
          variant: 'destructive'
        });
        navigate('/auth');
        return;
      }

      const apiBase = import.meta.env.VITE_API_BASE_URL || '';
      const response = await fetch(`${apiBase}/api/payments/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          plan: planType,
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
        // Mark intent so we can activate plan on return
        localStorage.setItem('upgrade_plan_intent', JSON.stringify({ plan: planType, interval, ts: Date.now() }));
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

  const plans = [
    {
      name: "Free",
      price: selectedPlan === 'monthly' ? "$0" : "$0",
      period: "forever",
      description: "Perfect for getting started",
      features: [
        "Basic AI nutrition advice",
        "5 recipe recommendations/month",
        "Community support",
        "Basic meal planning",
      ],
      buttonText: "Current Plan",
      buttonVariant: "outline" as const,
      icon: Sparkles,
    },
    {
      name: "Premium",
      price: selectedPlan === 'monthly' ? "₦19,990" : "₦99,999",
      period: selectedPlan === 'monthly' ? "/month" : "/year",
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
      ],
      buttonText: "Upgrade to Premium",
      buttonVariant: "default" as const,
      icon: Crown,
      savings: selectedPlan === 'yearly' ? null : null,
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

          <div className="inline-flex items-center justify-center rounded-full bg-card border border-border p-1 shadow-lg">
            <button
              onClick={() => setSelectedPlan('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                selectedPlan === 'monthly'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setSelectedPlan('yearly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                selectedPlan === 'yearly'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Yearly
              <span className="ml-1 text-xs">(Save 17%)</span>
            </button>
          </div>
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
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    {plan.savings && (
                      <Badge variant="outline" className="text-xs">
                        {plan.savings}
                      </Badge>
                    )}
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
                    onClick={() => handleUpgrade(plan.name)}
                    disabled={plan.name === "Free"}
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