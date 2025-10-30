
import { useState } from "react";
import Navigation from "@/components/Navigation";
import MobileNav from "@/components/MobileNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronLeft, ChevronRight, Plus, ShoppingCart } from "lucide-react";

const MealPlanner = () => {
  const [currentWeek, setCurrentWeek] = useState(0);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

  const getWeekDates = () => {
    const today = new Date();
    const firstDay = new Date(today);
    firstDay.setDate(today.getDate() - today.getDay() + 1 + (currentWeek * 7));
    
    return days.map((_, index) => {
      const date = new Date(firstDay);
      date.setDate(firstDay.getDate() + index);
      return date;
    });
  };

  const weekDates = getWeekDates();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background pb-20 md:pb-0">
      <Navigation />
      <main className="pt-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Meal Planner</h1>
          <p className="text-muted-foreground">Plan your meals for the week ahead</p>
        </div>

        {/* Week Navigator */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentWeek(currentWeek - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="text-center">
                <h2 className="font-semibold">
                  {weekDates[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                  {' - '}
                  {weekDates[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </h2>
                {currentWeek === 0 && (
                  <Badge variant="secondary" className="mt-1">This Week</Badge>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentWeek(currentWeek + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button variant="outline" className="justify-start gap-2">
            <Calendar className="h-4 w-4" />
            Auto-Fill Week
          </Button>
          <Button variant="outline" className="justify-start gap-2">
            <ShoppingCart className="h-4 w-4" />
            Generate Shopping List
          </Button>
        </div>

        {/* Meal Grid */}
        <div className="space-y-4">
          {days.map((day, dayIndex) => (
            <Card key={day}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{day}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {weekDates[dayIndex].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <Badge variant={dayIndex === new Date().getDay() - 1 ? "default" : "outline"}>
                    {dayIndex === new Date().getDay() - 1 ? 'Today' : ''}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {mealTypes.map((mealType) => (
                    <button
                      key={mealType}
                      className="p-4 rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all text-left group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-sm font-medium text-muted-foreground">
                          {mealType}
                        </span>
                        <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Click to add meal
                      </p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Coming Soon Banner */}
        <Card className="mt-6 border-primary/20 bg-primary/5">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">🚧 Coming Soon</h3>
            <p className="text-sm text-muted-foreground">
              Full meal planning features with drag-and-drop, recipe suggestions, and shopping lists will be available soon!
            </p>
          </CardContent>
        </Card>
      </main>
      <MobileNav />
    </div>
  );
};

export default MealPlanner;