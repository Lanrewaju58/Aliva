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

// Terra webhook signature verification
function verifyTerraSignature(payload: string, signature: string, secret: string): boolean {
    const crypto = require('crypto');
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const terraSecret = process.env.TERRA_WEBHOOK_SECRET;
        const signature = req.headers['terra-signature'] as string;

        // Verify webhook signature (optional but recommended)
        if (terraSecret && signature) {
            const payload = JSON.stringify(req.body);
            if (!verifyTerraSignature(payload, signature, terraSecret)) {
                console.error('Invalid Terra webhook signature');
                return res.status(401).json({ error: 'Invalid signature' });
            }
        }

        const { type, user, data } = req.body;

        if (!user?.reference_id) {
            console.log('No reference_id in webhook, skipping');
            return res.status(200).json({ received: true });
        }

        const userId = user.reference_id;
        const provider = user.provider?.toLowerCase() || 'unknown';
        const terraUserId = user.user_id;

        console.log(`Terra webhook: ${type} for user ${userId} from ${provider}`);

        // Handle different webhook types
        switch (type) {
            case 'auth':
                // User authenticated - update connected providers
                await db.collection('connectedProviders').doc(`${userId}_${provider}`).set({
                    userId,
                    provider,
                    terraUserId,
                    status: 'active',
                    connectedAt: Timestamp.now(),
                    lastSyncAt: Timestamp.now()
                }, { merge: true });
                break;

            case 'deauth':
                // User deauthenticated
                await db.collection('connectedProviders').doc(`${userId}_${provider}`).update({
                    status: 'disconnected',
                    disconnectedAt: Timestamp.now()
                });
                break;

            case 'activity':
                // Activity data (steps, calories, etc.)
                if (data && Array.isArray(data)) {
                    for (const activity of data) {
                        const date = new Date(activity.metadata?.start_time || Date.now());
                        const entryId = `${provider}_activity_${date.toISOString().split('T')[0]}`;

                        await db.collection('healthData').doc(userId).collection('entries').doc(entryId).set({
                            userId,
                            provider,
                            dataType: 'activity',
                            date: Timestamp.fromDate(date),
                            data: {
                                steps: activity.distance_data?.steps || activity.summary?.steps || 0,
                                caloriesBurned: activity.calories_data?.total_burned_calories || 0,
                                activeMinutes: activity.active_durations_data?.activity_seconds
                                    ? Math.round(activity.active_durations_data.activity_seconds / 60)
                                    : 0,
                                distance: activity.distance_data?.distance_metres || 0
                            },
                            createdAt: Timestamp.now(),
                            rawData: activity
                        }, { merge: true });
                    }
                }
                break;

            case 'sleep':
                // Sleep data
                if (data && Array.isArray(data)) {
                    for (const sleep of data) {
                        const date = new Date(sleep.metadata?.start_time || Date.now());
                        const entryId = `${provider}_sleep_${date.toISOString().split('T')[0]}`;

                        const sleepDurations = sleep.sleep_durations_data || {};

                        await db.collection('healthData').doc(userId).collection('entries').doc(entryId).set({
                            userId,
                            provider,
                            dataType: 'sleep',
                            date: Timestamp.fromDate(date),
                            data: {
                                totalSleepMinutes: sleepDurations.asleep?.duration_asleep_state_seconds
                                    ? Math.round(sleepDurations.asleep.duration_asleep_state_seconds / 60)
                                    : Math.round((sleepDurations.sleep_efficiency || 0) * 8 * 60), // Estimate from efficiency
                                deepSleepMinutes: sleepDurations.asleep?.duration_deep_sleep_state_seconds
                                    ? Math.round(sleepDurations.asleep.duration_deep_sleep_state_seconds / 60)
                                    : 0,
                                lightSleepMinutes: sleepDurations.asleep?.duration_light_sleep_state_seconds
                                    ? Math.round(sleepDurations.asleep.duration_light_sleep_state_seconds / 60)
                                    : 0,
                                remSleepMinutes: sleepDurations.asleep?.duration_REM_sleep_state_seconds
                                    ? Math.round(sleepDurations.asleep.duration_REM_sleep_state_seconds / 60)
                                    : 0,
                                sleepScore: sleep.sleep_durations_data?.sleep_efficiency
                                    ? Math.round(sleep.sleep_durations_data.sleep_efficiency * 100)
                                    : null,
                                sleepStartTime: sleep.metadata?.start_time,
                                sleepEndTime: sleep.metadata?.end_time
                            },
                            createdAt: Timestamp.now(),
                            rawData: sleep
                        }, { merge: true });
                    }
                }
                break;

            case 'body':
                // Heart rate and other body metrics
                if (data && Array.isArray(data)) {
                    for (const body of data) {
                        const date = new Date(body.metadata?.start_time || Date.now());
                        const entryId = `${provider}_heart_rate_${date.toISOString().split('T')[0]}`;

                        const heartData = body.heart_data || {};

                        await db.collection('healthData').doc(userId).collection('entries').doc(entryId).set({
                            userId,
                            provider,
                            dataType: 'heart_rate',
                            date: Timestamp.fromDate(date),
                            data: {
                                avgHeartRate: heartData.heart_rate_data?.summary?.avg_hr_bpm || null,
                                restingHeartRate: heartData.heart_rate_data?.summary?.resting_hr_bpm || null,
                                maxHeartRate: heartData.heart_rate_data?.summary?.max_hr_bpm || null,
                                minHeartRate: heartData.heart_rate_data?.summary?.min_hr_bpm || null,
                                hrvMs: heartData.heart_rate_variability_data?.summary?.avg_hrv_rmssd || null
                            },
                            createdAt: Timestamp.now(),
                            rawData: body
                        }, { merge: true });
                    }
                }
                break;

            case 'daily':
                // Daily summary - includes steps, activity, sleep
                if (data && Array.isArray(data)) {
                    for (const daily of data) {
                        const date = new Date(daily.metadata?.start_time || Date.now());
                        const dateStr = date.toISOString().split('T')[0];

                        // Save activity data
                        if (daily.distance_data || daily.calories_data) {
                            await db.collection('healthData').doc(userId).collection('entries')
                                .doc(`${provider}_activity_${dateStr}`).set({
                                    userId,
                                    provider,
                                    dataType: 'activity',
                                    date: Timestamp.fromDate(date),
                                    data: {
                                        steps: daily.distance_data?.steps || 0,
                                        caloriesBurned: daily.calories_data?.total_burned_calories || 0,
                                        activeMinutes: daily.active_durations_data?.activity_seconds
                                            ? Math.round(daily.active_durations_data.activity_seconds / 60)
                                            : 0,
                                        distance: daily.distance_data?.distance_metres || 0
                                    },
                                    createdAt: Timestamp.now()
                                }, { merge: true });
                        }
                    }
                }
                break;

            default:
                console.log(`Unhandled webhook type: ${type}`);
        }

        // Update last sync time for provider
        if (['activity', 'sleep', 'body', 'daily'].includes(type)) {
            await db.collection('connectedProviders').doc(`${userId}_${provider}`).update({
                lastSyncAt: Timestamp.now()
            }).catch(() => { }); // Ignore if doc doesn't exist
        }

        return res.status(200).json({ received: true });
    } catch (error: any) {
        console.error('Terra webhook error:', error);
        return res.status(500).json({ error: 'Webhook processing failed' });
    }
}
