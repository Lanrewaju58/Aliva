import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  DocumentReference,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { UserProfile } from '@/types/profile';

export class ProfileService {
  /**
   * Verify user is authenticated
   */
  private verifyAuth(userId: string): void {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error('User must be authenticated');
    }

    if (currentUser.uid !== userId) {
      throw new Error('User ID mismatch. Cannot access another user\'s profile.');
    }
  }

  /**
   * Get profile document reference
   */
  private getProfileRef(userId: string): DocumentReference {
    return doc(db, 'users', userId); // Changed from 'profiles' to 'users'
  }

  /**
   * Remove undefined fields (Firestore does not accept undefined in set/update)
   */
  private sanitizeUpdate(data: Partial<UserProfile>): Record<string, any> {
    const cleaned: Record<string, any> = {};
    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined) return;
      if (key === 'weightHistory' && Array.isArray(value)) {
        cleaned[key] = value.map((w: any) => ({
          date: w?.date instanceof Date ? w.date : new Date(w?.date),
          weightKg: w?.weightKg,
        }));
        return;
      }
      cleaned[key] = value;
    });
    return cleaned;
  }

  /**
   * Get user profile
   */
  /**
   * Get user profile
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      this.verifyAuth(userId);

      // Fetch global settings and profile in parallel
      const [profileSnap, globalSettings] = await Promise.all([
        getDoc(this.getProfileRef(userId)),
        // Ideally we would import settingsService here, but circular deps might be issue if we're not careful.
        // Dynamic import or separate settings fetch. For now let's use the service.
        import('./settingsService').then(m => m.settingsService.getSettings())
      ]);

      if (profileSnap.exists()) {
        const data = profileSnap.data();


        // Check for Admin status or Global Override
        const email = data.email || auth.currentUser?.email;

        const isAdmin = (await import('./adminService')).adminService.isAdmin(email, userId);

        let plan = data.plan;
        // Default expiry
        let planExpiresAt = data.planExpiresAt?.toDate ? data.planExpiresAt.toDate() : (data.planExpiresAt ? new Date(data.planExpiresAt) : null);

        if (isAdmin || globalSettings.freeUsersArePro) {
          plan = 'PRO';
          // Set expiry to far future
          planExpiresAt = new Date('2099-12-31T23:59:59.999Z');
        }

        const profile: UserProfile = {
          id: profileSnap.id,
          userId: data.userId,
          email: data.email, // Ensure email is passed
          plan: plan,
          planExpiresAt: planExpiresAt,
          isFreeTrial: data.isFreeTrial || false, // Include free trial status
          fullName: data.fullName,
          dietaryPreferences: data.dietaryPreferences || [],
          healthGoals: data.healthGoals || [],
          allergies: data.allergies || [],
          age: data.age,
          activityLevel: data.activityLevel,
          gender: data.gender || undefined,
          heightCm: data.heightCm || undefined,
          currentWeightKg: data.currentWeightKg || undefined,
          targetWeightKg: data.targetWeightKg || undefined,
          medicalConditions: data.medicalConditions || [],
          smokingStatus: data.smokingStatus || undefined,
          alcoholFrequency: data.alcoholFrequency || undefined,
          weightHistory: (data.weightHistory || []).map((w: any) => ({
            date: w.date?.toDate ? w.date.toDate() : new Date(w.date),
            weightKg: w.weightKg,
          })),
          preferredCalorieTarget: data.preferredCalorieTarget || undefined,
          photoURL: data.photoURL || undefined,
          country: data.country || undefined, // Add country field
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        };
        return profile;
      }

      console.log('No profile found for user:', userId);
      return null;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }

  /**
   * Create new profile
   * New users automatically get a 3-day free Pro trial
   */
  async createProfile(userId: string, profileData: Partial<UserProfile>): Promise<void> {
    try {
      this.verifyAuth(userId);

      // Calculate 3-day free trial expiration
      const trialExpiresAt = new Date();
      trialExpiresAt.setDate(trialExpiresAt.getDate() + 3);

      const profileRef = this.getProfileRef(userId);
      await setDoc(profileRef, {
        userId,
        email: auth.currentUser?.email, // Store email
        fullName: profileData.fullName || '',
        // New users get a 3-day free Pro trial
        plan: profileData.plan || 'PRO',
        planExpiresAt: profileData.planExpiresAt || Timestamp.fromDate(trialExpiresAt),
        isFreeTrial: true, // Mark as free trial user
        dietaryPreferences: profileData.dietaryPreferences || [],
        healthGoals: profileData.healthGoals || [],
        allergies: profileData.allergies || [],
        age: profileData.age ?? null,
        activityLevel: profileData.activityLevel ?? null,
        gender: profileData.gender ?? null,
        heightCm: profileData.heightCm ?? null,
        currentWeightKg: profileData.currentWeightKg ?? null,
        targetWeightKg: profileData.targetWeightKg ?? null,
        medicalConditions: profileData.medicalConditions || [],
        smokingStatus: profileData.smokingStatus ?? null,
        alcoholFrequency: profileData.alcoholFrequency ?? null,
        weightHistory: (profileData.weightHistory || []).map(w => ({
          date: w.date instanceof Date ? w.date : new Date(w.date),
          weightKg: w.weightKg,
        })),
        preferredCalorieTarget: profileData.preferredCalorieTarget ?? null,
        photoURL: profileData.photoURL ?? null,
        country: profileData.country ?? null, // Add country field
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log('Profile created successfully with 3-day Pro trial');
    } catch (error) {
      console.error('Error creating profile:', error);

      // Provide more detailed error message
      if (error instanceof Error) {
        if (error.message.includes('Missing or insufficient permissions')) {
          throw new Error('Permission denied. Please check your Firestore security rules.');
        }
      }

      throw error;
    }
  }

  /**
   * Update existing profile
   */
  async updateProfile(userId: string, profileData: Partial<UserProfile>): Promise<void> {
    try {
      this.verifyAuth(userId);

      const profileRef = this.getProfileRef(userId);
      const cleaned = this.sanitizeUpdate(profileData);
      await updateDoc(profileRef, {
        ...cleaned,
        updatedAt: serverTimestamp(),
      });
      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  /**
   * Create or update profile (upsert)
   */
  async upsertProfile(userId: string, profileData: Partial<UserProfile>): Promise<void> {
    try {
      this.verifyAuth(userId);

      const existingProfile = await this.getProfile(userId);

      if (existingProfile) {
        console.log('Profile exists, updating...');
        await this.updateProfile(userId, profileData);
      } else {
        console.log('Profile does not exist, creating...');
        await this.createProfile(userId, profileData);
      }
    } catch (error) {
      console.error('Error upserting profile:', error);
      throw error;
    }
  }

  /**
   * Add weight entry to weight history
   */
  async addWeightEntry(userId: string, weightKg: number): Promise<void> {
    try {
      this.verifyAuth(userId);

      const profile = await this.getProfile(userId);

      if (!profile) {
        throw new Error('Profile not found');
      }

      const weightHistory = profile.weightHistory || [];
      weightHistory.push({
        date: new Date(),
        weightKg: weightKg,
      });

      await this.updateProfile(userId, {
        currentWeightKg: weightKg,
        weightHistory: weightHistory,
      });

      console.log('Weight entry added successfully');
    } catch (error) {
      console.error('Error adding weight entry:', error);
      throw error;
    }
  }

  /**
   * Check if user has completed onboarding
   */
  async hasCompletedOnboarding(userId: string): Promise<boolean> {
    try {
      const profile = await this.getProfile(userId);

      if (!profile) {
        return false;
      }

      // Check if essential profile fields are filled
      return !!(
        profile.age &&
        profile.gender &&
        profile.heightCm &&
        profile.currentWeightKg &&
        profile.targetWeightKg &&
        profile.activityLevel &&
        profile.preferredCalorieTarget
      );
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  }
}

export const profileService = new ProfileService();