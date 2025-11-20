import fs from 'fs';
import dotenv from 'dotenv';

const envConfig = dotenv.parse(fs.readFileSync('.env'));

const keysToCheck = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
    'VITE_GOOGLE_MAPS_API_KEY',
    'OPENAI_API_KEY'
];

const missing = [];
keysToCheck.forEach(key => {
    const value = envConfig[key];
    if (!value || value.length === 0) {
        missing.push(key);
    }
});

if (missing.length === 0) {
    console.log('ALL_KEYS_PRESENT');
} else {
    console.log('MISSING_KEYS:', missing.join(', '));
}
