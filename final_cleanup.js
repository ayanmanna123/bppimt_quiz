const fs = require('fs');
const envPath = 'backend/.env';
const jsonPath = 'backend/firebase-service-account.json';

const originalEnv = fs.readFileSync(envPath, 'utf8');
const jsonContent = fs.readFileSync(jsonPath, 'utf8');
const base64Key = Buffer.from(jsonContent).toString('base64');

const cleanLines = originalEnv.split('\n').filter(line => {
    const trimmed = line.trim();
    // Keep lines that are not Firebase-related or corrupted fragments
    return trimmed && 
           !trimmed.startsWith('FIREBASE_') && 
           !trimmed.startsWith('"') && 
           !trimmed.startsWith('}') && 
           !trimmed.includes(': "');
});

const newEnv = cleanLines.join('\n') + '\n\nFIREBASE_SERVICE_ACCOUNT_KEY=' + base64Key + '\n';
fs.writeFileSync(envPath, newEnv);
console.log('Final clean .env written with Base64 key');
