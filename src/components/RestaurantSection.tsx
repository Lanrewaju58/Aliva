import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Star, Clock, DollarSign, Sparkles, TrendingUp, Award, Utensils } from "lucide-react";

const RestaurantSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [locationInput, setLocationInput] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const section = document.querySelector('#restaurants-section');
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  const handleRestaurantSearch = () => {
    console.log('Searching for:', locationInput);
  };

  const sampleRestaurants = [
    {
      name: "Green Garden Bistro",
      cuisine: "Mediterranean",
      rating: 4.8,
      time: "25 min",
      price: "$$",
      healthyOptions: 12,
      image: null,
      badge: "Top Rated",
      color: "from-emerald-400 to-green-500"
    },
    {
      name: "Fresh & Fit Kitchen",
      cuisine: "Healthy American",
      rating: 4.6,
      time: "18 min",
      price: "$",
      healthyOptions: 8,
      image: null,
      badge: "Fast Delivery",
      color: "from-blue-400 to-cyan-500"
    },
    {
      name: "Nourish Bowl Co.",
      cuisine: "Asian Fusion",
      rating: 4.9,
      time: "30 min",
      price: "$$",
      healthyOptions: 15,
      image: null,
      badge: "Most Popular",
      color: "from-purple-400 to-pink-500"
    }
  ];

  return (
    <section id="restaurants-section" className="py-16 sm:py-20 md:py-24 bg-gradient-to-b from-background via-muted/10 to-background relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-primary/5 rounded-full blur-2xl animate-float" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className={`text-center mb-12 sm:mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 hover:scale-105 transition-transform duration-300">
            <MapPin className="w-4 h-4 animate-pulse" />
            <span>Restaurant Discovery</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
            Discover Healthy
            <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent mt-2 animate-gradient">
              Restaurant Options
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            Find nutritious meals at restaurants near you. Get AI-powered recommendations
            for the healthiest dishes that match your dietary goals.
          </p>
        </div>

        {/* Search Bar */}
        <div className={`max-w-2xl mx-auto mb-10 sm:mb-12 transition-all duration-500 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className={`flex-1 relative transition-all duration-200 ${searchFocused ? 'scale-[1.02]' : ''
              }`}>
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors" />
              <Input
                placeholder="Enter your location..."
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="pl-12 h-12 bg-card border border-border focus:border-primary transition-all duration-200 rounded-xl text-base shadow-sm"
              />
            </div>
            <Button
              size="lg"
              onClick={handleRestaurantSearch}
              className="h-12 px-8 bg-primary hover:bg-primary/90 transition-all duration-200 shadow-sm rounded-xl text-base"
            >
              <Search className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">Find Restaurants</span>
              <span className="sm:hidden">Search</span>
            </Button>
          </div>
        </div>

        {/* Restaurant Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {sampleRestaurants.map((restaurant, index) => (
            <Card
              key={index}
              className={`group overflow-hidden border border-border bg-card transition-all duration-300 hover:shadow-xl hover:border-primary/30 hover:-translate-y-1 cursor-pointer ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
              style={{ transitionDelay: `${300 + index * 100}ms` }}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="p-5 sm:p-6 relative">
                {/* Badge */}
                <div className={`absolute top-4 right-4 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full shadow-sm transition-transform duration-200 ${hoveredCard === index ? 'scale-110' : ''
                  }`}>
                  {restaurant.badge}
                </div>

                {/* Restaurant Icon */}
                <div className={`h-24 mb-4 flex items-center justify-center transition-transform duration-300 ${hoveredCard === index ? 'scale-105' : ''
                  }`}>
                  <div className="h-20 w-20 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Utensils className="h-10 w-10 text-primary" />
                  </div>
                </div>

                {/* Restaurant Info */}
                <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors duration-200">
                  {restaurant.name}
                </h3>

                <p className="text-sm text-muted-foreground mb-4">{restaurant.cuisine}</p>

                {/* Stats */}
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-bold">{restaurant.rating}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{restaurant.time}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground font-medium">{restaurant.price}</span>
                  </div>
                </div>

                {/* Healthy Options Badge */}
                <div className="bg-primary/5 rounded-lg p-3 mb-4 border border-primary/20">
                  <p className="text-sm text-primary font-semibold flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    {restaurant.healthyOptions} AI-recommended options
                  </p>
                </div>

                {/* CTA Button */}
                <Button
                  variant="outline"
                  className={`w-full text-sm border transition-all duration-200 ${hoveredCard === index
                      ? 'bg-primary text-primary-foreground border-primary shadow-md'
                      : 'hover:bg-primary/5 hover:border-primary/30'
                    }`}
                >
                  View Healthy Menu
                </Button>

                {/* Extra info on hover */}
                {hoveredCard === index && (
                  <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground animate-in fade-in-0 duration-200">
                    <TrendingUp className="w-3 h-3" />
                    <span>Popular this week</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* CTA Button */}
        <div className={`text-center mt-8 sm:mt-12 transition-all duration-700 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
          <Button
            size="lg"
            onClick={handleRestaurantSearch}
            className="group px-6 sm:px-8 md:px-10 py-5 sm:py-6 text-base sm:text-lg bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 hover:scale-105 hover:shadow-2xl rounded-full"
          >
            <span>Explore More Restaurants</span>
            <Award className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:rotate-12" />
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 6s ease-in-out infinite;
          animation-delay: 1s;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </section>
  );
};

export default RestaurantSection;