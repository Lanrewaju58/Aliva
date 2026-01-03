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

    try {
        const { country, diet, allergies, calories, query } = req.body;
        console.log(`🍳 Generating recipes for ${country}, Diet: ${diet || 'None'}, Query: ${query || 'None'}`);

        if (!process.env.OPENAI_API_KEY) {
            console.error('OPENAI_API_KEY is not configured');
            return res.status(500).json({
                error: 'AI service not configured',
                message: "The AI service is not properly configured. Please contact support."
            });
        }

        let prompt = "";

        if (query && query.trim().length > 0) {
            // Search Mode
            prompt = `
          Create 3 distinct recipes that match the search term: "${query}".
          Adjust them to be healthy and suitable for a user in ${country}.
          
          Preferences to respect (if possible, but prioritize the search term):
          - Diet: ${diet || 'None'}
          - Allergies: ${allergies ? (Array.isArray(allergies) ? allergies.join(', ') : allergies) : 'None'}
          - Target Calories: ~${calories ? Math.round(calories / 3) : 600} kcal

          Requirements:
          1. Strictly match the search query "${query}".
          2. Use locally available ingredients for ${country}.
          3. Return STRICT JSON format only.
          4. PROVIDE DETAILED COOKING INSTRUCTIONS (at least 5 steps).
        `;
        } else {
            // Discovery Mode (Original)
            prompt = `
          Create 3 distinct, healthy, and culturally relevant recipes for a user in ${country} with these preferences:
          - Diet: ${diet || 'None'}
          - Allergies: ${allergies ? (Array.isArray(allergies) ? allergies.join(', ') : allergies) : 'None'}
          - Target Calories per meal: ~${calories ? Math.round(calories / 3) : 600} kcal

          Requirements:
          1. Use locally available ingredients for ${country}.
          2. Ensure recipes are nutritious and balanced.
          3. Return STRICT JSON format only.
          4. PROVIDE DETAILED COOKING INSTRUCTIONS (at least 5 steps).
        `;
        }

        prompt += `
      Output JSON Structure:
      {
        "recipes": [
          {
            "id": "unique-id-1",
            "name": "Recipe Name",
            "calories": 500,
            "protein": 30,
            "carbs": 40,
            "fat": 15,
            "time": "30 mins",
            "description": "Short appetizing description",
            "ingredients": ["1 cup rice", "200g chicken"],
            "instructions": [
              "Step 1: Wash the rice thoroughly...",
              "Step 2: Marinate the chicken with spices...",
              "Step 3: Sear the chicken in a hot pan..."
            ]
          }
        ]
      }
    `;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a professional chef and nutritionist. Output valid JSON object with a 'recipes' key containing the array." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" },
        });

        console.log('OpenAI raw response received');

        let responseContent;
        try {
            responseContent = JSON.parse(completion.choices[0].message.content || '{}');
        } catch (e) {
            console.error("Failed to parse OpenAI JSON:", e);
            throw new Error("Invalid JSON from AI");
        }

        // Handle case where AI wraps array in object key like "recipes": [...]
        const recipes = Array.isArray(responseContent) ? responseContent : (responseContent.recipes || responseContent.data || Object.values(responseContent)[0]);

        if (!recipes || !Array.isArray(recipes)) {
            console.error("Parsed content is not an array:", responseContent);
            throw new Error("Invalid format from AI - Expected array");
        }

        // Validate recipe structure
        const validRecipes = recipes.map((r: any) => ({
            ...r,
            name: r.name || "Untitled Recipe",
            description: r.description || "No description available",
            imageKeyword: r.imageKeyword || r.name || "food"
        }));

        console.log(`✅ Generated ${validRecipes.length} recipes`);
        res.status(200).json(validRecipes);

    } catch (error: any) {
        console.error('❌ Error generating recipes:', error);
        res.status(500).json({ error: 'Failed to generate recipes', details: error.message });
    }
}
