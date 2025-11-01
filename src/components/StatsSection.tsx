const Stat = ({ value, label }: { value: string; label: string }) => (
  <div className="space-y-2">
    <div className="text-5xl md:text-6xl font-bold text-primary">{value}</div>
    <div className="text-lg text-foreground font-medium">{label}</div>
    <p className="text-muted-foreground text-sm max-w-sm">Rated by users who rely on Aliva daily for quick, healthy guidance.</p>
  </div>
);

const StatsSection = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-primary/10 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
          <Stat value="92%" label="Smarter Choices" />
          <Stat value="6K+" label="Daily Knowledge Requests" />
          <Stat value="5K+" label="Healthy Meal Lookups" />
        </div>
      </div>
    </section>
  );
};

export default StatsSection;


