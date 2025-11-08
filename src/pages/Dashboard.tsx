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
  Trash2
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

// QuickStatCard Component
const QuickStatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  target, 
  unit = "",
  color = "primary" 
}: { 
  icon: any; 
  label: string; 
  value: number; 
  target: number;
  unit?: string;
  color?: string;
}) => {
  const percentage = target > 0 ? Math.min((value / target) * 100, 100) : 0;
  
  const colorClasses = {
    orange: { bg: 'bg-orange-500/10', text: 'text-orange-500' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-500' },
    green: { bg: 'bg-green-500/10', text: 'text-green-500' },
    cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-500' },
    primary: { bg: 'bg-primary/10', text: 'text-primary' }
  };

  const colors = colorClasses[color as keyof typeof colorClasses] || colorClasses.primary;
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className={`p-2 rounded-lg ${colors.bg}`}>
            <Icon className={`h-4 w-4 ${colors.text}`} />
          </div>
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">{value}</span>
            <span className="text-sm text-muted-foreground">/ {target}{unit}</span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>
      </CardContent>
    </Card>
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
  const mealIcons = {
    breakfast: '🌅',
    lunch: '☀️',
    dinner: '🌙',
    snack: '🍎'
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{mealIcons[mealType as keyof typeof mealIcons]}</span>
            <div>
              <CardTitle className="text-sm font-medium capitalize">{mealType}</CardTitle>
              <CardDescription className="text-xs">
                {totalCalories > 0 ? `${totalCalories} cal` : 'No meals logged'}
              </CardDescription>
            </div>
          </div>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => onAddMeal(mealType)}
            aria-label={`Add ${mealType}`}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      {meals.length > 0 && (
        <CardContent className="pt-0">
          <div className="space-y-2">
            {meals.map((meal) => (
              <div 
                key={meal.id} 
                className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/50 group"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{meal.name}</div>
                  <div className="text-xs text-muted-foreground">
                    P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fat}g
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <span className="text-muted-foreground whitespace-nowrap">
                    {meal.calories} cal
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0 transition-opacity"
                    onClick={() => onDeleteMeal(meal.id)}
                    aria-label={`Delete ${meal.name}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
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
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Add {mealType}</CardTitle>
        <CardDescription>Log your meal details</CardDescription>
      </CardHeader>
      <CardContent>
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
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isSubmitting}
            >
              <Plus className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Adding...' : 'Add Meal'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
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
  }, [user?.uid, meals]); // Recalculate when meals change

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
      }]);
      
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
      <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background">
      <Navigation />
      
      <main className="pt-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user.displayName?.split(' ')[0] || 'there'}! 👋
            </h1>
            <p className="text-muted-foreground">Track your nutrition and reach your goals</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/profile')}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Card className="mb-6 border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="meals">Meals</TabsTrigger>
            <TabsTrigger value="chat">AI Assistant</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <QuickStatCard icon={Flame} label="Calories" value={totals.calories} target={dailyTargets.calories} color="orange" />
              <QuickStatCard icon={Target} label="Protein" value={totals.protein} target={dailyTargets.protein} unit="g" color="blue" />
              <QuickStatCard icon={Apple} label="Carbs" value={totals.carbs} target={dailyTargets.carbs} unit="g" color="green" />
              <QuickStatCard icon={Droplet} label="Water" value={waterIntake} target={dailyTargets.water} unit=" glasses" color="cyan" />
            </div>

            {/* Streak & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Daily Streak</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold">{dailyStreak}</p>
                      <p className="text-sm text-muted-foreground">days in a row</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="justify-start gap-2" onClick={handleAddWater} disabled={waterIntake >= dailyTargets.water}>
                      <Droplet className="h-4 w-4 text-blue-500" />
                      Log Water
                    </Button>
                    <Button variant="outline" className="justify-start gap-2" onClick={() => navigate('/profile')}>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      Log Weight
                    </Button>
                    <Button variant="outline" className="justify-start gap-2" onClick={() => navigate('/meal-planner')}>
                      <Calendar className="h-4 w-4 text-purple-500" />
                      Meal Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Macros Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Macros</CardTitle>
                <CardDescription>Your nutritional breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: 'Protein', value: totals.protein, target: dailyTargets.protein },
                    { label: 'Carbs', value: totals.carbs, target: dailyTargets.carbs },
                    { label: 'Fat', value: totals.fat, target: dailyTargets.fat }
                  ].map(({ label, value, target }) => (
                    <div key={label} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-medium">{value}g / {target}g</span>
                      </div>
                      <Progress value={Math.min((value / target) * 100, 100)} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Meals */}
            {meals.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Meals</CardTitle>
                  <CardDescription>Your last 3 meals today</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {meals.slice(-3).reverse().map((meal) => (
                      <div key={meal.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium">{meal.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{meal.mealType}</p>
                        </div>
                        <p className="font-medium">{meal.calories} cal</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Meals Tab */}
          <TabsContent value="meals" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Today's Meals</h3>
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
            <Card className="p-4 bg-card shadow-xl border border-border rounded-[20px]">
              <LoginChat 
                dashboardData={{
                  totals,
                  targets: dailyTargets,
                  waterIntake
                }}
              />
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;