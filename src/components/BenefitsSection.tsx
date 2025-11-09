import { useState } from "react";
import { 
  Salad, 
  HeartPulse, 
  Utensils, 
  Leaf,
  Sparkles,
  Brain,
  Target,
  TrendingUp,
  Calendar,
  BarChart3,
  ChevronRight,
  Check
} from "lucide-react";

const mainPerks = [
  { 
    icon: Salad, 
    title: "Personalized Meals", 
    text: "AI suggests meals that fit how you feel and your goals.",
    details: [
      "Custom meal plans based on your preferences",
      "Dietary restriction support (vegan, keto, etc.)",
      "Real-time calorie and macro tracking"
    ]
  },
  { 
    icon: HeartPulse, 
    title: "Better Health", 
    text: "Balanced choices that support gut health and energy.",
    details: [
      "Science-backed nutrition recommendations",
      "Health goal tracking (weight loss, muscle gain)",
      "Daily wellness insights"
    ]
  },
  { 
    icon: Utensils, 
    title: "Eat Out Smart", 
    text: "Find nearby spots with healthier options you'll enjoy.",
    details: [
      "Restaurant menu analysis",
      "Healthier alternative suggestions",
      "Nutrition info for popular chains"
    ]
  },
  { 
    icon: Leaf, 
    title: "Simple & Fresh", 
    text: "Clean ingredients and easy swaps for everyday eating.",
    details: [
      "Smart ingredient substitutions",
      "Seasonal recipe recommendations",
      "Shopping list generation"
    ]
  },
];

const additionalFeatures = [
  {
    icon: Brain,
    title: "AI Nutritionist",
    description: "Chat with an intelligent assistant that learns your preferences and provides personalized advice 24/7"
  },
  {
    icon: Target,
    title: "Goal Tracking",
    description: "Set and achieve your health goals with visual progress tracking and milestone celebrations"
  },
  {
    icon: TrendingUp,
    title: "Progress Analytics",
    description: "Detailed insights into your nutrition trends, weight changes, and habit formation over time"
  },
  {
    icon: Calendar,
    title: "Meal Planning",
    description: "Plan your week ahead with smart meal suggestions and automated shopping lists"
  },
  {
    icon: BarChart3,
    title: "Macro Breakdown",
    description: "Visualize your protein, carbs, and fat intake with easy-to-understand charts and reports"
  },
  {
    icon: Sparkles,
    title: "Smart Recipes",
    description: "Discover recipes tailored to your taste, dietary needs, and available ingredients"
  }
];

const BenefitsSection = () => {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  return (
    <section id="features" className="py-20 bg-gradient-to-b from-background to-primary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Benefits Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Left image */}
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-primary/10 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-50" />
            <div className="relative rounded-3xl overflow-hidden border-2 border-primary/20 shadow-2xl h-[320px] md:h-[480px] bg-[url('https://images.unsplash.com/photo-1552611052-33e04de081de?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGZvb2QlMjBwaG90b2dyYXBoeXxlbnwwfHwwfHx8MA%3D%3D')] bg-cover bg-center group-hover:scale-105 transition-transform duration-700">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Floating stat cards */}
              <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Today's Goal</div>
                    <div className="text-sm font-bold text-foreground">1,850 / 2,000 cal</div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl animate-float-delayed">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">7-Day Streak</div>
                    <div className="text-sm font-bold text-foreground">Keep it up!</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right content */}
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              <span>Why Choose Aliva</span>
            </div>
            <h3 className="text-4xl md:text-5xl font-bold text-foreground mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Eat well, feel better
            </h3>
            <p className="text-muted-foreground text-lg mb-8 max-w-prose">
              Small choices add up. Aliva keeps it simple with clear suggestions and quick wins you can use today.
            </p>
            
            <div className="grid grid-cols-1 gap-4">
              {mainPerks.map((perk, i) => (
                <div 
                  key={i} 
                  className={`group cursor-pointer transition-all duration-300 ${
                    expandedCard === i ? 'col-span-1' : ''
                  }`}
                  onClick={() => setExpandedCard(expandedCard === i ? null : i)}
                >
                  <div className={`flex flex-col gap-3 p-5 rounded-2xl border-2 transition-all duration-300 ${
                    expandedCard === i 
                      ? 'border-primary bg-primary/5 shadow-lg' 
                      : 'border-primary/10 bg-card hover:border-primary/30 hover:shadow-md'
                  }`}>
                    <div className="flex items-start gap-4">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                        expandedCard === i 
                          ? 'bg-primary text-primary-foreground shadow-lg' 
                          : 'bg-primary/10 text-primary group-hover:bg-primary/20'
                      }`}>
                        <perk.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-foreground text-lg">{perk.title}</div>
                          <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${
                            expandedCard === i ? 'rotate-90' : ''
                          }`} />
                        </div>
                        <div className="text-muted-foreground text-sm mt-1">{perk.text}</div>
                      </div>
                    </div>
                    
                    {expandedCard === i && (
                      <div className="ml-16 space-y-2 animate-fade-in-up">
                        {perk.details.map((detail, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                            <span>{detail}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Features Grid */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything you need to succeed
            </h3>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Powerful features designed to make healthy eating effortless and enjoyable
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalFeatures.map((feature, i) => (
              <div 
                key={i}
                className="group relative"
                onMouseEnter={() => setHoveredFeature(i)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div className={`h-full p-6 rounded-2xl border-2 transition-all duration-300 ${
                  hoveredFeature === i 
                    ? 'border-primary bg-primary/5 shadow-xl -translate-y-2' 
                    : 'border-border bg-card hover:border-primary/30'
                }`}>
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 ${
                    hoveredFeature === i 
                      ? 'bg-primary text-primary-foreground shadow-lg scale-110' 
                      : 'bg-primary/10 text-primary'
                  }`}>
                    <feature.icon className="h-7 w-7" />
                  </div>
                  <h4 className="text-xl font-bold text-foreground mb-2">{feature.title}</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                  
                  {hoveredFeature === i && (
                    <div className="mt-4 flex items-center gap-2 text-primary text-sm font-medium animate-fade-in-up">
                      Learn more
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 3s ease-in-out infinite;
          animation-delay: 0.5s;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.4s ease-out forwards;
        }
      `}</style>
    </section>
  );
};

export default BenefitsSection;