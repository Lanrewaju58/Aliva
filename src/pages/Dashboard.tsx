import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useHealthData } from "@/contexts/HealthDataContext";
import { useToast } from "@/hooks/use-toast";
import { profileService } from "@/services/profileService";
import { mealService, Meal, MealType } from "@/services/mealService";
import { exerciseService, Exercise, ExerciseType } from "@/services/exerciseService";
import { adminService } from "@/services/adminService";
import { ShareableProgress } from "@/services/shareService";
import { UserProfile } from "@/types/profile";

// import Navigation from "@/components/Navigation";
import LoginChat from "@/components/LoginChat";
import PhotoCalorieChecker from "@/components/PhotoCalorieChecker";
import ShareProgressModal from "@/components/ShareProgressModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MeditationTab from "@/components/dashboard/MeditationTab";
import WomenHealthDashboard from "@/components/WomenHealthDashboard";
import HealthDashboard from "@/components/HealthDashboard";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Droplet,
  TrendingUp,
  Plus,
  Apple,
  UtensilsCrossed,
  Calendar,
  Target,
  Settings,
  Trash2,
  ChevronRight,
  Zap,
  Crown,
  Star,
  Dumbbell,
  Flame,
  Clock,
  X,
  Share2,
  Newspaper
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
  bgColor = "bg-primary/10",
  isPro = false
}: {
  icon: any;
  label: string;
  value: number;
  target: number;
  unit?: string;
  color?: string;
  bgColor?: string;
  isPro?: boolean;
}) => {
  const percentage = target > 0 ? Math.min((value / target) * 100, 100) : 0;

  return (
    <div className={`rounded-xl p-5 transition-all duration-300 ${isPro
      ? 'bg-gradient-to-br from-card to-primary/5 border-2 border-primary/10 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5'
      : 'bg-card border border-border hover:border-border/80'
      }`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2.5 rounded-lg ${isPro ? bgColor.replace('/10', '/20') : bgColor}`}>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="space-y-3">
        <div className="flex items-baseline gap-1.5">
          <span className={`text-2xl font-semibold ${isPro ? 'text-primary' : 'text-foreground'}`}>{value.toLocaleString()}</span>
          <span className="text-sm text-muted-foreground">/ {target.toLocaleString()}{unit}</span>
        </div>
        <div className={`h-2 rounded-full overflow-hidden ${isPro ? 'bg-primary/10' : 'bg-muted'}`}>
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
  onDeleteMeal,
  isPro = false
}: {
  mealType: string;
  meals: Meal[];
  onAddMeal: (type: string) => void;
  onDeleteMeal: (id: string) => void;
  isPro?: boolean;
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
    <div className={`rounded-xl overflow-hidden transition-all duration-300 ${isPro
      ? 'bg-gradient-to-br from-card to-primary/5 border-2 border-primary/10 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5'
      : 'bg-card border border-border hover:border-primary/30'
      }`}>
      <div className={`p-4 border-b ${isPro ? 'border-primary/10' : 'border-border/50'}`}>
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
              <span className={`text-sm font-medium ${isPro ? 'text-primary' : 'text-primary'}`}>{totalCalories} cal</span>
            )}
            <Button
              size="sm"
              variant="ghost"
              className={`h-8 w-8 p-0 ${isPro ? 'hover:bg-primary/10' : ''}`}
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
            className={`w-full py-6 border-2 border-dashed rounded-lg text-muted-foreground text-sm transition-all ${isPro
              ? 'border-primary/20 hover:border-primary/40 hover:text-primary hover:bg-primary/5'
              : 'border-border hover:border-primary/50 hover:text-primary'
              }`}
          >
            <Plus className="h-4 w-4 mx-auto mb-1" />
            Add {mealType}
          </button>
        ) : (
          <div className="space-y-2">
            {meals.map((meal) => (
              <div
                key={meal.id}
                className={`flex items-center justify-between p-3 rounded-lg group transition-colors ${isPro
                  ? 'bg-primary/5 hover:bg-primary/10'
                  : 'bg-muted/30 hover:bg-muted/50'
                  }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{meal.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {meal.protein}g P • {meal.carbs}g C • {meal.fat}g F
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-3">
                  <span className={`text-sm ${isPro ? 'text-primary' : 'text-muted-foreground'}`}>{meal.calories} cal</span>
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
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [waterIntake, setWaterIntake] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [userProfile, todaysMeals, dailyLog, todaysExercises] = await Promise.all([
          profileService.getProfile(userId),
          mealService.getMealsByDate(userId, today),
          mealService.getDailyLog(userId, today),
          exerciseService.getExercisesByDate(userId, today),
        ]);

        setProfile(userProfile);
        setMeals(todaysMeals);
        setWaterIntake(dailyLog?.waterIntake || 0);
        setExercises(todaysExercises);
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

  return { profile, meals, setMeals, exercises, setExercises, waterIntake, setWaterIntake, isLoading, error };
};

// ==================== MAIN COMPONENT ====================

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [showAddMeal, setShowAddMeal] = useState<string | null>(null);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Use shared health data from context
  const {
    profile,
    meals,
    setMeals,
    exercises,
    setExercises,
    waterIntake,
    setWaterIntake,
    dailyStreak,
    setDailyStreak,
    today,
    isLoading,
    error,
    dailyTargets,
    nutritionTotals: totals,
  } = useHealthData();

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

  const handleAddExercise = useCallback(async (
    exerciseData: Omit<Exercise, 'id' | 'userId' | 'date' | 'time' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!user) return;

    try {
      const newExercise: Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'> = {
        ...exerciseData,
        userId: user.uid,
        date: today,
        time: new Date().toISOString(),
      };

      const exerciseId = await exerciseService.addExercise(newExercise);

      setExercises(prev => [...prev, {
        ...newExercise,
        id: exerciseId,
        createdAt: new Date(),
        updatedAt: new Date()
      }] as Exercise[]);

      setShowAddExercise(false);

      toast({
        title: 'Exercise logged',
        description: `${exerciseData.name} - ${exerciseData.duration} mins`
      });
    } catch (err) {
      console.error('Error adding exercise:', err);
      toast({
        title: 'Error',
        description: 'Failed to log exercise.',
        variant: 'destructive'
      });
    }
  }, [user, today, setExercises, toast]);

  const handleDeleteExercise = useCallback(async (exerciseId: string) => {
    if (!user) return;

    try {
      await exerciseService.deleteExercise(user.uid, exerciseId);
      setExercises(prev => prev.filter(e => e.id !== exerciseId));

      toast({
        title: 'Exercise deleted',
        description: 'Exercise removed from log'
      });
    } catch (err) {
      console.error('Error deleting exercise:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete exercise.',
        variant: 'destructive'
      });
    }
  }, [user, setExercises, toast]);

  // ==================== RENDER ====================

  // Must compute these before any conditional returns (React hooks rules)
  const isMonday = new Date().getDay() === 1;
  const isPro = profile?.plan === 'PRO' || isMonday;
  const isAdmin = user ? adminService.isAdmin(user.email, user.uid) : false;
  const canShare = isPro || isAdmin;

  // Prepare shareable progress data (must be before conditional returns for hooks)
  const shareableProgress: ShareableProgress = useMemo(() => ({
    caloriesConsumed: totals.calories,
    calorieTarget: dailyTargets.calories,
    dailyStreak,
    mealsToday: meals.map(m => ({ name: m.name, calories: m.calories })),
    exercisesToday: exercises.map(e => ({ name: e.name, duration: e.duration, caloriesBurned: e.caloriesBurned })),
    userName: user?.displayName || 'User',
    isPro,
  }), [totals.calories, dailyTargets.calories, dailyStreak, meals, exercises, user?.displayName, isPro]);

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
    <div className={`min-h-screen ${isPro ? 'bg-gradient-to-br from-background via-background to-primary/5' : 'bg-background'}`}>
      {/* Navigation removed - handled by AppShell */}

      <main className=""> {/* Padding handled by AppShell */}
        <div className=""> {/* Container handled by AppShell */}.

          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
                  Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user.displayName?.split(' ')[0] || 'there'}
                </h1>
                {isPro && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium">
                    <Crown className="w-3 h-3" />
                    PRO
                  </span>
                )}
              </div>
              <p className="text-muted-foreground">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/profile')} className="hidden sm:flex">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 rounded-xl border border-destructive/50 bg-destructive/5 text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Main Tabs */}
          <Tabs defaultValue="overview" className="space-y-8">
            <div className="flex justify-center mb-6">
              <TabsList className="bg-muted/50 p-1">
                <TabsTrigger value="overview" className="data-[state=active]:bg-background">Overview</TabsTrigger>
                <TabsTrigger value="meals" className="data-[state=active]:bg-background">Meals</TabsTrigger>
                <TabsTrigger value="health" className="data-[state=active]:bg-background">Health</TabsTrigger>
                <TabsTrigger value="mindfulness" className="data-[state=active]:bg-background">Mindfulness</TabsTrigger>
                <TabsTrigger value="chat" className="data-[state=active]:bg-background">AI Assistant</TabsTrigger>
              </TabsList>
            </div>

            {/* Blog Link - Mobile Only */}
            <div className="lg:hidden flex justify-center -mt-4 mb-6">
              <div className="bg-muted/50 p-1 rounded-md">
                <button
                  onClick={() => navigate('/blog')}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-background text-foreground shadow-sm"
                >
                  Aliva Blog
                </button>
              </div>
            </div>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-8">
              {/* Calorie Summary + Quick Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calorie Ring Card */}
                <div className={`relative rounded-xl p-6 lg:col-span-1 overflow-hidden ${isPro
                  ? 'bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20 shadow-lg shadow-primary/5'
                  : 'bg-card border border-border'
                  }`}>
                  {isPro && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-medium">
                      <Crown className="w-2.5 h-2.5" />
                      PRO
                    </div>
                  )}
                  <div className="text-center">
                    <CircularProgress value={totals.calories} max={dailyTargets.calories} size={160} strokeWidth={12}>
                      <div className="text-center">
                        <p className="text-3xl font-semibold text-foreground">{totals.calories}</p>
                        <p className="text-xs text-muted-foreground">of {dailyTargets.calories} cal</p>
                      </div>
                    </CircularProgress>

                    <div className="mt-6 pt-6 border-t border-border/50">
                      <div className="flex justify-between items-center">
                        <div className="text-center">
                          <p className={`text-lg font-semibold ${isPro ? 'text-primary' : 'text-foreground'}`}>{remainingCalories}</p>
                          <p className="text-xs text-muted-foreground">Remaining</p>
                        </div>
                        <div className="h-8 w-px bg-border/50" />
                        <div className="text-center">
                          <p className={`text-lg font-semibold ${isPro ? 'text-primary' : 'text-foreground'}`}>{dailyStreak}</p>
                          <p className="text-xs text-muted-foreground">Day streak</p>
                        </div>
                        <div className="h-8 w-px bg-border/50" />
                        <div className="text-center">
                          <p className={`text-lg font-semibold ${isPro ? 'text-primary' : 'text-foreground'}`}>{meals.length}</p>
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
                    isPro={isPro}
                  />
                  <StatCard
                    icon={Apple}
                    label="Carbs"
                    value={totals.carbs}
                    target={dailyTargets.carbs}
                    unit="g"
                    color="text-amber-500"
                    bgColor="bg-amber-500/10"
                    isPro={isPro}
                  />
                  <StatCard
                    icon={Zap}
                    label="Fat"
                    value={totals.fat}
                    target={dailyTargets.fat}
                    unit="g"
                    color="text-purple-500"
                    bgColor="bg-purple-500/10"
                    isPro={isPro}
                  />
                  <StatCard
                    icon={Droplet}
                    label="Water"
                    value={waterIntake}
                    target={dailyTargets.water}
                    unit=" glasses"
                    color="text-cyan-500"
                    bgColor="bg-cyan-500/10"
                    isPro={isPro}
                  />
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  className={`h-auto py-4 flex-col gap-2 transition-all ${isPro
                    ? 'border-2 border-primary/10 hover:border-primary/30 hover:bg-primary/5 hover:shadow-lg hover:shadow-primary/5'
                    : 'hover:bg-primary/5 hover:border-primary/30'
                    }`}
                  onClick={handleAddWater}
                  disabled={waterIntake >= dailyTargets.water}
                >
                  <Droplet className="h-5 w-5 text-cyan-500" />
                  <span className="text-sm">Log Water</span>
                </Button>
                <Button
                  variant="outline"
                  className={`h-auto py-4 flex-col gap-2 transition-all ${isPro
                    ? 'border-2 border-primary/10 hover:border-primary/30 hover:bg-primary/5 hover:shadow-lg hover:shadow-primary/5'
                    : 'hover:bg-primary/5 hover:border-primary/30'
                    }`}
                  onClick={() => navigate('/profile')}
                >
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Log Weight</span>
                </Button>
                <Button
                  variant="outline"
                  className={`h-auto py-4 flex-col gap-2 transition-all ${isPro
                    ? 'border-2 border-primary/10 hover:border-primary/30 hover:bg-primary/5 hover:shadow-lg hover:shadow-primary/5'
                    : 'hover:bg-primary/5 hover:border-primary/30'
                    }`}
                  onClick={() => navigate('/meal-planner')}
                >
                  <Calendar className="h-5 w-5 text-purple-500" />
                  <span className="text-sm">Meal Plan</span>
                </Button>
              </div>

              {/* Macros Breakdown */}
              <div className={`rounded-xl p-6 ${isPro
                ? 'bg-gradient-to-br from-card to-primary/5 border-2 border-primary/10'
                : 'bg-card border border-border'
                }`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-foreground">Today's Macros</h3>
                  {isPro && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-medium">
                      <Crown className="w-2.5 h-2.5" />
                      PRO
                    </span>
                  )}
                </div>
                <div className="space-y-5">
                  <MacroBar label="Protein" value={totals.protein} target={dailyTargets.protein} color="bg-blue-500" />
                  <MacroBar label="Carbohydrates" value={totals.carbs} target={dailyTargets.carbs} color="bg-amber-500" />
                  <MacroBar label="Fat" value={totals.fat} target={dailyTargets.fat} color="bg-purple-500" />
                </div>
              </div>

              {/* Exercise Log Section */}
              <div className={`rounded-xl p-6 ${isPro
                ? 'bg-gradient-to-br from-card to-primary/5 border-2 border-primary/10'
                : 'bg-card border border-border'
                }`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${isPro ? 'bg-orange-500/20' : 'bg-orange-500/10'}`}>
                      <Dumbbell className="h-4 w-4 text-orange-500" />
                    </div>
                    <h3 className="font-semibold text-foreground">Today's Exercise</h3>
                  </div>
                  <Button size="sm" onClick={() => setShowAddExercise(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>

                {/* Add Exercise Form */}
                {showAddExercise && (
                  <div className="mb-6 p-4 bg-muted/30 rounded-xl border border-border">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-foreground">Log Exercise</h4>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowAddExercise(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.target as HTMLFormElement;
                        const formData = new FormData(form);
                        handleAddExercise({
                          name: formData.get('name') as string,
                          exerciseType: formData.get('type') as ExerciseType,
                          duration: Number(formData.get('duration')),
                          caloriesBurned: Number(formData.get('calories')),
                        });
                        form.reset();
                      }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="ex-name">Exercise Name</Label>
                          <Input id="ex-name" name="name" placeholder="Running, Yoga..." required className="h-10" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ex-type">Type</Label>
                          <select
                            id="ex-type"
                            name="type"
                            required
                            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <option value="cardio">Cardio</option>
                            <option value="strength">Strength</option>
                            <option value="flexibility">Flexibility</option>
                            <option value="sports">Sports</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="ex-duration">Duration (mins)</Label>
                          <Input id="ex-duration" name="duration" type="number" min="1" placeholder="30" required className="h-10" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ex-calories">Calories Burned</Label>
                          <Input id="ex-calories" name="calories" type="number" min="0" placeholder="200" required className="h-10" />
                        </div>
                      </div>
                      <Button type="submit" className="w-full h-10">
                        <Plus className="h-4 w-4 mr-2" />
                        Log Exercise
                      </Button>
                    </form>
                  </div>
                )}

                {/* Exercise List */}
                {exercises.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Dumbbell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No exercises logged today</p>
                    <p className="text-xs mt-1">Click "Add" to log your workout</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {exercises.map((exercise) => (
                      <div
                        key={exercise.id}
                        className={`flex items-center justify-between p-3 rounded-lg group transition-colors ${isPro ? 'bg-primary/5 hover:bg-primary/10' : 'bg-muted/30 hover:bg-muted/50'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${exercise.exerciseType === 'cardio' ? 'bg-red-500/10' :
                            exercise.exerciseType === 'strength' ? 'bg-orange-500/10' :
                              exercise.exerciseType === 'flexibility' ? 'bg-purple-500/10' :
                                exercise.exerciseType === 'sports' ? 'bg-green-500/10' : 'bg-gray-500/10'
                            }`}>
                            {exercise.exerciseType === 'cardio' && <Flame className="h-4 w-4 text-red-500" />}
                            {exercise.exerciseType === 'strength' && <Dumbbell className="h-4 w-4 text-orange-500" />}
                            {exercise.exerciseType === 'flexibility' && <TrendingUp className="h-4 w-4 text-purple-500" />}
                            {exercise.exerciseType === 'sports' && <Target className="h-4 w-4 text-green-500" />}
                            {exercise.exerciseType === 'other' && <Zap className="h-4 w-4 text-gray-500" />}
                          </div>
                          <div>
                            <p className="font-medium text-sm text-foreground">{exercise.name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {exercise.duration} mins
                              <span className="text-muted-foreground/50">•</span>
                              <Flame className="h-3 w-3" />
                              {exercise.caloriesBurned} cal
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100 h-7 w-7 p-0 transition-opacity"
                          onClick={() => handleDeleteExercise(exercise.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    ))}

                    {/* Exercise Summary */}
                    <div className={`mt-4 pt-4 border-t flex justify-around text-center ${isPro ? 'border-primary/10' : 'border-border'}`}>
                      <div>
                        <p className={`text-lg font-semibold ${isPro ? 'text-primary' : 'text-foreground'}`}>
                          {exercises.reduce((sum, e) => sum + e.duration, 0)}
                        </p>
                        <p className="text-xs text-muted-foreground">Total mins</p>
                      </div>
                      <div>
                        <p className={`text-lg font-semibold ${isPro ? 'text-primary' : 'text-foreground'}`}>
                          {exercises.reduce((sum, e) => sum + e.caloriesBurned, 0)}
                        </p>
                        <p className="text-xs text-muted-foreground">Calories burned</p>
                      </div>
                      <div>
                        <p className={`text-lg font-semibold ${isPro ? 'text-primary' : 'text-foreground'}`}>
                          {exercises.length}
                        </p>
                        <p className="text-xs text-muted-foreground">Workouts</p>
                      </div>
                    </div>
                  </div>
                )}
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
              <div className={`flex items-center justify-between p-4 rounded-xl ${isPro ? 'bg-gradient-to-r from-primary/5 to-transparent' : ''}`}>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Today's Meals</h2>
                  {isPro && <p className="text-sm text-primary">Pro: Unlimited meal logging</p>}
                </div>
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
                    isPro={isPro}
                  />
                ))}
              </div>
            </TabsContent>

            {/* Health Tab */}
            <TabsContent value="health" className="space-y-6">
              {/* Show Women's Health Dashboard + Health Metrics for female Pro users */}
              {profile?.gender === 'female' && isPro ? (
                <div className="space-y-8">
                  <WomenHealthDashboard />
                  <div className="border-t pt-8">
                    <HealthDashboard />
                  </div>
                </div>
              ) : isPro ? (
                <HealthDashboard />
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-primary/10">
                    <TrendingUp className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-semibold text-foreground mb-2">Health Tracking</h2>
                  <p className="text-muted-foreground max-w-md mb-6">
                    {profile?.gender === 'female'
                      ? 'Upgrade to Pro to access menstrual cycle tracking, symptom logging, and personalized insights.'
                      : 'Upgrade to Pro to track steps, sleep, heart rate, and log your daily health metrics.'}
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary">
                    <span className="w-2 h-2 rounded-full animate-pulse bg-primary" />
                    Upgrade to Pro
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Mindfulness Tab */}
            <TabsContent value="mindfulness">
              <MeditationTab isPro={isPro} />
            </TabsContent>

            {/* Chat Tab */}
            <TabsContent value="chat">
              <div className={`rounded-xl p-6 ${isPro
                ? 'bg-gradient-to-br from-card to-primary/5 border-2 border-primary/10'
                : 'bg-card border border-border'
                }`}>
                {isPro && (
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b border-primary/10">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-medium">
                      <Crown className="w-2.5 h-2.5" />
                      PRO
                    </span>
                    <span className="text-sm text-muted-foreground">Unlimited AI consultations</span>
                  </div>
                )}
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

      {/* Share Progress Modal */}
      <ShareProgressModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        progress={shareableProgress}
      />
    </div>
  );
};

export default Dashboard;