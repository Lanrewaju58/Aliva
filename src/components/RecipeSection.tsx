import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChefHat, Search, Clock, Users, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const RecipeSection = () => {
  const { toast } = useToast();

  const handleRecipeSearch = () => {
    toast({
      title: "Recipe Generator Coming Soon!",
      description: "We're creating an AI-powered recipe generator that creates custom meals based on your preferences.",
    });
  };

  const sampleRecipes = [
    {
      name: "Mediterranean Quinoa Bowl",
      time: "25 min",
      servings: 4,
      calories: 420,
      difficulty: "Easy",
      tags: ["Vegetarian", "High Protein"],
      image: null,
      description: "Fresh quinoa bowl with roasted vegetables, feta, and lemon herb dressing."
    },
    {
      name: "Grilled Salmon with Asparagus",
      time: "20 min",
      servings: 2,
      calories: 380,
      difficulty: "Medium",
      tags: ["Keto", "High Protein", "Omega-3"],
      image: null,
      description: "Perfectly grilled salmon with garlic butter asparagus and herbs."
    },
    {
      name: "Green Power Smoothie Bowl",
      time: "10 min",
      servings: 1,
      calories: 280,
      difficulty: "Easy",
      tags: ["Vegan", "Antioxidants", "Quick"],
      image: null,
      description: "Energizing smoothie bowl with spinach, banana, berries, and superfoods."
    }
  ];

  return (
    <section id="recipes" className="py-24 bg-gradient-to-b from-muted/20 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            AI-Generated
            <span className="block bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent">
              Healthy Recipes
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get personalized recipes created by AI based on your dietary preferences, 
            available ingredients, and nutritional goals.
          </p>
        </div>

        {/* Recipe Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="flex space-x-3">
            <div className="flex-1 relative">
              <ChefHat className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Tell AI what you want to cook..."
                className="pl-10 h-12 bg-white/70 border-primary/20 focus:border-primary/40"
              />
            </div>
            <Button 
              variant="hero" 
              size="lg" 
              onClick={handleRecipeSearch}
              className="px-8"
            >
              <Zap className="w-5 h-5 mr-2" />
              Generate Recipe
            </Button>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground mb-3">Popular searches:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {["High protein breakfast", "Keto dinner", "Quick lunch", "Vegan dessert"].map((search, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                  onClick={() => toast({
                    title: `Searching: ${search}`,
                    description: "AI recipe generation coming soon!",
                  })}
                >
                  {search}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Sample Recipe Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {sampleRecipes.map((recipe, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 bg-white/50 backdrop-blur-sm card-hover">
              <div className="p-6">
                <div className="h-16 mb-4 flex items-center justify-center">
                  <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <ChefHat className="h-7 w-7 text-primary" />
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mb-2 text-foreground">{recipe.name}</h3>
                
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                  {recipe.description}
                </p>
                
                <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                  <div>
                    <Clock className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">{recipe.time}</p>
                  </div>
                  <div>
                    <Users className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">{recipe.servings} servings</p>
                  </div>
                  <div>
                    <Zap className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">{recipe.calories} cal</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {recipe.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                  onClick={() => toast({
                    title: `${recipe.name}`,
                    description: "Full recipe instructions coming soon!",
                  })}
                >
                  View Recipe
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="hero" size="xl" onClick={handleRecipeSearch}>
            Create Custom Recipe with AI
          </Button>
        </div>
      </div>
    </section>
  );
};

export default RecipeSection;