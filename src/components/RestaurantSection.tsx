import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Star, Clock, DollarSign, Utensils, ArrowRight, ChefHat, Leaf, Award } from "lucide-react";

// Premium quality card component
const RestaurantCard = ({ restaurant }: { restaurant: any }) => (
  <div className="group relative bg-white/50 dark:bg-black/20 backdrop-blur-sm border border-black/5 dark:border-white/5 rounded-2xl p-6 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-white/5 transition-all duration-500 hover:-translate-y-1">

    {/* Subtle Gradient Overlay on Hover */}
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

    {/* Header with Icon & Rating */}
    <div className="flex justify-between items-start mb-6 relative">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10 flex items-center justify-center border border-amber-100/50 dark:border-amber-500/10">
        <Utensils className="h-5 w-5 text-amber-600 dark:text-amber-500" strokeWidth={1.5} />
      </div>

      {restaurant.badge && (
        <span className="px-3 py-1 bg-black/5 dark:bg-white/10 backdrop-blur-md rounded-full text-[10px] uppercase tracking-wider font-semibold text-foreground/80 border border-black/5 dark:border-white/5">
          {restaurant.badge}
        </span>
      )}
    </div>

    {/* Content */}
    <div className="space-y-4 relative">
      <div>
        <h3 className="text-xl font-medium tracking-tight text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">
          {restaurant.name}
        </h3>
        <p className="text-sm text-muted-foreground mt-1 font-light">{restaurant.cuisine}</p>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-3 gap-2 py-4 border-t border-b border-black/5 dark:border-white/5">
        <div className="text-center px-2 border-r border-black/5 dark:border-white/5 last:border-0">
          <div className="flex items-center justify-center gap-1.5 mb-1 text-amber-500">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="text-sm font-medium text-foreground">{restaurant.rating}</span>
          </div>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Rating</span>
        </div>
        <div className="text-center px-2 border-r border-black/5 dark:border-white/5 last:border-0">
          <div className="flex items-center justify-center gap-1.5 mb-1 text-foreground/80">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-sm font-medium">{restaurant.time}</span>
          </div>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Time</span>
        </div>
        <div className="text-center px-2">
          <div className="flex items-center justify-center gap-1.5 mb-1 text-foreground/80">
            <DollarSign className="w-3.5 h-3.5" />
            <span className="text-sm font-medium">{restaurant.price}</span>
          </div>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Price</span>
        </div>
      </div>

      {/* Healthy Options Highlight */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground/80 bg-primary/5 rounded-lg p-2.5">
        <Leaf className="w-3.5 h-3.5 text-primary" />
        <span>{restaurant.healthyOptions} healthy options available</span>
      </div>

      {/* Action */}
      <Button
        variant="ghost"
        className="w-full justify-between group/btn hover:bg-transparent hover:text-amber-600 p-0 h-auto font-medium"
      >
        View Menu
        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
      </Button>
    </div>
  </div>
);

const RestaurantSection = () => {
  const [locationInput, setLocationInput] = useState("");

  const handleRestaurantSearch = () => {
    console.log('Searching for:', locationInput);
  };

  const sampleRestaurants = [
    {
      name: "Green Garden Bistro",
      cuisine: "Mediterranean • Organic",
      rating: 4.8,
      time: "25m",
      price: "$$",
      healthyOptions: 12,
      badge: "Top Rated"
    },
    {
      name: "Fresh & Fit Kitchen",
      cuisine: "Modern American • Bowls",
      rating: 4.6,
      time: "18m",
      price: "$",
      healthyOptions: 8,
      badge: "Quick"
    },
    {
      name: "Nourish Bowl Co.",
      cuisine: "Asian Fusion • Vegan",
      rating: 4.9,
      time: "30m",
      price: "$$",
      healthyOptions: 15,
      badge: "Trending"
    }
  ];

  return (
    <section id="restaurants-section" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-[100%] blur-[120px] -z-10 opacity-50" />

      <div className="container px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium tracking-wide uppercase mb-6">
            <Award className="w-3.5 h-3.5" />
            <span>Curated Dining</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-light tracking-tight text-foreground mb-6">
            Refined dining, <span className="font-medium">healthier choices.</span>
          </h2>
          <p className="text-lg text-muted-foreground font-light leading-relaxed">
            Experience a curated selection of restaurants that prioritize your well-being.
            AI-powered recommendations ensure every meal aligns with your nutritional goals specifically.
          </p>
        </div>

        {/* Search Bar Container */}
        <div className="relative max-w-2xl mx-auto mb-24">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
            <div className="relative flex items-center bg-background border border-border/50 rounded-2xl shadow-sm p-2 transition-all duration-300 focus-within:shadow-md focus-within:border-primary/20">
              <div className="flex-none px-4 text-muted-foreground">
                <MapPin className="w-5 h-5" />
              </div>
              <Input
                placeholder="Enter your location for curated options..."
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                className="flex-1 border-0 bg-transparent shadow-none h-12 text-base placeholder:font-light focus-visible:ring-0 px-0"
              />
              <Button
                size="lg"
                onClick={handleRestaurantSearch}
                className="flex-none rounded-xl px-8 h-12 bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
              >
                Discover
              </Button>
            </div>
          </div>
        </div>

        {/* Features / Benefits Grid (Minimalist) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20 border-t border-border/40 pt-16">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-primary/5 flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-primary" strokeWidth={1.5} />
            </div>
            <h4 className="text-lg font-medium">Chef Curated</h4>
            <p className="text-sm text-muted-foreground font-light leading-relaxed">
              Meals crafted by top chefs with a focus on nutritional balance and premium ingredients.
            </p>
          </div>
          <div className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-primary/5 flex items-center justify-center">
              <Leaf className="w-6 h-6 text-primary" strokeWidth={1.5} />
            </div>
            <h4 className="text-lg font-medium">Verified Organic</h4>
            <p className="text-sm text-muted-foreground font-light leading-relaxed">
              Partners committed to organic sourcing and sustainable farming practices.
            </p>
          </div>
          <div className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-primary/5 flex items-center justify-center">
              <Award className="w-6 h-6 text-primary" strokeWidth={1.5} />
            </div>
            <h4 className="text-lg font-medium">AI Approved</h4>
            <p className="text-sm text-muted-foreground font-light leading-relaxed">
              Every dish is analyzed for nutritional density and compatibility with your goals.
            </p>
          </div>
        </div>

        {/* Restaurant Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {sampleRestaurants.map((restaurant, index) => (
            <RestaurantCard key={index} restaurant={restaurant} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <Button
            variant="outline"
            size="lg"
            onClick={handleRestaurantSearch}
            className="rounded-full px-10 h-14 border-primary/20 text-primary hover:bg-primary/5 transition-colors duration-300 text-base font-medium"
          >
            Explore All Partners
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default RestaurantSection;