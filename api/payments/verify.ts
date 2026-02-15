import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
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
    const PAYSTACK_BASE_URL = process.env.PAYSTACK_BASE_URL || 'https://api.paystack.co';

    if (!PAYSTACK_SECRET_KEY) {
      return res.status(503).json({ error: 'Payment service unavailable: PAYSTACK_SECRET_KEY not set' });
    }

    const { reference, userId } = (req.body || {}) as {
      reference?: string;
      userId?: string;
    };

    if (!reference) {
      return res.status(400).json({ error: 'Transaction reference is required' });
    }
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Verify transaction with Paystack
    const verifyResponse = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
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
  } catch (error: any) {
    console.error('❌ Error verifying Paystack transaction (vercel api/):', error);
    return res.status(500).json({ error: 'Failed to verify transaction' });
  }
}

