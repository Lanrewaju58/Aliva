import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface GlobalSettings {
    freeUsersArePro: boolean;
}

const SETTINGS_DOC_PATH = 'settings/global';

class SettingsService {
    /**
     * Get global settings
     */
    async getSettings(): Promise<GlobalSettings> {
        try {
            const docRef = doc(db, SETTINGS_DOC_PATH);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return docSnap.data() as GlobalSettings;
            }

            // Default settings
            return {
                freeUsersArePro: false
            };
        } catch (error) {
            console.error('Error fetching settings:', error);
            // Fallback to default
            return { freeUsersArePro: false };
        }
    }

    /**
     * Update global settings
     */
    async updateSettings(settings: Partial<GlobalSettings>): Promise<void> {
        try {
            const docRef = doc(db, SETTINGS_DOC_PATH);
            await setDoc(docRef, settings, { merge: true });
        } catch (error) {
            console.error('Error updating settings:', error);
            throw error;
        }
    }

    /**
     * Subscribe to settings changes
     */
    subscribeToSettings(callback: (settings: GlobalSettings) => void): () => void {
        const docRef = doc(db, SETTINGS_DOC_PATH);

        return onSnapshot(docRef, (doc) => {
            if (doc.exists()) {
                callback(doc.data() as GlobalSettings);
            } else {
                callback({ freeUsersArePro: false });
            }
        }, (error) => {
            console.error('Error subscribing to settings:', error);
        });
    }
}

export const settingsService = new SettingsService();
