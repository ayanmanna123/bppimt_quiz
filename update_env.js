const fs = require('fs');
const path = require('path');
const json = fs.readFileSync('backend/firebase-service-account.json', 'utf8');
const envPath = 'backend/.env';
let env = fs.readFileSync(envPath, 'utf8');

// Remove existing Firebase related keys to avoid duplicates
env = env.split('\n').filter(line => 
    !line.startsWith('FIREBASE_SERVICE_ACCOUNT_KEY=') && 
    !line.startsWith('FIREBASE_PRIVATE_KEY=') && 
    !line.startsWith('FIREBASE_PROJECT_ID=') && 
    !line.startsWith('FIREBASE_CLIENT_EMAIL=')
).join('\n');

env += `\nFIREBASE_SERVICE_ACCOUNT_KEY='${json.trim()}'\n`;
fs.writeFileSync(envPath, env.trim() + '\n');
console.log('Successfully updated .env with FIREBASE_SERVICE_ACCOUNT_KEY');
