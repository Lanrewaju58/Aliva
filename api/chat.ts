import OpenAI from 'openai';

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
  };

  return countryContexts[country] || 'locally available fresh produce, proteins, and whole grains';
};

const getLocationAwarePrompt = (country?: string, city?: string) => {
  const basePrompt = `You are Aliva — a friendly nutritionist and health companion. You chat like a real person: warm, casual, and to the point.

PERSONALITY:
- Talk like texting a smart friend who happens to know a lot about health
- Keep responses SHORT — 2-4 sentences max for simple questions
- Use natural language, not clinical terminology
- Be warm but not overly enthusiastic or fake
- Skip the formalities — no "Great question!" or excessive pleasantries
- Use contractions (you're, don't, it's)
- Occasionally use casual expressions naturally

RESPONSE STYLE:
- Get straight to the point
- One clear recommendation > long lists
- If they need more, they'll ask
- Don't over-explain or add unnecessary context
- Sound like a person, not a textbook

EXAMPLES OF GOOD RESPONSES:
User: "What should I eat for breakfast?"
Bad: "Great question! Breakfast is the most important meal of the day. I recommend incorporating a balance of proteins, complex carbohydrates, and healthy fats..."
Good: "Eggs with some veggies and toast is solid. Quick and keeps you full til lunch."

User: "I'm feeling stressed"
Bad: "I'm sorry to hear you're experiencing stress. Stress is a common experience that can affect both mental and physical health..."
Good: "That's rough. What's going on? Sometimes just talking it out helps."

User: "How much water should I drink?"
Bad: "Hydration is essential for optimal bodily function. The general recommendation is 8 glasses per day, though this varies..."
Good: "Aim for about 8 glasses. If your pee is light yellow, you're good."

WHAT YOU HELP WITH:
- Nutrition advice (practical, not preachy)
- Mental health support (listen first, advise second)
- General health questions
- Being someone to talk to

IMPORTANT:
- For serious symptoms: briefly suggest seeing a doctor
- For crisis/self-harm mentions: provide crisis resources (988 in US) and encourage professional help
- Remember their context from the conversation`;

  const locationContext = country
    ? `

LOCATION: ${city ? `${city}, ` : ''}${country}
- Suggest foods common in ${country}: ${getCountryContext(country)}
- Use local ingredients and dishes when relevant
- Be culturally aware`
    : '';

  return basePrompt + locationContext;
};

// Get location from IP address using request headers
const getLocationFromRequest = (req: any): { country?: string; city?: string } => {
  const country = req.headers['cf-ipcountry'] as string ||
    req.headers['x-vercel-ip-country'] as string ||
    req.headers['x-country-code'] as string;

  const city = req.headers['x-vercel-ip-city'] as string ||
    req.headers['cf-ipcity'] as string;

  return { country, city };
};

// Reverse geocoding to get city/country from coordinates
const getLocationFromCoordinates = async (lat: number, lng: number): Promise<{ country?: string; city?: string }> => {
  try {
    const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
    const data = await response.json();

    return {
      country: data.countryName,
      city: data.city || data.locality
    };
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    return {};
  }
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface RequestBody {
  message: string;
  chatHistory?: ChatMessage[];
  location?: {
    latitude?: number;
    longitude?: number;
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
    const { message, chatHistory = [], location } = req.body as RequestBody;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Verify API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not configured');
      return res.status(500).json({
        error: 'AI service not configured',
        fallbackResponse: "Can't connect right now. Try again in a bit?"
      });
    }

    // Use provided location or detect from request headers
    let finalLocation = { country: '', city: '' };

    if (location?.latitude && location?.longitude) {
      const geoLocation = await getLocationFromCoordinates(location.latitude, location.longitude);
      finalLocation = {
        country: geoLocation.country || location.country || '',
        city: geoLocation.city || location.city || ''
      };
    } else {
      const detectedLocation = getLocationFromRequest(req);
      finalLocation = {
        country: location?.country || detectedLocation.country || '',
        city: location?.city || detectedLocation.city || ''
      };
    }

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
      max_tokens: 300, // Reduced for more concise responses
      temperature: 0.8, // Slightly higher for more natural variation
      presence_penalty: 0.3, // Encourage variety
      frequency_penalty: 0.3, // Reduce repetition
    });

    const aiResponse = completion.choices[0]?.message?.content ||
      "Hey, what's on your mind?";

    return res.status(200).json({
      response: aiResponse,
      usage: completion.usage,
      detectedLocation: finalLocation
    });

  } catch (error: any) {
    console.error('OpenAI API error:', error);

    let errorMessage = 'AI service temporarily unavailable';
    if (error?.code === 'invalid_api_key') {
      errorMessage = 'AI service authentication failed';
    } else if (error?.code === 'insufficient_quota') {
      errorMessage = 'AI service quota exceeded';
    }

    const fallbackResponse = "Having some technical issues. Try again in a sec?";

    return res.status(500).json({
      error: errorMessage,
      fallbackResponse
    });
  }
}
