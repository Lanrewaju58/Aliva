import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useHealthData } from "@/contexts/HealthDataContext";
import { useToast } from "@/hooks/use-toast";
import { healthService } from "@/services/healthService";
import {
    Activity,
    Moon,
    Heart,
    Flame,
    TrendingUp,
    Footprints,
    Plus,
    Edit3,
    Settings,
    Target
} from "lucide-react";

// Default goals
const DEFAULT_GOALS = {
    steps: 10000,
    sleepHours: 8,
    caloriesBurned: 500,
    activeMinutes: 30
};

const HealthDashboard = () => {
    const { user } = useAuth();
    const { toast } = useToast();

    // Use shared health data from context
    const { healthSummary: summary, isLoading: loading, refreshHealthSummary } = useHealthData();

    const [logDialogOpen, setLogDialogOpen] = useState(false);
    const [goalsDialogOpen, setGoalsDialogOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Goals state
    const [goals, setGoals] = useState(DEFAULT_GOALS);
    const [tempGoals, setTempGoals] = useState(DEFAULT_GOALS);

    // Manual log form state
    const [manualData, setManualData] = useState({
        steps: '',
        sleepHours: '',
        caloriesBurned: '',
        avgHeartRate: '',
        activeMinutes: ''
    });

    // Load goals from localStorage
    useEffect(() => {
        if (user?.uid) {
            const savedGoals = localStorage.getItem(`health_goals_${user.uid}`);
            if (savedGoals) {
                const parsed = JSON.parse(savedGoals);
                setGoals(parsed);
                setTempGoals(parsed);
            }
        }
    }, [user?.uid]);

    const handleManualLog = async () => {
        if (!user?.uid) return;

        setSaving(true);
        try {
            const data: {
                steps?: number;
                sleepHours?: number;
                caloriesBurned?: number;
                avgHeartRate?: number;
                activeMinutes?: number;
            } = {};

            if (manualData.steps) data.steps = parseInt(manualData.steps);
            if (manualData.sleepHours) data.sleepHours = parseFloat(manualData.sleepHours);
            if (manualData.caloriesBurned) data.caloriesBurned = parseInt(manualData.caloriesBurned);
            if (manualData.avgHeartRate) data.avgHeartRate = parseInt(manualData.avgHeartRate);
            if (manualData.activeMinutes) data.activeMinutes = parseInt(manualData.activeMinutes);

            if (Object.keys(data).length === 0) {
                toast({ title: 'No data', description: 'Please enter at least one value', variant: 'destructive' });
                return;
            }

            await healthService.saveManualEntry(user.uid, new Date(), data);

            toast({ title: 'Saved!', description: isEditing ? 'Your health data has been updated' : 'Your health data has been logged' });
            setLogDialogOpen(false);
            setManualData({ steps: '', sleepHours: '', caloriesBurned: '', avgHeartRate: '', activeMinutes: '' });
            setIsEditing(false);
            // Refresh shared health data
            refreshHealthSummary();
        } catch (error) {
            console.error('Error saving manual entry:', error);
            toast({ title: 'Error', description: 'Failed to save data', variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    const handleEditData = () => {
        // Pre-fill with current values
        if (summary?.today) {
            setManualData({
                steps: summary.today.steps > 0 ? String(summary.today.steps) : '',
                sleepHours: summary.today.sleepHours > 0 ? String(summary.today.sleepHours) : '',
                caloriesBurned: summary.today.caloriesBurned > 0 ? String(summary.today.caloriesBurned) : '',
                avgHeartRate: summary.today.avgHeartRate ? String(summary.today.avgHeartRate) : '',
                activeMinutes: summary.today.activeMinutes > 0 ? String(summary.today.activeMinutes) : ''
            });
        }
        setIsEditing(true);
        setLogDialogOpen(true);
    };

    const handleSaveGoals = () => {
        if (!user?.uid) return;

        setGoals(tempGoals);
        localStorage.setItem(`health_goals_${user.uid}`, JSON.stringify(tempGoals));
        setGoalsDialogOpen(false);
        toast({ title: 'Goals updated!', description: 'Your health goals have been saved' });
    };

    const calculateProgress = (current: number, goal: number) => {
        return Math.min(100, Math.round((current / goal) * 100));
    };

    const hasData = summary?.today && (summary.today.steps > 0 || summary.today.sleepHours > 0);

    return (
        <div className="space-y-6">
            {/* Header with Buttons */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold">Health Metrics</h2>
                    <p className="text-sm text-muted-foreground">Track your daily health data</p>
                </div>
                <div className="flex gap-2">
                    {/* Goals Button */}
                    <Dialog open={goalsDialogOpen} onOpenChange={setGoalsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <Target className="w-4 h-4" />
                                <span className="hidden sm:inline">Goals</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Target className="w-5 h-5 text-primary" />
                                    Set Your Goals
                                </DialogTitle>
                                <DialogDescription>
                                    Customize your daily health goals
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="goal-steps" className="flex items-center gap-2 text-sm">
                                        <Footprints className="w-4 h-4 text-blue-500" />
                                        Steps Goal
                                    </Label>
                                    <Input
                                        id="goal-steps"
                                        type="number"
                                        placeholder="10000"
                                        value={tempGoals.steps}
                                        onChange={(e) => setTempGoals({ ...tempGoals, steps: parseInt(e.target.value) || 0 })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="goal-sleep" className="flex items-center gap-2 text-sm">
                                        <Moon className="w-4 h-4 text-indigo-500" />
                                        Sleep Goal (hours)
                                    </Label>
                                    <Input
                                        id="goal-sleep"
                                        type="number"
                                        step="0.5"
                                        placeholder="8"
                                        value={tempGoals.sleepHours}
                                        onChange={(e) => setTempGoals({ ...tempGoals, sleepHours: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="goal-calories" className="flex items-center gap-2 text-sm">
                                        <Flame className="w-4 h-4 text-orange-500" />
                                        Calories Burned Goal
                                    </Label>
                                    <Input
                                        id="goal-calories"
                                        type="number"
                                        placeholder="500"
                                        value={tempGoals.caloriesBurned}
                                        onChange={(e) => setTempGoals({ ...tempGoals, caloriesBurned: parseInt(e.target.value) || 0 })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="goal-active" className="flex items-center gap-2 text-sm">
                                        <Activity className="w-4 h-4 text-green-500" />
                                        Active Minutes Goal
                                    </Label>
                                    <Input
                                        id="goal-active"
                                        type="number"
                                        placeholder="30"
                                        value={tempGoals.activeMinutes}
                                        onChange={(e) => setTempGoals({ ...tempGoals, activeMinutes: parseInt(e.target.value) || 0 })}
                                    />
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <Button variant="outline" onClick={() => setGoalsDialogOpen(false)} className="flex-1">
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSaveGoals} className="flex-1 bg-primary">
                                        Save Goals
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Edit Button (shows when there's data) */}
                    {hasData && (
                        <Button variant="outline" onClick={handleEditData} className="gap-2">
                            <Edit3 className="w-4 h-4" />
                            <span className="hidden sm:inline">Edit</span>
                        </Button>
                    )}

                    {/* Log Data Button */}
                    <Dialog open={logDialogOpen} onOpenChange={(open) => {
                        setLogDialogOpen(open);
                        if (!open) {
                            setIsEditing(false);
                            setManualData({ steps: '', sleepHours: '', caloriesBurned: '', avgHeartRate: '', activeMinutes: '' });
                        }
                    }}>
                        <DialogTrigger asChild>
                            <Button className="gap-2 bg-green-500 hover:bg-green-600 text-white">
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">Log Data</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Edit3 className="w-5 h-5 text-green-500" />
                                    {isEditing ? 'Edit Health Data' : 'Log Health Data'}
                                </DialogTitle>
                                <DialogDescription>
                                    {isEditing ? 'Update your logged values for today' : 'Log today\'s health metrics manually'}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="steps" className="flex items-center gap-2 text-sm">
                                            <Footprints className="w-4 h-4 text-blue-500" />
                                            Steps
                                        </Label>
                                        <Input
                                            id="steps"
                                            type="number"
                                            placeholder="e.g. 8000"
                                            value={manualData.steps}
                                            onChange={(e) => setManualData({ ...manualData, steps: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="sleep" className="flex items-center gap-2 text-sm">
                                            <Moon className="w-4 h-4 text-indigo-500" />
                                            Sleep (hours)
                                        </Label>
                                        <Input
                                            id="sleep"
                                            type="number"
                                            step="0.5"
                                            placeholder="e.g. 7.5"
                                            value={manualData.sleepHours}
                                            onChange={(e) => setManualData({ ...manualData, sleepHours: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="calories" className="flex items-center gap-2 text-sm">
                                            <Flame className="w-4 h-4 text-orange-500" />
                                            Calories Burned
                                        </Label>
                                        <Input
                                            id="calories"
                                            type="number"
                                            placeholder="e.g. 500"
                                            value={manualData.caloriesBurned}
                                            onChange={(e) => setManualData({ ...manualData, caloriesBurned: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="heartRate" className="flex items-center gap-2 text-sm">
                                            <Heart className="w-4 h-4 text-red-500" />
                                            Avg Heart Rate
                                        </Label>
                                        <Input
                                            id="heartRate"
                                            type="number"
                                            placeholder="e.g. 72"
                                            value={manualData.avgHeartRate}
                                            onChange={(e) => setManualData({ ...manualData, avgHeartRate: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2 col-span-2">
                                        <Label htmlFor="activeMinutes" className="flex items-center gap-2 text-sm">
                                            <Activity className="w-4 h-4 text-green-500" />
                                            Active Minutes
                                        </Label>
                                        <Input
                                            id="activeMinutes"
                                            type="number"
                                            placeholder="e.g. 45"
                                            value={manualData.activeMinutes}
                                            onChange={(e) => setManualData({ ...manualData, activeMinutes: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <Button
                                    onClick={handleManualLog}
                                    disabled={saving}
                                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                                >
                                    {saving ? 'Saving...' : isEditing ? 'Update Data' : 'Save Health Data'}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Health Metrics Grid with Progress */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Steps */}
                <Card className="border-border relative overflow-hidden">
                    <div
                        className="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all duration-500"
                        style={{ width: `${calculateProgress(summary?.today.steps || 0, goals.steps)}%` }}
                    />
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <Footprints className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">
                                    {loading ? '—' : summary?.today.steps.toLocaleString() || '0'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    of {goals.steps.toLocaleString()} steps
                                </p>
                            </div>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                            <span className={`font-medium ${calculateProgress(summary?.today.steps || 0, goals.steps) >= 100 ? 'text-green-500' : 'text-blue-500'}`}>
                                {calculateProgress(summary?.today.steps || 0, goals.steps)}%
                            </span>
                            of goal
                        </div>
                    </CardContent>
                </Card>

                {/* Sleep */}
                <Card className="border-border relative overflow-hidden">
                    <div
                        className="absolute bottom-0 left-0 h-1 bg-indigo-500 transition-all duration-500"
                        style={{ width: `${calculateProgress(summary?.today.sleepHours || 0, goals.sleepHours)}%` }}
                    />
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                <Moon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">
                                    {loading ? '—' : summary?.today.sleepHours || '0'}
                                    <span className="text-sm font-normal text-muted-foreground">h</span>
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    of {goals.sleepHours}h goal
                                </p>
                            </div>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                            <span className={`font-medium ${calculateProgress(summary?.today.sleepHours || 0, goals.sleepHours) >= 100 ? 'text-green-500' : 'text-indigo-500'}`}>
                                {calculateProgress(summary?.today.sleepHours || 0, goals.sleepHours)}%
                            </span>
                            of goal
                        </div>
                    </CardContent>
                </Card>

                {/* Calories */}
                <Card className="border-border relative overflow-hidden">
                    <div
                        className="absolute bottom-0 left-0 h-1 bg-orange-500 transition-all duration-500"
                        style={{ width: `${calculateProgress(summary?.today.caloriesBurned || 0, goals.caloriesBurned)}%` }}
                    />
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">
                                    {loading ? '—' : summary?.today.caloriesBurned.toLocaleString() || '0'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    of {goals.caloriesBurned} cal
                                </p>
                            </div>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                            <span className={`font-medium ${calculateProgress(summary?.today.caloriesBurned || 0, goals.caloriesBurned) >= 100 ? 'text-green-500' : 'text-orange-500'}`}>
                                {calculateProgress(summary?.today.caloriesBurned || 0, goals.caloriesBurned)}%
                            </span>
                            of goal
                        </div>
                    </CardContent>
                </Card>

                {/* Heart Rate */}
                <Card className="border-border">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <Heart className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">
                                    {loading ? '—' : summary?.today.avgHeartRate || '—'}
                                    {summary?.today.avgHeartRate && (
                                        <span className="text-sm font-normal text-muted-foreground"> bpm</span>
                                    )}
                                </p>
                                <p className="text-xs text-muted-foreground">Heart Rate</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Activity Summary */}
            <Card className="border-border">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" />
                        Activity Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {!hasData ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">No data yet</p>
                            <p className="text-xs mt-1">Log your health data using the button above</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Active Minutes</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">{summary?.today.activeMinutes || 0} / {goals.activeMinutes} min</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${calculateProgress(summary?.today.activeMinutes || 0, goals.activeMinutes) >= 100
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-muted text-muted-foreground'
                                        }`}>
                                        {calculateProgress(summary?.today.activeMinutes || 0, goals.activeMinutes)}%
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Steps Goal</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 rounded-full transition-all"
                                            style={{ width: `${calculateProgress(summary?.today.steps || 0, goals.steps)}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-muted-foreground w-10 text-right">
                                        {calculateProgress(summary?.today.steps || 0, goals.steps)}%
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Sleep Goal</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-500 rounded-full transition-all"
                                            style={{ width: `${calculateProgress(summary?.today.sleepHours || 0, goals.sleepHours)}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-muted-foreground w-10 text-right">
                                        {calculateProgress(summary?.today.sleepHours || 0, goals.sleepHours)}%
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Calories Goal</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-orange-500 rounded-full transition-all"
                                            style={{ width: `${calculateProgress(summary?.today.caloriesBurned || 0, goals.caloriesBurned)}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-muted-foreground w-10 text-right">
                                        {calculateProgress(summary?.today.caloriesBurned || 0, goals.caloriesBurned)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Weekly Average (if available) */}
            {!loading && summary?.weekAverage && (
                <Card className="border-border">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            7-Day Averages
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-2xl font-bold text-blue-500">{summary.weekAverage.steps.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">steps/day</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-indigo-500">{summary.weekAverage.sleepHours}h</p>
                                <p className="text-xs text-muted-foreground">sleep/night</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-orange-500">{summary.weekAverage.caloriesBurned.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">cal/day</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default HealthDashboard;
