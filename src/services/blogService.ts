import {
    doc,
    getDoc,
    setDoc,
    deleteDoc,
    Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface BlogArticle {
    id: string;
    title: string;
    summary: string;
    source: string;
    sourceUrl: string;
    category: 'nutrition' | 'fitness' | 'mental-health' | 'wellness' | 'medical';
    imageUrl?: string;
    publishedAt: Date;
    fetchedAt: Date;
}

export interface BlogCache {
    articles: BlogArticle[];
    lastUpdated: Date;
    nextUpdateDue: Date;
}

const BLOG_CACHE_DOC = 'health-articles-cache';
const UPDATE_INTERVAL_DAYS = 3; // Update every 3 days (roughly twice a week)

// Check if running in development mode
const isDevelopment = import.meta.env.DEV;

// Curated health articles with VERIFIED working URLs
const CURATED_ARTICLES: BlogArticle[] = [
    {
        id: 'nutrition-1',
        title: 'How to Build a Healthy Plate: The Basics of Balanced Nutrition',
        summary: 'A balanced plate should include half vegetables and fruits, one quarter protein, and one quarter whole grains. This simple approach helps ensure you get essential nutrients while managing portion sizes effectively.',
        source: 'Harvard T.H. Chan School of Public Health',
        sourceUrl: 'https://www.hsph.harvard.edu/nutritionsource/healthy-eating-plate/',
        category: 'nutrition',
        publishedAt: new Date(),
        fetchedAt: new Date(),
    },
    {
        id: 'fitness-1',
        title: 'Physical Activity Guidelines for Adults',
        summary: 'Adults should aim for at least 150 minutes of moderate aerobic activity or 75 minutes of vigorous activity per week, plus muscle-strengthening activities on 2 or more days.',
        source: 'Centers for Disease Control and Prevention',
        sourceUrl: 'https://www.cdc.gov/physical-activity-basics/guidelines/adults.html',
        category: 'fitness',
        publishedAt: new Date(),
        fetchedAt: new Date(),
    },
    {
        id: 'mental-health-1',
        title: 'Understanding Anxiety Disorders',
        summary: 'Anxiety disorders affect millions worldwide. Common symptoms include excessive worry, restlessness, and difficulty concentrating. Effective treatments include therapy, medication, and lifestyle changes.',
        source: 'National Institute of Mental Health',
        sourceUrl: 'https://www.nimh.nih.gov/health/topics/anxiety-disorders',
        category: 'mental-health',
        publishedAt: new Date(),
        fetchedAt: new Date(),
    },
    {
        id: 'wellness-1',
        title: 'Why Do We Need Sleep?',
        summary: 'Quality sleep is crucial for physical recovery, memory consolidation, and immune function. Adults need 7-9 hours nightly. Poor sleep is linked to obesity, heart disease, and mental health issues.',
        source: 'Sleep Foundation',
        sourceUrl: 'https://www.sleepfoundation.org/how-sleep-works/why-do-we-need-sleep',
        category: 'wellness',
        publishedAt: new Date(),
        fetchedAt: new Date(),
    },
    {
        id: 'medical-1',
        title: 'Understanding Blood Pressure Readings',
        summary: 'Normal blood pressure is below 120/80 mmHg. High blood pressure often has no symptoms but increases risk of heart disease and stroke. Regular monitoring helps maintain cardiovascular health.',
        source: 'American Heart Association',
        sourceUrl: 'https://www.heart.org/en/health-topics/high-blood-pressure/understanding-blood-pressure-readings',
        category: 'medical',
        publishedAt: new Date(),
        fetchedAt: new Date(),
    },
    {
        id: 'nutrition-2',
        title: 'Water: How Much Should You Drink Every Day?',
        summary: 'While the "8 glasses a day" rule is a good starting point, individual water needs vary based on activity level, climate, and overall health. Signs of good hydration include light-colored urine.',
        source: 'Mayo Clinic',
        sourceUrl: 'https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating/in-depth/water/art-20044256',
        category: 'nutrition',
        publishedAt: new Date(),
        fetchedAt: new Date(),
    },
    {
        id: 'fitness-2',
        title: 'Benefits of Strength Training',
        summary: 'Resistance training improves bone density, boosts metabolism, enhances balance, and supports mental health. The CDC recommends muscle-strengthening activities at least 2 days per week.',
        source: 'Cleveland Clinic',
        sourceUrl: 'https://health.clevelandclinic.org/benefits-of-strength-training',
        category: 'fitness',
        publishedAt: new Date(),
        fetchedAt: new Date(),
    },
    {
        id: 'mental-health-2',
        title: 'How to Meditate: A Beginner\'s Guide',
        summary: 'Mindfulness meditation involves focusing attention on the present moment without judgment. Research shows regular practice can reduce stress, improve focus, and enhance emotional regulation.',
        source: 'Mindful.org',
        sourceUrl: 'https://www.mindful.org/how-to-meditate/',
        category: 'mental-health',
        publishedAt: new Date(),
        fetchedAt: new Date(),
    },
    {
        id: 'nutrition-3',
        title: 'Mediterranean Diet: A Heart-Healthy Eating Plan',
        summary: 'The Mediterranean diet emphasizes fruits, vegetables, whole grains, olive oil, and lean proteins like fish. Studies link it to reduced risk of heart disease, diabetes, and cognitive decline.',
        source: 'American Heart Association',
        sourceUrl: 'https://www.heart.org/en/healthy-living/healthy-eating/eat-smart/nutrition-basics/mediterranean-diet',
        category: 'nutrition',
        publishedAt: new Date(),
        fetchedAt: new Date(),
    },
    {
        id: 'wellness-2',
        title: 'Healthy Ways to Handle Life\'s Stressors',
        summary: 'Effective stress management includes regular physical activity, adequate sleep, social connection, and relaxation techniques. Chronic stress affects your immune system, digestion, and cardiovascular health.',
        source: 'American Psychological Association',
        sourceUrl: 'https://www.apa.org/topics/stress/tips',
        category: 'wellness',
        publishedAt: new Date(),
        fetchedAt: new Date(),
    },
    {
        id: 'medical-2',
        title: 'Blood Cholesterol: What You Need to Know',
        summary: 'LDL cholesterol can build up in arteries, while HDL helps remove it. Total cholesterol should be below 200 mg/dL. Diet, exercise, and sometimes medication help maintain healthy levels.',
        source: 'National Heart, Lung, and Blood Institute',
        sourceUrl: 'https://www.nhlbi.nih.gov/health/blood-cholesterol',
        category: 'medical',
        publishedAt: new Date(),
        fetchedAt: new Date(),
    },
    {
        id: 'fitness-3',
        title: 'Walking: Your Steps to Health',
        summary: 'Walking is one of the easiest ways to get more exercise. It can help you maintain a healthy weight, strengthen bones, and boost your mood. Just 30 minutes a day makes a difference.',
        source: 'Harvard Health Publishing',
        sourceUrl: 'https://www.health.harvard.edu/staying-healthy/walking-your-steps-to-health',
        category: 'fitness',
        publishedAt: new Date(),
        fetchedAt: new Date(),
    },
];

class BlogService {
    /**
     * Get cached articles from Firestore
     */
    async getCachedArticles(): Promise<BlogCache | null> {
        try {
            const cacheRef = doc(db, 'blog', BLOG_CACHE_DOC);
            const cacheSnap = await getDoc(cacheRef);

            if (!cacheSnap.exists()) {
                return null;
            }

            const data = cacheSnap.data();
            return {
                articles: (data.articles || []).map((article: any) => ({
                    ...article,
                    publishedAt: article.publishedAt?.toDate?.() || new Date(article.publishedAt),
                    fetchedAt: article.fetchedAt?.toDate?.() || new Date(article.fetchedAt),
                })),
                lastUpdated: data.lastUpdated?.toDate?.() || new Date(data.lastUpdated),
                nextUpdateDue: data.nextUpdateDue?.toDate?.() || new Date(data.nextUpdateDue),
            };
        } catch (error) {
            console.error('Error fetching cached articles:', error);
            return null;
        }
    }

    /**
     * Clear the Firestore cache
     */
    async clearCache(): Promise<void> {
        try {
            const cacheRef = doc(db, 'blog', BLOG_CACHE_DOC);
            await deleteDoc(cacheRef);
            console.log('Blog cache cleared');
        } catch (error) {
            console.error('Error clearing cache:', error);
        }
    }

    /**
     * Check if articles need to be refreshed
     */
    shouldRefresh(cache: BlogCache | null): boolean {
        if (!cache) return true;
        return new Date() >= cache.nextUpdateDue;
    }

    /**
     * Fetch fresh articles from the AI-powered API endpoint
     */
    async fetchFreshArticles(): Promise<BlogArticle[]> {
        // In development, always use curated articles since API isn't available
        if (isDevelopment) {
            console.log('Development mode: Using curated health articles');
            return this.getCuratedArticles();
        }

        try {
            const response = await fetch('/api/fetch-health-articles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                console.warn('API endpoint not available, using curated articles');
                return this.getCuratedArticles();
            }

            const data = await response.json();
            return data.articles || this.getCuratedArticles();
        } catch (error) {
            console.warn('Error fetching from API, using curated articles:', error);
            return this.getCuratedArticles();
        }
    }

    /**
     * Get curated articles with staggered dates
     */
    getCuratedArticles(): BlogArticle[] {
        const now = new Date();
        // Shuffle and pick 6 articles
        const shuffled = [...CURATED_ARTICLES].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 6).map((article, index) => ({
            ...article,
            id: `${article.id}-${Date.now()}`,
            publishedAt: new Date(now.getTime() - (index * 12 + Math.random() * 24) * 60 * 60 * 1000),
            fetchedAt: now,
        }));
    }

    /**
     * Save articles to Firestore cache
     */
    async cacheArticles(articles: BlogArticle[]): Promise<void> {
        try {
            const cacheRef = doc(db, 'blog', BLOG_CACHE_DOC);
            const now = new Date();
            const nextUpdate = new Date();
            nextUpdate.setDate(nextUpdate.getDate() + UPDATE_INTERVAL_DAYS);

            await setDoc(cacheRef, {
                articles: articles.map(article => ({
                    ...article,
                    publishedAt: Timestamp.fromDate(new Date(article.publishedAt)),
                    fetchedAt: Timestamp.fromDate(new Date(article.fetchedAt)),
                })),
                lastUpdated: Timestamp.fromDate(now),
                nextUpdateDue: Timestamp.fromDate(nextUpdate),
            });
        } catch (error) {
            console.error('Error caching articles:', error);
        }
    }

    /**
     * Get articles - in development, always returns fresh curated articles
     */
    async getArticles(forceRefresh = false): Promise<{ articles: BlogArticle[]; lastUpdated: Date | null }> {
        // In development mode, always use fresh curated articles to avoid stale cache
        if (isDevelopment) {
            const articles = this.getCuratedArticles();
            return { articles, lastUpdated: new Date() };
        }

        try {
            // Production: try to get cached articles first
            let cache: BlogCache | null = null;
            try {
                cache = await this.getCachedArticles();
            } catch (error) {
                console.warn('Could not access cache:', error);
            }

            // Return cached articles if still fresh
            if (!forceRefresh && cache && !this.shouldRefresh(cache)) {
                return { articles: cache.articles, lastUpdated: cache.lastUpdated };
            }

            // Fetch fresh articles
            const freshArticles = await this.fetchFreshArticles();

            // Try to cache the new articles
            this.cacheArticles(freshArticles).catch(() => {
                console.warn('Failed to cache articles');
            });

            return { articles: freshArticles, lastUpdated: new Date() };
        } catch (error) {
            console.error('Error getting articles:', error);
            return { articles: this.getCuratedArticles(), lastUpdated: new Date() };
        }
    }
}

export const blogService = new BlogService();
