import Navigation from "@/components/Navigation";
import FooterSection from "@/components/FooterSection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Target, Shield, Users, Lightbulb, Award, TrendingUp, Globe, Zap, CheckCircle } from "lucide-react";
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
    { number: "1M+", label: "Meals Planned" },
    { number: "95%", label: "User Satisfaction" },
    { number: "24/7", label: "AI Support" }
  ];

  const team = [
    {
      name: "Dr. Sarah Chen",
      role: "Chief Nutrition Officer",
      bio: "PhD in Nutritional Sciences with 15+ years of clinical experience"
    },
    {
      name: "Marcus Rodriguez",
      role: "Head of AI",
      bio: "Former Google AI researcher specializing in health and wellness applications"
    },
    {
      name: "Emily Johnson",
      role: "Product Design Lead",
      bio: "UX designer focused on making health technology accessible and delightful"
    },
    {
      name: "David Kim",
      role: "Engineering Director",
      bio: "Full-stack engineer passionate about building scalable health solutions"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-background">
      <Navigation />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-transparent to-purple-500/10"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-purple-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Heart className="w-4 h-4" />
                About Our Mission
              </div>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-green-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
                About Aliva
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                We believe better nutrition should be accessible, delightful, and deeply personal.
                Aliva blends AI with expert guidance to help you discover healthier choices, plan meals,
                and build lasting habits—without friction.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Badge variant="secondary" className="px-4 py-2 bg-green-100 text-green-800">
                  <Award className="w-4 h-4 mr-2" />
                  AI-Powered
                </Badge>
                <Badge variant="outline" className="px-4 py-2 border-purple-200 text-purple-700">
                  <Shield className="w-4 h-4 mr-2" />
                  Privacy-First
                </Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gradient-to-r from-green-50/50 to-purple-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-muted-foreground font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Empower every person to eat well with confidence and convenience. We're building the future
                  of personalized nutrition, where AI meets human expertise to create truly individualized
                  health experiences.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Evidence-Based Approach</h3>
                      <p className="text-muted-foreground">All recommendations grounded in scientific research and clinical expertise</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Personalized Experience</h3>
                      <p className="text-muted-foreground">AI that adapts to your unique needs, preferences, and health goals</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Privacy & Security</h3>
                      <p className="text-muted-foreground">Your health data is protected with enterprise-grade security</p>
                    </div>
                  </div>
                </div>
                <div className="mt-8">
                  <Button
                    onClick={() => navigate('/privacy')}
                    variant="outline"
                    className="border-green-200 text-green-700 hover:bg-green-50"
                  >
                    Learn About Our Privacy Policy
                  </Button>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-green-100 to-purple-100 rounded-2xl p-8">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Heart className="w-12 h-12 text-primary-foreground" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-4">Making Health Accessible</h3>
                    <p className="text-muted-foreground">
                      We're democratizing access to expert nutrition guidance, making it available
                      to everyone, everywhere, at any time.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-gradient-to-r from-green-50/30 to-purple-50/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-purple-600 bg-clip-text text-transparent">Our Values</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                These principles guide everything we do, from product development to user support.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <value.icon className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-4">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-purple-600 bg-clip-text text-transparent">What We're Building</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                The modern nutrition companion for everyday life, powered by AI and human expertise.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="border-0 shadow-lg">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                        <p className="text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-12">
              <Button
                onClick={() => navigate('/dashboard')}
                size="lg"
                className="bg-gradient-to-r from-green-600 to-purple-600 hover:from-green-700 hover:to-purple-700 text-white"
              >
                Explore Our Features
              </Button>
            </div>
          </div>
        </section>


        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-green-600 to-purple-600 text-white">
              <CardContent className="p-12">
                <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Nutrition?</h2>
                <p className="text-xl mb-8 opacity-90">
                  Join thousands of users who are already making healthier choices with Aliva's AI-powered guidance.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="bg-card text-green-600 hover:bg-muted"
                    onClick={() => navigate(user ? '/dashboard' : '/auth')}
                  >
                    {user ? 'Dashboard' : 'Get Started Free'}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-primary text-primary-foreground hover:bg-card hover:text-green-600"
                    onClick={() => navigate('/contact')}
                  >
                    Learn More
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


