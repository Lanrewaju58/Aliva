import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const CTASection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const benefits = [
    "No credit card required",
    "Cancel anytime",
    "24/7 AI support"
  ];

  return (
    <section className="py-24 bg-primary relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Headline */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
          Ready to Transform Your
          <span className="block">Nutrition Journey?</span>
        </h2>

        <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
          Join thousands who've already discovered smarter, healthier eating with personalized AI guidance.
        </p>

        {/* CTA Button */}
        <Button
          size="lg"
          onClick={() => navigate(user ? '/dashboard' : '/auth')}
          className="h-14 px-10 text-lg rounded-xl bg-white text-primary hover:bg-white/95 font-semibold shadow-2xl hover:shadow-3xl transition-all duration-200"
        >
          {user ? 'Go to Dashboard' : 'Get Started Free'}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>

        {/* Benefits */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-2 text-white/80">
              <Check className="w-4 h-4 text-green-300" />
              <span className="text-sm">{benefit}</span>
            </div>
          ))}
        </div>

        {/* Stats bar */}
        <div className="mt-16 pt-10 border-t border-white/10">
          <div className="grid grid-cols-3 gap-8">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white">Free</div>
              <div className="text-white/60 text-sm mt-1">To get started</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white">24/7</div>
              <div className="text-white/60 text-sm mt-1">AI assistance</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white">1min</div>
              <div className="text-white/60 text-sm mt-1">To sign up</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;