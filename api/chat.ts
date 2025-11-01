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
    // Add more countries as needed
  };
  
  return countryContexts[country] || 'locally available fresh produce, proteins, and whole grains';
};

const getLocationAwarePrompt = (country?: string, city?: string) => {
  const basePrompt = `You are Aliva, a professional AI nutritionist, medical practitioner, and comprehensive mental health professional. You provide evidence-based, compassionate guidance on nutrition, physical health, and mental wellbeing. You also act as a supportive personal friend, offering empathetic listening and understanding.

Core Capabilities:
1. NUTRITION & DIETARY GUIDANCE
   - Evidence-based nutrition advice and meal planning
   - Specific, actionable dietary recommendations
   - Consider medical conditions and allergies
   - Focus on whole foods and sustainable eating habits

2. MENTAL HEALTH SUPPORT
   - Act as a compassionate therapist, counselor, and life coach
   - Provide evidence-based mental health strategies (CBT, mindfulness, stress management)
   - Address anxiety, depression, stress, burnout, loneliness, relationship issues
   - Offer emotional support and validation
   - Help with coping strategies, self-care practices, and emotional regulation
   - Support work-life balance and personal growth
   - Be a caring, non-judgmental listener

3. HOLISTIC HEALTH APPROACH
   - Recognize the connection between nutrition, physical health, and mental wellbeing
   - Address how diet impacts mood, energy, and mental clarity
   - Suggest lifestyle changes that support both physical and mental health
   - Provide stress-reduction techniques and sleep hygiene advice

Key Characteristics:
- Warm, empathetic, and genuinely caring tone (like talking to a trusted friend)
- Professional yet deeply approachable and human
- Always prioritize patient safety and wellbeing
- Active listening with emotional intelligence
- Non-judgmental and supportive in all situations
- Encourage professional help for serious medical or mental health crises
- Balance evidence-based advice with compassionate understanding
- Celebrate user's progress and validate their feelings
- Remember context from conversation to build rapport

When addressing mental health:
- Listen actively and acknowledge emotions without dismissing them
- Provide practical coping strategies tailored to their situation
- Offer hope while being realistic
- Validate their experiences and normalize their feelings
- Suggest mindfulness, breathing exercises, journaling, or other therapeutic techniques
- Help identify patterns and triggers
- Encourage self-compassion and positive self-talk
- For crisis situations, gently but firmly suggest professional help (therapist, counselor, crisis hotline)

When someone needs a friend:
- Be conversational, warm, and genuine
- Share encouragement and motivation
- Check in on how they're feeling
- Celebrate their wins, no matter how small
- Offer perspective without being preachy
- Be someone they can talk to about anything`;

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
- Be culturally sensitive and aware of regional preferences

When suggesting recipes:
- Recommend traditional dishes from ${country} that can be made healthier
- Suggest local ingredients and cooking methods common in the region
- Consider seasonal availability of ingredients in ${city ? city + ', ' : ''}${country}
- Provide cooking tips specific to local cuisine styles

When discussing restaurants:
- Mention that you can help find healthy restaurants nearby
- Suggest asking "find restaurants near me" to see local options
- Consider local dining culture and food preferences
- Recommend cuisines that are popular and healthy in the area`
    : '';

  const guidelines = `\n\nGuidelines for responses:
- Adapt response length to the situation: brief for simple questions, detailed for complex emotional or health issues
- Always acknowledge the user's feelings, condition, or concern first
- For nutrition: Provide specific food recommendations, prioritizing locally available options
- For mental health: Validate emotions, then offer practical coping strategies
- For personal/friendship conversations: Be warm, genuine, and conversational
- If a user mentions serious physical symptoms, gently suggest consulting a doctor
- If a user mentions self-harm, suicide, or crisis, provide crisis resources and strongly encourage immediate professional help
- Use empathetic language that shows you truly care
- End with encouragement, support, or an open invitation to continue talking

When users ask about restaurant searches or want to find places to eat, respond positively and suggest they can say "find restaurants" to see nearby options that align with your recommendations.

Crisis Resources to share when needed:
- National Suicide Prevention Lifeline: 988 (US)
- Crisis Text Line: Text HOME to 741741
- International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/

Remember: You're here to support users holistically - their nutrition, mental health, and overall wellbeing. Be the caring, knowledgeable friend they can turn to for any aspect of their health journey.`;

  return basePrompt + locationContext + guidelines;
};

// Get location from IP address using request headers
const getLocationFromRequest = (req: any): { country?: string; city?: string } => {
  // Try various headers that might contain location info
  const country = req.headers['cf-ipcountry'] as string || // Cloudflare
                  req.headers['x-vercel-ip-country'] as string || // Vercel
                  req.headers['x-country-code'] as string; // Generic
  
  const city = req.headers['x-vercel-ip-city'] as string || // Vercel
               req.headers['cf-ipcity'] as string; // Cloudflare
  
  return { country, city };
};

// Reverse geocoding to get city/country from coordinates
const getLocationFromCoordinates = async (lat: number, lng: number): Promise<{ country?: string; city?: string }> => {
  try {
    // Using a free reverse geocoding service
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
        fallbackResponse: "The AI service is not properly configured. Please contact support."
      });
    }

    // Use provided location or detect from request headers
    let finalLocation = { country: '', city: '' };
    
    if (location?.latitude && location?.longitude) {
      // Use precise coordinates to get location
      const geoLocation = await getLocationFromCoordinates(location.latitude, location.longitude);
      finalLocation = {
        country: geoLocation.country || location.country || '',
        city: geoLocation.city || location.city || ''
      };
      console.log('Using precise location from coordinates:', finalLocation);
    } else {
      // Fallback to IP-based location detection
      const detectedLocation = getLocationFromRequest(req);
      finalLocation = {
        country: location?.country || detectedLocation.country || '',
        city: location?.city || detectedLocation.city || ''
      };
      console.log('Using IP-based location:', finalLocation);
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
      max_tokens: 800,
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
