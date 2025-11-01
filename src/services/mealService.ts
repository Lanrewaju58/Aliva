
import { 
    collection,
    doc, 
    getDoc, 
    getDocs,
    setDoc, 
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    Timestamp
  } from 'firebase/firestore';
  import { db } from '@/lib/firebase';
  
  export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
  
  export interface Meal {
    id: string;
    userId: string;
    name: string;
    mealType: MealType;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    date: string; // YYYY-MM-DD format
    time: string; // ISO string
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  export interface DailyLog {
    id?: string;
    userId: string;
    date: string; // YYYY-MM-DD format
    waterIntake: number; // number of glasses
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  export class MealService {
    // Meal operations
    private getMealRef(userId: string, mealId: string) {
      return doc(db, 'users', userId, 'meals', mealId);
    }
  
    private getMealsCollection(userId: string) {
      return collection(db, 'users', userId, 'meals');
    }
  
    async addMeal(meal: Omit<Meal, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
      try {
        const mealId = `meal_${Date.now()}`;
        const mealRef = this.getMealRef(meal.userId, mealId);
        
        await setDoc(mealRef, {
          ...meal,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        
        return mealId;
      } catch (error) {
        console.error('Error adding meal:', error);
        throw error;
      }
    }
  
    async getMeal(userId: string, mealId: string): Promise<Meal | null> {
      try {
        const mealRef = this.getMealRef(userId, mealId);
        const mealSnap = await getDoc(mealRef);
        
        if (mealSnap.exists()) {
          const data = mealSnap.data();
          return {
            id: mealSnap.id,
            userId: data.userId,
            name: data.name,
            mealType: data.mealType,
            calories: data.calories,
            protein: data.protein,
            carbs: data.carbs,
            fat: data.fat,
            date: data.date,
            time: data.time,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
          };
        }
        
        return null;
      } catch (error) {
        console.error('Error getting meal:', error);
        throw error;
      }
    }
  
    async getMealsByDate(userId: string, date: string): Promise<Meal[]> {
      try {
        const mealsCol = this.getMealsCollection(userId);
        const q = query(
          mealsCol,
          where('date', '==', date),
          orderBy('time', 'asc')
        );
        
        const querySnapshot = await getDocs(q);
        const meals: Meal[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          meals.push({
            id: doc.id,
            userId: data.userId,
            name: data.name,
            mealType: data.mealType,
            calories: data.calories,
            protein: data.protein,
            carbs: data.carbs,
            fat: data.fat,
            date: data.date,
            time: data.time,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
          });
        });
        
        return meals;
      } catch (error) {
        console.error('Error getting meals by date:', error);
        throw error;
      }
    }
  
    async getMealsByDateRange(userId: string, startDate: string, endDate: string): Promise<Meal[]> {
      try {
        const mealsCol = this.getMealsCollection(userId);
        const q = query(
          mealsCol,
          where('date', '>=', startDate),
          where('date', '<=', endDate),
          orderBy('date', 'desc'),
          orderBy('time', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const meals: Meal[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          meals.push({
            id: doc.id,
            userId: data.userId,
            name: data.name,
            mealType: data.mealType,
            calories: data.calories,
            protein: data.protein,
            carbs: data.carbs,
            fat: data.fat,
            date: data.date,
            time: data.time,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
          });
        });
        
        return meals;
      } catch (error) {
        console.error('Error getting meals by date range:', error);
        throw error;
      }
    }
  
    async updateMeal(userId: string, mealId: string, updates: Partial<Omit<Meal, 'id' | 'userId' | 'createdAt'>>): Promise<void> {
      try {
        const mealRef = this.getMealRef(userId, mealId);
        await updateDoc(mealRef, {
          ...updates,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error('Error updating meal:', error);
        throw error;
      }
    }
  
    async deleteMeal(userId: string, mealId: string): Promise<void> {
      try {
        const mealRef = this.getMealRef(userId, mealId);
        await deleteDoc(mealRef);
      } catch (error) {
        console.error('Error deleting meal:', error);
        throw error;
      }
    }
  
    // Daily log operations
    private getDailyLogRef(userId: string, date: string) {
      return doc(db, 'users', userId, 'dailyLogs', date);
    }
  
    async getDailyLog(userId: string, date: string): Promise<DailyLog | null> {
      try {
        const logRef = this.getDailyLogRef(userId, date);
        const logSnap = await getDoc(logRef);
        
        if (logSnap.exists()) {
          const data = logSnap.data();
          return {
            id: logSnap.id,
            userId: data.userId,
            date: data.date,
            waterIntake: data.waterIntake || 0,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
          };
        }
        
        return null;
      } catch (error) {
        console.error('Error getting daily log:', error);
        throw error;
      }
    }
  
    async updateDailyLog(userId: string, date: string, waterIntake: number): Promise<void> {
      try {
        const logRef = this.getDailyLogRef(userId, date);
        const logSnap = await getDoc(logRef);
        
        if (logSnap.exists()) {
          await updateDoc(logRef, {
            waterIntake,
            updatedAt: serverTimestamp(),
          });
        } else {
          await setDoc(logRef, {
            userId,
            date,
            waterIntake,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      } catch (error) {
        console.error('Error updating daily log:', error);
        throw error;
      }
    }
  
    // Analytics helpers
    async getCaloriesByDateRange(userId: string, startDate: string, endDate: string): Promise<{ date: string; calories: number }[]> {
      try {
        const meals = await this.getMealsByDateRange(userId, startDate, endDate);
        const caloriesByDate: { [date: string]: number } = {};
        
        meals.forEach((meal) => {
          if (!caloriesByDate[meal.date]) {
            caloriesByDate[meal.date] = 0;
          }
          caloriesByDate[meal.date] += meal.calories;
        });
        
        return Object.entries(caloriesByDate)
          .map(([date, calories]) => ({ date, calories }))
          .sort((a, b) => a.date.localeCompare(b.date));
      } catch (error) {
        console.error('Error getting calories by date range:', error);
        throw error;
      }
    }
  }
  
  export const mealService = new MealService();