import OpenAI from 'openai';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to get country-specific food context
const getCountryContext = (country: string) => {
  const countryContexts: Record<string, string> = {
    'Nigeria': 'Nigerian staples like jollof rice, plantains, beans, yams, egusi soup, fish, palm oil, vegetables like ugu and ewedu',
    'Ghana': 'Ghanaian foods like banku, fufu, kenkey, groundnut soup, kontomire, red red, tilapia',
    'Kenya': 'Kenyan staples like ugali, sukuma wiki, nyama choma, githeri, chapati, beans, maize',
    'South Africa': 'South African foods like bobotie, biltong, boerewors, pap, chakalaka, samp and beans',
    'United States': 'American foods available in grocery stores, farmers markets, and common restaurant options',
    'United Kingdom': 'British foods and produce available in supermarkets and local markets',
    'India': 'Indian staples like dal, roti, rice, sabzi, paneer, lentils, chickpeas, regional curries',
    'Mexico': 'Mexican foods like beans, corn tortillas, nopales, chiles, fresh produce, traditional dishes',
    // Add more countries as needed
  };
  
  return countryContexts[country] || 'locally available fresh produce, proteins, and whole grains';
};

const getLocationAwarePrompt = (country?: string, city?: string) => {
  const basePrompt = `You are Aliva, a professional AI nutritionist and medical practitioner specializing in dietary guidance and health recommendations. You provide evidence-based, compassionate, and personalized nutrition advice.

Key characteristics:
- Professional yet approachable tone
- Always prioritize patient safety and well-being
- Provide specific, actionable dietary recommendations
- Consider medical conditions when giving advice
- Encourage users to consult healthcare providers for serious conditions
- Focus on whole foods, balanced nutrition, and sustainable eating habits
- Be empathetic to users' challenges and preferences`;

  const locationContext = country 
    ? `\n\nUser Location: ${city ? `${city}, ` : ''}${country}

When making food recommendations:
- Prioritize foods commonly available in ${country}: ${getCountryContext(country)}
- Suggest locally sourced and culturally appropriate foods
- Recommend seasonal produce common in this region
- Consider local cuisine and eating habits when possible
- Mention local dishes that can be made healthier or align with nutritional goals
- Use familiar local ingredients in your suggestions
- Reference local markets, grocery stores, or food vendors where appropriate
- Be culturally sensitive and aware of regional preferences`
    : '';

  const guidelines = `\n\nGuidelines for responses:
- Keep responses concise but informative (2-4 sentences typically)
- Always acknowledge the user's condition or concern
- Provide specific food recommendations when appropriate, prioritizing locally available options
- Mention portion sizes or preparation methods when relevant
- If a user mentions serious symptoms, gently suggest consulting a doctor
- End with an encouraging or supportive statement when appropriate

When users ask about restaurant searches or want to find places to eat, respond positively and suggest they can say "find restaurants" to see nearby options that align with your recommendations.

Remember: You're here to guide users toward healthier eating choices while being understanding of their current situation and preferences.`;

  return basePrompt + locationContext + guidelines;
};

// Get location from IP address using request headers
const getLocationFromRequest = (req: VercelRequest): { country?: string; city?: string } => {
  // Try various headers that might contain location info
  const country = req.headers['cf-ipcountry'] as string || // Cloudflare
                  req.headers['x-vercel-ip-country'] as string || // Vercel
                  req.headers['x-country-code'] as string; // Generic
  
  const city = req.headers['x-vercel-ip-city'] as string || // Vercel
               req.headers['cf-ipcity'] as string; // Cloudflare
  
  return { country, city };
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface RequestBody {
  message: string;
  chatHistory?: ChatMessage[];
  location?: {
    country?: string;
    city?: string;
  };
}

interface ResponseData {
  response?: string;
  usage?: any;
  error?: string;
  fallbackResponse?: string;
  detectedLocation?: {
    country?: string;
    city?: string;
  };
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse<ResponseData>
) {
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
    const { message, chatHistory = [], location } = req.body as RequestBody;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Verify API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not configured');
      return res.status(500).json({ 
        error: 'AI service not configured',
        fallbackResponse: "The AI service is not properly configured. Please contact support."
      });
    }

    // Use provided location or detect from request headers
    const detectedLocation = getLocationFromRequest(req);
    const finalLocation = {
      country: location?.country || detectedLocation.country,
      city: location?.city || detectedLocation.city
    };

    console.log('Using location:', finalLocation);

    // Build conversation history for context with location-aware prompt
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: getLocationAwarePrompt(finalLocation.country, finalLocation.city) },
      ...chatHistory.map((msg) => ({
        role: msg.role === 'assistant' ? 'assistant' as const : 'user' as const,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      max_tokens: 300,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    });

    const aiResponse = completion.choices[0]?.message?.content || 
      "I'm here to help with your nutrition questions. Could you tell me more about what you're looking for?";

    return res.status(200).json({ 
      response: aiResponse,
      usage: completion.usage,
      detectedLocation: finalLocation // Return location so client knows what was detected
    });

  } catch (error: any) {
    console.error('OpenAI API error:', error);
    
    // More specific error messages
    let errorMessage = 'AI service temporarily unavailable';
    if (error?.code === 'invalid_api_key') {
      errorMessage = 'AI service authentication failed';
      console.error('Invalid OpenAI API key');
    } else if (error?.code === 'insufficient_quota') {
      errorMessage = 'AI service quota exceeded';
      console.error('OpenAI quota exceeded');
    }
    
    const fallbackResponse = "I'm experiencing some technical difficulties right now. In the meantime, I'd recommend focusing on whole foods, plenty of vegetables, lean proteins, and staying hydrated. Please try again in a moment.";
    
    return res.status(500).json({ 
      error: errorMessage,
      fallbackResponse 
    });
  }
}
