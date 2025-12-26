import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

const TestimonialBanner = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [count, setCount] = useState(0);

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
    <section className="section-padding">
      <div className="container-wide">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Stats Card */}
          <div
            className={`rounded-2xl bg-card p-8 md:p-10 flex flex-col justify-between transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
          >
            <div>
              <p className="text-sm font-medium text-primary mb-4">User Success Rate</p>

              <div className="text-6xl md:text-7xl font-bold text-primary mb-6">
                {count}%
              </div>

              <p className="text-muted-foreground text-lg max-w-md leading-relaxed mb-6">
                of users say Aliva helps them make smarter, faster, and more efficient food decisions.
              </p>

              {/* Feature highlights */}
              <div className="flex flex-wrap gap-3">
                {['Smarter choices', 'Faster decisions', 'Better results'].map((item, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-muted text-sm text-muted-foreground rounded-full"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <Button
              className="mt-8 w-fit rounded-full px-6"
              onClick={handleTryAliva}
            >
              Try Aliva Today
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Testimonial Card */}
          <div
            className={`rounded-2xl overflow-hidden transition-all duration-500 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
          >
            <div
              className="h-full min-h-[400px] bg-cover bg-center"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=1600&auto=format&fit=crop')" }}
            >
              <div className="h-full w-full bg-gradient-to-t from-black/70 via-black/40 to-black/20 p-8 md:p-10 flex flex-col justify-end">
                <Quote className="w-10 h-10 text-white/40 mb-4" />

                <blockquote className="text-white text-xl md:text-2xl leading-relaxed mb-6 max-w-lg">
                  Aliva has transformed how I approach nutrition. The personalized recommendations make healthy eating effortless.
                </blockquote>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm" />
                  <div>
                    <div className="text-white font-medium">Sarah M.</div>
                    <div className="text-white/60 text-sm">Health Enthusiast</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialBanner;