import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { userId, provider, referenceId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const terraApiKey = process.env.TERRA_API_KEY;
        const terraDevId = process.env.TERRA_DEV_ID;

        if (!terraApiKey || !terraDevId) {
            console.error('Missing Terra API credentials');
            return res.status(500).json({ error: 'Terra API not configured' });
        }

        // Generate widget session from Terra API
        const response = await fetch('https://api.tryterra.co/v2/auth/generateWidgetSession', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'dev-id': terraDevId,
                'x-api-key': terraApiKey
            },
            body: JSON.stringify({
                reference_id: referenceId || userId,
                providers: provider ? [provider] : undefined, // Filter to specific provider if provided
                language: 'en',
                auth_success_redirect_url: `${process.env.VITE_APP_URL || 'http://localhost:5173'}/dashboard?health_connected=true`,
                auth_failure_redirect_url: `${process.env.VITE_APP_URL || 'http://localhost:5173'}/dashboard?health_connected=false`
            })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            console.error('Terra API error:', error);
            return res.status(response.status).json({ error: 'Failed to generate widget session' });
        }

        const data = await response.json();

        return res.status(200).json({
            url: data.url,
            sessionId: data.session_id,
            expiresAt: data.expires_at
        });
    } catch (error: any) {
        console.error('Generate widget error:', error);
        return res.status(500).json({ error: 'Failed to generate widget' });
    }
}
