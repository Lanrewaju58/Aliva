import Navigation from "@/components/Navigation";
import FooterSection from "@/components/FooterSection";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Target, Shield, Users, Lightbulb, Globe, TrendingUp, Zap, CheckCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const About = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const values = [
    {
      icon: Heart,
      title: "User-Centric",
      description: "Every feature is designed with your health and happiness in mind"
    },
    {
      icon: Shield,
      title: "Privacy-First",
      description: "Your data is yours. We never sell or misuse your personal information"
    },
    {
      icon: Target,
      title: "Evidence-Based",
      description: "All recommendations are grounded in scientific research and expert knowledge"
    },
    {
      icon: Users,
      title: "Inclusive",
      description: "Nutrition guidance that works for everyone, regardless of background or dietary needs"
    }
  ];

  const features = [
    {
      icon: Lightbulb,
      title: "AI-Powered Recommendations",
      description: "Personalized nutrition advice that adapts to your unique needs and preferences"
    },
    {
      icon: Globe,
      title: "Restaurant Discovery",
      description: "Find healthy dining options near you with detailed nutritional information"
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Monitor your health journey with insightful analytics and goal tracking"
    },
    {
      icon: Zap,
      title: "Real-Time Guidance",
      description: "Get instant answers to your nutrition questions whenever you need them"
    }
  ];

  const stats = [
    { number: "50K+", label: "Active Users" },
    { number: "10k", label: "Meals Planned" },
    { number: "95%", label: "User Satisfaction" },
    { number: "24/7", label: "AI Support" }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="section-padding-lg bg-gradient-to-b from-primary/5 to-background">
          <div className="container-tight text-center">
            <h1 className="text-foreground mb-6">
              About Aliva
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              We believe better nutrition should be accessible, delightful, and deeply personal.
              Aliva blends AI with expert guidance to help you discover healthier choices, plan meals,
              and build lasting habits—without friction.
            </p>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 border-y border-border bg-muted/30">
          <div className="container-wide">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
                    {stat.number}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="section-padding">
          <div className="container-wide">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <h2 className="text-foreground mb-6">Our Mission</h2>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Empower every person to eat well with confidence and convenience. We're building the future
                  of personalized nutrition, where AI meets human expertise to create truly individualized
                  health experiences.
                </p>
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Evidence-Based Approach</h4>
                      <p className="text-sm text-muted-foreground">All recommendations grounded in scientific research and clinical expertise</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Personalized Experience</h4>
                      <p className="text-sm text-muted-foreground">AI that adapts to your unique needs, preferences, and health goals</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Privacy & Security</h4>
                      <p className="text-sm text-muted-foreground">Your health data is protected with enterprise-grade security</p>
                    </div>
                  </div>
                </div>
                <div className="mt-8">
                  <Button
                    onClick={() => navigate('/privacy')}
                    variant="outline"
                    className="rounded-lg"
                  >
                    Learn About Our Privacy Policy
                  </Button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-10 text-center border border-primary/10">
                <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-10 h-10 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">Making Health Accessible</h3>
                <p className="text-muted-foreground">
                  We're democratizing access to expert nutrition guidance, making it available
                  to everyone, everywhere, at any time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="section-padding bg-muted/30">
          <div className="container-wide">
            <div className="text-center mb-12">
              <h2 className="text-foreground mb-4">Our Values</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                These principles guide everything we do, from product development to user support.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <Card key={index} className="border-border hover:border-primary/30 transition-colors duration-200">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-5">
                      <value.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h4 className="text-lg font-semibold text-foreground mb-2">{value.title}</h4>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="section-padding">
          <div className="container-wide">
            <div className="text-center mb-12">
              <h2 className="text-foreground mb-4">What We're Building</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                The modern nutrition companion for everyday life, powered by AI and human expertise.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="border-border">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                        <feature.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h4>
                        <p className="text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-10">
              <Button
                onClick={() => navigate('/dashboard')}
                size="lg"
                className="rounded-full px-8"
              >
                Explore Our Features
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section-padding">
          <div className="container-tight text-center">
            <Card className="p-12 md:p-16 bg-muted/30 text-foreground border border-border shadow-xl relative overflow-hidden">
              <CardContent className="p-10 md:p-14">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Nutrition?</h2>
                <p className="text-lg mb-8 text-muted-foreground max-w-xl mx-auto">
                  Join thousands of users who are already making healthier choices with Aliva's AI-powered guidance.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="bg-white text-primary hover:bg-white/90 rounded-full px-8"
                    onClick={() => navigate(user ? '/dashboard' : '/auth')}
                  >
                    {user ? 'Go to Dashboard' : 'Get Started Free'}
                  </Button>
                  <Button
                    variant="default"
                    className="h-12 px-8 rounded-lg transition-all duration-200"
                    onClick={() => navigate('/contact')}
                  >
                    Contact Us
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <FooterSection />
    </div>
  );
};

export default About;
