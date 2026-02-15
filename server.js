// server.js
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import dotenv from 'dotenv';
// Stripe was previously used; switching to Paystack
// import Stripe from 'stripe';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

// Configuration
const CONFIG = {
  PORT: process.env.PORT || 5000,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  // Paystack
  PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
  PAYSTACK_CURRENCY: process.env.PAYSTACK_CURRENCY || 'NGN',
  PAYSTACK_BASE_URL: process.env.PAYSTACK_BASE_URL || 'https://api.paystack.co',
  CORS_ORIGINS: [
    'http://localhost:8080',
    'http://localhost:8081',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost',
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
  ].filter(Boolean),
  OPENAI_CONFIG: {
    model: 'gpt-4o-mini',
    maxTokens: 300, // Shorter for more concise responses
    temperature: 0.8, // Higher for more natural variation
    presencePenalty: 0.3, // Encourage variety
    frequencyPenalty: 0.3, // Reduce repetition
  }
};

// System Prompt - Human-like, brief, conversational
const ALIVA_SYSTEM_PROMPT = `You are Aliva — a friendly nutritionist and health companion. You chat like a real person: warm, casual, and to the point.

PERSONALITY:
- Talk like texting a smart friend who happens to know a lot about health
- Keep responses SHORT — 2-4 sentences max for simple questions
- Use natural language, not clinical terminology
- Be warm but not overly enthusiastic or fake
- Skip the formalities — no "Great question!" or excessive pleasantries
- Use contractions (you're, don't, it's)

RESPONSE STYLE:
- Get straight to the point
- One clear recommendation > long lists
- If they need more, they'll ask
- Sound like a person, not a textbook

EXAMPLES OF GOOD RESPONSES:
User: "What should I eat for breakfast?"
Good: "Eggs with some veggies and toast is solid. Quick and keeps you full til lunch."

User: "I'm feeling stressed"
Good: "That's rough. What's going on? Sometimes just talking it out helps."

User: "How much water should I drink?"
Good: "Aim for about 8 glasses. If your pee is light yellow, you're good."

WHAT YOU HELP WITH:
- Nutrition advice (practical, not preachy)
- Mental health support (listen first, advise second)  
- General health questions
- Being someone to talk to

IMPORTANT:
- For serious symptoms: briefly suggest seeing a doctor
- For allergies marked in profiles: ALWAYS avoid those foods
- For crisis/self-harm: provide resources (988 in US) and encourage professional help`;

// Initialize Express App
const app = express();

// Middleware Setup
app.use(cors({
  origin: CONFIG.CORS_ORIGINS,
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Initialize OpenAI
let openaiClient = null;
// let stripeClient = null; // no longer used

const initializeOpenAI = () => {
  try {
    if (!CONFIG.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY not found in environment variables');
      console.error('💡 Create a .env file with: OPENAI_API_KEY=sk-...');
      return false;
    }

    openaiClient = new OpenAI({
      apiKey: CONFIG.OPENAI_API_KEY,
    });

    console.log('✅ OpenAI client initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize OpenAI:', error.message);
    return false;
  }
};

// No explicit client init required for Paystack; we'll call its REST API

// Helper: Build messages for OpenAI
const buildMessages = (userMessage, chatHistory = []) => {
  const messages = [
    { role: 'system', content: ALIVA_SYSTEM_PROMPT }
  ];

  // Add last 8 messages for context (to stay within token limits)
  const recentHistory = chatHistory.slice(-8);
  recentHistory.forEach(msg => {
    messages.push({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    });
  });

  // Add current user message
  messages.push({ role: 'user', content: userMessage });

  return messages;
};

// Helper: Generate fallback response
const getFallbackResponse = (errorCode = null) => {
  const fallbacks = {
    invalid_api_key: "I'm experiencing configuration issues. Please contact support to resolve the API key issue.",
    rate_limit_exceeded: "I'm receiving too many requests. Please wait a moment and try again.",
    insufficient_quota: "The AI service quota has been exceeded. Please check your OpenAI billing settings.",
    no_openai: "I'm temporarily unavailable. For general nutrition advice, focus on balanced meals with vegetables, lean proteins, whole grains, and plenty of water.",
    default: "I'm experiencing technical difficulties. For healthy eating, prioritize whole foods, stay hydrated, and maintain balanced portions. Please try again shortly."
  };

  return fallbacks[errorCode] || fallbacks.default;
};

// API Routes

// Health Check
app.get('/api/health', (req, res) => {
  const health = {
    status: 'online',
    timestamp: new Date().toISOString(),
    environment: CONFIG.NODE_ENV,
    openai: {
      configured: !!CONFIG.OPENAI_API_KEY,
      initialized: !!openaiClient
    }
  };

  const statusCode = openaiClient ? 200 : 503;
  res.status(statusCode).json(health);
});

// Chat Endpoint
// In-memory daily counters (restart resets). Consider Redis for production.
const dailyCounters = new Map(); // key -> { date: 'YYYY-MM-DD', count: number }

function getDailyKey(userId, ip) {
  const today = new Date().toISOString().slice(0, 10);
  const key = userId ? `u:${userId}` : `ip:${ip || 'unknown'}`;
  return { mapKey: key, today };
}

app.post('/api/chat', async (req, res) => {
  const startTime = Date.now();

  try {
    // Validate request body
    const { message, chatHistory, userId, isPaid } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Message must be a non-empty string',
        response: "Please provide a message so I can help you."
      });
    }

    // Check OpenAI availability
    if (!openaiClient) {
      console.warn('⚠️ OpenAI client not available');
      return res.status(503).json({
        error: 'Service unavailable',
        response: getFallbackResponse('no_openai')
      });
    }

    // Enforce free plan limits (3/day) for unauthenticated users by IP.
    // Skip limits if client indicates a paid user (best-effort; for robust security, verify server-side).
    const isPaidUserHeader = (req.headers['x-paid-user'] || '').toString().toLowerCase() === 'true';
    const isPaidUser = Boolean(isPaidUserHeader || isPaid);
    const ip = req.headers['x-forwarded-for']?.toString().split(',')[0] || req.socket.remoteAddress;
    const { mapKey, today } = getDailyKey(userId, ip);
    if (!isPaidUser) {
      const entry = dailyCounters.get(mapKey);
      if (!entry || entry.date !== today) {
        dailyCounters.set(mapKey, { date: today, count: 0 });
      }
      const { count } = dailyCounters.get(mapKey);
      if (count >= 3) {
        return res.status(429).json({
          error: 'daily_limit_reached',
          response: 'You have reached today\'s free limit. Please upgrade to continue.'
        });
      }
    }

    // Prepare messages
    const messages = buildMessages(message, chatHistory || []);

    console.log(`🤖 Processing chat request (${message.length} chars, ${messages.length} messages)`);

    // Call OpenAI API
    const completion = await openaiClient.chat.completions.create({
      model: CONFIG.OPENAI_CONFIG.model,
      messages,
      max_tokens: CONFIG.OPENAI_CONFIG.maxTokens,
      temperature: CONFIG.OPENAI_CONFIG.temperature,
      presence_penalty: CONFIG.OPENAI_CONFIG.presencePenalty,
      frequency_penalty: CONFIG.OPENAI_CONFIG.frequencyPenalty,
    });

    const aiResponse = completion.choices[0]?.message?.content?.trim() ||
      "I'm here to help with your nutrition questions. Could you tell me more?";

    const duration = Date.now() - startTime;

    console.log(`✅ Response generated in ${duration}ms (${completion.usage.total_tokens} tokens)`);

    // Increment counter only for non-paid users
    if (!isPaidUser) {
      const current = dailyCounters.get(mapKey) || { date: today, count: 0 };
      dailyCounters.set(mapKey, { date: today, count: (current.count || 0) + 1 });
    }

    res.status(200).json({
      response: aiResponse,
      metadata: {
        tokensUsed: completion.usage.total_tokens,
        model: completion.model,
        duration: `${duration}ms`
      }
    });

  } catch (error) {
    console.error('❌ Error in /api/chat:', error);

    // Handle specific OpenAI errors
    let errorCode = 'default';
    let statusCode = 500;

    if (error.code === 'invalid_api_key') {
      errorCode = 'invalid_api_key';
      statusCode = 500;
    } else if (error.code === 'rate_limit_exceeded') {
      errorCode = 'rate_limit_exceeded';
      statusCode = 429;
    } else if (error.code === 'insufficient_quota') {
      errorCode = 'insufficient_quota';
      statusCode = 402;
    }

    res.status(statusCode).json({
      error: error.message || 'Internal server error',
      response: getFallbackResponse(errorCode),
      ...(CONFIG.NODE_ENV === 'development' && {
        details: {
          code: error.code,
          type: error.type,
          message: error.message
        }
      })
    });
  }
});

// Food Image Analysis Endpoint
app.post('/api/analyze-food', async (req, res) => {
  const startTime = Date.now();

  try {
    const { image } = req.body;

    if (!image || typeof image !== 'string') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Image data is required'
      });
    }

    if (!openaiClient) {
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'AI service is temporarily unavailable'
      });
    }

    console.log(`🍔 Processing food image analysis`);

    const completion = await openaiClient.chat.completions.create({
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
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) throw new Error('Invalid response format');

    const nutritionData = JSON.parse(jsonMatch[0]);
    console.log(`✅ Food analysis completed in ${Date.now() - startTime}ms`);

    res.status(200).json(nutritionData);

  } catch (error) {
    console.error('❌ Error in /api/analyze-food:', error);
    res.status(500).json({
      error: 'Failed to analyze image',
      ...(CONFIG.NODE_ENV === 'development' && { details: error.message })
    });
  }
});

// Generate AI Meal Plan Endpoint
app.post('/api/generate-meal-plan', async (req, res) => {
  const startTime = Date.now();

  try {
    const { country, diet, allergies, calories, goal, durationDays = 7 } = req.body;

    if (!openaiClient) {
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

    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 2500,
      temperature: 0.7
    });

    const content = completion.choices[0]?.message?.content;
    const plan = JSON.parse(content);

    console.log(`✅ Meal plan generated in ${Date.now() - startTime}ms`);
    res.status(200).json(plan);

  } catch (error) {
    console.error('❌ Error in /api/generate-meal-plan:', error);
    res.status(500).json({
      error: 'Failed to generate meal plan',
      details: CONFIG.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ✅ AI Recipe Generation Endpoint
app.post('/api/generate-recipes', async (req, res) => {
  try {
    const { country, diet, allergies, calories, query } = req.body;
    console.log(`🍳 Generating recipes for ${country}, Diet: ${diet || 'None'}, Query: ${query || 'None'}`);

    if (!openaiClient) {
      if (!initializeOpenAI()) {
        throw new Error('OpenAI service not available');
      }
    }

    let systemInstruction = "You are a professional chef and nutritionist.";
    let prompt = "";

    if (query && query.trim().length > 0) {
      // Search Mode
      prompt = `
          Create 3 distinct recipes that match the search term: "${query}".
          Adjust them to be healthy and suitable for a user in ${country}.
          
          Preferences to respect (if possible, but prioritize the search term):
          - Diet: ${diet || 'None'}
          - Allergies: ${allergies ? allergies.join(', ') : 'None'}
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
          - Allergies: ${allergies ? allergies.join(', ') : 'None'}
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

    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a professional chef and nutritionist. Output valid JSON object with a 'recipes' key containing the array." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
    });

    console.log('OpenAI raw response:', completion.choices[0].message.content); // Debug log

    let responseContent;
    try {
      responseContent = JSON.parse(completion.choices[0].message.content);
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
    const validRecipes = recipes.map(r => ({
      ...r,
      name: r.name || "Untitled Recipe",
      description: r.description || "No description available",
      imageKeyword: r.imageKeyword || r.name || "food"
    }));

    console.log(`✅ Generated ${validRecipes.length} recipes`);
    res.json(validRecipes);

  } catch (error) {
    console.error('❌ Error generating recipes:', error);
    res.status(500).json({ error: 'Failed to generate recipes', details: error.message });
  }
});


// Payments: Verify Paystack Transaction
app.post('/api/payments/verify', async (req, res) => {
  try {
    if (!CONFIG.PAYSTACK_SECRET_KEY) {
      return res.status(503).json({ error: 'Payment service unavailable: PAYSTACK_SECRET_KEY not set' });
    }

    const { reference, userId } = req.body || {};

    if (!reference) {
      return res.status(400).json({ error: 'Transaction reference is required' });
    }
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Verify transaction with Paystack
    const verifyResponse = await fetch(`${CONFIG.PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${CONFIG.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const verifyResult = await verifyResponse.json();

    if (!verifyResult.status || verifyResult.data?.status !== 'success') {
      return res.status(400).json({
        error: 'Payment verification failed',
        details: verifyResult.message || 'Transaction not successful'
      });
    }

    const transactionData = verifyResult.data;
    const metadata = transactionData.metadata || {};

    // Validate that the transaction belongs to this user
    const transactionUserId = metadata.userId || metadata.user_id || metadata.uid;
    if (transactionUserId !== userId) {
      return res.status(403).json({ error: 'Transaction does not belong to this user' });
    }

    const plan = (metadata.plan || '').toString().toUpperCase();
    const interval = (metadata.interval || 'monthly').toString().toLowerCase();

    if (!['PREMIUM', 'PRO'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan in transaction metadata' });
    }

    // Compute expiry date
    let planExpiresAt = new Date();
    if (interval === 'yearly') {
      planExpiresAt.setFullYear(planExpiresAt.getFullYear() + 1);
    } else {
      planExpiresAt.setMonth(planExpiresAt.getMonth() + 1);
    }

    // Return the plan details (frontend will update profile)
    return res.status(200).json({
      success: true,
      verified: true,
      plan,
      interval,
      planExpiresAt: planExpiresAt.toISOString(),
      transactionReference: reference
    });

  } catch (error) {
    console.error('❌ Error verifying Paystack transaction:', error);
    return res.status(500).json({ error: 'Failed to verify transaction' });
  }
});

// Payments: Initialize Paystack Transaction
app.post('/api/payments/init', async (req, res) => {
  try {
    if (!CONFIG.PAYSTACK_SECRET_KEY) {
      return res.status(503).json({ error: 'Payment service unavailable: PAYSTACK_SECRET_KEY not set' });
    }

    const { plan, interval = 'monthly', customerEmail, userId } = req.body || {};
    console.log('🔔 Init Paystack:', { plan, interval, customerEmail, userId });
    const normalizedPlan = (plan || '').toString().toUpperCase();
    const normalizedInterval = (interval || 'monthly').toString().toLowerCase();

    if (!customerEmail) {
      return res.status(400).json({ error: 'Customer email is required' });
    }
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    if (!['PRO', 'PREMIUM'].includes(normalizedPlan)) {
      return res.status(400).json({ error: 'Invalid plan' });
    }
    if (!['monthly', 'yearly'].includes(normalizedInterval)) {
      return res.status(400).json({ error: 'Invalid interval' });
    }

    // Determine amount (kobo) - set your pricing here
    // kobo = NGN * 100
    const amountByPlan = {
      PRO: { monthly: 650000, yearly: 650000 }, // ₦6,500.00 monthly and yearly
      PREMIUM: { monthly: 1999000, yearly: 9999900 } // ₦19,990.00 and ₦99,999.00 (legacy)
    };

    const amount = amountByPlan[normalizedPlan]?.[normalizedInterval];
    if (!amount) {
      return res.status(500).json({ error: 'Amount not configured' });
    }

    // Log for debugging
    console.log(`💰 Payment Init - Plan: ${normalizedPlan}, Interval: ${normalizedInterval}, Amount: ${amount} kobo (₦${amount / 100})`);

    const originHeader = req.headers['origin'];
    const baseUrl = typeof originHeader === 'string' ? originHeader : CONFIG.FRONTEND_URL;
    const callbackUrl = `${baseUrl}/dashboard?upgrade=success`;

    const initResponse = await fetch(`${CONFIG.PAYSTACK_BASE_URL}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${CONFIG.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: customerEmail,
        amount, // in kobo
        currency: CONFIG.PAYSTACK_CURRENCY,
        callback_url: callbackUrl,
        metadata: {
          plan: normalizedPlan,
          interval: normalizedInterval,
          userId: userId
        }
      })
    });

    const text = await initResponse.text();
    let result;
    try { result = JSON.parse(text); } catch { result = { raw: text }; }
    if (!result?.status) {
      console.error('❌ Paystack init failed:', result);
      return res.status(500).json({ error: result?.message || 'Failed to initialize transaction', details: result });
    }

    // Return authorization URL to redirect user
    return res.status(200).json({ authorizationUrl: result.data.authorization_url, reference: result.data.reference });
  } catch (error) {
    console.error('❌ Error initializing Paystack transaction:', error);
    return res.status(500).json({ error: 'Failed to initialize transaction' });
  }
});

// Root Endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Aliva API Server',
    version: '2.0.0',
    status: 'running',
    endpoints: {
      health: 'GET /api/health',
      chat: 'POST /api/chat'
    },
    documentation: 'Visit /api/health for system status'
  });
});

// 404 Handler
app.use((req, res) => {
  console.warn(`⚠️ 404: ${req.method} ${req.path}`);
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    method: req.method,
    availableEndpoints: ['GET /', 'GET /api/health', 'POST /api/chat']
  });
});

// Global Error Handler
app.use((error, req, res, next) => {
  console.error('🔥 Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: CONFIG.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Start Server
const startServer = () => {
  const isOpenAIReady = initializeOpenAI();

  app.listen(CONFIG.PORT, () => {
    console.log('\n' + '═'.repeat(60));
    console.log('🚀  ALIVA API SERVER');
    console.log('═'.repeat(60));
    console.log(`📡  Server URL:     http://localhost:${CONFIG.PORT}`);
    console.log(`🌍  Environment:    ${CONFIG.NODE_ENV}`);
    console.log(`🔑  OpenAI API Key: ${CONFIG.OPENAI_API_KEY ? '✅ Present' : '❌ Missing'}`);
    console.log(`🤖  OpenAI Client:  ${isOpenAIReady ? '✅ Ready' : '❌ Not Initialized'}`);
    console.log(`💳  Payments:       Paystack enabled: ${CONFIG.PAYSTACK_SECRET_KEY ? '✅' : '❌'}`);
    console.log('─'.repeat(60));
    console.log('📋  Endpoints:');
    console.log(`    GET  http://localhost:${CONFIG.PORT}/`);
    console.log(`    GET  http://localhost:${CONFIG.PORT}/api/health`);
    console.log(`    POST http://localhost:${CONFIG.PORT}/api/chat`);
    console.log(`    POST http://localhost:${CONFIG.PORT}/api/payments/init`);
    console.log(`    POST http://localhost:${CONFIG.PORT}/api/payments/verify`);
    console.log('═'.repeat(60) + '\n');

    if (!isOpenAIReady) {
      console.warn('⚠️  WARNING: Server started but OpenAI is not configured!');
      console.warn('    The /api/chat endpoint will return fallback responses.\n');
    }
  });
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();
