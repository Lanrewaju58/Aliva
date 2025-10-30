
import { useState } from "react";
import Navigation from "@/components/Navigation";
import MobileNav from "@/components/MobileNav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Clock, Flame, Heart, ChefHat, Sparkles } from "lucide-react";

interface Recipe {
  id: string;
  name: string;
  calories: number;
  protein: number;
  cookTime: number;
  difficulty: string;
  tags: string[];
  image: string;
}

const sampleRecipes: Recipe[] = [
  {
    id: '1',
    name: 'Grilled Chicken & Quinoa Bowl',
    calories: 450,
    protein: 35,
    cookTime: 25,
    difficulty: 'Easy',
    tags: ['High Protein', 'Gluten-Free'],
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'
  },
  {
    id: '2',
    name: 'Mediterranean Salmon',
    calories: 520,
    protein: 42,
    cookTime: 30,
    difficulty: 'Medium',
    tags: ['Keto', 'High Protein'],
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop'
  },
  {
    id: '3',
    name: 'Vegan Buddha Bowl',
    calories: 380,
    protein: 18,
    cookTime: 20,
    difficulty: 'Easy',
    tags: ['Vegan', 'Gluten-Free'],
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop'
  },
  {
    id: '4',
    name: 'Beef Stir-Fry',
    calories: 480,
    protein: 38,
    cookTime: 15,
    difficulty: 'Easy',
    tags: ['Quick', 'High Protein'],
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop'
  },
  {
    id: '5',
    name: 'Overnight Oats',
    calories: 320,
    protein: 12,
    cookTime: 5,
    difficulty: 'Very Easy',
    tags: ['Breakfast', 'Quick'],
    image: 'https://images.unsplash.com/photo-1517673400267-0251440a3832?w=400&h=300&fit=crop'
  },
  {
    id: '6',
    name: 'Greek Salad with Feta',
    calories: 280,
    protein: 14,
    cookTime: 10,
    difficulty: 'Very Easy',
    tags: ['Vegetarian', 'Low Carb'],
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop'
  },
];

const Recipes = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);

  const toggleFavorite = (recipeId: string) => {
    setFavorites(prev => 
      prev.includes(recipeId) 
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId]
    );
  };

  const filteredRecipes = sampleRecipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
      recipe.tags.some(tag => tag.toLowerCase() === selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'High Protein', 'Vegan', 'Keto', 'Quick', 'Low Carb'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background pb-20 md:pb-0">
      <Navigation />
      <main className="pt-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Recipes</h1>
          <p className="text-muted-foreground">Discover healthy and delicious meal ideas</p>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search recipes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2 flex-wrap">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category.toLowerCase() || (category === 'All' && selectedCategory === 'all') ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category === 'All' ? 'all' : category.toLowerCase())}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="discover" className="space-y-6">
          <TabsList>
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="favorites">
              Favorites ({favorites.length})
            </TabsTrigger>
            <TabsTrigger value="ai">
              <Sparkles className="h-4 w-4 mr-2" />
              AI Suggestions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecipes.map((recipe) => (
                <Card key={recipe.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                  <div className="relative h-48 overflow-hidden bg-muted">
                    <img 
                      src={recipe.image} 
                      alt={recipe.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      onClick={() => toggleFavorite(recipe.id)}
                      className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      <Heart 
                        className={`h-5 w-5 ${favorites.includes(recipe.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                      />
                    </button>
                  </div>
                  
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{recipe.name}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                      <div className="flex items-center gap-1">
                        <Flame className="h-4 w-4" />
                        <span>{recipe.calories} cal</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{recipe.cookTime} min</span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {recipe.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-primary">
                        {recipe.protein}g protein
                      </span>
                      <Button size="sm">
                        View Recipe
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredRecipes.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No recipes found</h3>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your search or filters
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="favorites">
            {favorites.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Start adding recipes to your favorites by clicking the heart icon
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sampleRecipes
                  .filter(recipe => favorites.includes(recipe.id))
                  .map((recipe) => (
                    <Card key={recipe.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative h-48 overflow-hidden bg-muted">
                        <img 
                          src={recipe.image} 
                          alt={recipe.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">{recipe.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Button size="sm" className="w-full">
                          View Recipe
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="ai">
            <Card>
              <CardContent className="p-12 text-center">
                <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">AI Recipe Suggestions</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Get personalized recipe recommendations based on your dietary preferences, goals, and available ingredients
                </p>
                <Button>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate AI Recipes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <MobileNav />
    </div>
  );
};

export default Recipes;