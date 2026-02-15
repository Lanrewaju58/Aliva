import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp,
    limit,
    Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SleepLog, MoodLog, SleepLogInput, MoodLogInput } from '@/types/wellness';

class WellnessService {
    // ==================== SLEEP LOGS ====================

    async addSleepLog(userId: string, data: SleepLogInput): Promise<string> {
        const docRef = await addDoc(collection(db, `users/${userId}/sleepLogs`), {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return docRef.id;
    }

    async getSleepLogs(userId: string, days: number = 7): Promise<SleepLog[]> {
        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const startDateString = startDate.toISOString().split('T')[0];

        const q = query(
            collection(db, `users/${userId}/sleepLogs`),
            where('date', '>=', startDateString),
            orderBy('date', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as SleepLog));
    }

    async updateSleepLog(userId: string, logId: string, data: Partial<SleepLogInput>): Promise<void> {
        await updateDoc(doc(db, `users/${userId}/sleepLogs/${logId}`), {
            ...data,
            updatedAt: serverTimestamp()
        });
    }

    async deleteSleepLog(userId: string, logId: string): Promise<void> {
        await deleteDoc(doc(db, `users/${userId}/sleepLogs/${logId}`));
    }

    // ==================== MOOD LOGS ====================

    async addMoodLog(userId: string, data: MoodLogInput): Promise<string> {
        const docRef = await addDoc(collection(db, `users/${userId}/moodLogs`), {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return docRef.id;
    }

    async getMoodLogs(userId: string, days: number = 7): Promise<MoodLog[]> {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const startDateString = startDate.toISOString().split('T')[0];

        const q = query(
            collection(db, `users/${userId}/moodLogs`),
            where('date', '>=', startDateString),
            orderBy('date', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as MoodLog));
    }

    async deleteMoodLog(userId: string, logId: string): Promise<void> {
        await deleteDoc(doc(db, `users/${userId}/moodLogs/${logId}`));
    }
}

export const wellnessService = new WellnessService();
