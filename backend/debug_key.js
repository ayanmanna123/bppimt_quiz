import dotenv from 'dotenv';
dotenv.config({ path: 'backend/.env' });

const key = process.env.FIREBASE_PRIVATE_KEY;
console.log('Original Key Starts With:', key.substring(0, 30));
console.log('Includes \\n (literal):', key.includes('\\n'));
console.log('Includes \n (newline):', key.includes('\n'));

const fixedKey = key.includes('\\n') ? key.replace(/\\n/g, '\n') : key;
console.log('Fixed Key Starts With:', fixedKey.substring(0, 30));
console.log('Final Key Lines:', fixedKey.split('\n').length);
