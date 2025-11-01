import { useState, useEffect } from "react";
import { 
  MessageSquare, 
  Sparkles, 
  MapPin, 
  Clock,
  Check
} from "lucide-react";
import LoginChat from "@/components/LoginChat";

const ChatPreviewSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [animateMessages, setAnimateMessages] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => setAnimateMessages(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const features = [
    { icon: MessageSquare, text: "Natural conversation" },
    { icon: Sparkles, text: "AI-powered suggestions" },
    { icon: MapPin, text: "Local restaurant finder" }
  ];

  return (
    <section className="mt-0 md:mt-0 -translate-y-0 pb-16 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-primary/5 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div 
          className={`group rounded-[28px] bg-card shadow-xl border-2 border-border p-4 sm:p-6 md:p-8 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          } hover:shadow-2xl hover:border-primary/30 hover:-translate-y-1`}
        >
          {/* Glow effect on hover */}
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-primary/10 rounded-[32px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            {/* Left side - Chat Interface */}
            <div className={`order-2 md:order-1 transition-all duration-700 delay-200 relative ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            }`}>
              {/* Floating stat cards */}
              <div className="absolute -top-4 -right-4 bg-white dark:bg-card rounded-xl px-3 py-2 shadow-lg border border-primary/20 animate-float z-10">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-xs font-bold text-foreground">Active</span>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-white dark:bg-card rounded-xl px-3 py-2 shadow-lg border border-primary/20 animate-float-delayed z-10">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-foreground">24/7 Available</span>
                </div>
              </div>

              {/* Your actual LoginChat component */}
              <div className="hover:shadow-xl transition-all duration-300">
                <LoginChat />
              </div>
            </div>

            {/* Right side - Content */}
            <div className={`order-1 md:order-2 transition-all duration-700 delay-400 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`}>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4 hover:bg-primary/20 transition-colors duration-200">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>AI-Powered Chat</span>
              </div>

              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Welcome to <span className="text-primary inline-block hover:scale-110 transition-transform duration-300 cursor-pointer">Aliva Chat</span>
              </h3>
              
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-6">
                Ask anything about how you feel, agree on a meal, and say
                <span className="font-bold text-primary inline-block mx-1 hover:scale-110 transition-transform duration-200">"find restaurants"</span> 
                to see nearby places instantly. Clean, simple, and built for healthy choices.
              </p>

              {/* Feature highlights - visual only */}
              <div className="space-y-3">
                {features.map((feature, i) => (
                  <div 
                    key={i}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-300 ${
                      hoveredFeature === i 
                        ? 'border-primary bg-primary/5 shadow-md translate-x-2' 
                        : 'border-border bg-card/50 hover:border-primary/30'
                    }`}
                    onMouseEnter={() => setHoveredFeature(i)}
                    onMouseLeave={() => setHoveredFeature(null)}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      hoveredFeature === i 
                        ? 'bg-primary text-primary-foreground shadow-lg scale-110' 
                        : 'bg-primary/10 text-primary'
                    }`}>
                      <feature.icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{feature.text}</span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground mt-4 italic">
                ← Use the chat interface to interact with Aliva
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 4s ease-in-out infinite;
          animation-delay: 0.7s;
        }
      `}</style>
    </section>
  );
};

export default ChatPreviewSection;