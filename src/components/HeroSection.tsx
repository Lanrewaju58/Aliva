import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, Sparkles, TrendingUp, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [currentWord, setCurrentWord] = useState(0);

  const rotatingWords = ["Smarter", "Personalized", "AI-Powered", "Effortless"];

  useEffect(() => {
    setIsVisible(true);
    
    // Rotate words
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % rotatingWords.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <section id="home" className="relative min-h-[84vh] md:min-h-[92vh] flex items-center justify-center overflow-hidden bg-primary bg-gradient-to-b from-primary/95 via-primary/90 to-primary pb-28 md:pb-40">
      {/* Subtle background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Grid overlay */}
        <div className="absolute inset-0 grid-overlay opacity-20" />
        
        {/* Subtle gradient orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-white/3 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-white/3 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-28 md:pt-36">
        {/* Badge */}
        <div 
          className={`inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm mb-6 border border-white/20 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Professional Nutrition Platform</span>
        </div>

        {/* Main heading with rotating word */}
        <h1 
          className={`text-4xl md:text-[64px] lg:text-[84px] font-bold text-white leading-[1.05] tracking-tight transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <span className="inline-block relative">
            <span 
              key={currentWord}
              className="inline-block animate-fade-in-up"
            >
              {rotatingWords[currentWord]}
            </span>
          </span>
          {" "}Nutrition
          <span className="block mt-2">Begins Here with Aliva</span>
        </h1>

        {/* Subheading */}
        <p 
          className={`mt-6 text-white/90 text-lg md:text-xl max-w-3xl mx-auto transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          Personalized nutrition guidance, meal tracking, and recipe discovery tailored to your health goals.
        </p>

        {/* CTA Buttons */}
        <div 
          className={`mt-8 md:mt-12 flex flex-row flex-wrap items-center justify-center gap-4 transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <Button 
            size="lg"
            className="rounded-full px-8 py-6 bg-white text-primary hover:bg-white/90 shadow-2xl hover:shadow-white/20 hover:scale-105 transition-all duration-300 font-semibold text-base"
            onClick={handleGetStarted}
          >
            <MessageCircle className="w-5 h-5 mr-2" /> 
            Get Started Free
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="rounded-full px-8 py-6 bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20 hover:border-white/50 transition-all duration-300 font-semibold text-base"
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Learn More
          </Button>
        </div>

        {/* Stats */}
        <div 
          className={`mt-16 md:mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="group">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mx-auto mb-4 group-hover:rotate-12 transition-transform duration-300">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">10K+</div>
              <div className="text-white/70 text-sm">Active Users</div>
            </div>
          </div>

          <div className="group">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mx-auto mb-4 group-hover:rotate-12 transition-transform duration-300">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">95%</div>
              <div className="text-white/70 text-sm">Success Rate</div>
            </div>
          </div>

          <div className="group">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mx-auto mb-4 group-hover:rotate-12 transition-transform duration-300">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">1M+</div>
              <div className="text-white/70 text-sm">Meals Tracked</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 md:h-40 bg-gradient-to-b from-transparent to-background" />

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;