import OpenAI from 'openai';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

interface ArticleData {
    id: string;
    title: string;
    summary: string;
    source: string;
    sourceUrl: string;
    category: 'nutrition' | 'fitness' | 'mental-health' | 'wellness' | 'medical';
    publishedAt: string;
    fetchedAt: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        if (!process.env.OPENAI_API_KEY) {
            console.error('OPENAI_API_KEY is not configured');
            return res.status(500).json({ error: 'API key not configured' });
        }

        const today = new Date().toISOString().split('T')[0];

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are a health news curator. Generate 6 realistic health-related article summaries that would be relevant for a health and wellness app. Each article should feel authentic and current.

Return a valid JSON array with exactly 6 articles. Each article must have:
- id: unique string (use format "article-1", "article-2", etc.)
- title: engaging headline (max 80 characters)
- summary: 2-3 sentence description of the article content (max 200 characters)
- source: reputable health publication name (e.g., "Harvard Health", "Mayo Clinic", "WebMD", "Healthline", "Medical News Today")
- sourceUrl: realistic URL to the source (can be placeholder like "https://example.com/article")
- category: one of "nutrition", "fitness", "mental-health", "wellness", "medical"
- publishedAt: ISO date string within the last week

Cover a variety of categories. Focus on practical, actionable health advice.`
                },
                {
                    role: 'user',
                    content: `Generate 6 current health articles for today's date (${today}). Return ONLY the JSON array, no additional text or markdown formatting.`
                }
            ],
            temperature: 0.8,
            max_tokens: 2000,
        });

        const responseText = completion.choices[0]?.message?.content?.trim() || '[]';

        // Clean up the response - remove markdown code blocks if present
        let cleanJson = responseText;
        if (cleanJson.startsWith('```')) {
            cleanJson = cleanJson.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        }

        let articles: ArticleData[];
        try {
            articles = JSON.parse(cleanJson);
        } catch {
            console.error('Failed to parse AI response:', responseText);
            return res.status(500).json({ error: 'Failed to parse article data' });
        }

        // Add fetchedAt timestamp to each article
        const fetchedAt = new Date().toISOString();
        const enrichedArticles = articles.map(article => ({
            ...article,
            fetchedAt,
        }));

        return res.status(200).json({
            success: true,
            articles: enrichedArticles,
            fetchedAt,
        });
    } catch (error) {
        console.error('Error fetching health articles:', error);
        return res.status(500).json({
            error: 'Failed to fetch health articles',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
