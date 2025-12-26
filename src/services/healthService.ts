import { db } from "@/lib/firebase";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
    DocumentData
} from "firebase/firestore";

// Types for health data
export interface HealthEntry {
    id?: string;
    userId: string;
    provider: 'google' | 'apple' | 'fitbit' | 'garmin' | 'oura' | 'samsung' | 'withings';
    dataType: 'sleep' | 'activity' | 'heart_rate' | 'steps' | 'nutrition';
    date: Date;
    data: {
        // Sleep data
        totalSleepMinutes?: number;
        deepSleepMinutes?: number;
        lightSleepMinutes?: number;
        remSleepMinutes?: number;
        awakeDurationMinutes?: number;
        sleepScore?: number;
        sleepStartTime?: Date;
        sleepEndTime?: Date;

        // Activity data
        steps?: number;
        caloriesBurned?: number;
        activeMinutes?: number;
        distance?: number; // in meters
        floors?: number;

        // Heart rate data
        avgHeartRate?: number;
        restingHeartRate?: number;
        maxHeartRate?: number;
        minHeartRate?: number;
        hrvMs?: number; // Heart rate variability in ms
    };
    createdAt: Date;
    rawData?: any; // Original data from Terra for debugging
}

export interface ConnectedProvider {
    userId: string;
    provider: string;
    terraUserId: string;
    connectedAt: Date;
    lastSyncAt?: Date;
    status: 'active' | 'disconnected' | 'error';
}

export interface HealthSummary {
    today: {
        steps: number;
        caloriesBurned: number;
        activeMinutes: number;
        sleepHours: number;
        avgHeartRate: number | null;
    };
    weekAverage: {
        steps: number;
        sleepHours: number;
        caloriesBurned: number;
    };
    connectedProviders: ConnectedProvider[];
}

class HealthService {
    private healthCollection = 'healthData';
    private providersCollection = 'connectedProviders';

    /**
     * Get health entries for a user within a date range
     */
    async getHealthEntries(
        userId: string,
        startDate: Date,
        endDate: Date,
        dataType?: HealthEntry['dataType']
    ): Promise<HealthEntry[]> {
        try {
            const entriesRef = collection(db, this.healthCollection, userId, 'entries');

            let q = query(
                entriesRef,
                where('date', '>=', Timestamp.fromDate(startDate)),
                where('date', '<=', Timestamp.fromDate(endDate)),
                orderBy('date', 'desc')
            );

            if (dataType) {
                q = query(
                    entriesRef,
                    where('dataType', '==', dataType),
                    where('date', '>=', Timestamp.fromDate(startDate)),
                    where('date', '<=', Timestamp.fromDate(endDate)),
                    orderBy('date', 'desc')
                );
            }

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => this.parseHealthEntry(doc.id, doc.data()));
        } catch (error) {
            console.error('Error fetching health entries:', error);
            return [];
        }
    }

    /**
     * Get today's health summary
     */
    async getTodaySummary(userId: string): Promise<HealthSummary['today']> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const entries = await this.getHealthEntries(userId, today, tomorrow);

        let steps = 0;
        let caloriesBurned = 0;
        let activeMinutes = 0;
        let sleepMinutes = 0;
        let heartRateSum = 0;
        let heartRateCount = 0;

        entries.forEach(entry => {
            if (entry.dataType === 'activity' || entry.dataType === 'steps') {
                steps += entry.data.steps || 0;
                caloriesBurned += entry.data.caloriesBurned || 0;
                activeMinutes += entry.data.activeMinutes || 0;
            }
            if (entry.dataType === 'sleep') {
                sleepMinutes += entry.data.totalSleepMinutes || 0;
            }
            if (entry.dataType === 'heart_rate' && entry.data.avgHeartRate) {
                heartRateSum += entry.data.avgHeartRate;
                heartRateCount++;
            }
        });

        return {
            steps,
            caloriesBurned,
            activeMinutes,
            sleepHours: Math.round((sleepMinutes / 60) * 10) / 10,
            avgHeartRate: heartRateCount > 0 ? Math.round(heartRateSum / heartRateCount) : null
        };
    }

    /**
     * Get last 7 days weekly average
     */
    async getWeeklyAverage(userId: string): Promise<HealthSummary['weekAverage']> {
        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        weekAgo.setHours(0, 0, 0, 0);

        const entries = await this.getHealthEntries(userId, weekAgo, today);

        let totalSteps = 0;
        let totalSleepMinutes = 0;
        let totalCalories = 0;
        const daysWithData = new Set<string>();

        entries.forEach(entry => {
            const dateKey = entry.date.toISOString().split('T')[0];
            daysWithData.add(dateKey);

            if (entry.dataType === 'activity' || entry.dataType === 'steps') {
                totalSteps += entry.data.steps || 0;
                totalCalories += entry.data.caloriesBurned || 0;
            }
            if (entry.dataType === 'sleep') {
                totalSleepMinutes += entry.data.totalSleepMinutes || 0;
            }
        });

        const days = Math.max(daysWithData.size, 1);

        return {
            steps: Math.round(totalSteps / days),
            sleepHours: Math.round((totalSleepMinutes / 60 / days) * 10) / 10,
            caloriesBurned: Math.round(totalCalories / days)
        };
    }

    /**
     * Get connected health providers for a user
     */
    async getConnectedProviders(userId: string): Promise<ConnectedProvider[]> {
        try {
            const providersRef = collection(db, this.providersCollection);
            const q = query(
                providersRef,
                where('userId', '==', userId),
                where('status', '==', 'active')
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                userId: doc.data().userId,
                provider: doc.data().provider,
                terraUserId: doc.data().terraUserId,
                connectedAt: doc.data().connectedAt?.toDate() || new Date(),
                lastSyncAt: doc.data().lastSyncAt?.toDate(),
                status: doc.data().status
            }));
        } catch (error) {
            console.error('Error fetching connected providers:', error);
            return [];
        }
    }

    /**
     * Get full health summary including connected providers
     */
    async getHealthSummary(userId: string): Promise<HealthSummary> {
        const [today, weekAverage, connectedProviders] = await Promise.all([
            this.getTodaySummary(userId),
            this.getWeeklyAverage(userId),
            this.getConnectedProviders(userId)
        ]);

        return { today, weekAverage, connectedProviders };
    }

    /**
     * Save a health entry (called by webhook handler)
     */
    async saveHealthEntry(userId: string, entry: Omit<HealthEntry, 'id' | 'createdAt'>): Promise<void> {
        try {
            const entriesRef = collection(db, this.healthCollection, userId, 'entries');
            const entryId = `${entry.provider}_${entry.dataType}_${entry.date.toISOString().split('T')[0]}`;

            await setDoc(doc(entriesRef, entryId), {
                ...entry,
                date: Timestamp.fromDate(entry.date),
                createdAt: Timestamp.now()
            }, { merge: true });
        } catch (error) {
            console.error('Error saving health entry:', error);
            throw error;
        }
    }

    /**
     * Update connected provider status
     */
    async updateProviderConnection(
        userId: string,
        provider: string,
        terraUserId: string,
        status: ConnectedProvider['status']
    ): Promise<void> {
        try {
            const providerRef = doc(db, this.providersCollection, `${userId}_${provider}`);
            await setDoc(providerRef, {
                userId,
                provider,
                terraUserId,
                status,
                connectedAt: Timestamp.now(),
                lastSyncAt: status === 'active' ? Timestamp.now() : null
            }, { merge: true });
        } catch (error) {
            console.error('Error updating provider connection:', error);
            throw error;
        }
    }

    /**
     * Parse Firestore document to HealthEntry
     */
    private parseHealthEntry(id: string, data: DocumentData): HealthEntry {
        return {
            id,
            userId: data.userId,
            provider: data.provider,
            dataType: data.dataType,
            date: data.date?.toDate() || new Date(),
            data: data.data || {},
            createdAt: data.createdAt?.toDate() || new Date(),
            rawData: data.rawData
        };
    }
}

export const healthService = new HealthService();
