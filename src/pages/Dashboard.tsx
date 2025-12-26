import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { profileService } from "@/services/profileService";
import { mealService, Meal, MealType } from "@/services/mealService";
import { UserProfile } from "@/types/profile";

import Navigation from "@/components/Navigation";
import LoginChat from "@/components/LoginChat";
import PhotoCalorieChecker from "@/components/PhotoCalorieChecker";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Droplet,
  TrendingUp,
  Plus,
  Flame,
  Apple,
  UtensilsCrossed,
  Calendar,
  Target,
  Award,
  Settings,
  Trash2,
  ChevronRight,
  Zap
} from "lucide-react";

// ==================== TYPES ====================
interface DailyTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
}

interface NutritionTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// ==================== COMPONENTS ====================

// Circular Progress Ring Component
const CircularProgress = ({
  value,
  max,
  size = 120,
  strokeWidth = 8,
  children
}: {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min((value / max) * 100, 100);
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-primary transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

// Macro Bar Component
const MacroBar = ({
  label,
  value,
  target,
  color
}: {
  label: string;
  value: number;
  target: number;
  color: string;
}) => {
  const percentage = Math.min((value / target) * 100, 100);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-sm text-muted-foreground">
          {value}g <span className="text-muted-foreground/60">/ {target}g</span>
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({
  icon: Icon,
  label,
  value,
  target,
  unit = "",
  color = "text-primary",
  bgColor = "bg-primary/10"
}: {
  icon: any;
  label: string;
  value: number;
  target: number;
  unit?: string;
  color?: string;
  bgColor?: string;
}) => {
  const percentage = target > 0 ? Math.min((value / target) * 100, 100) : 0;

  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:border-border/80 transition-colors">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2.5 rounded-lg ${bgColor}`}>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="space-y-3">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-semibold text-foreground">{value.toLocaleString()}</span>
          <span className="text-sm text-muted-foreground">/ {target.toLocaleString()}{unit}</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${bgColor.replace('/10', '')}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// MealCard Component
const MealCard = ({
  mealType,
  meals,
  onAddMeal,
  onDeleteMeal
}: {
  mealType: string;
  meals: Meal[];
  onAddMeal: (type: string) => void;
  onDeleteMeal: (id: string) => void;
}) => {
  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const mealLabels: Record<string, { icon: string; time: string }> = {
    breakfast: { icon: '🌅', time: '6am - 10am' },
    lunch: { icon: '☀️', time: '11am - 2pm' },
    dinner: { icon: '🌙', time: '5pm - 9pm' },
    snack: { icon: '🍎', time: 'Anytime' }
  };

  const mealInfo = mealLabels[mealType] || { icon: '🍽️', time: '' };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-colors">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{mealInfo.icon}</span>
            <div>
              <h4 className="font-medium text-foreground capitalize">{mealType}</h4>
              <p className="text-xs text-muted-foreground">{mealInfo.time}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {totalCalories > 0 && (
              <span className="text-sm font-medium text-primary">{totalCalories} cal</span>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={() => onAddMeal(mealType)}
              aria-label={`Add ${mealType}`}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4">
        {meals.length === 0 ? (
          <button
            onClick={() => onAddMeal(mealType)}
            className="w-full py-6 border-2 border-dashed border-border rounded-lg text-muted-foreground text-sm hover:border-primary/50 hover:text-primary transition-colors"
          >
            <Plus className="h-4 w-4 mx-auto mb-1" />
            Add {mealType}
          </button>
        ) : (
          <div className="space-y-2">
            {meals.map((meal) => (
              <div
                key={meal.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 group hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{meal.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {meal.protein}g P • {meal.carbs}g C • {meal.fat}g F
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-3">
                  <span className="text-sm text-muted-foreground">{meal.calories} cal</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100 h-7 w-7 p-0 transition-opacity"
                    onClick={() => onDeleteMeal(meal.id)}
                    aria-label={`Delete ${meal.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// AddMealForm Component
const AddMealForm = ({
  mealType,
  onClose,
  onAdd
}: {
  mealType: string;
  onClose: () => void;
  onAdd: (meal: Omit<Meal, 'id' | 'userId' | 'date' | 'time' | 'createdAt' | 'updatedAt'>) => void;
}) => {
  const [formData, setFormData] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      onAdd({
        name: formData.name.trim(),
        mealType: mealType as MealType,
        calories: Number(formData.calories),
        protein: Number(formData.protein),
        carbs: Number(formData.carbs),
        fat: Number(formData.fat),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-foreground capitalize">Add {mealType}</h3>
          <p className="text-sm text-muted-foreground">Log your meal details</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="meal-name">Food Name</Label>
          <Input
            id="meal-name"
            placeholder="e.g., Grilled Chicken Salad"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            disabled={isSubmitting}
            autoFocus
            className="h-11"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="calories">Calories</Label>
            <Input
              id="calories"
              type="number"
              min="0"
              step="1"
              placeholder="250"
              value={formData.calories}
              onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
              required
              disabled={isSubmitting}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="protein">Protein (g)</Label>
            <Input
              id="protein"
              type="number"
              min="0"
              step="0.1"
              placeholder="30"
              value={formData.protein}
              onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
              required
              disabled={isSubmitting}
              className="h-11"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="carbs">Carbs (g)</Label>
            <Input
              id="carbs"
              type="number"
              min="0"
              step="0.1"
              placeholder="20"
              value={formData.carbs}
              onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
              required
              disabled={isSubmitting}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fat">Fat (g)</Label>
            <Input
              id="fat"
              type="number"
              min="0"
              step="0.1"
              placeholder="10"
              value={formData.fat}
              onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
              required
              disabled={isSubmitting}
              className="h-11"
            />
          </div>
        </div>

        <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
          <Plus className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Adding...' : 'Add Meal'}
        </Button>
      </form>
    </div>
  );
};

// ==================== HOOKS ====================

const useDashboardData = (userId: string, today: string) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [waterIntake, setWaterIntake] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [userProfile, todaysMeals, dailyLog] = await Promise.all([
          profileService.getProfile(userId),
          mealService.getMealsByDate(userId, today),
          mealService.getDailyLog(userId, today),
        ]);

        setProfile(userProfile);
        setMeals(todaysMeals);
        setWaterIntake(dailyLog?.waterIntake || 0);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load dashboard data');
        toast({
          title: 'Error loading data',
          description: 'Some features may not work correctly.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [userId, today, toast]);

  return { profile, meals, setMeals, waterIntake, setWaterIntake, isLoading, error };
};

// ==================== MAIN COMPONENT ====================

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [showAddMeal, setShowAddMeal] = useState<string | null>(null);
  const [dailyStreak, setDailyStreak] = useState<number>(0);
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const { profile, meals, setMeals, waterIntake, setWaterIntake, isLoading, error } =
    useDashboardData(user?.uid || '', today);

  // Load daily streak
  useEffect(() => {
    const loadStreak = async () => {
      if (!user?.uid) {
        setDailyStreak(0);
        return;
      }
      try {
        const streak = await mealService.getDailyStreak(user.uid);
        setDailyStreak(streak);
      } catch (error) {
        console.error('Error loading daily streak:', error);
        setDailyStreak(0);
      }
    };
    loadStreak();
  }, [user?.uid, meals]);

  // Calculate daily targets
  const dailyTargets: DailyTargets = useMemo(() => ({
    calories: profile?.preferredCalorieTarget || 2000,
    protein: profile?.currentWeightKg ? Math.round(profile.currentWeightKg * 1.8) : 150,
    carbs: 200,
    fat: 65,
    water: 8
  }), [profile]);

  // Calculate nutrition totals
  const totals: NutritionTotals = useMemo(() =>
    meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
        carbs: acc.carbs + meal.carbs,
        fat: acc.fat + meal.fat
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    ),
    [meals]
  );

  // Filter meals by type
  const mealsByType = useMemo(() => ({
    breakfast: meals.filter(m => m.mealType === 'breakfast'),
    lunch: meals.filter(m => m.mealType === 'lunch'),
    dinner: meals.filter(m => m.mealType === 'dinner'),
    snack: meals.filter(m => m.mealType === 'snack')
  }), [meals]);

  // Redirect to onboarding if profile incomplete
  useEffect(() => {
    if (!authLoading && !isLoading && profile && !profile.preferredCalorieTarget) {
      navigate('/onboarding');
    }
  }, [authLoading, isLoading, profile, navigate]);

  // ==================== HANDLERS ====================

  const handleAddMeal = useCallback(async (
    mealData: Omit<Meal, 'id' | 'userId' | 'date' | 'time' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!user) return;

    try {
      const newMeal: Omit<Meal, 'id' | 'createdAt' | 'updatedAt'> = {
        ...mealData,
        userId: user.uid,
        date: today,
        time: new Date().toISOString(),
      };

      const mealId = await mealService.addMeal(newMeal);

      setMeals(prev => [...prev, {
        ...newMeal,
        id: mealId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }] as Meal[]);

      setShowAddMeal(null);

      toast({
        title: 'Meal added',
        description: `${mealData.name} logged successfully`
      });
    } catch (err) {
      console.error('Error adding meal:', err);
      toast({
        title: 'Error',
        description: 'Failed to add meal.',
        variant: 'destructive'
      });
    }
  }, [user, today, setMeals, toast]);

  const handleDeleteMeal = useCallback(async (mealId: string) => {
    if (!user) return;

    try {
      await mealService.deleteMeal(user.uid, mealId);
      setMeals(prev => prev.filter(m => m.id !== mealId));

      toast({
        title: 'Meal deleted',
        description: 'Meal removed from log'
      });
    } catch (err) {
      console.error('Error deleting meal:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete meal.',
        variant: 'destructive'
      });
    }
  }, [user, setMeals, toast]);

  const handleAddWater = useCallback(async () => {
    if (!user || waterIntake >= dailyTargets.water) return;

    try {
      const newWaterIntake = waterIntake + 1;
      await mealService.updateDailyLog(user.uid, today, newWaterIntake);
      setWaterIntake(newWaterIntake);

      toast({
        title: 'Water logged',
        description: `${newWaterIntake} / ${dailyTargets.water} glasses`
      });
    } catch (err) {
      console.error('Error updating water:', err);
      toast({
        title: 'Error',
        description: 'Failed to log water.',
        variant: 'destructive'
      });
    }
  }, [user, waterIntake, dailyTargets.water, today, setWaterIntake, toast]);

  // ==================== RENDER ====================

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) return null;

  const caloriePercentage = Math.min((totals.calories / dailyTargets.calories) * 100, 100);
  const remainingCalories = Math.max(dailyTargets.calories - totals.calories, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-1">
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user.displayName?.split(' ')[0] || 'there'}
              </h1>
              <p className="text-muted-foreground">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/profile')} className="hidden sm:flex">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 rounded-xl border border-destructive/50 bg-destructive/5 text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Main Tabs */}
          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="overview" className="data-[state=active]:bg-background">Overview</TabsTrigger>
              <TabsTrigger value="meals" className="data-[state=active]:bg-background">Meals</TabsTrigger>
              <TabsTrigger value="chat" className="data-[state=active]:bg-background">AI Assistant</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-8">
              {/* Calorie Summary + Quick Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calorie Ring Card */}
                <div className="bg-card border border-border rounded-xl p-6 lg:col-span-1">
                  <div className="text-center">
                    <CircularProgress value={totals.calories} max={dailyTargets.calories} size={160} strokeWidth={12}>
                      <div className="text-center">
                        <p className="text-3xl font-semibold text-foreground">{totals.calories}</p>
                        <p className="text-xs text-muted-foreground">of {dailyTargets.calories} cal</p>
                      </div>
                    </CircularProgress>

                    <div className="mt-6 pt-6 border-t border-border">
                      <div className="flex justify-between items-center">
                        <div className="text-center">
                          <p className="text-lg font-semibold text-foreground">{remainingCalories}</p>
                          <p className="text-xs text-muted-foreground">Remaining</p>
                        </div>
                        <div className="h-8 w-px bg-border" />
                        <div className="text-center">
                          <p className="text-lg font-semibold text-foreground">{dailyStreak}</p>
                          <p className="text-xs text-muted-foreground">Day streak</p>
                        </div>
                        <div className="h-8 w-px bg-border" />
                        <div className="text-center">
                          <p className="text-lg font-semibold text-foreground">{meals.length}</p>
                          <p className="text-xs text-muted-foreground">Meals</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                  <StatCard
                    icon={Target}
                    label="Protein"
                    value={totals.protein}
                    target={dailyTargets.protein}
                    unit="g"
                    color="text-blue-500"
                    bgColor="bg-blue-500/10"
                  />
                  <StatCard
                    icon={Apple}
                    label="Carbs"
                    value={totals.carbs}
                    target={dailyTargets.carbs}
                    unit="g"
                    color="text-amber-500"
                    bgColor="bg-amber-500/10"
                  />
                  <StatCard
                    icon={Zap}
                    label="Fat"
                    value={totals.fat}
                    target={dailyTargets.fat}
                    unit="g"
                    color="text-purple-500"
                    bgColor="bg-purple-500/10"
                  />
                  <StatCard
                    icon={Droplet}
                    label="Water"
                    value={waterIntake}
                    target={dailyTargets.water}
                    unit=" glasses"
                    color="text-cyan-500"
                    bgColor="bg-cyan-500/10"
                  />
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2 hover:bg-primary/5 hover:border-primary/30"
                  onClick={handleAddWater}
                  disabled={waterIntake >= dailyTargets.water}
                >
                  <Droplet className="h-5 w-5 text-cyan-500" />
                  <span className="text-sm">Log Water</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2 hover:bg-primary/5 hover:border-primary/30"
                  onClick={() => navigate('/profile')}
                >
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Log Weight</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2 hover:bg-primary/5 hover:border-primary/30"
                  onClick={() => navigate('/meal-planner')}
                >
                  <Calendar className="h-5 w-5 text-purple-500" />
                  <span className="text-sm">Meal Plan</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2 hover:bg-primary/5 hover:border-primary/30"
                  onClick={() => setShowAddMeal('snack')}
                >
                  <Plus className="h-5 w-5 text-primary" />
                  <span className="text-sm">Quick Add</span>
                </Button>
              </div>

              {/* Macros Breakdown */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-6">Today's Macros</h3>
                <div className="space-y-5">
                  <MacroBar label="Protein" value={totals.protein} target={dailyTargets.protein} color="bg-blue-500" />
                  <MacroBar label="Carbohydrates" value={totals.carbs} target={dailyTargets.carbs} color="bg-amber-500" />
                  <MacroBar label="Fat" value={totals.fat} target={dailyTargets.fat} color="bg-purple-500" />
                </div>
              </div>

              {/* Recent Meals */}
              {meals.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">Recent Meals</h3>
                    <Button variant="ghost" size="sm" className="text-primary" onClick={() => { }}>
                      View All
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {meals.slice(-3).reverse().map((meal) => (
                      <div key={meal.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <UtensilsCrossed className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground text-sm">{meal.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{meal.mealType}</p>
                          </div>
                        </div>
                        <p className="font-medium text-foreground">{meal.calories} cal</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Meals Tab */}
            <TabsContent value="meals" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Today's Meals</h2>
                <PhotoCalorieChecker onAddMeal={handleAddMeal} />
              </div>

              {showAddMeal && (
                <AddMealForm mealType={showAddMeal} onClose={() => setShowAddMeal(null)} onAdd={handleAddMeal} />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(mealsByType).map(([type, typeMeals]) => (
                  <MealCard
                    key={type}
                    mealType={type}
                    meals={typeMeals}
                    onAddMeal={setShowAddMeal}
                    onDeleteMeal={handleDeleteMeal}
                  />
                ))}
              </div>
            </TabsContent>

            {/* Chat Tab */}
            <TabsContent value="chat">
              <div className="bg-card border border-border rounded-xl p-6">
                <LoginChat
                  dashboardData={{
                    totals,
                    targets: dailyTargets,
                    waterIntake
                  }}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;