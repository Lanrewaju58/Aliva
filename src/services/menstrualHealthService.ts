// src/services/menstrualHealthService.ts
// Firebase service for menstrual health tracking (Flo-like functionality)

import { db } from "@/lib/firebase";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
} from "firebase/firestore";
import {
    PeriodEntry,
    SymptomEntry,
    MenstrualSettings,
    CycleData,
    CyclePhase,
    FertilityWindow,
    CycleHistoryEntry,
    DailyInsight,
    DEFAULT_MENSTRUAL_SETTINGS,
} from "@/types/menstrualTypes";

class MenstrualHealthService {
    private periodsCollection = "menstrualPeriods";
    private symptomsCollection = "menstrualSymptoms";
    private settingsDoc = "menstrualSettings";

    // ==================== PERIOD TRACKING ====================

    /**
     * Get all period entries for a user
     */
    async getPeriodHistory(userId: string): Promise<PeriodEntry[]> {
        try {
            const periodsRef = collection(db, "users", userId, this.periodsCollection);
            const q = query(periodsRef, orderBy("startDate", "desc"));
            const snapshot = await getDocs(q);

            return snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate() || new Date(),
            })) as PeriodEntry[];
        } catch (error) {
            console.error("Error fetching period history:", error);
            return [];
        }
    }

    /**
     * Get the most recent period entry
     */
    async getLastPeriod(userId: string): Promise<PeriodEntry | null> {
        try {
            const periodsRef = collection(db, "users", userId, this.periodsCollection);
            const q = query(periodsRef, orderBy("startDate", "desc"), limit(1));
            const snapshot = await getDocs(q);

            if (snapshot.empty) return null;

            const doc = snapshot.docs[0];
            return {
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate() || new Date(),
            } as PeriodEntry;
        } catch (error) {
            console.error("Error fetching last period:", error);
            return null;
        }
    }

    /**
     * Log period start
     */
    async logPeriodStart(
        userId: string,
        date: string,
        flowIntensity: string = "medium"
    ): Promise<string> {
        try {
            const periodsRef = collection(db, "users", userId, this.periodsCollection);
            const periodId = `period_${date}`;
            const periodDoc = doc(periodsRef, periodId);

            const entry: Omit<PeriodEntry, "id"> = {
                userId,
                startDate: date,
                flowIntensities: { [date]: flowIntensity as any },
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            await setDoc(periodDoc, {
                ...entry,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            });

            return periodId;
        } catch (error) {
            console.error("Error logging period start:", error);
            throw error;
        }
    }

    /**
     * Log period end
     */
    async logPeriodEnd(userId: string, periodId: string, endDate: string): Promise<void> {
        try {
            const periodDoc = doc(db, "users", userId, this.periodsCollection, periodId);
            await setDoc(
                periodDoc,
                {
                    endDate,
                    updatedAt: Timestamp.now(),
                },
                { merge: true }
            );
        } catch (error) {
            console.error("Error logging period end:", error);
            throw error;
        }
    }

    /**
     * Update flow intensity for a specific date
     */
    async updateFlowIntensity(
        userId: string,
        periodId: string,
        date: string,
        intensity: string
    ): Promise<void> {
        try {
            const periodDoc = doc(db, "users", userId, this.periodsCollection, periodId);
            const existing = await getDoc(periodDoc);

            if (existing.exists()) {
                const flowIntensities = existing.data().flowIntensities || {};
                flowIntensities[date] = intensity;

                await setDoc(
                    periodDoc,
                    {
                        flowIntensities,
                        updatedAt: Timestamp.now(),
                    },
                    { merge: true }
                );
            }
        } catch (error) {
            console.error("Error updating flow intensity:", error);
            throw error;
        }
    }

    /**
     * Delete a period entry
     */
    async deletePeriod(userId: string, periodId: string): Promise<void> {
        try {
            const periodDoc = doc(db, "users", userId, this.periodsCollection, periodId);
            await deleteDoc(periodDoc);
        } catch (error) {
            console.error("Error deleting period:", error);
            throw error;
        }
    }

    // ==================== SYMPTOM TRACKING ====================

    /**
     * Get symptoms for a specific date
     */
    async getSymptomsByDate(userId: string, date: string): Promise<SymptomEntry | null> {
        try {
            const symptomDoc = doc(
                db,
                "users",
                userId,
                this.symptomsCollection,
                `symptoms_${date}`
            );
            const snapshot = await getDoc(symptomDoc);

            if (!snapshot.exists()) return null;

            return {
                id: snapshot.id,
                ...snapshot.data(),
                createdAt: snapshot.data().createdAt?.toDate() || new Date(),
                updatedAt: snapshot.data().updatedAt?.toDate() || new Date(),
            } as SymptomEntry;
        } catch (error) {
            console.error("Error fetching symptoms:", error);
            return null;
        }
    }

    /**
     * Get symptoms for a date range
     */
    async getSymptomsInRange(
        userId: string,
        startDate: string,
        endDate: string
    ): Promise<SymptomEntry[]> {
        try {
            const symptomsRef = collection(db, "users", userId, this.symptomsCollection);
            const q = query(
                symptomsRef,
                where("date", ">=", startDate),
                where("date", "<=", endDate),
                orderBy("date", "desc")
            );
            const snapshot = await getDocs(q);

            return snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate() || new Date(),
            })) as SymptomEntry[];
        } catch (error) {
            console.error("Error fetching symptoms in range:", error);
            return [];
        }
    }

    /**
     * Log symptoms for a date
     */
    async logSymptoms(
        userId: string,
        date: string,
        symptoms: SymptomEntry["symptoms"],
        notes?: string
    ): Promise<void> {
        try {
            const symptomDoc = doc(
                db,
                "users",
                userId,
                this.symptomsCollection,
                `symptoms_${date}`
            );

            await setDoc(symptomDoc, {
                userId,
                date,
                symptoms,
                ...(notes !== undefined && { notes }),
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            });
        } catch (error) {
            console.error("Error logging symptoms:", error);
            throw error;
        }
    }

    /**
     * Add symptoms to existing entry
     */
    async addSymptoms(
        userId: string,
        date: string,
        newSymptoms: SymptomEntry["symptoms"]
    ): Promise<void> {
        try {
            const existing = await this.getSymptomsByDate(userId, date);
            const symptoms = existing ? [...existing.symptoms, ...newSymptoms] : newSymptoms;
            await this.logSymptoms(userId, date, symptoms);
        } catch (error) {
            console.error("Error adding symptoms:", error);
            throw error;
        }
    }

    // ==================== SETTINGS ====================

    /**
     * Get user's menstrual settings
     */
    async getSettings(userId: string): Promise<MenstrualSettings> {
        try {
            const settingsDocRef = doc(db, "users", userId, this.settingsDoc, "settings");
            const snapshot = await getDoc(settingsDocRef);

            if (!snapshot.exists()) {
                return {
                    userId,
                    ...DEFAULT_MENSTRUAL_SETTINGS,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
            }

            return {
                userId,
                ...snapshot.data(),
                createdAt: snapshot.data().createdAt?.toDate() || new Date(),
                updatedAt: snapshot.data().updatedAt?.toDate() || new Date(),
            } as MenstrualSettings;
        } catch (error) {
            console.error("Error fetching settings:", error);
            return {
                userId,
                ...DEFAULT_MENSTRUAL_SETTINGS,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
        }
    }

    /**
     * Update user's menstrual settings
     */
    async updateSettings(
        userId: string,
        settings: Partial<MenstrualSettings>
    ): Promise<void> {
        try {
            const settingsDocRef = doc(db, "users", userId, this.settingsDoc, "settings");
            await setDoc(
                settingsDocRef,
                {
                    ...settings,
                    userId,
                    updatedAt: Timestamp.now(),
                },
                { merge: true }
            );
        } catch (error) {
            console.error("Error updating settings:", error);
            throw error;
        }
    }

    // ==================== CYCLE CALCULATIONS ====================

    /**
     * Calculate cycle data and predictions
     */
    async getCycleData(userId: string): Promise<CycleData> {
        const [periods, settings] = await Promise.all([
            this.getPeriodHistory(userId),
            this.getSettings(userId),
        ]);

        const today = new Date().toISOString().split("T")[0];

        if (periods.length === 0) {
            return {
                currentCycleDay: 0,
                cyclePhase: "follicular",
                nextPeriodDate: null,
                daysUntilNextPeriod: null,
                lastPeriodStart: null,
                lastPeriodEnd: null,
                averageCycleLength: settings.defaultCycleLength,
                averagePeriodLength: settings.defaultPeriodLength,
                cycleCount: 0,
                fertilityWindow: null,
                isOnPeriod: false,
            };
        }

        // Calculate averages from history
        const cycleLengths: number[] = [];
        const periodLengths: number[] = [];

        for (let i = 0; i < periods.length - 1; i++) {
            const cycleLength = this.daysBetween(periods[i + 1].startDate, periods[i].startDate);
            if (cycleLength > 0 && cycleLength <= 45) {
                cycleLengths.push(cycleLength);
            }

            if (periods[i].endDate) {
                const periodLength = this.daysBetween(periods[i].startDate, periods[i].endDate) + 1;
                if (periodLength > 0 && periodLength <= 10) {
                    periodLengths.push(periodLength);
                }
            }
        }

        const averageCycleLength =
            cycleLengths.length > 0
                ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
                : settings.defaultCycleLength;

        const averagePeriodLength =
            periodLengths.length > 0
                ? Math.round(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length)
                : settings.defaultPeriodLength;

        const lastPeriod = periods[0];
        const lastPeriodStart = lastPeriod.startDate;
        const lastPeriodEnd = lastPeriod.endDate || null;

        // Check if currently on period
        const isOnPeriod = !lastPeriodEnd && this.daysBetween(lastPeriodStart, today) < 10;

        // Calculate current cycle day
        const currentCycleDay = this.daysBetween(lastPeriodStart, today) + 1;

        // Predict next period
        const nextPeriodDate = this.addDays(lastPeriodStart, averageCycleLength);
        const daysUntilNextPeriod = Math.max(0, this.daysBetween(today, nextPeriodDate));

        // Determine cycle phase
        const cyclePhase = this.determineCyclePhase(
            currentCycleDay,
            averageCycleLength,
            averagePeriodLength,
            isOnPeriod
        );

        // Calculate fertility window
        const fertilityWindow = this.calculateFertilityWindow(
            lastPeriodStart,
            averageCycleLength,
            periods.length
        );

        return {
            currentCycleDay,
            cyclePhase,
            nextPeriodDate,
            daysUntilNextPeriod,
            lastPeriodStart,
            lastPeriodEnd,
            averageCycleLength,
            averagePeriodLength,
            cycleCount: periods.length,
            fertilityWindow,
            isOnPeriod,
        };
    }

    /**
     * Get cycle history for statistics
     */
    async getCycleHistory(userId: string): Promise<CycleHistoryEntry[]> {
        const periods = await this.getPeriodHistory(userId);
        const history: CycleHistoryEntry[] = [];

        for (let i = 0; i < periods.length - 1; i++) {
            const cycleLength = this.daysBetween(periods[i + 1].startDate, periods[i].startDate);
            const periodLength = periods[i].endDate
                ? this.daysBetween(periods[i].startDate, periods[i].endDate) + 1
                : 0;

            history.push({
                cycleNumber: periods.length - i,
                startDate: periods[i].startDate,
                endDate: periods[i].endDate || periods[i].startDate,
                cycleLength,
                periodLength,
            });
        }

        return history;
    }

    /**
     * Get daily insights based on cycle phase
     */
    async getDailyInsights(userId: string): Promise<DailyInsight[]> {
        const cycleData = await this.getCycleData(userId);
        const insights: DailyInsight[] = [];

        if (cycleData.cycleCount === 0) {
            insights.push({
                title: "Welcome! Let's get started",
                message: "Log your period to start tracking your cycle and get personalized insights.",
                type: "info",
                icon: "👋",
            });
            return insights;
        }

        // Phase-based insights
        switch (cycleData.cyclePhase) {
            case "menstrual":
                insights.push({
                    title: "Period Day " + cycleData.currentCycleDay,
                    message: "Take it easy. Warm drinks and gentle stretching can help with cramps.",
                    type: "tip",
                    icon: "🌸",
                });
                break;
            case "follicular":
                insights.push({
                    title: "Rising Energy",
                    message: "Your energy is increasing! Great time to start new projects or try new workouts.",
                    type: "info",
                    icon: "🌱",
                });
                break;
            case "ovulation":
                insights.push({
                    title: "Peak Fertility",
                    message: "You may feel more social and energetic. Your fertile window is now.",
                    type: "info",
                    icon: "✨",
                });
                break;
            case "luteal":
                insights.push({
                    title: "Winding Down",
                    message: "Focus on self-care. Some PMS symptoms may appear in the coming days.",
                    type: "tip",
                    icon: "🍂",
                });
                break;
        }

        // Prediction insight
        if (cycleData.daysUntilNextPeriod !== null && cycleData.daysUntilNextPeriod <= 3) {
            insights.push({
                title: "Period Coming Soon",
                message: `Your period is predicted to start in ${cycleData.daysUntilNextPeriod} day${cycleData.daysUntilNextPeriod !== 1 ? "s" : ""}.`,
                type: "prediction",
                icon: "📅",
            });
        }

        return insights;
    }

    // ==================== HELPER METHODS ====================

    private daysBetween(date1: string, date2: string): number {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diffTime = d2.getTime() - d1.getTime();
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }

    private addDays(date: string, days: number): string {
        const d = new Date(date);
        d.setDate(d.getDate() + days);
        return d.toISOString().split("T")[0];
    }

    private determineCyclePhase(
        cycleDay: number,
        cycleLength: number,
        periodLength: number,
        isOnPeriod: boolean
    ): CyclePhase {
        if (isOnPeriod || cycleDay <= periodLength) {
            return "menstrual";
        }

        const ovulationDay = cycleLength - 14;
        const follicularEnd = ovulationDay - 2;
        const ovulationEnd = ovulationDay + 2;

        if (cycleDay <= follicularEnd) {
            return "follicular";
        }
        if (cycleDay <= ovulationEnd) {
            return "ovulation";
        }
        return "luteal";
    }

    private calculateFertilityWindow(
        lastPeriodStart: string,
        cycleLength: number,
        cycleCount: number
    ): FertilityWindow | null {
        if (cycleCount < 1) return null;

        const ovulationDay = cycleLength - 14;
        const ovulationDate = this.addDays(lastPeriodStart, ovulationDay);
        const fertileStart = this.addDays(lastPeriodStart, ovulationDay - 5);
        const fertileEnd = this.addDays(lastPeriodStart, ovulationDay + 1);

        return {
            fertileStart,
            fertileEnd,
            ovulationDate,
            confidence: cycleCount >= 3 ? "high" : cycleCount >= 2 ? "medium" : "low",
        };
    }
}

export const menstrualHealthService = new MenstrualHealthService();
