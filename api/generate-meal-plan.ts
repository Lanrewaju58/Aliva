
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: any, res: any) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const startTime = Date.now();

    try {
        const { country, diet, allergies, calories, goal, durationDays = 7 } = req.body;

        if (!process.env.OPENAI_API_KEY) {
            return res.status(503).json({
                error: 'Service unavailable',
                message: 'AI service is temporarily unavailable'
            });
        }

        console.log(`🥗 Generating meal plan for ${country} (${calories} cal/day)`);

        const prompt = `Generate a ${durationDays}-day meal plan for a user in ${country}.
      Dietary Profile:
      - Goal: ${goal || 'Maintain Weight'}
      - Target Calories: ${calories || 2000} kcal/day
      - Preferences: ${diet?.join(', ') || 'None'}
      - Allergies/Restrictions: ${allergies?.join(', ') || 'None'}
      
      Requirements:
      1. Use LOCALLY AVAILABLE ingredients and culturally appropriate dishes for ${country}.
      2. Provide specific meal names and brief descriptions.
      3. Include approximate calories, protein (g), carbs (g), and fat (g) for each meal.
      4. Avoid repetition where possible.
      
      Output strictly valid JSON with this structure:
      {
        "days": [
          {
            "day": 1,
            "meals": {
              "Breakfast": { "name": "...", "calories": 0, "protein": 0, "carbs": 0, "fat": 0 },
              "Lunch": { "name": "...", "calories": 0, "protein": 0, "carbs": 0, "fat": 0 },
              "Dinner": { "name": "...", "calories": 0, "protein": 0, "carbs": 0, "fat": 0 },
              "Snack": { "name": "...", "calories": 0, "protein": 0, "carbs": 0, "fat": 0 }
            }
          }
          // ... repeat for all days
        ]
      }`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
            max_tokens: 2500,
            temperature: 0.7
        });

        const content = completion.choices[0]?.message?.content;
        const plan = JSON.parse(content || '{}');

        console.log(`✅ Meal plan generated in ${Date.now() - startTime}ms`);
        res.status(200).json(plan);

    } catch (error: any) {
        console.error('❌ Error in /api/generate-meal-plan:', error);
        res.status(500).json({
            error: 'Failed to generate meal plan',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}
