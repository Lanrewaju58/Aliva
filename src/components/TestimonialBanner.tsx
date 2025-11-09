import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Sparkles, TrendingUp, Award } from "lucide-react";

const TestimonialBanner = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [count, setCount] = useState(0);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  useEffect(() => {
    setIsVisible(true);
    
    // Animate the percentage counter
    const duration = 2000;
    const steps = 60;
    const increment = 92 / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= 92) {
        setCount(92);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, []);

  const handleTryAliva = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <section className="py-16 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-primary/10 rounded-full blur-3xl animate-float-delayed" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Stats Card */}
          <div 
            className={`group rounded-[28px] bg-card shadow-xl border-2 border-border p-8 flex flex-col justify-between transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            } hover:shadow-2xl hover:border-primary/30 hover:-translate-y-2`}
            onMouseEnter={() => setHoveredCard(0)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* Glow effect on hover */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-primary/10 rounded-[32px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10" />

            <div>
              {/* Floating badge */}
              <div className={`inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 transition-all duration-300 ${
                hoveredCard === 0 ? 'scale-110' : ''
              }`}>
                <Award className="w-4 h-4" />
                <span>User Success Rate</span>
              </div>

              {/* Animated counter */}
              <div className="relative">
                <div className={`text-6xl md:text-7xl font-bold bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent mb-6 transition-all duration-500 ${
                  hoveredCard === 0 ? 'scale-110' : ''
                }`}>
                  {count}%
                </div>
                
                {/* Sparkle animation on hover */}
                {hoveredCard === 0 && (
                  <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-primary animate-pulse" />
                )}
              </div>

              <p className="text-muted-foreground text-lg max-w-md leading-relaxed">
                of users say Aliva helps them make smarter, faster, and more efficient food decisions.
              </p>

              {/* Feature highlights */}
              <div className="mt-6 space-y-2">
                {['Smarter choices', 'Faster decisions', 'Better results'].map((item, i) => (
                  <div 
                    key={i}
                    className={`flex items-center gap-2 text-sm text-muted-foreground transition-all duration-300 ${
                      isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                    }`}
                    style={{ transitionDelay: `${400 + i * 100}ms` }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <button 
              className="group/btn mt-8 h-12 px-6 rounded-full bg-gradient-to-b from-primary/90 to-primary text-white font-medium w-max transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 hover:scale-105 active:scale-95 flex items-center gap-2"
              onClick={handleTryAliva}
            >
              <span>Try Aliva Today</span>
              <TrendingUp className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </button>
          </div>

          {/* Testimonial Card */}
          <div 
            className={`group rounded-[28px] overflow-hidden shadow-xl border-2 border-border transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            } hover:shadow-2xl hover:border-primary/30 hover:-translate-y-2`}
            onMouseEnter={() => setHoveredCard(1)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="h-full w-full bg-[url('https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-700 group-hover:scale-110">
              <div className={`h-full w-full bg-black/30 group-hover:bg-black/40 transition-all duration-700 p-8 flex flex-col justify-between`}>
                {/* Quote icon */}
                <div className="text-white/60 text-6xl font-serif leading-none transition-all duration-300 group-hover:text-white/80 group-hover:scale-110 origin-top-left">
                  "
                </div>

                {/* Quote text */}
                <div className="space-y-4">
                  <p className={`text-white text-2xl md:text-3xl leading-snug max-w-2xl transition-all duration-500 ${
                    hoveredCard === 1 ? 'translate-x-2' : ''
                  }`}>
                    Aliva has transformed how I approach nutrition. The personalized recommendations and meal tracking make healthy eating effortless.
                  </p>

                  {/* Author info with animation */}
                  <div className={`flex items-center gap-3 transition-all duration-500 ${
                    hoveredCard === 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}>
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 animate-pulse" />
                    <div>
                      <div className="text-white font-semibold">Sarah M.</div>
                      <div className="text-white/70 text-sm">Health Enthusiast</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 6s ease-in-out infinite;
          animation-delay: 1s;
        }
      `}</style>
    </section>
  );
};

export default TestimonialBanner;