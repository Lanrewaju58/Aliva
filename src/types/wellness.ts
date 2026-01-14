import { Timestamp } from 'firebase/firestore';

export interface SleepLog {
    id: string;
    userId: string;
    date: string; // YYYY-MM-DD
    hours: number;
    quality: 'Poor' | 'Fair' | 'Good' | 'Excellent';
    bedTime?: string; // HH:mm
    wakeTime?: string; // HH:mm
    notes?: string;
    createdAt?: Timestamp | Date;
    updatedAt?: Timestamp | Date;
}

export interface MoodLog {
    id: string;
    userId: string;
    date: string; // YYYY-MM-DD
    mood: 1 | 2 | 3 | 4 | 5; // 1 = Very Bad, 5 = Great
    tags: string[]; // e.g., "Stressed", "Energetic", "Calm"
    notes?: string;
    createdAt?: Timestamp | Date;
    updatedAt?: Timestamp | Date;
}

export type SleepLogInput = Omit<SleepLog, 'id' | 'createdAt' | 'updatedAt'>;
export type MoodLogInput = Omit<MoodLog, 'id' | 'createdAt' | 'updatedAt'>;
