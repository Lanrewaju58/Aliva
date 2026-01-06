import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  const features = [
    "AI-powered meal recommendations",
    "Personalized nutrition tracking",
    "Smart restaurant discovery"
  ];

  return (
    <section id="home" className="sticky top-0 min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-dark via-primary-dark to-primary-dark/90" />

      {/* Gradient orbs for depth */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

      {/* Content */}
      <div className="relative z-10 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-white/10">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>Trusted by 100+ users</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1] tracking-tight">
                Your AI-Powered
                <span className="block mt-2">
                  <span className="relative">
                    Nutrition
                    <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 8C50 2 150 2 198 8" stroke="rgba(255,255,255,0.3)" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                  </span>
                  {" "}Partner
                </span>
              </h1>

              {/* Description */}
              <p className="mt-6 text-lg sm:text-xl text-white/80 leading-relaxed max-w-lg">
                Get personalized meal plans, track your nutrition effortlessly, and achieve your health goals with intelligent AI guidance.
              </p>

              {/* Feature list */}
              <div className="mt-8 space-y-3">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 text-white/80 transition-all duration-700`}
                    style={{ transitionDelay: `${200 + index * 100}ms` }}
                  >
                    <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="h-14 px-8 rounded-xl bg-white text-primary hover:bg-white/95 font-semibold text-base shadow-xl hover:shadow-2xl transition-all duration-200"
                  onClick={handleGetStarted}
                >
                  {user ? 'Go to Dashboard' : 'Start Free Trial'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  className="h-14 px-8 rounded-xl text-white border border-white/20 hover:bg-white/10 transition-all duration-200 font-medium text-base"
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Play className="w-4 h-4 mr-2" />
                  See How It Works
                </Button>
              </div>

              {/* Social proof */}
              <div className="mt-12 pt-8 border-t border-white/10">
                <div className="flex items-center gap-6">
                  {/* Avatar stack */}
                  <div className="flex -space-x-3">
                    <img
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face"
                      alt="User"
                      className="w-10 h-10 rounded-full border-2 border-primary object-cover"
                    />
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face"
                      alt="User"
                      className="w-10 h-10 rounded-full border-2 border-primary object-cover"
                    />
                    <img
                      src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face"
                      alt="User"
                      className="w-10 h-10 rounded-full border-2 border-primary object-cover"
                    />
                    <img
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face"
                      alt="User"
                      className="w-10 h-10 rounded-full border-2 border-primary object-cover"
                    />
                    <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-primary flex items-center justify-center text-white text-xs font-medium backdrop-blur-sm">
                      +1K
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-white/60 text-sm">Rated 4.9/5 from 2,000+ reviews</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Stats Cards */}
            <div className={`hidden lg:block transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="relative">
                {/* Main stats card */}
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                  <div className="text-center mb-8">
                    <p className="text-white/60 text-sm mb-2">Daily users achieving their goals</p>
                    <p className="text-6xl font-bold text-white">95%</p>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white/80 text-sm">Meals Tracked</span>
                        <span className="text-white font-semibold">10.4k</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-white/60 rounded-full" style={{ width: '85%' }} />
                      </div>
                    </div>

                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white/80 text-sm">AI Recommendations</span>
                        <span className="text-white font-semibold">7k</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-green-400/60 rounded-full" style={{ width: '72%' }} />
                      </div>
                    </div>

                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white/80 text-sm">Healthy Restaurants Found</span>
                        <span className="text-white font-semibold">50K+</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-400/60 rounded-full" style={{ width: '65%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating cards */}
                <div className="absolute -top-6 -right-6 bg-white rounded-2xl p-4 shadow-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Goal reached!</p>
                      <p className="font-semibold text-gray-900 text-sm">2,000 cal today</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -left-6 bg-white rounded-2xl p-4 shadow-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-lg">🔥</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Current streak</p>
                      <p className="font-semibold text-gray-900 text-sm">14 days</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;