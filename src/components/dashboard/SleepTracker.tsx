import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { wellnessService } from "@/services/wellnessService";
import { SleepLog } from "@/types/wellness";
import { useToast } from "@/hooks/use-toast";
import { Moon, Clock, Sparkles } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format, subDays } from 'date-fns';

// Calculate sleep quality based on hours slept
const calculateSleepQuality = (hours: number): 'Poor' | 'Fair' | 'Good' | 'Excellent' => {
    if (hours >= 7 && hours <= 9) return 'Excellent';
    if ((hours >= 6 && hours < 7) || (hours > 9 && hours <= 10)) return 'Good';
    if ((hours >= 5 && hours < 6) || (hours > 10 && hours <= 11)) return 'Fair';
    return 'Poor';
};

const getQualityEmoji = (quality: 'Poor' | 'Fair' | 'Good' | 'Excellent'): string => {
    switch (quality) {
        case 'Excellent': return '🤩';
        case 'Good': return '🙂';
        case 'Fair': return '😐';
        case 'Poor': return '😫';
    }
};

const SleepTracker = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [logs, setLogs] = useState<SleepLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form state
    const [hours, setHours] = useState('');
    const [bedTime, setBedTime] = useState('');
    const [wakeTime, setWakeTime] = useState('');

    // Auto-calculated quality based on hours
    const calculatedQuality = hours ? calculateSleepQuality(parseFloat(hours)) : null;

    const loadData = async () => {
        if (!user?.uid) return;
        try {
            const data = await wellnessService.getSleepLogs(user.uid, 7);
            setLogs(data);
        } catch (error) {
            console.error('Error loading sleep logs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [user?.uid]);

    const handleSave = async () => {
        if (!user?.uid || !hours || !calculatedQuality) return;

        setSaving(true);
        try {
            await wellnessService.addSleepLog(user.uid, {
                userId: user.uid,
                date: new Date().toISOString().split('T')[0],
                hours: parseFloat(hours),
                quality: calculatedQuality,
                bedTime,
                wakeTime,
            });

            toast({ title: "Sleep logged!", description: "Sweet dreams!" });
            setHours('');
            setBedTime('');
            setWakeTime('');
            loadData();
        } catch (error) {
            toast({ title: "Error", description: "Failed to save sleep log", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    // Prepare chart data
    const chartData = Array.from({ length: 7 }).map((_, i) => {
        const date = subDays(new Date(), 6 - i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const log = logs.find(l => l.date === dateStr);
        return {
            day: format(date, 'EEE'),
            hours: log ? log.hours : 0,
            quality: log ? log.quality : null,
            fullDate: format(date, 'MMM d')
        };
    });

    const getBarColor = (quality: string | null) => {
        switch (quality) {
            case 'Excellent': return '#10b981'; // green-500
            case 'Good': return '#3b82f6'; // blue-500
            case 'Fair': return '#f59e0b'; // amber-500
            case 'Poor': return '#ef4444'; // red-500
            default: return '#e2e8f0'; // slate-200
        }
    };

    return (
        <div className="grid gap-6 md:grid-cols-2">
            {/* Log Input */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Moon className="w-5 h-5 text-indigo-500" />
                        Log Sleep
                    </CardTitle>
                    <CardDescription>How did you sleep last night?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Hours Slept</Label>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <Input
                                type="number"
                                step="0.5"
                                placeholder="e.g. 7.5"
                                value={hours}
                                onChange={e => setHours(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Bed Time</Label>
                            <Input
                                type="time"
                                value={bedTime}
                                onChange={e => setBedTime(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Wake Up Time</Label>
                            <Input
                                type="time"
                                value={wakeTime}
                                onChange={e => setWakeTime(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Auto-calculated Quality Display */}
                    {hours && calculatedQuality && (
                        <div className="p-4 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-indigo-500" />
                                    <Label className="text-sm font-medium">Sleep Quality</Label>
                                </div>
                                <div className="text-lg font-semibold">
                                    {calculatedQuality} {getQualityEmoji(calculatedQuality)}
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Based on {parseFloat(hours)} hours of sleep
                            </p>
                        </div>
                    )}

                    <Button onClick={handleSave} disabled={saving || !hours} className="w-full bg-indigo-600 hover:bg-indigo-700">
                        {saving ? "Saving..." : "Save Sleep Log"}
                    </Button>
                </CardContent>
            </Card>

            {/* Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Sleep History</CardTitle>
                    <CardDescription>Last 7 days</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <XAxis dataKey="day" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis hide domain={[0, 12]} />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        return (
                                            <div className="bg-popover border border-border p-2 rounded shadow-sm text-sm">
                                                <p className="font-semibold">{data.fullDate}</p>
                                                <p>{data.hours} hours</p>
                                                {data.quality && <p className="text-muted-foreground">{data.quality}</p>}
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getBarColor(entry.quality)} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-4 mt-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div>Excellent</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div>Good</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div>Fair</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div>Poor</div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SleepTracker;
