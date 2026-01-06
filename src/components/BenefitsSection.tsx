import {
  Brain,
  Target,
  Utensils,
  TrendingUp,
  BarChart3,
  MapPin,
  Check
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
  return (
    <section id="features" className="py-28 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <p className="text-sm font-medium text-primary mb-4 uppercase tracking-wide">Features</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Everything You Need to
            <span className="block text-primary mt-2">Eat Smarter</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive tools designed to make healthy eating effortless, enjoyable, and sustainable.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <feature.icon className="w-7 h-7 text-primary group-hover:text-white transition-colors duration-300" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">{feature.description}</p>

              {/* Highlights */}
              <div className="space-y-3">
                {feature.highlights.map((highlight, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-muted-foreground">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;