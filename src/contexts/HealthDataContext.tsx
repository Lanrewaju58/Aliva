import { createContext, useContext, useEffect, useState, useCallback, ReactNode, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { profileService } from '@/services/profileService';
import { mealService, Meal } from '@/services/mealService';
import { exerciseService, Exercise } from '@/services/exerciseService';
import { healthService, HealthSummary } from '@/services/healthService';
import { UserProfile } from '@/types/profile';

// ==================== TYPES ====================

interface HealthDataContextType {
    // Core data
    profile: UserProfile | null;
    meals: Meal[];
    exercises: Exercise[];
    waterIntake: number;
    healthSummary: HealthSummary | null;
    dailyStreak: number;
    today: string;

    // Loading states
    isLoading: boolean;
    error: string | null;

    // Setters for local state updates (used after Firebase operations)
    setMeals: React.Dispatch<React.SetStateAction<Meal[]>>;
    setExercises: React.Dispatch<React.SetStateAction<Exercise[]>>;
    setWaterIntake: React.Dispatch<React.SetStateAction<number>>;
    setDailyStreak: React.Dispatch<React.SetStateAction<number>>;

    // Refresh function
    refreshData: () => Promise<void>;
    refreshHealthSummary: () => Promise<void>;

    // Computed values
    nutritionTotals: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };

    dailyTargets: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        water: number;
    };
}

const HealthDataContext = createContext<HealthDataContextType | undefined>(undefined);

// ==================== PROVIDER ====================

interface HealthDataProviderProps {
    children: ReactNode;
}

export const HealthDataProvider = ({ children }: HealthDataProviderProps) => {
    const { user } = useAuth();

    // Core state
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [meals, setMeals] = useState<Meal[]>([]);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [waterIntake, setWaterIntake] = useState(0);
    const [healthSummary, setHealthSummary] = useState<HealthSummary | null>(null);
    const [dailyStreak, setDailyStreak] = useState(0);

    // Loading states
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Today's date (stable reference)
    const today = useMemo(() => new Date().toISOString().split('T')[0], []);

    // Load all data
    const loadData = useCallback(async () => {
        if (!user?.uid) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const [userProfile, todaysMeals, dailyLog, todaysExercises, health, streak] = await Promise.all([
                profileService.getProfile(user.uid),
                mealService.getMealsByDate(user.uid, today),
                mealService.getDailyLog(user.uid, today),
                exerciseService.getExercisesByDate(user.uid, today),
                healthService.getHealthSummary(user.uid),
                mealService.getDailyStreak(user.uid),
            ]);

            setProfile(userProfile);
            setMeals(todaysMeals);
            setWaterIntake(dailyLog?.waterIntake || 0);
            setExercises(todaysExercises);
            setHealthSummary(health);
            setDailyStreak(streak);
        } catch (err) {
            console.error('Error loading health data:', err);
            setError('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    }, [user?.uid, today]);

    // Initial load
    useEffect(() => {
        loadData();
    }, [loadData]);

    // Refresh health summary only (for HealthDashboard after manual log)
    const refreshHealthSummary = useCallback(async () => {
        if (!user?.uid) return;
        try {
            const health = await healthService.getHealthSummary(user.uid);
            setHealthSummary(health);
        } catch (err) {
            console.error('Error refreshing health summary:', err);
        }
    }, [user?.uid]);

    // Computed: nutrition totals
    const nutritionTotals = useMemo(() =>
        meals.reduce(
            (acc, meal) => ({
                calories: acc.calories + meal.calories,
                protein: acc.protein + meal.protein,
                carbs: acc.carbs + meal.carbs,
                fat: acc.fat + meal.fat,
            }),
            { calories: 0, protein: 0, carbs: 0, fat: 0 }
        ),
        [meals]
    );

    const dailyTargets = useMemo(() => {
        // Hydration: ~35ml per kg of body weight
        // 1 glass = 250ml (0.25L)
        // Cups = (weight * 0.035) / 0.25
        const weight = profile?.currentWeightKg || 70;
        const waterTargetCups = Math.max(6, Math.min(16, Math.round((weight * 0.035) / 0.25)));

        return {
            calories: profile?.preferredCalorieTarget || 2000,
            protein: profile?.currentWeightKg ? Math.round(profile.currentWeightKg * 1.8) : 150,
            carbs: 200,
            fat: 65,
            water: waterTargetCups,
        };
    }, [profile]);

    const value: HealthDataContextType = {
        profile,
        meals,
        exercises,
        waterIntake,
        healthSummary,
        dailyStreak,
        today,
        isLoading,
        error,
        setMeals,
        setExercises,
        setWaterIntake,
        setDailyStreak,
        refreshData: loadData,
        refreshHealthSummary,
        nutritionTotals,
        dailyTargets,
    };

    return (
        <HealthDataContext.Provider value={value}>
            {children}
        </HealthDataContext.Provider>
    );
};

// ==================== HOOK ====================

export const useHealthData = (): HealthDataContextType => {
    const context = useContext(HealthDataContext);
    if (context === undefined) {
        throw new Error('useHealthData must be used within a HealthDataProvider');
    }
    return context;
};

export default HealthDataContext;
