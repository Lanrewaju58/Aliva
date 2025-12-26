const StatsSection = () => {
  const stats = [
    { value: "92%", label: "Success Rate", description: "Users achieve their nutrition goals" },
    { value: "1k+", label: "Active Users", description: "Trust Aliva for daily guidance" },
    { value: "10k", label: "Meals Tracked", description: "Healthy choices made every day" }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-5xl md:text-6xl font-bold text-primary mb-2">{stat.value}</div>
              <div className="text-lg font-semibold text-foreground mb-1">{stat.label}</div>
              <p className="text-muted-foreground text-sm">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
