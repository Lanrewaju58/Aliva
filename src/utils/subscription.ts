/**
 * Subscription utility functions
 */

/**
 * Check if today is Monday (Free Pro Day)
 */
export const isFreeProMonday = (): boolean => {
    const today = new Date();
    return today.getDay() === 1; // 0 = Sunday, 1 = Monday
};

/**
 * Determine if user has Pro access
 * Pro users always have access
 * Free users get access on Mondays
 */
export const hasProAccess = (plan?: 'FREE' | 'PRO' | string): boolean => {
    if (plan === 'PRO') return true;
    return isFreeProMonday();
};
