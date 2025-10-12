import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

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
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          <div className="rounded-[28px] bg-card shadow-xl border border-border p-8 flex flex-col justify-between">
            <div>
              <div className="text-6xl font-bold text-foreground mb-6">92%</div>
              <p className="text-muted-foreground text-lg max-w-md">
                of users say Aliva helps them make smarter, faster, and more efficient food decisions.
              </p>
            </div>
            <button 
              className="mt-8 h-12 px-6 rounded-full bg-gradient-to-b from-primary/90 to-primary text-white font-medium w-max"
              onClick={handleTryAliva}
            >
              Try Aliva Today
            </button>
          </div>
          <div className="rounded-[28px] overflow-hidden shadow-xl border border-black/5">
            <div className="h-full w-full bg-[url('https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center">
              <div className="h-full w-full bg-black/30 p-8 flex items-end">
                <p className="text-white text-2xl md:text-3xl leading-snug max-w-2xl">
                  “Aliva boosts my productivity, sparks creativity, and effortlessly simplifies every meal decision I make.”
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialBanner;


