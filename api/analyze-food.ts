
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
        const { image } = req.body;

        if (!image || typeof image !== 'string') {
            return res.status(400).json({
                error: 'Invalid request',
                message: 'Image data is required'
            });
        }

        if (!process.env.OPENAI_API_KEY) {
            return res.status(503).json({
                error: 'Service unavailable',
                message: 'AI service is temporarily unavailable'
            });
        }

        console.log(`🍔 Processing food image analysis`);

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{
                role: "user",
                content: [
                    {
                        type: "text",
                        text: `Analyze this food image and provide nutritional information in the following JSON format only, no additional text:
{
  "name": "Name of the dish",
  "calories": number,
  "protein": number (in grams),
  "carbs": number (in grams),
  "fat": number (in grams),
  "servingSize": "description of serving size",
  "confidence": "High or Medium or Low"
}

Be as accurate as possible based on the visible portion size. If you're unsure, indicate "Medium" or "Low" confidence.`
                    },
                    {
                        type: "image_url",
                        image_url: { url: image }
                    }
                ]
            }],
            max_tokens: 500,
            temperature: 0.3
        });

        const content = completion.choices[0]?.message?.content;
        const jsonMatch = content?.match(/\{[\s\S]*\}/);

        if (!jsonMatch) throw new Error('Invalid response format');

        const nutritionData = JSON.parse(jsonMatch[0]);

        res.status(200).json(nutritionData);

    } catch (error: any) {
        console.error('❌ Error in /api/analyze-food:', error);
        res.status(500).json({
            error: 'Failed to analyze image',
            details: error.message
        });
    }
}
