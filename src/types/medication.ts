import { Timestamp } from 'firebase/firestore';

export type MedicationType = 'Pill' | 'Capsule' | 'Liquid' | 'Injection' | 'Other';

export interface Medication {
    id: string;
    userId: string;
    name: string;
    dosage: string;
    frequency: string; // e.g., "Once daily", "Twice daily"
    time?: string; // e.g., "08:00"
    type: MedicationType;
    active: boolean;
    createdAt?: Timestamp | Date;
    updatedAt?: Timestamp | Date;
}

export interface MedicationLog {
    id: string;
    userId: string;
    medicationId: string;
    date: string; // YYYY-MM-DD
    takenAt: Timestamp | Date;
    status: 'taken' | 'skipped' | 'missed';
}

export type MedicationInput = Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>;
export type MedicationLogInput = Omit<MedicationLog, 'id'>;
