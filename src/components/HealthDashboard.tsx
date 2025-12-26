import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { healthService, HealthSummary } from "@/services/healthService";
import HealthConnect from "./HealthConnect";
import {
    Activity,
    Moon,
    Heart,
    Flame,
    TrendingUp,
    Footprints
} from "lucide-react";

const HealthDashboard = () => {
    const { user } = useAuth();
    const [summary, setSummary] = useState<HealthSummary | null>(null);
    const [loading, setLoading] = useState(true);

    const loadHealthData = async () => {
        if (!user?.uid) return;

        setLoading(true);
        try {
            const data = await healthService.getHealthSummary(user.uid);
            setSummary(data);
        } catch (error) {
            console.error('Error loading health data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHealthData();
    }, [user?.uid]);

    const hasConnectedDevices = summary?.connectedProviders && summary.connectedProviders.length > 0;
    const hasData = summary?.today && (summary.today.steps > 0 || summary.today.sleepHours > 0);

    return (
        <div className="space-y-6">
            {/* Health Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Steps */}
                <Card className="border-border">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <Footprints className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">
                                    {loading ? '—' : summary?.today.steps.toLocaleString() || '0'}
                                </p>
                                <p className="text-xs text-muted-foreground">Steps Today</p>
                            </div>
                        </div>
                        {!loading && summary?.weekAverage && (
                            <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                                <TrendingUp className="w-3 h-3" />
                                <span>Avg: {summary.weekAverage.steps.toLocaleString()}/day</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Sleep */}
                <Card className="border-border">
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
                                <p className="text-xs text-muted-foreground">Sleep</p>
                            </div>
                        </div>
                        {!loading && summary?.weekAverage && (
                            <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                                <TrendingUp className="w-3 h-3" />
                                <span>Avg: {summary.weekAverage.sleepHours}h/night</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Calories */}
                <Card className="border-border">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">
                                    {loading ? '—' : summary?.today.caloriesBurned.toLocaleString() || '0'}
                                </p>
                                <p className="text-xs text-muted-foreground">Calories Burned</p>
                            </div>
                        </div>
                        {!loading && summary?.weekAverage && (
                            <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                                <TrendingUp className="w-3 h-3" />
                                <span>Avg: {summary.weekAverage.caloriesBurned.toLocaleString()}/day</span>
                            </div>
                        )}
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

            {/* Connection Card or Empty State */}
            <div className="grid md:grid-cols-2 gap-6">
                <HealthConnect onConnectionChange={loadHealthData} />

                {/* Activity Summary */}
                <Card className="border-border">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Activity className="w-5 h-5 text-primary" />
                            Activity Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!hasConnectedDevices ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p className="text-sm">Connect a device to see your activity data</p>
                            </div>
                        ) : !hasData ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p className="text-sm">Waiting for data sync...</p>
                                <p className="text-xs mt-1">Data will appear after your first sync</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Active Minutes</span>
                                    <span className="font-medium">{summary?.today.activeMinutes || 0} min</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Steps Goal</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary rounded-full transition-all"
                                                style={{ width: `${Math.min(100, ((summary?.today.steps || 0) / 10000) * 100)}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {Math.round(((summary?.today.steps || 0) / 10000) * 100)}%
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Sleep Goal</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-indigo-500 rounded-full transition-all"
                                                style={{ width: `${Math.min(100, ((summary?.today.sleepHours || 0) / 8) * 100)}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {Math.round(((summary?.today.sleepHours || 0) / 8) * 100)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default HealthDashboard;
