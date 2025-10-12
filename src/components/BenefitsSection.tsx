import { Salad, HeartPulse, Utensils, Leaf } from "lucide-react";

const perks = [
  { icon: Salad, title: "Personalized Meals", text: "AI suggests meals that fit how you feel and your goals." },
  { icon: HeartPulse, title: "Better Health", text: "Balanced choices that support gut health and energy." },
  { icon: Utensils, title: "Eat Out Smart", text: "Find nearby spots with healthier options you’ll enjoy." },
  { icon: Leaf, title: "Simple & Fresh", text: "Clean ingredients and easy swaps for everyday eating." },
];

const BenefitsSection = () => {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Left image mock */}
          <div className="rounded-3xl overflow-hidden border border-border shadow-xl h-[320px] md:h-[420px] bg-[url('https://images.unsplash.com/photo-1552611052-33e04de081de?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGZvb2QlMjBwaG90b2dyYXBoeXxlbnwwfHwwfHx8MA%3D%3D')] bg-cover bg-center" />

          {/* Right text + icons */}
          <div>
            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Eat well, feel better</h3>
            <p className="text-muted-foreground mb-6 max-w-prose">Small choices add up. Aliva keeps it simple with clear suggestions and quick wins you can use today.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {perks.map((p, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-primary/10 bg-card">
                  <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <p.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{p.title}</div>
                    <div className="text-muted-foreground text-sm">{p.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;


