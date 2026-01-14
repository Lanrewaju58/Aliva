import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, MapPin, ChefHat, BarChart3, Sparkles, Shield } from "lucide-react";

const features = [
  {
    icon: MessageCircle,
    title: "AI Nutrition Consultation",
    description: "Get personalized dietary advice, meal plans and quick answers—24/7.",
    color: "from-primary to-primary-glow",
    delay: "0s"
  },
  {
    icon: MapPin,
    title: "Smart Restaurant Discovery",
    description: "Find healthy options at restaurants near you. Get detailed nutritional analysis and AI-recommended dishes that match your dietary goals.",
    color: "from-secondary to-secondary-glow",
    delay: "0.2s"
  },
  {
    icon: ChefHat,
    title: "Personalized Recipes",
    description: "Generate custom recipes based on your preferences, dietary restrictions and pantry.",
    color: "from-primary to-primary-glow",
    delay: "0.4s"
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description: "Track calories and macros with clear, simple insights.",
    color: "from-primary to-primary-glow",
    delay: "0.6s"
  },
  {
    icon: Sparkles,
    title: "Meal Planning",
    description: "AI-generated weekly plans tailored to your lifestyle.",
    color: "from-primary to-primary-glow",
    delay: "0.8s"
  },
  {
    icon: Shield,
    title: "Expert-Backed Advice",
    description: "Recommendations aligned with current nutritional science.",
    color: "from-primary to-primary-glow",
    delay: "1s"
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-background via-muted/30 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Everything You Need for
            <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Optimal Nutrition
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our comprehensive platform combines cutting-edge AI technology with practical tools
            to make healthy eating simple, enjoyable, and sustainable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="relative overflow-hidden group border bg-card hover:border-primary/20 transition-colors"
              >
                <div className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>

                  <h3 className="text-lg font-semibold mb-2 text-foreground">
                    {feature.title}
                  </h3>

                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Button size="lg">
            Start Your Health Journey
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;