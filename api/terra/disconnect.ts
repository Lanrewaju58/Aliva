import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// Initialize Firebase Admin
let app: App;
if (getApps().length === 0) {
    app = initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
} else {
    app = getApps()[0];
}

const db = getFirestore(app);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { userId, provider } = req.body;

        if (!userId || !provider) {
            return res.status(400).json({ error: 'userId and provider are required' });
        }

        const terraApiKey = process.env.TERRA_API_KEY;
        const terraDevId = process.env.TERRA_DEV_ID;

        // Get the Terra user ID for this provider connection
        const providerDoc = await db.collection('connectedProviders').doc(`${userId}_${provider.toLowerCase()}`).get();

        if (!providerDoc.exists) {
            return res.status(404).json({ error: 'Provider connection not found' });
        }

        const terraUserId = providerDoc.data()?.terraUserId;

        if (terraUserId && terraApiKey && terraDevId) {
            // Call Terra API to deauthenticate
            await fetch(`https://api.tryterra.co/v2/auth/deauthenticateUser`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'dev-id': terraDevId,
                    'x-api-key': terraApiKey
                },
                body: JSON.stringify({
                    user_id: terraUserId
                })
            }).catch(console.error);
        }

        // Update Firestore
        await db.collection('connectedProviders').doc(`${userId}_${provider.toLowerCase()}`).update({
            status: 'disconnected',
            disconnectedAt: Timestamp.now()
        });

        return res.status(200).json({ success: true });
    } catch (error: any) {
        console.error('Disconnect error:', error);
        return res.status(500).json({ error: 'Failed to disconnect' });
    }
}
