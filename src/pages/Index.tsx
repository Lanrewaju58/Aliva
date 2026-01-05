import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import FeatureShowcase from "@/components/FeatureShowcase";
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
      <div className="relative z-10 bg-background">
        <FeatureShowcase />
        <BenefitsSection />
        <StatsSection />
        <TestimonialBanner />
        <FooterSection />
      </div>
    </div>
  );
};

export default Index;
