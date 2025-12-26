import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Star, Clock, DollarSign, Utensils } from "lucide-react";

const RestaurantSection = () => {
  const [locationInput, setLocationInput] = useState("");

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
      badge: "Top Rated"
    },
    {
      name: "Fresh & Fit Kitchen",
      cuisine: "Healthy American",
      rating: 4.6,
      time: "18 min",
      price: "$",
      healthyOptions: 8,
      badge: "Fast Delivery"
    },
    {
      name: "Nourish Bowl Co.",
      cuisine: "Asian Fusion",
      rating: 4.9,
      time: "30 min",
      price: "$$",
      healthyOptions: 15,
      badge: "Most Popular"
    }
  ];

  return (
    <section id="restaurants-section" className="section-padding bg-muted/30">
      <div className="container-wide">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="badge-subtle mb-4 mx-auto w-fit">
            <MapPin className="w-3.5 h-3.5" />
            <span>Restaurant Discovery</span>
          </div>

          <h2 className="text-foreground mb-4">
            Discover Healthy Restaurant Options
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find nutritious meals at restaurants near you. Get AI-powered recommendations
            for the healthiest dishes that match your dietary goals.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto mb-12">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Enter your location..."
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                className="pl-11 h-12 bg-background border-border rounded-xl"
              />
            </div>
            <Button
              size="lg"
              onClick={handleRestaurantSearch}
              className="h-12 px-6 rounded-xl"
            >
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </div>

        {/* Restaurant Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleRestaurants.map((restaurant, index) => (
            <div
              key={index}
              className="group bg-card border border-border rounded-xl p-6 hover:border-primary/40 hover:-translate-y-1 transition-all duration-200"
            >
              {/* Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                  {restaurant.badge}
                </span>
              </div>

              {/* Restaurant Icon */}
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Utensils className="h-8 w-8 text-primary" />
              </div>

              {/* Restaurant Info */}
              <h4 className="text-lg font-semibold text-foreground mb-1">
                {restaurant.name}
              </h4>
              <p className="text-sm text-muted-foreground mb-4">{restaurant.cuisine}</p>

              {/* Stats */}
              <div className="flex items-center gap-4 mb-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-500" />
                  <span className="font-medium">{restaurant.rating}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{restaurant.time}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <DollarSign className="w-4 h-4" />
                  <span>{restaurant.price}</span>
                </div>
              </div>

              {/* Healthy Options */}
              <div className="bg-primary/5 rounded-lg p-3 mb-4">
                <p className="text-sm text-primary font-medium">
                  {restaurant.healthyOptions} AI-recommended options
                </p>
              </div>

              {/* CTA Button */}
              <Button
                variant="outline"
                className="w-full rounded-lg group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors duration-200"
              >
                View Healthy Menu
              </Button>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button
            size="lg"
            onClick={handleRestaurantSearch}
            className="rounded-full px-8"
          >
            Explore More Restaurants
          </Button>
        </div>
      </div>
    </section>
  );
};

export default RestaurantSection;