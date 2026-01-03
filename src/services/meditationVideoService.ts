import {
    collection,
    doc,
    getDocs,
    addDoc,
    deleteDoc,
    updateDoc,
    query,
    orderBy,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface MeditationVideo {
    id: string;
    title: string;
    channel: string;
    duration: string;
    videoId: string; // YouTube video ID
    category: 'Sleep' | 'Relaxation' | 'Focus' | 'Healing' | 'Guided';
    views?: string;
    isPro: boolean;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

export type MeditationVideoInput = Omit<MeditationVideo, 'id' | 'createdAt' | 'updatedAt'>;

const COLLECTION_NAME = 'meditationVideos';

// Extract YouTube video ID from various URL formats
export const extractYouTubeId = (url: string): string | null => {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /^([a-zA-Z0-9_-]{11})$/ // Direct ID
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
};

export const meditationVideoService = {
    // Get all videos
    async getVideos(): Promise<MeditationVideo[]> {
        try {
            const q = query(
                collection(db, COLLECTION_NAME),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as MeditationVideo[];
        } catch (error) {
            console.error('Error fetching meditation videos:', error);
            return [];
        }
    },

    // Add a new video
    async addVideo(video: MeditationVideoInput): Promise<string | null> {
        try {
            const docRef = await addDoc(collection(db, COLLECTION_NAME), {
                ...video,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            console.error('Error adding meditation video:', error);
            return null;
        }
    },

    // Update a video
    async updateVideo(id: string, updates: Partial<MeditationVideoInput>): Promise<boolean> {
        try {
            await updateDoc(doc(db, COLLECTION_NAME, id), {
                ...updates,
                updatedAt: serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error('Error updating meditation video:', error);
            return false;
        }
    },

    // Delete a video
    async deleteVideo(id: string): Promise<boolean> {
        try {
            await deleteDoc(doc(db, COLLECTION_NAME, id));
            return true;
        } catch (error) {
            console.error('Error deleting meditation video:', error);
            return false;
        }
    }
};
