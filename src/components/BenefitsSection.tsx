import { useState } from "react";
import {
  Brain,
  Target,
  Utensils,
  TrendingUp,
  Stethoscope,
  ChevronRight,
  Check,
  BarChart3,
  MapPin
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Insights",
    description: "Get personalized nutrition recommendations based on your unique goals, preferences, and health data.",
    highlights: ["Smart meal suggestions", "Adaptive learning", "Real-time adjustments"]
  },
  {
    icon: Target,
    title: "Goal Tracking",
    description: "Set and achieve your nutrition targets with visual progress tracking and milestone celebrations.",
    highlights: ["Custom goal setting", "Daily progress", "Weekly reports"]
  },
  {
    icon: Utensils,
    title: "Meal Planning",
    description: "Effortlessly plan your meals with AI-generated suggestions that fit your lifestyle and taste.",
    highlights: ["Weekly meal plans", "Shopping lists", "Recipe suggestions"]
  },
  {
    icon: MapPin,
    title: "Restaurant Discovery",
    description: "Find healthy dining options near you with detailed nutritional information and smart recommendations.",
    highlights: ["Nearby healthy spots", "Menu analysis", "Nutrition info"]
  },
  {
    icon: BarChart3,
    title: "Macro Tracking",
    description: "Monitor your protein, carbs, and fat intake with beautiful visualizations and insights.",
    highlights: ["Automatic calculation", "Visual breakdowns", "Trend analysis"]
  },
  {
    icon: TrendingUp,
    title: "Progress Analytics",
    description: "Understand your nutrition journey with comprehensive analytics and actionable insights.",
    highlights: ["Historical data", "Pattern recognition", "Health trends"]
  }
];

const BenefitsSection = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
            <Stethoscope className="w-4 h-4" />
            <span>Powerful Features</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Everything You Need to
            <span className="block text-primary">Eat Smarter</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive tools designed to make healthy eating effortless, enjoyable, and sustainable.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group relative p-6 rounded-2xl border transition-all duration-300 cursor-pointer ${activeFeature === index
                ? 'bg-primary/5 border-primary/30 shadow-lg'
                : 'bg-card border-border hover:border-primary/20 hover:shadow-md'
                }`}
              onClick={() => setActiveFeature(index)}
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-colors ${activeFeature === index
                ? 'bg-primary text-primary-foreground'
                : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground'
                }`}>
                <feature.icon className="w-6 h-6" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">{feature.description}</p>

              {/* Highlights */}
              <div className="space-y-2">
                {feature.highlights.map((highlight, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Check className={`w-4 h-4 ${activeFeature === index ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                    <span className="text-muted-foreground">{highlight}</span>
                  </div>
                ))}
              </div>

              {/* Arrow indicator */}
              <ChevronRight className={`absolute top-6 right-6 w-5 h-5 transition-all duration-200 ${activeFeature === index
                ? 'text-primary opacity-100'
                : 'text-muted-foreground opacity-0 group-hover:opacity-100'
                }`} />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}

      </div>
    </section>
  );
};

export default BenefitsSection;