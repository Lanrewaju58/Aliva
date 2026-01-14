import { Marquee } from "@/components/ui/magicui/marquee";
import { NumberTicker } from "@/components/ui/magicui/number-ticker";
import { Apple, Salad, Dumbbell, Brain, BarChart3, Trophy } from "lucide-react";

const StatsSection = () => {
  const stats = [
    { value: 92, label: "Success Rate", suffix: "%" },
    { value: 100, label: "Active Users", suffix: "+" },
    { value: 10, label: "Meals Tracked", suffix: "k" }
  ];

  const trustBadges = [
    { icon: Apple, text: "Healthy Eating" },
    { icon: Salad, text: "Balanced Diet" },
    { icon: Dumbbell, text: "Fitness Goals" },
    { icon: Brain, text: "AI-Powered" },
    { icon: BarChart3, text: "Track Progress" },
    { icon: Trophy, text: "Achieve Goals" },
  ];

  return (
    <section className="py-24 bg-background overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 mb-16">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`text-center py-10 px-8 ${index !== stats.length - 1 ? 'md:border-r md:border-border' : ''
                }`}
            >
              <div className="text-5xl md:text-6xl font-bold bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent mb-3">
                <NumberTicker value={stat.value} />{stat.suffix}
              </div>
              <div className="text-lg font-semibold text-foreground mb-2">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Trust Badge Marquee */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />
          <Marquee pauseOnHover className="[--duration:30s]">
            {trustBadges.map((badge, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-muted/50 border border-border mx-2"
              >
                <badge.icon className="w-5 h-5 text-primary" />
                <span className="font-medium text-muted-foreground">{badge.text}</span>
              </div>
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
