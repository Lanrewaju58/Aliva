import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

const TestimonialBanner = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleTryAliva = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <section className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Stats Card */}
          <div className="rounded-3xl bg-card border border-border p-10 md:p-12 flex flex-col justify-between">
            <div>
              <p className="text-sm font-medium text-primary mb-6 uppercase tracking-wide">User Success Rate</p>

              <div className="text-7xl md:text-8xl font-bold bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent mb-8">
                92%
              </div>

              <p className="text-muted-foreground text-lg max-w-md leading-relaxed mb-8">
                of users say Aliva helps them make smarter, faster, and more efficient food decisions.
              </p>

              {/* Feature highlights */}
              <div className="flex flex-wrap gap-3">
                {['Smarter choices', 'Faster decisions', 'Better results'].map((item, i) => (
                  <span
                    key={i}
                    className="px-4 py-2 bg-muted text-sm text-muted-foreground rounded-full border border-border"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <Button
              className="mt-10 w-fit rounded-full px-8 h-12"
              onClick={handleTryAliva}
            >
              Try Aliva Today
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Testimonial Card */}
          <div className="rounded-3xl overflow-hidden">
            <div
              className="h-full min-h-[480px] bg-cover bg-center"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=1600&auto=format&fit=crop')" }}
            >
              <div className="h-full w-full bg-gradient-to-t from-black/80 via-black/40 to-black/10 p-10 md:p-12 flex flex-col justify-end">
                <Quote className="w-12 h-12 text-white/30 mb-6" />

                <blockquote className="text-white text-2xl md:text-3xl leading-relaxed mb-8 max-w-lg font-light">
                  Aliva has transformed how I approach nutrition. The personalized recommendations make healthy eating effortless.
                </blockquote>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm" />
                  <div>
                    <div className="text-white font-semibold text-lg">Sarah M.</div>
                    <div className="text-white/60">Health Enthusiast</div>
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