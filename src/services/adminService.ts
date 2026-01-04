import { collection, getDocs, query, orderBy, limit, where, Timestamp, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProfile } from '@/types/profile';

export interface AdminUser {
  userId: string;
  email: string;
  displayName: string | null;
  fullName: string;
  plan: string;
  planExpiresAt: Date | null;
  createdAt: Date | null;
  lastLoginAt: Date | null;
  isActive: boolean;
}

export class AdminService {
  /**
   * Check if user is admin (by email for now)
   * In production, you'd use Firebase Custom Claims
   * 
   * To add admin access:
   * 1. Add your email to the adminEmails array below
   * 2. Or set VITE_ADMIN_EMAILS environment variable (comma-separated)
   */
  isAdmin(email: string | null | undefined, userId?: string): boolean {
    const defaultAdminEmails = [
      'mohammedodunlami@gmail.com',
      'iamezekieljeremiah@gmail.com',
    ];

    const defaultAdminIds = [
      'EJ3f1PoNSEWEPHXJkFZcerEzxeC3',
      '1qJMBNFl0OSopYJoYaM6zqCYM1x2'
    ];

    // Check by ID first
    if (userId && defaultAdminIds.includes(userId)) {
      return true;
    }

    if (!email) return false;

    // Get admin emails from environment variable or use default list
    const envAdmins = import.meta.env.VITE_ADMIN_EMAILS;
    const adminEmailsFromEnv = envAdmins
      ? envAdmins.split(',').map(e => e.trim().toLowerCase())
      : [];

    // Combine environment and default admin emails
    const allAdminEmails = [
      ...adminEmailsFromEnv,
      ...defaultAdminEmails.map(e => e.toLowerCase())
    ];

    return allAdminEmails.includes(email.toLowerCase());
  }

  /**
   * Get all users from Firestore
   */
  async getAllUsers(): Promise<AdminUser[]> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      const users: AdminUser[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          userId: doc.id,
          email: data.email || '',
          displayName: data.displayName || null,
          fullName: data.fullName || 'Unknown User',
          plan: data.plan || 'FREE',
          planExpiresAt: data.planExpiresAt?.toDate ? data.planExpiresAt.toDate() : (data.planExpiresAt ? new Date(data.planExpiresAt) : null),
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : null),
          lastLoginAt: data.lastLoginAt?.toDate ? data.lastLoginAt.toDate() : (data.lastLoginAt ? new Date(data.lastLoginAt) : null),
          isActive: data.planExpiresAt ? (data.planExpiresAt?.toDate ? data.planExpiresAt.toDate() > new Date() : new Date(data.planExpiresAt) > new Date()) : true,
        });
      });

      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  /**
   * Subscribe to users collection for real-time updates
   */
  subscribeToUsers(callback: (users: AdminUser[]) => void): () => void {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
      const users: AdminUser[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          userId: doc.id,
          email: data.email || '',
          displayName: data.displayName || null,
          fullName: data.fullName || 'Unknown User',
          plan: data.plan || 'FREE',
          planExpiresAt: data.planExpiresAt?.toDate ? data.planExpiresAt.toDate() : (data.planExpiresAt ? new Date(data.planExpiresAt) : null),
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : null),
          lastLoginAt: data.lastLoginAt?.toDate ? data.lastLoginAt.toDate() : (data.lastLoginAt ? new Date(data.lastLoginAt) : null),
          isActive: data.planExpiresAt ? (data.planExpiresAt?.toDate ? data.planExpiresAt.toDate() > new Date() : new Date(data.planExpiresAt) > new Date()) : true,
        });
      });
      callback(users);
    }, (error) => {
      console.error('Error subscribing to users:', error);
    });
  }

  /**
   * Delete a user
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'users', userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Get user count by plan
   */
  async getUserStats(): Promise<{ total: number; free: number; pro: number }> {
    try {
      const users = await this.getAllUsers();

      return {
        total: users.length,
        free: users.filter(u => u.plan === 'FREE').length,
        pro: users.filter(u => u.plan === 'PRO').length,
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }

  /**
   * Get estimated revenue stats
   */
  async getRevenueStats(): Promise<{ totalRevenue: number; monthlyRecurring: number; activeSubscriptions: number }> {
    try {
      const users = await this.getAllUsers();

      // Filter for active PRO users
      const activeProUsers = users.filter(u =>
        u.plan === 'PRO' &&
        u.isActive
      );

      // Estimate revenue: 
      // PRO = 6500 monthly
      const pricePerUser = 6500;
      const monthlyRecurring = activeProUsers.length * pricePerUser;

      return {
        totalRevenue: monthlyRecurring * 12, // Rough annualized estimate
        monthlyRecurring,
        activeSubscriptions: activeProUsers.length
      };
    } catch (error) {
      console.error('Error fetching revenue stats:', error);
      throw error;
    }
  }
}

export const adminService = new AdminService();

