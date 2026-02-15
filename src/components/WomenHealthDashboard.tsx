// src/components/WomenHealthDashboard.tsx
// Premium menstrual health tracking for female Pro users

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { menstrualHealthService } from "@/services/menstrualHealthService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    CycleData,
    SymptomEntry,
    PeriodEntry,
    SYMPTOM_CATEGORIES,
    SymptomCategory,
    getCyclePhaseInfo,
    getSymptomDisplayName,
    DailyInsight,
    FlowIntensity,
    CycleHistoryEntry,
} from "@/types/menstrualTypes";
import {
    Calendar,
    Droplets,
    Heart,
    Moon,
    Sparkles,
    TrendingUp,
    ChevronLeft,
    ChevronRight,
    Plus,
    Check,
    Activity,
    Info,
    Flower2,
    CalendarDays,
    BarChart3,
    Lightbulb,
} from "lucide-react";

// ==================== PREMIUM CYCLE RING ====================
const CycleRing = ({
    currentDay,
    totalDays,
    phase,
    isOnPeriod,
}: {
    currentDay: number;
    totalDays: number;
    phase: string;
    isOnPeriod: boolean;
}) => {
    const percentage = Math.min((currentDay / totalDays) * 100, 100);
    const strokeDasharray = 2 * Math.PI * 54;
    const strokeDashoffset = strokeDasharray * (1 - percentage / 100);
    const phaseInfo = getCyclePhaseInfo(phase as any);

    return (
        <div className="relative w-44 h-44 mx-auto">
            {/* Outer glow effect */}
            <div
                className="absolute inset-0 rounded-full blur-xl opacity-30"
                style={{ backgroundColor: phaseInfo.color }}
            />

            <svg className="w-full h-full transform -rotate-90 relative z-10" viewBox="0 0 120 120">
                {/* Background track */}
                <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-muted/20"
                />
                {/* Progress arc with gradient */}
                <defs>
                    <linearGradient id="cycleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={phaseInfo.color} />
                        <stop offset="100%" stopColor={phase === 'menstrual' ? '#ec4899' : phase === 'ovulation' ? '#a855f7' : phaseInfo.color} />
                    </linearGradient>
                </defs>
                <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke={phaseInfo.color}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-700 ease-out"
                />
                {/* Inner decorative ring */}
                <circle
                    cx="60"
                    cy="60"
                    r="46"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-muted/10"
                />
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                <span className="text-4xl font-light tracking-tight" style={{ color: phaseInfo.color }}>
                    {currentDay}
                </span>
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">
                    {isOnPeriod ? 'Period Day' : 'Cycle Day'}
                </span>
            </div>
        </div>
    );
};

// ==================== PREMIUM CALENDAR ====================
const CycleCalendar = ({
    cycleData,
    periods,
    symptoms,
    selectedDate,
    onDateSelect,
}: {
    cycleData: CycleData;
    periods: PeriodEntry[];
    symptoms: SymptomEntry[];
    selectedDate: string;
    onDateSelect: (date: string) => void;
}) => {
    const [viewMonth, setViewMonth] = useState(new Date());

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days: Date[] = [];

        const startPadding = firstDay.getDay();
        for (let i = startPadding - 1; i >= 0; i--) {
            days.push(new Date(year, month, -i));
        }

        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(new Date(year, month, i));
        }

        const endPadding = 42 - days.length;
        for (let i = 1; i <= endPadding; i++) {
            days.push(new Date(year, month + 1, i));
        }

        return days;
    };

    const isPeriodDay = (date: string) => {
        return periods.some((p) => {
            const start = new Date(p.startDate);
            const end = p.endDate ? new Date(p.endDate) : new Date();
            const d = new Date(date);
            return d >= start && d <= end;
        });
    };

    const isFertileDay = (date: string) => {
        if (!cycleData.fertilityWindow) return false;
        const fw = cycleData.fertilityWindow;
        return date >= fw.fertileStart && date <= fw.fertileEnd;
    };

    const isOvulationDay = (date: string) => {
        return cycleData.fertilityWindow?.ovulationDate === date;
    };

    const isPredictedPeriod = (date: string) => {
        if (!cycleData.nextPeriodDate) return false;
        const nextStart = new Date(cycleData.nextPeriodDate);
        const nextEnd = new Date(nextStart);
        nextEnd.setDate(nextEnd.getDate() + cycleData.averagePeriodLength - 1);
        const d = new Date(date);
        return d >= nextStart && d <= nextEnd;
    };

    const hasSymptoms = (date: string) => {
        return symptoms.some((s) => s.date === date);
    };

    const days = getDaysInMonth(viewMonth);
    const currentMonth = viewMonth.getMonth();
    const today = new Date().toISOString().split("T")[0];

    return (
        <div className="space-y-6">
            {/* Month navigation */}
            <div className="flex items-center justify-between px-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/20"
                    onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1))}
                >
                    <ChevronLeft className="h-5 w-5 text-rose-500" />
                </Button>
                <h3 className="text-lg font-medium tracking-tight">
                    {viewMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </h3>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/20"
                    onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1))}
                >
                    <ChevronRight className="h-5 w-5 text-rose-500" />
                </Button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1">
                {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                    <div key={i} className="h-8 flex items-center justify-center">
                        <span className="text-xs font-medium text-muted-foreground/60">{day}</span>
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
                {days.map((day, i) => {
                    const dateStr = day.toISOString().split("T")[0];
                    const isCurrentMonth = day.getMonth() === currentMonth;
                    const isToday = dateStr === today;
                    const isSelected = dateStr === selectedDate;
                    const period = isPeriodDay(dateStr);
                    const fertile = isFertileDay(dateStr);
                    const ovulation = isOvulationDay(dateStr);
                    const predicted = isPredictedPeriod(dateStr);
                    const symptom = hasSymptoms(dateStr);

                    return (
                        <button
                            key={i}
                            onClick={() => onDateSelect(dateStr)}
                            className={`
                relative h-10 w-full rounded-xl flex items-center justify-center text-sm font-medium
                transition-all duration-200 ease-out
                ${!isCurrentMonth ? "opacity-25" : ""}
                ${isToday && !isSelected ? "ring-2 ring-rose-400/50 ring-offset-1 ring-offset-background" : ""}
                ${isSelected ? "bg-pink-500 text-white shadow-lg scale-105" : "hover:bg-muted/60"}
                ${period && !isSelected ? "bg-pink-500 text-white shadow-md" : ""}
                ${predicted && !period && !isSelected ? "border-2 border-dashed border-rose-300 dark:border-rose-700" : ""}
                ${fertile && !period && !isSelected && !ovulation ? "bg-green-100 dark:bg-green-900/30" : ""}
                ${ovulation && !period && !isSelected ? "bg-green-500 text-white shadow-md" : ""}
              `}
                        >
                            {day.getDate()}
                            {symptom && !period && !ovulation && (
                                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-400" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-4 border-t border-border/50">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-pink-500" />
                    <span className="text-xs text-muted-foreground">Period</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full border-2 border-dashed border-rose-400" />
                    <span className="text-xs text-muted-foreground">Predicted</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-200 dark:bg-green-800" />
                    <span className="text-xs text-muted-foreground">Fertile</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-xs text-muted-foreground">Ovulation</span>
                </div>
            </div>
        </div>
    );
};

// ==================== SYMPTOM SELECTOR ====================
const SymptomSelector = ({
    open,
    onClose,
    date,
    existingSymptoms,
    onSave,
}: {
    open: boolean;
    onClose: () => void;
    date: string;
    existingSymptoms: SymptomEntry["symptoms"];
    onSave: (symptoms: SymptomEntry["symptoms"]) => void;
}) => {
    const [selected, setSelected] = useState<SymptomEntry["symptoms"]>(existingSymptoms);
    const [activeCategory, setActiveCategory] = useState<SymptomCategory>("mood");

    useEffect(() => {
        setSelected(existingSymptoms);
    }, [existingSymptoms]);

    const toggleSymptom = (category: SymptomCategory, symptom: string) => {
        const exists = selected.find((s) => s.category === category && s.symptom === symptom);
        if (exists) {
            setSelected(selected.filter((s) => !(s.category === category && s.symptom === symptom)));
        } else {
            setSelected([...selected, { category, symptom }]);
        }
    };

    const isSelected = (category: SymptomCategory, symptom: string) => {
        return selected.some((s) => s.category === category && s.symptom === symptom);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
                <DialogHeader className="pb-4 border-b">
                    <DialogTitle className="text-lg font-medium">
                        {new Date(date).toLocaleDateString("en-US", { weekday: 'long', month: "long", day: "numeric" })}
                    </DialogTitle>
                </DialogHeader>

                {/* Category pills */}
                <div className="flex gap-2 overflow-x-auto py-4 no-scrollbar">
                    {Object.entries(SYMPTOM_CATEGORIES).map(([key, cat]) => (
                        <button
                            key={key}
                            onClick={() => setActiveCategory(key as SymptomCategory)}
                            className={`
                shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all
                ${activeCategory === key
                                    ? "bg-pink-500 text-white shadow-lg"
                                    : "bg-muted/50 hover:bg-muted text-muted-foreground"}
              `}
                        >
                            <span className="mr-1.5">{cat.icon}</span>
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Symptoms grid - scrollable */}
                <div className="flex-1 overflow-y-auto py-2">
                    <div className="grid grid-cols-2 gap-2">
                        {SYMPTOM_CATEGORIES[activeCategory].symptoms.map((symptom) => (
                            <button
                                key={symptom}
                                onClick={() => toggleSymptom(activeCategory, symptom)}
                                className={`
                  p-3.5 rounded-xl text-left text-sm transition-all border-2
                  ${isSelected(activeCategory, symptom)
                                        ? "bg-pink-50 dark:bg-pink-950/30 border-pink-500 text-pink-700 dark:text-pink-300"
                                        : "bg-transparent hover:bg-muted/50 border-transparent hover:border-muted"}
                `}
                            >
                                <span className="flex items-center gap-2">
                                    {isSelected(activeCategory, symptom) && <Check className="h-4 w-4 text-pink-500" />}
                                    {getSymptomDisplayName(symptom)}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t mt-auto">
                    <span className="text-sm text-muted-foreground">
                        {selected.length} selected
                    </span>
                    <div className="flex gap-3">
                        <Button variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button
                            className="bg-green-500 hover:bg-green-600 text-white"
                            onClick={() => { onSave(selected); onClose(); }}
                        >
                            Save
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

// ==================== FLOW SELECTOR ====================
const FlowSelector = ({
    value,
    onChange,
}: {
    value: FlowIntensity;
    onChange: (v: FlowIntensity) => void;
}) => {
    const flows: { value: FlowIntensity; label: string; drops: number }[] = [
        { value: "spotting", label: "Spotting", drops: 1 },
        { value: "light", label: "Light", drops: 2 },
        { value: "medium", label: "Medium", drops: 3 },
        { value: "heavy", label: "Heavy", drops: 4 },
    ];

    return (
        <div className="grid grid-cols-4 gap-2">
            {flows.map((f) => (
                <button
                    key={f.value}
                    onClick={() => onChange(f.value)}
                    className={`
            flex flex-col items-center py-3 px-2 rounded-xl transition-all border-2
            ${value === f.value
                            ? "bg-pink-50 dark:bg-pink-950/30 border-pink-500 shadow-md"
                            : "bg-transparent border-transparent hover:bg-muted/50 hover:border-muted"}
          `}
                >
                    <div className="flex gap-0.5 mb-1.5">
                        {[...Array(f.drops)].map((_, i) => (
                            <Droplets
                                key={i}
                                className={`h-3.5 w-3.5 ${value === f.value ? 'text-pink-500' : 'text-muted-foreground/50'}`}
                            />
                        ))}
                    </div>
                    <span className={`text-xs font-medium ${value === f.value ? 'text-pink-600 dark:text-pink-400' : 'text-muted-foreground'}`}>
                        {f.label}
                    </span>
                </button>
            ))}
        </div>
    );
};

// ==================== MAIN COMPONENT ====================
const WomenHealthDashboard = () => {
    const { user } = useAuth();
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [cycleData, setCycleData] = useState<CycleData | null>(null);
    const [periods, setPeriods] = useState<PeriodEntry[]>([]);
    const [symptoms, setSymptoms] = useState<SymptomEntry[]>([]);
    const [insights, setInsights] = useState<DailyInsight[]>([]);
    const [cycleHistory, setCycleHistory] = useState<CycleHistoryEntry[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [showSymptomModal, setShowSymptomModal] = useState(false);
    const [selectedDateSymptoms, setSelectedDateSymptoms] = useState<SymptomEntry["symptoms"]>([]);
    const [flowIntensity, setFlowIntensity] = useState<FlowIntensity>("medium");

    const loadData = async () => {
        if (!user?.uid) return;
        setLoading(true);
        try {
            const [cycle, periodHistory, dailyInsights, history] = await Promise.all([
                menstrualHealthService.getCycleData(user.uid),
                menstrualHealthService.getPeriodHistory(user.uid),
                menstrualHealthService.getDailyInsights(user.uid),
                menstrualHealthService.getCycleHistory(user.uid),
            ]);
            setCycleData(cycle);
            setPeriods(periodHistory);
            setInsights(dailyInsights);
            setCycleHistory(history);

            const today = new Date();
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
            const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split("T")[0];
            const monthSymptoms = await menstrualHealthService.getSymptomsInRange(user.uid, monthStart, monthEnd);
            setSymptoms(monthSymptoms);
        } catch (error) {
            console.error("Error loading women's health data:", error);
            toast({ title: "Error", description: "Failed to load health data", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [user?.uid]);

    useEffect(() => {
        const loadDateSymptoms = async () => {
            if (!user?.uid) return;
            const dateSymptoms = await menstrualHealthService.getSymptomsByDate(user.uid, selectedDate);
            setSelectedDateSymptoms(dateSymptoms?.symptoms || []);
        };
        loadDateSymptoms();
    }, [selectedDate, user?.uid]);

    const handleLogPeriodStart = async () => {
        if (!user?.uid) return;
        try {
            await menstrualHealthService.logPeriodStart(user.uid, selectedDate, flowIntensity);
            toast({ title: "Period started", description: `Logged for ${new Date(selectedDate).toLocaleDateString()}` });
            loadData();
        } catch (error) {
            toast({ title: "Error", description: "Failed to log period", variant: "destructive" });
        }
    };

    const handleLogPeriodEnd = async () => {
        if (!user?.uid || periods.length === 0) return;
        const currentPeriod = periods.find((p) => !p.endDate);
        if (!currentPeriod?.id) {
            toast({ title: "No active period", description: "Start a period first", variant: "destructive" });
            return;
        }
        try {
            await menstrualHealthService.logPeriodEnd(user.uid, currentPeriod.id, selectedDate);
            toast({ title: "Period ended", description: `Ended on ${new Date(selectedDate).toLocaleDateString()}` });
            loadData();
        } catch (error) {
            toast({ title: "Error", description: "Failed to end period", variant: "destructive" });
        }
    };

    const handleSaveSymptoms = async (newSymptoms: SymptomEntry["symptoms"]) => {
        if (!user?.uid) return;
        try {
            await menstrualHealthService.logSymptoms(user.uid, selectedDate, newSymptoms);
            toast({ title: "Saved", description: `${newSymptoms.length} symptoms logged` });
            loadData();
        } catch (error) {
            toast({ title: "Error", description: "Failed to save symptoms", variant: "destructive" });
        }
    };

    const isOnPeriod = periods.some((p) => !p.endDate);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="relative">
                    <div className="h-12 w-12 rounded-full border-2 border-pink-200 border-t-pink-500 animate-spin" />
                    <Flower2 className="absolute inset-0 m-auto h-5 w-5 text-pink-400" />
                </div>
            </div>
        );
    }

    const phaseInfo = cycleData ? getCyclePhaseInfo(cycleData.cyclePhase) : null;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-pink-500 flex items-center justify-center shadow-lg">
                        <Flower2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight">Cycle Tracker</h2>
                        <p className="text-sm text-muted-foreground">Your personal health companion</p>
                    </div>
                </div>
            </div>

            {/* Premium tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="h-12 p-1.5 bg-muted/40 backdrop-blur rounded-2xl w-full justify-start gap-1">
                    <TabsTrigger
                        value="overview"
                        className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 gap-2"
                    >
                        <Activity className="h-4 w-4" />
                        <span className="hidden sm:inline">Overview</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="calendar"
                        className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 gap-2"
                    >
                        <CalendarDays className="h-4 w-4" />
                        <span className="hidden sm:inline">Calendar</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="symptoms"
                        className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 gap-2"
                    >
                        <Heart className="h-4 w-4" />
                        <span className="hidden sm:inline">Symptoms</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="insights"
                        className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 gap-2"
                    >
                        <Lightbulb className="h-4 w-4" />
                        <span className="hidden sm:inline">Insights</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="history"
                        className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 gap-2"
                    >
                        <BarChart3 className="h-4 w-4" />
                        <span className="hidden sm:inline">History</span>
                    </TabsTrigger>
                </TabsList>

                {/* ==================== OVERVIEW TAB ==================== */}
                <TabsContent value="overview" className="space-y-6 mt-0">
                    <div className="grid lg:grid-cols-5 gap-6">
                        {/* Cycle Ring Card */}
                        <Card className="lg:col-span-2 border-0 bg-pink-50 dark:bg-pink-950/30 overflow-hidden">
                            <CardContent className="pt-8 pb-6 relative">
                                {cycleData && cycleData.cycleCount > 0 ? (
                                    <>
                                        <CycleRing
                                            currentDay={cycleData.currentCycleDay}
                                            totalDays={cycleData.averageCycleLength}
                                            phase={cycleData.cyclePhase}
                                            isOnPeriod={cycleData.isOnPeriod}
                                        />
                                        <div className="text-center mt-6 space-y-3">
                                            <div
                                                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium"
                                                style={{ backgroundColor: `${phaseInfo?.color}20`, color: phaseInfo?.color }}
                                            >
                                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: phaseInfo?.color }} />
                                                {phaseInfo?.label} Phase
                                            </div>
                                            <p className="text-sm text-muted-foreground max-w-[200px] mx-auto">{phaseInfo?.description}</p>
                                            {cycleData.daysUntilNextPeriod !== null && cycleData.daysUntilNextPeriod > 0 && !cycleData.isOnPeriod && (
                                                <p className="text-base font-medium pt-2">
                                                    <span className="text-rose-500">{cycleData.daysUntilNextPeriod}</span>
                                                    <span className="text-muted-foreground"> days until period</span>
                                                </p>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                                            <Droplets className="h-8 w-8 text-pink-400" />
                                        </div>
                                        <h3 className="font-medium mb-2">Start Tracking</h3>
                                        <p className="text-sm text-muted-foreground max-w-[220px] mx-auto">
                                            Log your first period to get predictions and insights
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Quick Log Card */}
                        <Card className="lg:col-span-3 border-0 shadow-sm">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-base font-medium flex items-center gap-2">
                                    <Plus className="h-4 w-4 text-pink-500" />
                                    Quick Log
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div>
                                    <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-3 block">Date</Label>
                                    <Input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="h-11 rounded-xl border-muted"
                                    />
                                </div>

                                {!isOnPeriod ? (
                                    <div className="space-y-4">
                                        <div>
                                            <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-3 block">Flow Intensity</Label>
                                            <FlowSelector value={flowIntensity} onChange={setFlowIntensity} />
                                        </div>
                                        <Button
                                            onClick={handleLogPeriodStart}
                                            className="w-full h-12 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-medium"
                                        >
                                            <Droplets className="h-4 w-4 mr-2" />
                                            Log Period Start
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        onClick={handleLogPeriodEnd}
                                        variant="outline"
                                        className="w-full h-12 rounded-xl border-2 border-pink-300 dark:border-pink-800 text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-950/30"
                                    >
                                        <Check className="h-4 w-4 mr-2" />
                                        Log Period End
                                    </Button>
                                )}

                                <Button
                                    onClick={() => setShowSymptomModal(true)}
                                    variant="outline"
                                    className="w-full h-12 rounded-xl"
                                >
                                    <Heart className="h-4 w-4 mr-2 text-green-500" />
                                    Log Symptoms
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Daily Insights */}
                    {insights.length > 0 && (
                        <div className="space-y-3">
                            {insights.map((insight, i) => (
                                <div
                                    key={i}
                                    className="flex items-start gap-4 p-4 rounded-2xl bg-green-50 dark:bg-green-950/20 border border-green-200/50 dark:border-green-900/30"
                                >
                                    <span className="text-2xl">{insight.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-sm">{insight.title}</h4>
                                        <p className="text-sm text-muted-foreground mt-0.5">{insight.message}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Stats Grid */}
                    {cycleData && cycleData.cycleCount > 0 && (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: "Avg. Cycle", value: `${cycleData.averageCycleLength} days`, color: "rose" },
                                { label: "Avg. Period", value: `${cycleData.averagePeriodLength} days`, color: "pink" },
                                { label: "Cycles Logged", value: cycleData.cycleCount, color: "fuchsia" },
                                { label: "Prediction", value: cycleData.fertilityWindow?.confidence || "—", color: "purple" },
                            ].map((stat, i) => (
                                <Card key={i} className="border-0 bg-muted/30">
                                    <CardContent className="pt-5 pb-4 text-center">
                                        <p className={`text-2xl font-semibold text-${stat.color}-500`}>{stat.value}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* ==================== CALENDAR TAB ==================== */}
                <TabsContent value="calendar" className="mt-0">
                    <Card className="border-0 shadow-sm">
                        <CardContent className="pt-6">
                            <CycleCalendar
                                cycleData={cycleData || ({} as CycleData)}
                                periods={periods}
                                symptoms={symptoms}
                                selectedDate={selectedDate}
                                onDateSelect={(date) => {
                                    setSelectedDate(date);
                                    setShowSymptomModal(true);
                                }}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ==================== SYMPTOMS TAB ==================== */}
                <TabsContent value="symptoms" className="space-y-6 mt-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-medium">Today's Log</h3>
                            <p className="text-sm text-muted-foreground">
                                {new Date(selectedDate).toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                        <Button size="sm" onClick={() => setShowSymptomModal(true)} className="rounded-xl gap-2 bg-green-500 hover:bg-green-600 text-white">
                            <Plus className="h-4 w-4" />
                            Add
                        </Button>
                    </div>

                    {selectedDateSymptoms.length === 0 ? (
                        <Card className="border-0 bg-muted/30">
                            <CardContent className="py-16 text-center">
                                <Moon className="h-10 w-10 mx-auto text-muted-foreground/30 mb-4" />
                                <p className="text-muted-foreground mb-4">No symptoms logged</p>
                                <Button variant="outline" onClick={() => setShowSymptomModal(true)} className="rounded-xl">
                                    Log your first symptom
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {selectedDateSymptoms.map((s, i) => (
                                <Badge
                                    key={i}
                                    variant="secondary"
                                    className="py-2.5 px-4 rounded-xl bg-pink-50 dark:bg-pink-950/30 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800"
                                >
                                    {SYMPTOM_CATEGORIES[s.category].icon} {getSymptomDisplayName(s.symptom)}
                                </Badge>
                            ))}
                        </div>
                    )}

                    {/* Category Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        {Object.entries(SYMPTOM_CATEGORIES).slice(0, 5).map(([key, cat]) => (
                            <Card
                                key={key}
                                className="border-0 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                                onClick={() => setShowSymptomModal(true)}
                            >
                                <CardContent className="py-5 text-center">
                                    <span className="text-2xl">{cat.icon}</span>
                                    <p className="text-sm font-medium mt-2">{cat.label}</p>
                                    <p className="text-xs text-muted-foreground">{cat.symptoms.length} options</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* ==================== INSIGHTS TAB ==================== */}
                <TabsContent value="insights" className="space-y-6 mt-0">
                    <Card className="border-0 bg-green-50 dark:bg-green-950/20">
                        <CardHeader>
                            <CardTitle className="text-base font-medium flex items-center gap-2">
                                <Info className="h-4 w-4 text-green-500" />
                                Cycle Phases
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {(["menstrual", "follicular", "ovulation", "luteal"] as const).map((phase) => {
                                const info = getCyclePhaseInfo(phase);
                                const isCurrent = cycleData?.cyclePhase === phase;
                                return (
                                    <div
                                        key={phase}
                                        className={`p-4 rounded-xl transition-all ${isCurrent ? "bg-white dark:bg-background shadow-sm" : "bg-transparent"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: info.color }} />
                                            <span className="font-medium text-sm">{info.label}</span>
                                            {isCurrent && (
                                                <Badge variant="secondary" className="text-[10px] px-2 py-0">Current</Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground pl-6">{info.description}</p>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>

                    {cycleData?.fertilityWindow && (
                        <Card className="border-0 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-base font-medium flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-green-500" />
                                    Fertility Window
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 gap-6 text-center">
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Start</p>
                                        <p className="font-medium">
                                            {new Date(cycleData.fertilityWindow.fertileStart).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Ovulation</p>
                                        <p className="font-medium text-green-600">
                                            {new Date(cycleData.fertilityWindow.ovulationDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">End</p>
                                        <p className="font-medium">
                                            {new Date(cycleData.fertilityWindow.fertileEnd).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* ==================== HISTORY TAB ==================== */}
                <TabsContent value="history" className="space-y-4 mt-0">
                    {cycleHistory.length === 0 ? (
                        <Card className="border-0 bg-muted/30">
                            <CardContent className="py-16 text-center">
                                <TrendingUp className="h-10 w-10 mx-auto text-muted-foreground/30 mb-4" />
                                <p className="text-muted-foreground">Log at least 2 periods to see history</p>
                            </CardContent>
                        </Card>
                    ) : (
                        cycleHistory.map((cycle) => (
                            <Card key={cycle.cycleNumber} className="border-0 shadow-sm">
                                <CardContent className="py-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Cycle {cycle.cycleNumber}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(cycle.startDate).toLocaleDateString("en-US", { month: 'short', day: 'numeric' })} — {new Date(cycle.endDate).toLocaleDateString("en-US", { month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-pink-500">{cycle.cycleLength} days</p>
                                            <p className="text-sm text-muted-foreground">{cycle.periodLength} day period</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>
            </Tabs>

            {/* Symptom Modal */}
            <SymptomSelector
                open={showSymptomModal}
                onClose={() => setShowSymptomModal(false)}
                date={selectedDate}
                existingSymptoms={selectedDateSymptoms}
                onSave={handleSaveSymptoms}
            />

            {/* Disclaimer */}
            <p className="text-[11px] text-muted-foreground/60 text-center max-w-md mx-auto leading-relaxed">
                This feature provides estimates based on your logged data. It should not be used for contraception or medical decisions. Consult a healthcare provider for medical advice.
            </p>
        </div>
    );
};

export default WomenHealthDashboard;
