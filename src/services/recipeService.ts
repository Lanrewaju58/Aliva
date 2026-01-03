import { db } from '../lib/firebase';
import { collection, doc, setDoc, getDocs, deleteDoc, query, where, addDoc } from 'firebase/firestore';

export interface Recipe {
    id?: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    time: string;
    description: string;
    imageKeyword?: string;
    ingredients: string[];
    instructions: string[];
}

export const recipeService = {
    // Save a recipe to the user's collection
    saveRecipe: async (userId: string, recipe: Recipe) => {
        try {
            // Use a subcollection 'savedRecipes' under the user doc
            const savedRecipesRef = collection(db, 'users', userId, 'savedRecipes');

            // If recipe has an ID, try to use it, otherwise auto-generate
            if (recipe.id) {
                // Check if already exists to avoid duplicates if needed, or just overwrite
                // For simplicity and to ensure unique saved instances, we might want to addDoc or setDoc with recipe.id
                // Let's use recipe.name + timestamp or just addDoc for simplicity to avoid overwriting distinct generations
                // But unique filtering is better. Let's use addDoc for now.
                await addDoc(savedRecipesRef, {
                    ...recipe,
                    savedAt: new Date().toISOString()
                });
            } else {
                await addDoc(savedRecipesRef, {
                    ...recipe,
                    savedAt: new Date().toISOString()
                });
            }
            return true;
        } catch (error) {
            console.error('Error saving recipe:', error);
            throw error;
        }
    },

    // Get all saved recipes for a user
    getSavedRecipes: async (userId: string) => {
        try {
            const savedRecipesRef = collection(db, 'users', userId, 'savedRecipes');
            const q = query(savedRecipesRef);
            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Recipe[];
        } catch (error) {
            console.error('Error getting saved recipes:', error);
            return [];
        }
    },

    // Delete a saved recipe
    deleteRecipe: async (userId: string, recipeId: string) => {
        try {
            const recipeDocRef = doc(db, 'users', userId, 'savedRecipes', recipeId);
            await deleteDoc(recipeDocRef);
            return true;
        } catch (error) {
            console.error('Error deleting recipe:', error);
            throw error;
        }
    }
};
