// src/types/menstrualTypes.ts
// Types for menstrual health tracking (Flo-like functionality)

// Flow intensity for period logging
export type FlowIntensity = 'spotting' | 'light' | 'medium' | 'heavy';

// Cycle phases
export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

// Symptom categories matching Flo app
export const SYMPTOM_CATEGORIES = {
    mood: {
        label: 'Mood',
        icon: '😊',
        symptoms: [
            'happy', 'calm', 'energetic', 'sensitive', 'sad', 'anxious',
            'irritable', 'mood_swings', 'depressed', 'emotional', 'confident',
            'apathetic', 'confused', 'frisky', 'grateful', 'self_critical'
        ]
    },
    physical: {
        label: 'Physical',
        icon: '💪',
        symptoms: [
            'cramps', 'headache', 'migraine', 'backache', 'bloating',
            'breast_tenderness', 'fatigue', 'acne', 'hot_flashes',
            'joint_pain', 'muscle_pain', 'nausea', 'dizziness', 'chills'
        ]
    },
    discharge: {
        label: 'Discharge',
        icon: '💧',
        symptoms: [
            'no_discharge', 'sticky', 'creamy', 'egg_white', 'watery',
            'unusual_smell', 'unusual_color'
        ]
    },
    energy: {
        label: 'Energy',
        icon: '⚡',
        symptoms: ['high_energy', 'normal_energy', 'low_energy', 'exhausted']
    },
    sleep: {
        label: 'Sleep',
        icon: '😴',
        symptoms: [
            'good_sleep', 'poor_sleep', 'insomnia', 'vivid_dreams',
            'night_sweats', 'trouble_falling_asleep', 'waking_up_early'
        ]
    },
    cravings: {
        label: 'Cravings',
        icon: '🍫',
        symptoms: ['sweet', 'salty', 'chocolate', 'carbs', 'spicy', 'no_cravings']
    },
    sexual: {
        label: 'Sexual Activity',
        icon: '❤️',
        symptoms: [
            'high_libido', 'normal_libido', 'low_libido',
            'protected_sex', 'unprotected_sex', 'masturbation'
        ]
    },
    digestive: {
        label: 'Digestive',
        icon: '🍽️',
        symptoms: [
            'normal_digestion', 'constipation', 'diarrhea', 'gas',
            'nausea', 'vomiting', 'appetite_increased', 'appetite_decreased'
        ]
    },
    skin: {
        label: 'Skin & Hair',
        icon: '✨',
        symptoms: [
            'clear_skin', 'acne', 'oily_skin', 'dry_skin',
            'good_hair_day', 'bad_hair_day', 'oily_hair'
        ]
    },
    exercise: {
        label: 'Exercise',
        icon: '🏃',
        symptoms: [
            'worked_out', 'light_activity', 'rest_day', 'yoga', 'walking'
        ]
    }
} as const;

export type SymptomCategory = keyof typeof SYMPTOM_CATEGORIES;

// Get all possible symptom names
export type SymptomName = typeof SYMPTOM_CATEGORIES[SymptomCategory]['symptoms'][number];

// Period entry - a single logged period
export interface PeriodEntry {
    id?: string;
    userId: string;
    startDate: string; // ISO date string YYYY-MM-DD
    endDate?: string; // ISO date string, null if period is ongoing
    flowIntensities: { [date: string]: FlowIntensity }; // Flow per day
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Symptom entry - logged symptoms for a specific date
export interface SymptomEntry {
    id?: string;
    userId: string;
    date: string; // ISO date string YYYY-MM-DD
    symptoms: {
        category: SymptomCategory;
        symptom: string;
        intensity?: 1 | 2 | 3; // For symptoms with intensity scale
    }[];
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Fertility window prediction
export interface FertilityWindow {
    fertileStart: string; // ISO date
    fertileEnd: string; // ISO date
    ovulationDate: string; // ISO date
    confidence: 'low' | 'medium' | 'high';
}

// Cycle data with predictions
export interface CycleData {
    currentCycleDay: number;
    cyclePhase: CyclePhase;
    nextPeriodDate: string | null;
    daysUntilNextPeriod: number | null;
    lastPeriodStart: string | null;
    lastPeriodEnd: string | null;
    averageCycleLength: number;
    averagePeriodLength: number;
    cycleCount: number; // Number of logged cycles
    fertilityWindow: FertilityWindow | null;
    isOnPeriod: boolean;
}

// User's menstrual health settings
export interface MenstrualSettings {
    userId: string;
    defaultCycleLength: number; // 21-35, default 28
    defaultPeriodLength: number; // 3-10, default 5
    periodReminderEnabled: boolean;
    periodReminderDays: number; // Days before predicted period
    ovulationReminderEnabled: boolean;
    firstDayOfLastPeriod?: string; // For initial prediction
    createdAt: Date;
    updatedAt: Date;
}

// Cycle history entry for statistics
export interface CycleHistoryEntry {
    cycleNumber: number;
    startDate: string;
    endDate: string;
    cycleLength: number;
    periodLength: number;
}

// Daily insight for personalized messages
export interface DailyInsight {
    title: string;
    message: string;
    type: 'info' | 'tip' | 'prediction' | 'reminder';
    icon: string;
}

// Helper function to get symptom display name
export const getSymptomDisplayName = (symptom: string): string => {
    return symptom
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

// Helper to get cycle phase info
export const getCyclePhaseInfo = (phase: CyclePhase): { label: string; color: string; description: string } => {
    const phases = {
        menstrual: {
            label: 'Menstrual',
            color: '#FF6B6B',
            description: 'Your period days. Rest and self-care recommended.'
        },
        follicular: {
            label: 'Follicular',
            color: '#4ECDC4',
            description: 'Energy increasing. Great time for new projects.'
        },
        ovulation: {
            label: 'Ovulation',
            color: '#FFE66D',
            description: 'Peak fertility and energy. Social activities are ideal.'
        },
        luteal: {
            label: 'Luteal',
            color: '#9B59B6',
            description: 'Winding down. Focus on completing tasks.'
        }
    };
    return phases[phase];
};

// Default settings for new users
export const DEFAULT_MENSTRUAL_SETTINGS: Omit<MenstrualSettings, 'userId' | 'createdAt' | 'updatedAt'> = {
    defaultCycleLength: 28,
    defaultPeriodLength: 5,
    periodReminderEnabled: true,
    periodReminderDays: 2,
    ovulationReminderEnabled: false
};
