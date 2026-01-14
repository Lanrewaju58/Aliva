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
    Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Medication, MedicationLog, MedicationInput, MedicationLogInput } from '@/types/medication';

class MedicationService {
    // ==================== MEDICATIONS ====================

    async addMedication(userId: string, data: MedicationInput): Promise<string> {
        const docRef = await addDoc(collection(db, `users/${userId}/medications`), {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            active: true
        });
        return docRef.id;
    }

    async getMedications(userId: string): Promise<Medication[]> {
        const q = query(
            collection(db, `users/${userId}/medications`),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Medication));
    }

    async updateMedication(userId: string, medId: string, data: Partial<MedicationInput>): Promise<void> {
        await updateDoc(doc(db, `users/${userId}/medications/${medId}`), {
            ...data,
            updatedAt: serverTimestamp()
        });
    }

    async deleteMedication(userId: string, medId: string): Promise<void> {
        await deleteDoc(doc(db, `users/${userId}/medications/${medId}`));
    }

    // ==================== MEDICATION LOGS ====================

    async addLog(userId: string, data: MedicationLogInput): Promise<string> {
        const docRef = await addDoc(collection(db, `users/${userId}/medicationLogs`), {
            ...data,
            takenAt: serverTimestamp()
        });
        return docRef.id;
    }

    async getLogsByDate(userId: string, date: string): Promise<MedicationLog[]> {
        const q = query(
            collection(db, `users/${userId}/medicationLogs`),
            where('date', '==', date)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as MedicationLog));
    }

    async deleteLog(userId: string, logId: string): Promise<void> {
        await deleteDoc(doc(db, `users/${userId}/medicationLogs/${logId}`));
    }
}

export const medicationService = new MedicationService();
