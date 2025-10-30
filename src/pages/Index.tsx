import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import TestimonialBanner from "@/components/TestimonialBanner";
import BenefitsSection from "@/components/BenefitsSection";
import FooterSection from "@/components/FooterSection";

const Index = () => {
  console.log('Index page rendering');
  return (
    <div className="min-h-screen" data-testid="main-content">
      <Navigation />
      <HeroSection />
      <BenefitsSection />
      <StatsSection />
      <TestimonialBanner />
      <FooterSection />
    </div>
  );
};

export default Index;