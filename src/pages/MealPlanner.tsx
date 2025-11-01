// src/pages/MealPlanner.tsx

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Calendar, ChevronLeft, ChevronRight, Plus, Trash2, Copy, Download, Crown, Lock } from "lucide-react";
import { profileService } from "@/services/profileService";
import { UserProfile } from "@/types/profile";

interface PlannedMeal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface MealPlan {
  [date: string]: {
    [mealType: string]: PlannedMeal | null;
  };
}

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

const MealPlanner = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentWeek, setCurrentWeek] = useState(0);
  const [mealPlan, setMealPlan] = useState<MealPlan>({});
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; mealType: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: ''
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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

  // Load user profile to check plan
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.uid) {
        setProfile(null);
        return;
      }
      try {
        const userProfile = await profileService.getProfile(user.uid);
        setProfile(userProfile);
      } catch (error) {
        console.error('Error loading profile:', error);
        setProfile(null);
      }
    };
    loadProfile();
  }, [user]);

  // Check if user has active Pro plan
  const isPro = useMemo(() => {
    if (!profile?.plan || profile.plan === 'FREE') return false;
    if (profile.plan === 'PRO') {
      const expires = (profile as any).planExpiresAt;
      if (!expires) return true; // No expiry = lifetime
      const expDate = (typeof expires?.toDate === 'function')
        ? expires.toDate()
        : (expires instanceof Date ? expires : new Date(expires));
      return expDate > new Date();
    }
    return false;
  }, [profile]);

  // Load meal plan from localStorage
  useEffect(() => {
    if (!user) return;
    
    const savedPlan = localStorage.getItem(`mealPlan_${user.uid}`);
    if (savedPlan) {
      setMealPlan(JSON.parse(savedPlan));
    }
  }, [user]);

  // Save meal plan to localStorage
  const saveMealPlan = (plan: MealPlan) => {
    if (!user) return;
    localStorage.setItem(`mealPlan_${user.uid}`, JSON.stringify(plan));
    setMealPlan(plan);
  };

  const handleAddMeal = (date: Date, mealType: string) => {
    const dateStr = date.toISOString().split('T')[0];
    setSelectedSlot({ date: dateStr, mealType });
    setFormData({ name: '', calories: '', protein: '', carbs: '', fat: '' });
    setShowAddDialog(true);
  };

  const handleSubmitMeal = () => {
    if (!selectedSlot || !formData.name.trim()) return;

    const newMeal: PlannedMeal = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      calories: Number(formData.calories) || 0,
      protein: Number(formData.protein) || 0,
      carbs: Number(formData.carbs) || 0,
      fat: Number(formData.fat) || 0,
    };

    const newPlan = { ...mealPlan };
    if (!newPlan[selectedSlot.date]) {
      newPlan[selectedSlot.date] = {};
    }
    newPlan[selectedSlot.date][selectedSlot.mealType] = newMeal;

    saveMealPlan(newPlan);
    setShowAddDialog(false);
    
    toast({
      title: 'Meal added',
      description: `${newMeal.name} added to ${selectedSlot.mealType}`
    });
  };

  const handleDeleteMeal = (date: string, mealType: string) => {
    const newPlan = { ...mealPlan };
    if (newPlan[date] && newPlan[date][mealType]) {
      const mealName = newPlan[date][mealType]?.name;
      delete newPlan[date][mealType];
      
      // Clean up empty dates
      if (Object.keys(newPlan[date]).length === 0) {
        delete newPlan[date];
      }
      
      saveMealPlan(newPlan);
      toast({
        title: 'Meal removed',
        description: `${mealName} removed from plan`
      });
    }
  };

  const handleCopyDay = (sourceDate: Date) => {
    const sourceDateStr = sourceDate.toISOString().split('T')[0];
    const sourceMeals = mealPlan[sourceDateStr];
    
    if (!sourceMeals || Object.keys(sourceMeals).length === 0) {
      toast({
        title: 'No meals to copy',
        description: 'This day has no planned meals',
        variant: 'destructive'
      });
      return;
    }

    // Find next empty day in current week
    const targetDate = weekDates.find(date => {
      const dateStr = date.toISOString().split('T')[0];
      return !mealPlan[dateStr] || Object.keys(mealPlan[dateStr]).length === 0;
    });

    if (!targetDate) {
      toast({
        title: 'Week is full',
        description: 'All days in this week have meals planned',
        variant: 'destructive'
      });
      return;
    }

    const targetDateStr = targetDate.toISOString().split('T')[0];
    const newPlan = { ...mealPlan };
    newPlan[targetDateStr] = { ...sourceMeals };

    saveMealPlan(newPlan);
    toast({
      title: 'Day copied',
      description: `Meals copied to ${targetDate.toLocaleDateString('en-US', { weekday: 'long' })}`
    });
  };

  const handleAutoFill = () => {
    const sampleMeals: { [key: string]: PlannedMeal } = {
      Breakfast: { id: '1', name: 'Oatmeal with Berries', calories: 350, protein: 12, carbs: 55, fat: 8 },
      Lunch: { id: '2', name: 'Grilled Chicken Salad', calories: 450, protein: 35, carbs: 25, fat: 18 },
      Dinner: { id: '3', name: 'Salmon with Vegetables', calories: 520, protein: 42, carbs: 30, fat: 22 },
      Snack: { id: '4', name: 'Greek Yogurt & Nuts', calories: 200, protein: 15, carbs: 12, fat: 10 }
    };

    const newPlan = { ...mealPlan };
    weekDates.forEach(date => {
      const dateStr = date.toISOString().split('T')[0];
      if (!newPlan[dateStr] || Object.keys(newPlan[dateStr]).length === 0) {
        newPlan[dateStr] = { ...sampleMeals };
      }
    });

    saveMealPlan(newPlan);
    toast({
      title: 'Week auto-filled',
      description: 'Sample meals added to empty days'
    });
  };

  const generateShoppingList = () => {
    const ingredients = new Set<string>();
    weekDates.forEach(date => {
      const dateStr = date.toISOString().split('T')[0];
      const dayMeals = mealPlan[dateStr];
      if (dayMeals) {
        Object.values(dayMeals).forEach(meal => {
          if (meal) ingredients.add(meal.name);
        });
      }
    });

    if (ingredients.size === 0) {
      toast({
        title: 'No meals planned',
        description: 'Add meals to generate a shopping list',
        variant: 'destructive'
      });
      return;
    }

    const list = Array.from(ingredients).join('\n');
    navigator.clipboard.writeText(list);
    
    toast({
      title: 'Shopping list copied',
      description: `${ingredients.size} items copied to clipboard`
    });
  };

  const formatMealCalendar = (format: 'text' | 'csv' = 'text') => {
    let output = '';
    
    if (format === 'csv') {
      // CSV format
      output = 'Date,Day,Meal Type,Meal Name,Calories,Protein (g),Carbs (g),Fat (g)\n';
      
      weekDates.forEach((date) => {
        const dateStr = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const dayMeals = mealPlan[dateStr];
        
        if (dayMeals) {
          MEAL_TYPES.forEach((mealType) => {
            const meal = dayMeals[mealType];
            if (meal) {
              output += `"${formattedDate}","${dayName}","${mealType}","${meal.name}",${meal.calories},${meal.protein},${meal.carbs},${meal.fat}\n`;
            }
          });
        }
      });
    } else {
      // Text format
      output = 'MEAL CALENDAR\n';
      output += `${weekDates[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${weekDates[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}\n`;
      output += '='.repeat(50) + '\n\n';
      
      weekDates.forEach((date) => {
        const dateStr = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const dayMeals = mealPlan[dateStr];
        const dayNutrition = getTotalNutrition(dateStr);
        
        if (dayMeals && Object.values(dayMeals).some(meal => meal !== null)) {
          output += `${dayName}, ${formattedDate}\n`;
          output += '-'.repeat(40) + '\n';
          
          MEAL_TYPES.forEach((mealType) => {
            const meal = dayMeals[mealType];
            if (meal) {
              output += `  ${mealType}: ${meal.name}\n`;
              output += `    ${meal.calories} cal | P: ${meal.protein}g | C: ${meal.carbs}g | F: ${meal.fat}g\n`;
            }
          });
          
          if (dayNutrition.calories > 0) {
            output += `\n  Daily Total: ${dayNutrition.calories} cal | P: ${dayNutrition.protein}g | C: ${dayNutrition.carbs}g | F: ${dayNutrition.fat}g\n`;
          }
          
          output += '\n';
        }
      });
    }
    
    return output;
  };

  const handleCopyMealCalendar = () => {
    const calendarText = formatMealCalendar('text');
    
    if (!calendarText || calendarText.length < 50) {
      toast({
        title: 'No meals planned',
        description: 'Add meals to your calendar before copying',
        variant: 'destructive'
      });
      return;
    }
    
    navigator.clipboard.writeText(calendarText);
    
    toast({
      title: 'Meal calendar copied',
      description: 'Calendar copied to clipboard'
    });
  };

  const handleDownloadMealCalendar = () => {
    const calendarText = formatMealCalendar('text');
    const calendarCSV = formatMealCalendar('csv');
    
    if (!calendarText || calendarText.length < 50) {
      toast({
        title: 'No meals planned',
        description: 'Add meals to your calendar before downloading',
        variant: 'destructive'
      });
      return;
    }
    
    // Create and download text file
    const textBlob = new Blob([calendarText], { type: 'text/plain' });
    const textUrl = URL.createObjectURL(textBlob);
    const textLink = document.createElement('a');
    textLink.href = textUrl;
    textLink.download = `meal-calendar-${weekDates[0].toISOString().split('T')[0]}-${weekDates[6].toISOString().split('T')[0]}.txt`;
    document.body.appendChild(textLink);
    textLink.click();
    document.body.removeChild(textLink);
    URL.revokeObjectURL(textUrl);
    
    // Create and download CSV file
    const csvBlob = new Blob([calendarCSV], { type: 'text/csv' });
    const csvUrl = URL.createObjectURL(csvBlob);
    const csvLink = document.createElement('a');
    csvLink.href = csvUrl;
    csvLink.download = `meal-calendar-${weekDates[0].toISOString().split('T')[0]}-${weekDates[6].toISOString().split('T')[0]}.csv`;
    document.body.appendChild(csvLink);
    csvLink.click();
    document.body.removeChild(csvLink);
    URL.revokeObjectURL(csvUrl);
    
    toast({
      title: 'Meal calendar downloaded',
      description: 'Calendar downloaded as TXT and CSV files'
    });
  };

  const getTodayIndex = () => {
    const today = new Date().getDay();
    return today === 0 ? 6 : today - 1; // Adjust for Monday start
  };

  const getTotalNutrition = (dateStr: string) => {
    const dayMeals = mealPlan[dateStr];
    if (!dayMeals) return { calories: 0, protein: 0, carbs: 0, fat: 0 };

    return Object.values(dayMeals).reduce((total, meal) => {
      if (!meal) return total;
      return {
        calories: total.calories + meal.calories,
        protein: total.protein + meal.protein,
        carbs: total.carbs + meal.carbs,
        fat: total.fat + meal.fat
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  // Show upgrade prompt if not Pro user
  if (!isPro) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background pb-20 md:pb-0">
        <Navigation />
        <main className="pt-16 md:pt-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <Card className="max-w-2xl mx-auto mt-12">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl mb-2">Meal Planner - Pro Feature</CardTitle>
              <CardDescription className="text-base">
                Upgrade to Pro to unlock the Meal Planner and start planning your weekly meals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Crown className="h-5 w-5 text-primary" />
                  Pro Plan Benefits
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Plan meals for the entire week</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Track nutrition and calories</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Export and download meal calendars</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Copy meal plans to clipboard</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>All Pro features for just ₦6,500/year</span>
                  </li>
                </ul>
              </div>
              <div className="flex gap-3">
                <Button 
                  className="flex-1" 
                  onClick={() => navigate('/upgrade')}
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade to Pro
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/dashboard')}
                >
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background pb-20 md:pb-0">
      <Navigation />
      <main className="pt-16 md:pt-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Button variant="outline" className="justify-start gap-2" onClick={handleAutoFill}>
            <Calendar className="h-4 w-4" />
            Auto-Fill Week
          </Button>
          <Button variant="outline" className="justify-start gap-2" onClick={handleCopyMealCalendar}>
            <Copy className="h-4 w-4" />
            Copy Calendar
          </Button>
          <Button variant="outline" className="justify-start gap-2" onClick={handleDownloadMealCalendar}>
            <Download className="h-4 w-4" />
            Download Calendar
          </Button>
        </div>

        {/* Meal Grid */}
        <div className="space-y-4">
          {days.map((day, dayIndex) => {
            const date = weekDates[dayIndex];
            const dateStr = date.toISOString().split('T')[0];
            const isToday = currentWeek === 0 && dayIndex === getTodayIndex();
            const dayNutrition = getTotalNutrition(dateStr);
            const hasMeals = dayNutrition.calories > 0;

            return (
              <Card key={day}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{day}</CardTitle>
                        {isToday && <Badge>Today</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {hasMeals && ` • ${dayNutrition.calories} cal`}
                      </p>
                    </div>
                    {hasMeals && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyDay(date)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {MEAL_TYPES.map((mealType) => {
                      const meal = mealPlan[dateStr]?.[mealType];
                      
                      return (
                        <div key={mealType}>
                          {meal ? (
                            <div className="p-4 rounded-lg border-2 border-border bg-card group relative">
                              <div className="flex items-start justify-between mb-2">
                                <span className="text-sm font-medium text-muted-foreground">
                                  {mealType}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => handleDeleteMeal(dateStr, mealType)}
                                >
                                  <Trash2 className="h-3 w-3 text-destructive" />
                                </Button>
                              </div>
                              <p className="font-medium text-sm mb-1">{meal.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {meal.calories} cal • P: {meal.protein}g
                              </p>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAddMeal(date, mealType)}
                              className="p-4 rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all text-left group w-full"
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
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {hasMeals && (
                    <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Protein:</span>
                        <span className="font-medium ml-2">{dayNutrition.protein}g</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Carbs:</span>
                        <span className="font-medium ml-2">{dayNutrition.carbs}g</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Fat:</span>
                        <span className="font-medium ml-2">{dayNutrition.fat}g</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>

      {/* Add Meal Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Meal</DialogTitle>
            <DialogDescription>
              Plan a meal for {selectedSlot?.mealType}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="meal-name">Meal Name</Label>
              <Input
                id="meal-name"
                placeholder="e.g., Grilled Chicken Salad"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                autoFocus
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="calories">Calories</Label>
                <Input
                  id="calories"
                  type="number"
                  placeholder="450"
                  value={formData.calories}
                  onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="protein">Protein (g)</Label>
                <Input
                  id="protein"
                  type="number"
                  placeholder="35"
                  value={formData.protein}
                  onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="carbs">Carbs (g)</Label>
                <Input
                  id="carbs"
                  type="number"
                  placeholder="25"
                  value={formData.carbs}
                  onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fat">Fat (g)</Label>
                <Input
                  id="fat"
                  type="number"
                  placeholder="18"
                  value={formData.fat}
                  onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleSubmitMeal} 
                className="flex-1"
                disabled={!formData.name.trim()}
              >
                Add Meal
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAddDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MealPlanner;