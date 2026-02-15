
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useHealthData } from "@/contexts/HealthDataContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
  Flame,
  Award,
  Share2,
} from "lucide-react";
import { profileService } from "@/services/profileService";
import { mealService, Meal } from "@/services/mealService";
import { exerciseService, Exercise } from "@/services/exerciseService";
import { adminService } from "@/services/adminService";
import { UserProfile } from "@/types/profile";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import ShareProgressModal from "@/components/ShareProgressModal";
import { ShareableProgress } from "@/services/shareService";

type TimeRange = '7days' | '30days' | '90days' | 'all';

const Progress = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get shared data from context
  const {
    profile,
    meals: todayMeals,
    exercises: todayExercises,
    dailyStreak,
    dailyTargets,
  } = useHealthData();

  // Page-specific state
  const [calorieData, setCalorieData] = useState<{ date: string; calories: number; target: number }[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('30days');
  const [pageLoading, setPageLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (!user || !profile) return;

    const loadCalorieData = async () => {
      try {
        // Calculate date range
        const endDate = new Date();
        let startDate = new Date();

        switch (timeRange) {
          case '7days':
            startDate.setDate(endDate.getDate() - 7);
            break;
          case '30days':
            startDate.setDate(endDate.getDate() - 30);
            break;
          case '90days':
            startDate.setDate(endDate.getDate() - 90);
            break;
          case 'all':
            startDate = new Date(profile?.createdAt || new Date());
            break;
        }

        const start = startDate.toISOString().split('T')[0];
        const end = endDate.toISOString().split('T')[0];

        const calories = await mealService.getCaloriesByDateRange(user.uid, start, end);

        // Fill in missing dates with 0 calories
        const filledData = [];
        const current = new Date(startDate);
        const target = dailyTargets.calories;

        while (current <= endDate) {
          const dateStr = current.toISOString().split('T')[0];
          const existingData = calories.find(c => c.date === dateStr);

          filledData.push({
            date: new Date(current).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            calories: existingData?.calories || 0,
            target: target,
          });

          current.setDate(current.getDate() + 1);
        }

        setCalorieData(filledData);
      } catch (error) {
        console.error('Error loading progress data:', error);
        toast({
          title: 'Error loading data',
          description: 'Failed to load progress data',
          variant: 'destructive'
        });
      } finally {
        setPageLoading(false);
      }
    };

    loadCalorieData();
  }, [user, profile, timeRange, dailyTargets.calories, toast]);

  // Calculate statistics
  const weightHistory = profile?.weightHistory || [];
  const sortedWeights = [...weightHistory].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const startWeight = sortedWeights[0]?.weightKg;
  const currentWeight = profile?.currentWeightKg || sortedWeights[sortedWeights.length - 1]?.weightKg;
  const targetWeight = profile?.targetWeightKg;
  const weightChange = startWeight && currentWeight ? currentWeight - startWeight : 0;
  const weightToGo = targetWeight && currentWeight ? targetWeight - currentWeight : 0;

  const daysWithCalories = calorieData.filter(d => d.calories > 0).length;

  const avgCalories = daysWithCalories > 0
    ? Math.round(calorieData.reduce((sum, d) => sum + d.calories, 0) / daysWithCalories)
    : 0;

  const daysLogged = daysWithCalories;
  const consistencyRate = calorieData.length > 0
    ? Math.round((daysLogged / calorieData.length) * 100)
    : 0;

  // Check if user can share (Pro or Admin)
  const isPro = profile?.plan === 'PRO';
  const isAdmin = user ? adminService.isAdmin(user.email, user.uid) : false;
  const canShare = isPro || isAdmin;

  // Prepare shareable progress data
  const shareableProgress: ShareableProgress = useMemo(() => ({
    caloriesConsumed: avgCalories,
    calorieTarget: profile?.preferredCalorieTarget || 2000,
    dailyStreak,
    mealsToday: todayMeals.map(m => ({ name: m.name, calories: m.calories })),
    exercisesToday: todayExercises.map(e => ({ name: e.name, duration: e.duration, caloriesBurned: e.caloriesBurned })),
    userName: user?.displayName || 'User',
    isPro,
  }), [avgCalories, profile?.preferredCalorieTarget, dailyStreak, todayMeals, todayExercises, user?.displayName, isPro]);

  // Get weekly weight data
  const weeklyWeights = sortedWeights.slice(currentWeek * 7, (currentWeek + 1) * 7);

  if (loading || pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground">Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Your Progress</h1>
              <p className="text-muted-foreground">Track your journey and celebrate your wins</p>
            </div>
            {canShare && (
              <Button
                onClick={() => setShowShareModal(true)}
                className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25"
              >
                <Share2 className="h-4 w-4" />
                Share Your Progress
              </Button>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Weight Change</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {weightChange !== 0 && (
                  weightChange < 0 ? (
                    <TrendingDown className="h-5 w-5 text-green-500" />
                  ) : (
                    <TrendingUp className="h-5 w-5 text-orange-500" />
                  )
                )}
                <span className="text-2xl font-bold">
                  {Math.abs(weightChange).toFixed(1)} kg
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {weightChange < 0 ? 'Lost' : weightChange > 0 ? 'Gained' : 'No change'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">To Goal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">
                  {Math.abs(weightToGo).toFixed(1)} kg
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {weightToGo < 0 ? 'To lose' : weightToGo > 0 ? 'To gain' : 'At goal!'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Daily Calories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                <span className="text-2xl font-bold">{avgCalories}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Last {timeRange === '7days' ? '7' : timeRange === '30days' ? '30' : '90'} days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Consistency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold">{consistencyRate}%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {daysLogged} days logged
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="calories" className="space-y-6">
          <TabsList>
            <TabsTrigger value="calories">Calories</TabsTrigger>
            <TabsTrigger value="weight">Weight</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Calories Tab */}
          <TabsContent value="calories" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Calorie Intake</CardTitle>
                    <CardDescription>Your daily calorie consumption over time</CardDescription>
                  </div>
                  <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7days">7 Days</SelectItem>
                      <SelectItem value="30days">30 Days</SelectItem>
                      <SelectItem value="90days">90 Days</SelectItem>
                      <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={calorieData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="target"
                      stroke="#94a3b8"
                      strokeDasharray="5 5"
                      name="Target"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="calories"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Actual"
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Weight Tab */}
          <TabsContent value="weight" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Weight Progress</CardTitle>
                    <CardDescription>Your weight journey over time</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={sortedWeights.map(w => ({
                      date: new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                      weight: w.weightKg,
                      target: targetWeight || w.weightKg,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                    />
                    <YAxis
                      domain={['dataMin - 2', 'dataMax + 2']}
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    {targetWeight && (
                      <Line
                        type="monotone"
                        dataKey="target"
                        stroke="#94a3b8"
                        strokeDasharray="5 5"
                        name="Goal"
                        dot={false}
                      />
                    )}
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="#10b981"
                      strokeWidth={3}
                      name="Weight (kg)"
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>

                <div className="mt-6">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/profile')}
                    className="w-full"
                  >
                    Log New Weight
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Your Achievements 🏆</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {daysLogged >= 7 && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/10">
                      <Award className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Week Warrior</p>
                        <p className="text-sm text-muted-foreground">Logged meals for 7 days</p>
                      </div>
                    </div>
                  )}
                  {daysLogged >= 30 && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/10">
                      <Award className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Month Master</p>
                        <p className="text-sm text-muted-foreground">Logged meals for 30 days</p>
                      </div>
                    </div>
                  )}
                  {Math.abs(weightChange) >= 1 && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50">
                      <TrendingDown className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium">First Kilo</p>
                        <p className="text-sm text-muted-foreground">Lost your first kilogram!</p>
                      </div>
                    </div>
                  )}
                  {consistencyRate >= 80 && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50">
                      <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Consistency King</p>
                        <p className="text-sm text-muted-foreground">80%+ logging rate</p>
                      </div>
                    </div>
                  )}
                  {daysLogged === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Start logging meals to unlock achievements!
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <span className="text-sm font-medium">Days Tracked</span>
                    <span className="text-lg font-bold">{daysLogged}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <span className="text-sm font-medium">Total Weight Change</span>
                    <span className="text-lg font-bold">
                      {weightChange < 0 ? '' : '+'}{weightChange.toFixed(1)} kg
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <span className="text-sm font-medium">Avg Consistency</span>
                    <span className="text-lg font-bold">{consistencyRate}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <span className="text-sm font-medium">Current Streak</span>
                    <span className="text-lg font-bold">{dailyStreak} {dailyStreak > 0 ? 'days 🔥' : 'days'}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Share Progress Modal */}
        <ShareProgressModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          progress={shareableProgress}
        />
      </main>
    </div>
  );
};

export default Progress;