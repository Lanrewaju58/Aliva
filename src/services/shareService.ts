// src/services/shareService.ts

export interface ShareableProgress {
    caloriesConsumed: number;
    calorieTarget: number;
    dailyStreak: number;
    mealsToday: { name: string; calories: number }[];
    exercisesToday: { name: string; duration: number; caloriesBurned: number }[];
    userName: string;
    isPro: boolean;
}

export type SharePlatform = 'twitter' | 'facebook' | 'whatsapp' | 'linkedin' | 'copy';

// Pregenerated encouraging text templates
const progressTemplates = [
    "🔥 I'm on a {streak}-day streak with @AlivaApp! Today I tracked {mealCount} meals and consumed {consumed} calories. Join me on this health journey! 💪",
    "📊 Hitting my nutrition goals! {consumed}/{target} calories today with Aliva. Staying consistent feels amazing! 🥗",
    "💪 Crushing my fitness goals with Aliva! {streak} days strong and feeling great. Who's joining me? 🚀",
    "🎯 Another day, another win! Tracked {mealCount} meals and staying on target with Aliva. Health is wealth! ✨",
];

const exerciseTemplates = [
    "💪 Just finished {exerciseName} for {duration} mins and burned {calories} calories! Tracking with Aliva makes it so easy! 🔥",
    "🏃 Today's workout: {exerciseName} ({duration} mins, {calories} cal burned). Aliva keeps me accountable! 💯",
    "🎯 Completed my {exerciseName} session! {calories} calories burned in {duration} minutes. Let's gooo! 🚀",
];

const mealTemplates = [
    "🥗 Eating healthy with Aliva! Today's meals: {meals}. Delicious AND nutritious! 😋",
    "🍽️ Tracking my nutrition journey with Aliva. Today I enjoyed: {meals}. What's on your plate? 🌱",
];

const appPromoSuffix = "\n\n👉 Try Aliva and transform your health journey: https://aliva.food";

class ShareService {
    /**
     * Generate share text based on user progress
     */
    generateShareText(progress: ShareableProgress, type: 'progress' | 'exercise' | 'meals' = 'progress'): string {
        let template: string;

        if (type === 'exercise' && progress.exercisesToday.length > 0) {
            const exercise = progress.exercisesToday[0];
            template = exerciseTemplates[Math.floor(Math.random() * exerciseTemplates.length)]
                .replace('{exerciseName}', exercise.name)
                .replace('{duration}', String(exercise.duration))
                .replace('{calories}', String(exercise.caloriesBurned));
        } else if (type === 'meals' && progress.mealsToday.length > 0) {
            const mealNames = progress.mealsToday.slice(0, 3).map(m => m.name).join(', ');
            template = mealTemplates[Math.floor(Math.random() * mealTemplates.length)]
                .replace('{meals}', mealNames);
        } else {
            template = progressTemplates[Math.floor(Math.random() * progressTemplates.length)]
                .replace('{streak}', String(progress.dailyStreak))
                .replace('{mealCount}', String(progress.mealsToday.length))
                .replace('{consumed}', String(progress.caloriesConsumed))
                .replace('{target}', String(progress.calorieTarget));
        }

        // Add pro badge mention if applicable
        if (progress.isPro) {
            template = "⭐ " + template;
        }

        return template + appPromoSuffix;
    }

    /**
     * Generate a summary of today's progress for sharing
     */
    generateProgressSummary(progress: ShareableProgress): string {
        const lines = [
            `📊 My Health Progress with Aliva`,
            ``,
            `🔥 ${progress.dailyStreak}-day streak`,
            `🎯 ${progress.caloriesConsumed}/${progress.calorieTarget} calories`,
        ];

        if (progress.mealsToday.length > 0) {
            lines.push(`🍽️ ${progress.mealsToday.length} meals tracked`);
        }

        if (progress.exercisesToday.length > 0) {
            const totalCalsBurned = progress.exercisesToday.reduce((sum, ex) => sum + ex.caloriesBurned, 0);
            const totalMins = progress.exercisesToday.reduce((sum, ex) => sum + ex.duration, 0);
            lines.push(`💪 ${totalMins} mins exercise (${totalCalsBurned} cal burned)`);
        }

        lines.push(``);
        lines.push(`Join me on this journey! 🚀`);
        lines.push(appPromoSuffix.trim());

        return lines.join('\n');
    }

    /**
     * Get share URL for specific platform
     */
    getShareUrl(platform: SharePlatform, text: string, url?: string): string {
        const encodedText = encodeURIComponent(text);
        const encodedUrl = encodeURIComponent(url || 'https://aliva.app');

        switch (platform) {
            case 'twitter':
                return `https://twitter.com/intent/tweet?text=${encodedText}`;

            case 'facebook':
                return `https://www.facebook.com/sharer/sharer.php?quote=${encodedText}&u=${encodedUrl}`;

            case 'whatsapp':
                return `https://wa.me/?text=${encodedText}`;

            case 'linkedin':
                return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&summary=${encodedText}`;

            case 'copy':
                return text; // Return the text itself for copying

            default:
                return '';
        }
    }

    /**
     * Share to platform - opens in new window or copies to clipboard
     */
    async share(platform: SharePlatform, text: string): Promise<boolean> {
        try {
            if (platform === 'copy') {
                await navigator.clipboard.writeText(text);
                return true;
            }

            const url = this.getShareUrl(platform, text);

            // Try native share API first on mobile
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: 'My Health Progress',
                        text: text,
                        url: 'https://aliva.app',
                    });
                    return true;
                } catch {
                    // Fall back to URL-based sharing
                }
            }

            // Open in new window
            const width = 600;
            const height = 400;
            const left = window.screenX + (window.innerWidth - width) / 2;
            const top = window.screenY + (window.innerHeight - height) / 2;

            window.open(
                url,
                'share',
                `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
            );

            return true;
        } catch (error) {
            console.error('Share failed:', error);
            return false;
        }
    }

    /**
     * Get platform display info
     */
    getPlatformInfo(platform: SharePlatform): { name: string; icon: string; color: string } {
        const platforms: Record<SharePlatform, { name: string; icon: string; color: string }> = {
            twitter: { name: 'X (Twitter)', icon: '𝕏', color: 'bg-black hover:bg-gray-800' },
            facebook: { name: 'Facebook', icon: 'f', color: 'bg-[#1877F2] hover:bg-[#166FE5]' },
            whatsapp: { name: 'WhatsApp', icon: '💬', color: 'bg-[#25D366] hover:bg-[#20BD5A]' },
            linkedin: { name: 'LinkedIn', icon: 'in', color: 'bg-[#0A66C2] hover:bg-[#0958A8]' },
            copy: { name: 'Copy', icon: '📋', color: 'bg-muted hover:bg-muted/80' },
        };
        return platforms[platform];
    }
}

export const shareService = new ShareService();
