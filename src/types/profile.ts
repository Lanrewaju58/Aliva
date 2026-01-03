// src/types/profile.ts

export const ACTIVITY_LEVELS = [
  'sedentary',
  'lightly_active',
  'moderately_active',
  'very_active',
  'extremely_active',
] as const;

export type ActivityLevel = typeof ACTIVITY_LEVELS[number];

export type Gender = 'male' | 'female' | 'other';

export type SmokingStatus = 'never' | 'former' | 'current';

export type AlcoholFrequency = 'never' | 'occasional' | 'regular';

export type Plan = 'FREE' | 'PRO';

export interface WeightEntry {
  date: Date | string;
  weightKg: number;
}

export interface UserProfile {
  id?: string;
  userId: string;
  fullName: string;

  // Health metrics
  age?: number;
  gender?: Gender;
  heightCm?: number;
  currentWeightKg?: number;
  targetWeightKg?: number;
  activityLevel?: ActivityLevel;

  // Preferences
  dietaryPreferences: string[];
  healthGoals: string[];
  allergies: string[];
  medicalConditions: string[];

  // Lifestyle
  smokingStatus?: SmokingStatus;
  alcoholFrequency?: AlcoholFrequency;

  // Weight tracking
  weightHistory: WeightEntry[];

  // Nutrition goals
  preferredCalorieTarget?: number;

  // Subscription
  plan?: Plan;
  planExpiresAt?: Date | null;

  // Profile
  photoURL?: string;
  country?: string;

  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}