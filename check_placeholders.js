import fs from 'fs';
import dotenv from 'dotenv';

const envConfig = dotenv.parse(fs.readFileSync('.env'));

const keysToCheck = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'OPENAI_API_KEY'
];

const placeholders = [];
keysToCheck.forEach(key => {
    const value = envConfig[key];
    if (value && (value.includes('your_') || value.includes('placeholder') || value === '')) {
        placeholders.push(key);
    }
});

if (placeholders.length === 0) {
    console.log('NO_PLACEHOLDERS_FOUND');
} else {
    console.log('PLACEHOLDERS_FOUND:', placeholders.join(', '));
}
