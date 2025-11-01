import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS (safe since same-origin in prod; keep permissive for previews)
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
    const PAYSTACK_CURRENCY = process.env.PAYSTACK_CURRENCY || 'NGN';
    const PAYSTACK_BASE_URL = process.env.PAYSTACK_BASE_URL || 'https://api.paystack.co';

    if (!PAYSTACK_SECRET_KEY) {
      return res.status(503).json({ error: 'Payment service unavailable: PAYSTACK_SECRET_KEY not set' });
    }

    const { plan, interval = 'monthly', customerEmail, userId } = (req.body || {}) as {
      plan?: string;
      interval?: 'monthly' | 'yearly';
      customerEmail?: string;
      userId?: string;
    };

    const normalizedPlan = (plan || '').toString().toUpperCase();
    const normalizedInterval = (interval || 'monthly').toString().toLowerCase();

    if (!customerEmail) {
      return res.status(400).json({ error: 'Customer email is required' });
    }
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    if (!['PRO', 'PREMIUM'].includes(normalizedPlan)) {
      return res.status(400).json({ error: 'Invalid plan' });
    }
    if (!['monthly', 'yearly'].includes(normalizedInterval)) {
      return res.status(400).json({ error: 'Invalid interval' });
    }

    const amountByPlan: Record<string, Record<string, number>> = {
      PRO: { monthly: 999000, yearly: 9900000 },
      PREMIUM: { monthly: 1999000, yearly: 9999000 } // ₦19,990.00 and ₦99,999.00
    };
    const amount = amountByPlan[normalizedPlan]?.[normalizedInterval];
    if (!amount) {
      return res.status(500).json({ error: 'Amount not configured' });
    }

    const origin = (req.headers['origin'] as string) || (req.headers['referer'] as string) || '';
    const host = (req.headers['host'] as string) || '';
    const baseUrl = origin || (host ? `https://${host}` : process.env.FRONTEND_URL || '');
    const callbackUrl = baseUrl ? `${baseUrl.replace(/\/$/, '')}/dashboard?upgrade=success` : undefined;

    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: customerEmail,
        amount,
        currency: PAYSTACK_CURRENCY,
        ...(callbackUrl ? { callback_url: callbackUrl } : {}),
        metadata: { plan: normalizedPlan, interval: normalizedInterval, userId }
      })
    });

    const text = await response.text();
    let result: any;
    try { result = JSON.parse(text); } catch { result = { raw: text }; }
    if (!result?.status) {
      console.error('❌ Paystack init failed (vercel api/):', result);
      return res.status(500).json({ error: result?.message || 'Failed to initialize transaction', details: result });
    }

    return res.status(200).json({ authorizationUrl: result.data.authorization_url, reference: result.data.reference });
  } catch (error: any) {
    console.error('❌ Error initializing Paystack transaction (vercel api/):', error);
    return res.status(500).json({ error: 'Failed to initialize transaction' });
  }
}


