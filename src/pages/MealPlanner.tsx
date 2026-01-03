// src/pages/MealPlanner.tsx

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress"; // Assuming this exists or I'll use a custom one
import { useToast } from "@/hooks/use-toast";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Copy,
  Download,
  Crown,
  Lock,
  MoreHorizontal,
  Flame,
  Utensils,
  Droplets,
  Beef,
  Wheat,
  Activity,
  ChefHat,
  Search,
  Filter,
  UtensilsCrossed // Added missing import
} from "lucide-react";
import { profileService } from "@/services/profileService";
import { recipeService, Recipe } from "@/services/recipeService";
import { UserProfile } from "@/types/profile";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  // New State for Recipes
  const [generatedRecipes, setGeneratedRecipes] = useState<Recipe[]>([]); // Use Recipe type
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]); // Saved recipes state
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Load saved recipes on mount
  useEffect(() => {
    if (user?.uid) {
      loadSavedRecipes();
    }
  }, [user]);

  const loadSavedRecipes = async () => {
    if (!user?.uid) return;
    const recipes = await recipeService.getSavedRecipes(user.uid);
    setSavedRecipes(recipes);
  };

  const handleSaveRecipe = async (recipe: Recipe) => {
    if (!user?.uid) return;
    try {
      await recipeService.saveRecipe(user.uid, recipe);
      toast({ title: "Saved", description: "Recipe saved to your collection" });
      loadSavedRecipes(); // Refresh list
    } catch (error) {
      toast({ title: "Error", description: "Failed to save recipe", variant: "destructive" });
    }
  };

  const handleDeleteRecipe = async (recipeId: string) => {
    if (!user?.uid) return;
    try {
      await recipeService.deleteRecipe(user.uid, recipeId);
      toast({ title: "Removed", description: "Recipe removed from collection" });
      loadSavedRecipes(); // Refresh list
    } catch (error) {
      toast({ title: "Error", description: "Failed to remove recipe", variant: "destructive" });
    }
  };


  // Filter recipes based on search
  const filteredRecipes = generatedRecipes.filter(recipe =>
    (recipe.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (recipe.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const handleResetWeek = () => {
    const newPlan = { ...mealPlan };

    // Remove all meals for the current week's dates
    weekDates.forEach(date => {
      const dateStr = date.toISOString().split('T')[0];
      if (newPlan[dateStr]) {
        delete newPlan[dateStr];
      }
    });

    saveMealPlan(newPlan);
    toast({
      title: 'Week cleared',
      description: 'All meals for this week have been removed'
    });
  };

  const [generating, setGenerating] = useState(false);



  const handleSmartAutoFill = async () => {
    if (!profile) {
      toast({ title: 'Profile required', description: 'Please complete your profile first.' });
      return;
    }

    setGenerating(true);
    toast({
      title: 'Generating Meal Plan...',
      description: `Creating a personalized ${profile.country || 'generic'} diet plan for you. This may take a moment.`,
    });

    try {
      const response = await fetch('/api/generate-meal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country: profile.country || 'International',
          diet: profile.dietaryPreferences,
          allergies: profile.allergies,
          calories: profile.preferredCalorieTarget || 2000,
          goal: profile.healthGoals?.[0] || 'Maintain Weight',
          durationDays: 7
        })
      });

      if (!response.ok) throw new Error('Failed to generate plan');

      const data = await response.json();
      const newPlan = { ...mealPlan };
      let addedCount = 0;

      // Map API response to our MealPlan structure
      data.days?.forEach((dayData: any, index: number) => {
        if (index >= weekDates.length) return;
        const dateStr = weekDates[index].toISOString().split('T')[0];

        // Only overwrite if empty or user consented (currently just filling empty/all safely logic could be improved)
        // For now, let's fill the day
        const dailyMeals: Record<string, PlannedMeal> = {};

        Object.entries(dayData.meals).forEach(([type, meal]: [string, any]) => {
          dailyMeals[type] = {
            id: Date.now() + Math.random().toString(),
            name: meal.name,
            calories: meal.calories,
            protein: meal.protein,
            carbs: meal.carbs,
            fat: meal.fat
          };
        });

        newPlan[dateStr] = dailyMeals;
        addedCount++;
      });

      saveMealPlan(newPlan);
      toast({
        title: 'Plan Generated!',
        description: `Successfully created a 7-day meal plan based on your preferences.`,
      });

    } catch (error) {
      console.error('Plan generation error:', error);
      toast({
        title: 'Generation Failed',
        description: 'Could not generate AI meal plan. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setGenerating(false);
    }
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
      title: 'Calendar downloaded',
      description: 'Exported as TXT and CSV'
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



  const getDayNutrition = (dateStr: string) => {
    // Helper specific for day total if needed, or use getTotalNutrition
    return getTotalNutrition(dateStr);
  };

  // Calculate Weekly Stats (Moved up to fix Hook Error)
  const weeklyStats = useMemo(() => {
    return weekDates.reduce((acc, date) => {
      const dateStr = date.toISOString().split('T')[0];
      const dayNutrition = getTotalNutrition(dateStr);
      return {
        calories: acc.calories + dayNutrition.calories,
        protein: acc.protein + dayNutrition.protein,
        carbs: acc.carbs + dayNutrition.carbs,
        fat: acc.fat + dayNutrition.fat
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }, [mealPlan, weekDates]);

  // AI Recipe Generation (Moved up)
  const handleGenerateRecipes = async () => {
    setRecipeLoading(true);
    try {
      const token = user ? await user.getIdToken() : null;
      const response = await fetch('/api/generate-recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          country: profile?.country || 'Nigeria',
          diet: profile?.dietaryPreferences || 'None',
          allergies: profile?.allergies || [],
          calories: profile?.preferredCalorieTarget || 2000,
          query: searchQuery // Pass search query to backend
        })
      });

      if (!response.ok) throw new Error('Failed to generate recipes');

      const data = await response.json();
      setGeneratedRecipes(data);
      toast({
        title: "Recipes Generated",
        description: "Here are some personalized suggestions!",
      });
    } catch (error) {
      console.error("Recipe generation failed:", error);
      toast({
        title: "Generation Failed",
        description: "Could not generate recipes. Please try again.",
        variant: "destructive"
      });
    } finally {
      setRecipeLoading(false);
    }
  };

  // Show upgrade prompt if not Pro user
  if (!isPro) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-muted/60 shadow-xl rounded-2xl overflow-hidden">
          <div className="h-24 bg-gradient-to-br from-primary/20 via-primary/10 to-background flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center shadow-sm">
              <Lock className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardHeader className="text-center pt-6 pb-2">
            <CardTitle className="text-2xl font-bold">Unlock Meal Planner</CardTitle>
            <CardDescription className="text-base max-w-xs mx-auto mt-2">
              Plan your weekly nutrition, track macros, and reach your goals faster.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6 pt-2">
            <div className="space-y-3 bg-muted/30 rounded-xl p-4 border border-border/50">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-500" />
                Premium Features
              </h3>
              <ul className="space-y-2.5">
                {[
                  "Weekly meal scheduling",
                  "Automated macro calculation",
                  "One-click shopping lists",
                  "Export to CSV/PDF"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={() => navigate('/upgrade')}
                className="w-full h-11 text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
              >
                Upgrade Now
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="w-full text-muted-foreground hover:text-foreground"
              >
                Maybe Later
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }



  return (
    <div className="min-h-screen pb-20 md:pb-12 bg-muted/10">
      {/* Header Section */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/40 pb-4 pt-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Meal Planner</h1>
            <p className="text-sm text-muted-foreground">Design your perfect nutritional week</p>
          </div>

          <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-full border border-border/50 max-w-fit mx-auto md:mx-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentWeek(currentWeek - 1)}
              className="h-8 w-8 rounded-full hover:bg-background shadow-sm transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="px-4 text-sm font-medium min-w-[140px] text-center">
              {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              {' - '}
              {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentWeek(currentWeek + 1)}
              className="h-8 w-8 rounded-full hover:bg-background shadow-sm transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            <Button variant="outline" size="sm" className="h-9 gap-2 shadow-sm border-muted-foreground/20 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleResetWeek}>
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
            <Button variant="outline" size="sm" className="h-9 gap-2 shadow-sm border-muted-foreground/20" onClick={handleSmartAutoFill}>
              <Utensils className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Auto-Fill</span>
            </Button>
            <Button variant="outline" size="sm" className="h-9 gap-2 shadow-sm border-muted-foreground/20" onClick={handleCopyMealCalendar}>
              <Copy className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Copy</span>
            </Button>
            <Button variant="outline" size="sm" className="h-9 gap-2 shadow-sm border-muted-foreground/20" onClick={handleDownloadMealCalendar}>
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Pro Stats Bar */}
        <div className="bg-card border-y sm:border sm:rounded-xl p-4 mb-6 shadow-sm overflow-x-auto">
          <div className="flex items-center justify-between min-w-[600px] gap-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Daily Target</div>
                <div className="text-xl font-bold text-foreground">{profile?.preferredCalorieTarget || 2000} <span className="text-xs font-normal text-muted-foreground">kcal</span></div>
              </div>
            </div>

            <div className="h-8 w-px bg-border" />

            {/* Macro Progress Bars */}
            <div className="flex-1 grid grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-foreground">Protein</span>
                  <span className="text-muted-foreground">{weeklyStats.protein}g / {Math.round((profile?.currentWeightKg || 70) * 1.8)}g</span>
                </div>
                <Progress value={Math.min(100, (weeklyStats.protein / (Math.round((profile?.currentWeightKg || 70) * 1.8) * 7)) * 100)} className="h-2 bg-muted [&>div]:bg-blue-500" />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-foreground">Carbs</span>
                  <span className="text-muted-foreground">{weeklyStats.carbs}g</span>
                </div>
                <Progress value={50} className="h-2 bg-muted [&>div]:bg-amber-500" />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-foreground">Fats</span>
                  <span className="text-muted-foreground">{weeklyStats.fat}g</span>
                </div>
                <Progress value={30} className="h-2 bg-muted [&>div]:bg-rose-500" />
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="planner" className="w-full">
          <TabsList className="mb-6 bg-muted/50 p-1">
            <TabsTrigger value="planner" className="flex-1">Weekly Plan</TabsTrigger>
            <TabsTrigger value="discover" className="flex-1">Discover</TabsTrigger>
            <TabsTrigger value="saved" className="flex-1">Saved Recipes</TabsTrigger>
          </TabsList>

          <TabsContent value="planner" className="space-y-6 mt-0">
            {/* Week Navigation */}
            <div className="flex items-center justify-between bg-card border rounded-xl p-2 shadow-sm">
              <Button variant="ghost" size="icon" onClick={() => setCurrentWeek(prev => prev - 1)} className="hover:bg-muted/50 text-muted-foreground hover:text-foreground">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1 flex justify-center gap-1 sm:gap-2">
                {weekDates.map((date, i) => {
                  const isToday = new Date().toDateString() === date.toDateString();
                  return (
                    <div key={i} className={cn(
                      "flex flex-col items-center justify-center w-10 h-14 sm:w-14 sm:h-16 rounded-lg transition-all duration-200 border border-transparent",
                      isToday ? "bg-primary text-primary-foreground shadow-md scale-105 font-bold" : "hover:bg-muted/50 text-muted-foreground hover:text-foreground hover:border-border/50"
                    )}>
                      <span className="text-[10px] sm:text-xs uppercase tracking-wider opacity-80">{days[i].slice(0, 3)}</span>
                      <span className="text-lg sm:text-xl leading-none mt-0.5">{date.getDate()}</span>
                    </div>
                  );
                })}
              </div>
              <Button variant="ghost" size="icon" onClick={() => setCurrentWeek(prev => prev + 1)} className="hover:bg-muted/50 text-muted-foreground hover:text-foreground">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {MEAL_TYPES.map((type) => (
                <div key={type} className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                    <div className={cn(
                      "p-2 rounded-lg bg-background border shadow-sm",
                      type === 'Breakfast' ? "text-orange-500" :
                        type === 'Lunch' ? "text-green-500" :
                          type === 'Dinner' ? "text-blue-500" : "text-purple-500"
                    )}>
                      {type === 'Breakfast' && <Utensils className="w-4 h-4" />}
                      {type === 'Lunch' && <Beef className="w-4 h-4" />}
                      {type === 'Dinner' && <UtensilsCrossed className="w-4 h-4" />}
                      {type === 'Snack' && <Wheat className="w-4 h-4" />}
                    </div>
                    <h3 className="font-semibold text-foreground">{type}</h3>
                  </div>

                  <div className="space-y-3">
                    {weekDates.map((date) => {
                      const dateStr = date.toISOString().split('T')[0];
                      const meal = mealPlan[dateStr]?.[type];
                      const isToday = new Date().toDateString() === date.toDateString();

                      return (
                        <Card key={`${dateStr}-${type}`} className={cn(
                          "group transition-all duration-200 border-transparent hover:border-border hover:shadow-md",
                          !meal ? "bg-muted/20 hover:bg-muted/30 border-dashed border-border/50" : "bg-card border-border shadow-sm",
                          isToday && !meal && "bg-primary/5 border-primary/20 border-dashed"
                        )}>
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="text-[10px] font-medium text-muted-foreground mb-1 uppercase tracking-wide flex items-center justify-between">
                                  <span>{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                  {meal && (
                                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button className="text-xs hover:text-primary transition-colors">Edit</button>
                                    </div>
                                  )}
                                </div>

                                {meal ? (
                                  <div className="space-y-2">
                                    <div className="font-medium text-sm text-foreground truncate">{meal.name}</div>
                                    <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground">
                                      <span className="bg-orange-500/10 text-orange-600 px-1.5 py-0.5 rounded-md font-medium">{meal.calories} kcal</span>
                                      <span className="flex items-center gap-0.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                        {meal.protein}p
                                      </span>
                                      <span className="flex items-center gap-0.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                        {meal.carbs}c
                                      </span>
                                      <span className="flex items-center gap-0.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                        {meal.fat}f
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    className="w-full h-8 flex items-center gap-2 text-muted-foreground hover:text-primary hover:bg-primary/10 text-xs font-normal justify-start px-0"
                                    onClick={() => handleAddMeal(date, type)}
                                  >
                                    <div className="h-5 w-5 rounded-full border border-current flex items-center justify-center">
                                      <Plus className="h-3 w-3" />
                                    </div>
                                    Add meal
                                  </Button>
                                )}
                              </div>

                              {meal && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 -mr-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all duration-200"
                                  onClick={() => handleDeleteMeal(dateStr, type)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="discover" className="space-y-6 mt-0">
            {/* Recipes Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Discover Recipes</h2>
                <p className="text-sm text-muted-foreground">AI-powered suggestions based on your profile.</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search recipes (e.g., Jollof Rice)"
                    className="pl-9 h-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerateRecipes()}
                  />
                </div>
                <Button size="sm" onClick={handleGenerateRecipes} disabled={recipeLoading}>
                  {recipeLoading ? (
                    <>Generating...</>
                  ) : (
                    <>
                      {searchQuery ? <Search className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                      {searchQuery ? 'Search Recipes' : 'Smart Generate'}
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Empty State / Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Generated Recipe Cards - Filtered */}
              {filteredRecipes.length > 0 ? (
                filteredRecipes.map((recipe, i) => (
                  <Card key={i} className="group overflow-hidden border-border/50 hover:border-border hover:shadow-md transition-all">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className="font-normal text-xs">
                          {recipe.time || '30 mins'}
                        </Badge>
                      </div>
                      <CardTitle className="text-base line-clamp-1">{recipe.name}</CardTitle>
                      <CardDescription className="line-clamp-2 text-xs">{recipe.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-orange-500" />
                          <span>{recipe.calories} kcal</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Activity className="w-3.5 h-3.5 text-blue-500" />
                          <span>{recipe.protein}g P</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 text-xs h-8" onClick={() => setSelectedRecipe(recipe)}>View Recipe</Button>
                        <Button size="sm" className="h-8 w-8 p-0" onClick={() => handleSaveRecipe(recipe)}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                /* Placeholder / Empty State */
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                    <ChefHat className="h-8 w-8 opacity-50" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground">No recipes yet</h3>
                  <p className="max-w-xs mx-auto mb-6">Generate personalized recipes based on your dietary preferences and goals.</p>
                  <Button onClick={handleGenerateRecipes} disabled={recipeLoading}>
                    {recipeLoading ? 'Generating...' : 'Generate Suggestions'}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="saved" className="space-y-6 mt-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Saved Collection</h2>
                <p className="text-sm text-muted-foreground">Your favorite recipes, ready to cook.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedRecipes.length > 0 ? (
                savedRecipes.map((recipe, i) => (
                  <Card key={i} className="group overflow-hidden border-border/50 hover:border-border hover:shadow-md transition-all">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className="font-normal text-xs">
                          {recipe.time || '30 mins'}
                        </Badge>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => recipe.id && handleDeleteRecipe(recipe.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <CardTitle className="text-base line-clamp-1">{recipe.name}</CardTitle>
                      <CardDescription className="line-clamp-2 text-xs">{recipe.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-orange-500" />
                          <span>{recipe.calories} kcal</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Activity className="w-3.5 h-3.5 text-blue-500" />
                          <span>{recipe.protein}g P</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full text-xs h-8" onClick={() => setSelectedRecipe(recipe)}>View Recipe</Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                    <UtensilsCrossed className="h-8 w-8 opacity-50" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground">No saved recipes</h3>
                  <p className="max-w-xs mx-auto mb-6">Save recipes from the Discover tab to build your collection.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Recipe Details Modal */}
        <Dialog open={!!selectedRecipe} onOpenChange={(open) => !open && setSelectedRecipe(null)}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            {selectedRecipe && (
              <>
                <DialogHeader className="mb-6">
                  <DialogTitle className="text-3xl font-bold text-foreground mb-2">{selectedRecipe.name}</DialogTitle>
                  <DialogDescription className="text-muted-foreground text-sm max-w-xl text-left">
                    {selectedRecipe.description}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-4 gap-3 mb-8">
                  <div className="bg-muted/30 p-3 rounded-lg text-center border">
                    <Flame className="w-4 h-4 text-orange-500 mx-auto mb-1" />
                    <div className="text-sm font-semibold">{selectedRecipe.calories}</div>
                    <div className="text-[10px] text-muted-foreground uppercase">Calories</div>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-lg text-center border">
                    <Activity className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                    <div className="text-sm font-semibold">{selectedRecipe.protein}g</div>
                    <div className="text-[10px] text-muted-foreground uppercase">Protein</div>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-lg text-center border">
                    <Wheat className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                    <div className="text-sm font-semibold">{selectedRecipe.carbs}g</div>
                    <div className="text-[10px] text-muted-foreground uppercase">Carbs</div>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-lg text-center border">
                    <Droplets className="w-4 h-4 text-rose-500 mx-auto mb-1" />
                    <div className="text-sm font-semibold">{selectedRecipe.fat}g</div>
                    <div className="text-[10px] text-muted-foreground uppercase">Fat</div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Utensils className="w-4 h-4" />
                      Ingredients
                    </h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedRecipe.ingredients?.map((img: string, i: number) => (
                        <li key={i} className="text-sm flex items-center gap-2 text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {img}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <ChefHat className="w-4 h-4" />
                      Instructions
                    </h3>
                    <div className="space-y-4">
                      {selectedRecipe.instructions?.map((step: string, i: number) => (
                        <div key={i} className="flex gap-4 text-sm">
                          <div className="flex-none w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                            {i + 1}
                          </div>
                          <p className="text-muted-foreground leading-relaxed pt-0.5">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Add Meal Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px] border-border/60 shadow-2xl">
          <DialogHeader className="pb-4 border-b border-border/40">
            <DialogTitle className="text-xl">Add {selectedSlot?.mealType}</DialogTitle>
            <DialogDescription>
              {selectedSlot && new Date(selectedSlot.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="meal-name">Meal Name</Label>
              <Input
                id="meal-name"
                placeholder="e.g., Grilled Salmon with Asparagus"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                autoFocus
                className="h-11 bg-muted/30"
              />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="calories" className="flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                  Calories
                </Label>
                <div className="relative">
                  <Input
                    id="calories"
                    type="number"
                    placeholder="0"
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                    className="pl-8"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                    k
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="protein" className="flex items-center gap-2">
                  <Beef className="w-3.5 h-3.5 text-blue-500" />
                  Protein
                </Label>
                <div className="relative">
                  <Input
                    id="protein"
                    type="number"
                    placeholder="0"
                    value={formData.protein}
                    onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                    className="pl-8"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                    g
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="carbs" className="flex items-center gap-2">
                  <Wheat className="w-3.5 h-3.5 text-amber-500" />
                  Carbs
                </Label>
                <div className="relative">
                  <Input
                    id="carbs"
                    type="number"
                    placeholder="0"
                    value={formData.carbs}
                    onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                    className="pl-8"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                    g
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fat" className="flex items-center gap-2">
                  <Droplets className="w-3.5 h-3.5 text-rose-500" />
                  Fat
                </Label>
                <div className="relative">
                  <Input
                    id="fat"
                    type="number"
                    placeholder="0"
                    value={formData.fat}
                    onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                    className="pl-8"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                    g
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowAddDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitMeal}
                className="flex-[2]"
                disabled={!formData.name.trim()}
              >
                Add to Plan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MealPlanner;
