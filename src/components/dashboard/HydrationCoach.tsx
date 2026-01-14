import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Droplet, Info, Plus, Minus, Lightbulb, CheckCircle2 } from "lucide-react";
import { useHealthData } from "@/contexts/HealthDataContext";
import { useAuth } from "@/contexts/AuthContext";
import { mealService } from "@/services/mealService";
import { useToast } from "@/hooks/use-toast";

const HYDRATION_TIPS = [
    "Drink a glass of water first thing in the morning.",
    "Place a water bottle on your desk as a visual reminder.",
    "Drink a glass of water before every meal to aid digestion.",
    "Flavor your water with lemon, cucumber, or mint for variety.",
    "Set a phone reminder for every 2 hours to take a sip.",
    "Eat water-rich foods like watermelon, cucumber, and celery."
];

const HydrationCoach = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const { waterIntake, dailyTargets, setWaterIntake, today } = useHealthData();
    const [saving, setSaving] = useState(false);

    const percentage = Math.min((waterIntake / dailyTargets.water) * 100, 100);
    const remaining = Math.max(0, dailyTargets.water - waterIntake);

    const handleUpdateWater = useCallback(async (delta: number) => {
        if (!user || saving) return;
        const newValue = Math.max(0, waterIntake + delta);

        setSaving(true);
        try {
            await mealService.updateDailyLog(user.uid, today, newValue);
            setWaterIntake(newValue);

            if (delta > 0) {
                toast({
                    title: "Hydration updated!",
                    description: `You've had ${newValue} glasses today.`,
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update water intake.",
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    }, [user, waterIntake, today, setWaterIntake, toast, saving]);

    const randomTip = HYDRATION_TIPS[Math.floor(Math.random() * HYDRATION_TIPS.length)];

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card className="relative overflow-hidden border-2 border-blue-100 dark:border-blue-900 shadow-sm">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Droplet className="w-24 h-24 text-blue-500 fill-blue-500" />
                </div>

                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                        <Droplet className="w-5 h-5 fill-current" />
                        Hydration Coach
                    </CardTitle>
                    <CardDescription>Target: {dailyTargets.water} glasses daily</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="text-center space-y-2">
                        <span className="text-5xl font-bold text-blue-600 dark:text-blue-400">{waterIntake}</span>
                        <span className="text-muted-foreground ml-2">/ {dailyTargets.water} glasses</span>
                    </div>

                    <div className="space-y-2">
                        <Progress value={percentage} className="h-3 bg-blue-100 dark:bg-blue-950" />
                        <p className="text-xs text-center text-muted-foreground">
                            {remaining === 0 ? "Goal reached! Amazing job staying hydrated." : `${remaining} glasses to go!`}
                        </p>
                    </div>

                    <div className="flex items-center justify-center gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full h-12 w-12 border-blue-200 hover:bg-blue-50"
                            onClick={() => handleUpdateWater(-1)}
                            disabled={waterIntake <= 0 || saving}
                        >
                            <Minus className="w-5 h-5" />
                        </Button>
                        <Button
                            size="icon"
                            className="rounded-full h-16 w-16 bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
                            onClick={() => handleUpdateWater(1)}
                            disabled={saving}
                        >
                            <Plus className="w-8 h-8" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-6">
                <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2 text-amber-700 dark:text-amber-500">
                            <Lightbulb className="w-4 h-4" />
                            Coach's Tip
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm italic text-amber-800 dark:text-amber-400">
                            "{randomTip}"
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Info className="w-4 h-4 text-muted-foreground" />
                            Why Hydrate?
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {[
                            "Boosts energy & brain function",
                            "Promotes healthy looking skin",
                            "Aids digestion & weight loss",
                            "Regulates body temperature"
                        ].map((benefit, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                <span>{benefit}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default HydrationCoach;
