import { collection, getDocs, query, orderBy, limit, where, Timestamp } from 'firebase/firestore';
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
  isAdmin(email: string | null | undefined): boolean {
    if (!email) return false;
    
    // Get admin emails from environment variable or use default list
    const envAdmins = import.meta.env.VITE_ADMIN_EMAILS;
    const adminEmailsFromEnv = envAdmins 
      ? envAdmins.split(',').map(e => e.trim().toLowerCase())
      : [];
    
    // Default admin emails (add your email here)
    const defaultAdminEmails = [
      'mohammedodunlami@gmail.com',
      'iamezekieljeremiah@gmail.com',
      // Add your email here to grant admin access:
      // 'your-email@example.com',
    ];
    
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
   * Get user count by plan
   */
  async getUserStats(): Promise<{ total: number; free: number; pro: number; premium: number }> {
    try {
      const users = await this.getAllUsers();
      
      return {
        total: users.length,
        free: users.filter(u => u.plan === 'FREE').length,
        pro: users.filter(u => u.plan === 'PRO').length,
        premium: users.filter(u => u.plan === 'PREMIUM').length,
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }
}

export const adminService = new AdminService();

