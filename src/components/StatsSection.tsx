const StatsSection = () => {
  const stats = [
    { value: "92%", label: "Success Rate", description: "Users achieve their nutrition goals" },
    { value: "100+", label: "Active Users", description: "Trust Aliva for daily guidance" },
    { value: "10k", label: "Meals Tracked", description: "Healthy choices made every day" }
  ];

  return (
    <section className="py-24 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`text-center py-10 px-8 ${index !== stats.length - 1 ? 'md:border-r md:border-border' : ''
                }`}
            >
              <div className="text-5xl md:text-6xl font-bold bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent mb-3">
                {stat.value}
              </div>
              <div className="text-lg font-semibold text-foreground mb-2">{stat.label}</div>
              <p className="text-muted-foreground text-sm max-w-[200px] mx-auto">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
