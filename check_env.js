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

let output = 'Environment Variable Check:\n';
keysToCheck.forEach(key => {
    const value = envConfig[key];
    if (value && value.length > 0) {
        output += `${key}: ✅ Present (Length: ${value.length})\n`;
    } else {
        output += `${key}: ❌ Missing or Empty\n`;
    }
});

fs.writeFileSync('env_check_output.txt', output);
console.log('Check complete. Results written to env_check_output.txt');
