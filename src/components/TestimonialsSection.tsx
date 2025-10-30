import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Star, Quote, Sparkles } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Busy Professional",
    content: "Aliva has completely transformed how I approach eating. The AI consultant gives me personalized advice that actually fits my hectic schedule. I've lost 15 pounds and feel more energetic than ever!",
    rating: 5,
    avatar: "SJ"
  },
  {
    name: "Michael Chen",
    role: "Fitness Enthusiast",
    content: "As someone who's tried every diet app out there, this is different. The restaurant recommendations with nutritional analysis are spot-on, and the meal planning feature saves me hours every week.",
    rating: 5,
    avatar: "MC"
  },
  {
    name: "Emily Rodriguez",
    role: "Working Mom",
    content: "Finally, a nutrition app that understands real life! The AI helps me find healthy options when I'm dining out with my kids, and the quick recipe suggestions are perfect for busy weeknights.",
    rating: 5,
    avatar: "ER"
  }
];

const TestimonialsSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [animatedStars, setAnimatedStars] = useState<boolean[]>([false, false, false, false, false]);

  useEffect(() => {
    setIsVisible(true);
    
    // Animate stars sequentially
    animatedStars.forEach((_, index) => {
      setTimeout(() => {
        setAnimatedStars(prev => {
          const next = [...prev];
          next[index] = true;
          return next;
        });
      }, 2000 + index * 100);
    });
  }, []);

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/20 relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-32 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-32 right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-primary/5 rounded-full blur-2xl animate-float" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 hover:scale-105 transition-transform duration-300">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>Testimonials</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Loved by Thousands of
            <span className="block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mt-2 animate-gradient">
              Health-Conscious People
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            See how Aliva is helping people achieve their health goals with personalized AI guidance.
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index} 
              className={`relative overflow-hidden group border-2 border-border bg-card/50 backdrop-blur-sm transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              } hover:shadow-2xl hover:border-primary/30 hover:-translate-y-2`}
              style={{ transitionDelay: `${200 + index * 150}ms` }}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Glow effect on hover */}
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-primary/10 rounded-[32px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10" />
              
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="p-8 relative">
                {/* Header with avatar */}
                <div className="flex items-center mb-6">
                  <div className={`w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-white font-bold mr-4 transition-all duration-300 ${
                    hoveredCard === index ? 'scale-110 shadow-lg' : ''
                  }`}>
                    {testimonial.avatar}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                  <Quote className={`w-8 h-8 text-primary/20 transition-all duration-300 ${
                    hoveredCard === index ? 'text-primary/40 scale-125 rotate-12' : ''
                  }`} />
                </div>

                {/* Star Rating */}
                <div className="flex mb-4 gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-5 h-5 text-primary fill-current transition-all duration-300 ${
                        hoveredCard === index ? 'scale-110' : ''
                      }`}
                      style={{ 
                        transitionDelay: `${i * 50}ms`,
                        animation: hoveredCard === index ? 'wiggle 0.5s ease-in-out' : 'none'
                      }}
                    />
                  ))}
                </div>

                {/* Content */}
                <p className={`text-muted-foreground italic leading-relaxed transition-all duration-300 ${
                  hoveredCard === index ? 'text-foreground/80' : ''
                }`}>
                  "{testimonial.content}"
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Bottom Rating */}
        <div className={`text-center mt-16 transition-all duration-700 delay-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="inline-flex items-center space-x-3 text-muted-foreground mb-8 bg-card/50 backdrop-blur-sm px-6 py-3 rounded-full border-2 border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 group">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-5 h-5 text-primary fill-current transition-all duration-500 ${
                    animatedStars[i] ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                  }`}
                  style={{ 
                    transitionDelay: `${i * 100}ms`
                  }}
                />
              ))}
            </div>
            <span className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
              4.9/5 from 50,000+ users
            </span>
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

        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(-10deg) scale(1.1); }
          75% { transform: rotate(10deg) scale(1.1); }
        }

        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 6s ease-in-out infinite;
          animation-delay: 1s;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </section>
  );
};

export default TestimonialsSection;