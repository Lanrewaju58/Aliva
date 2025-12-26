import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    deleteDoc,
    query,
    where,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type ExerciseType = 'cardio' | 'strength' | 'flexibility' | 'sports' | 'other';

export interface Exercise {
    id: string;
    userId: string;
    name: string;
    exerciseType: ExerciseType;
    duration: number; // in minutes
    caloriesBurned: number;
    date: string; // YYYY-MM-DD format
    time: string; // ISO string
    notes?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export class ExerciseService {
    private getExerciseRef(userId: string, exerciseId: string) {
        return doc(db, 'users', userId, 'exercises', exerciseId);
    }

    private getExercisesCollection(userId: string) {
        return collection(db, 'users', userId, 'exercises');
    }

    async addExercise(exercise: Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        try {
            const exerciseId = `exercise_${Date.now()}`;
            const exerciseRef = this.getExerciseRef(exercise.userId, exerciseId);

            await setDoc(exerciseRef, {
                ...exercise,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            return exerciseId;
        } catch (error) {
            console.error('Error adding exercise:', error);
            throw error;
        }
    }

    async getExercise(userId: string, exerciseId: string): Promise<Exercise | null> {
        try {
            const exerciseRef = this.getExerciseRef(userId, exerciseId);
            const exerciseSnap = await getDoc(exerciseRef);

            if (exerciseSnap.exists()) {
                const data = exerciseSnap.data();
                return {
                    id: exerciseSnap.id,
                    userId: data.userId,
                    name: data.name,
                    exerciseType: data.exerciseType,
                    duration: data.duration,
                    caloriesBurned: data.caloriesBurned,
                    date: data.date,
                    time: data.time,
                    notes: data.notes,
                    createdAt: data.createdAt?.toDate(),
                    updatedAt: data.updatedAt?.toDate(),
                };
            }

            return null;
        } catch (error) {
            console.error('Error getting exercise:', error);
            throw error;
        }
    }

    async getExercisesByDate(userId: string, date: string): Promise<Exercise[]> {
        try {
            const exercisesRef = this.getExercisesCollection(userId);
            const q = query(
                exercisesRef,
                where('date', '==', date)
            );

            const querySnap = await getDocs(q);
            const exercises: Exercise[] = [];

            querySnap.forEach((doc) => {
                const data = doc.data();
                exercises.push({
                    id: doc.id,
                    userId: data.userId,
                    name: data.name,
                    exerciseType: data.exerciseType,
                    duration: data.duration,
                    caloriesBurned: data.caloriesBurned,
                    date: data.date,
                    time: data.time,
                    notes: data.notes,
                    createdAt: data.createdAt?.toDate(),
                    updatedAt: data.updatedAt?.toDate(),
                });
            });

            // Sort by time in memory instead
            return exercises.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
        } catch (error) {
            console.error('Error getting exercises by date:', error);
            throw error;
        }
    }

    async deleteExercise(userId: string, exerciseId: string): Promise<void> {
        try {
            const exerciseRef = this.getExerciseRef(userId, exerciseId);
            await deleteDoc(exerciseRef);
        } catch (error) {
            console.error('Error deleting exercise:', error);
            throw error;
        }
    }

    // Get total calories burned for a date
    async getTotalCaloriesBurned(userId: string, date: string): Promise<number> {
        try {
            const exercises = await this.getExercisesByDate(userId, date);
            return exercises.reduce((total, ex) => total + ex.caloriesBurned, 0);
        } catch (error) {
            console.error('Error getting total calories burned:', error);
            return 0;
        }
    }

    // Get total exercise duration for a date
    async getTotalDuration(userId: string, date: string): Promise<number> {
        try {
            const exercises = await this.getExercisesByDate(userId, date);
            return exercises.reduce((total, ex) => total + ex.duration, 0);
        } catch (error) {
            console.error('Error getting total duration:', error);
            return 0;
        }
    }
}

export const exerciseService = new ExerciseService();
