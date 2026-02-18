import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

/**
 * Encrypts text using a master key and an optional user-specific salt.
 * @param {string} text - The text to encrypt.
 * @param {string} userSalt - Optional salt (e.g., user Auth0 ID) to derive a per-user key.
 * @returns {string} - The encrypted text in format: iv:authTag:encryptedText
 */
export const encrypt = (text, userSalt = '') => {
    const masterKey = process.env.ENCRYPTION_KEY;
    if (!masterKey) {
        throw new Error('ENCRYPTION_KEY is not defined in environment variables');
    }

    // Derive a 32-byte key from the master key and salt
    // We use scrypt for key derivation
    const key = crypto.scryptSync(masterKey, userSalt, 32);
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
};

/**
 * Decrypts text using a master key and an optional user-specific salt.
 * @param {string} encryptedData - The encrypted data in format: iv:authTag:encryptedText
 * @param {string} userSalt - Optional salt (e.g., user Auth0 ID) used during encryption.
 * @returns {string} - The decrypted text.
 */
export const decrypt = (encryptedData, userSalt = '') => {
    const masterKey = process.env.ENCRYPTION_KEY;
    if (!masterKey) {
        throw new Error('ENCRYPTION_KEY is not defined in environment variables');
    }

    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
    }

    const [ivHex, authTagHex, encryptedText] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const key = crypto.scryptSync(masterKey, userSalt, 32);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
};
