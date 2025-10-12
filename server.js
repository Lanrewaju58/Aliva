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
    model: 'gpt-3.5-turbo',
    maxTokens: 500,
    temperature: 0.7,
    presencePenalty: 0.1,
    frequencyPenalty: 0.1,
  }
};

// System Prompt
const ALIVA_SYSTEM_PROMPT = `You are Aliva, a professional AI nutritionist and health advisor. You provide evidence-based, compassionate nutrition guidance.

Core Principles:
- Prioritize user safety and well-being
- Provide specific, actionable dietary advice
- Consider medical conditions and allergies (especially those in user profiles)
- Be empathetic and supportive
- Keep responses concise (2-4 sentences typically)
- Recommend consulting healthcare providers for serious conditions

Response Guidelines:
- Acknowledge the user's concern first
- Provide specific food recommendations with portions when relevant
- Consider preparation methods and meal timing
- End with encouragement or a practical tip
- For serious symptoms, gently suggest medical consultation

Important: ALWAYS avoid foods the user is allergic to. Pay special attention to profile information marked as "IMPORTANT" or "CRITICAL" or "MUST AVOID".`;

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
  const today = new Date().toISOString().slice(0,10);
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
      PRO: { monthly: 999000, yearly: 9900000 }, // ₦9,990.00 and ₦99,000.00
      PREMIUM: { monthly: 1999000, yearly: 19900000 } // ₦19,990.00 and ₦199,000.00
    };

    const amount = amountByPlan[normalizedPlan]?.[normalizedInterval];
    if (!amount) {
      return res.status(500).json({ error: 'Amount not configured' });
    }

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