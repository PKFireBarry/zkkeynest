// Encryption utilities for zKkeynest
// All encryption/decryption happens client-side using Web Crypto API

export interface EncryptedData {
  encryptedData: string;
  iv: string;
}

export interface VerificationData {
  salt: string;
  verificationHash: string;
}

export interface ShareData {
  encryptedData: string;
  shareKey: string;
  iv: string;
}

// Key derivation using PBKDF2
export async function deriveKeyFromPassword(
  password: string,
  salt: Uint8Array,
  userId: string
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  const userIdBuffer = encoder.encode(userId);
  
  // Combine password and user ID
  const combined = new Uint8Array(passwordBuffer.length + userIdBuffer.length);
  combined.set(passwordBuffer);
  combined.set(userIdBuffer, passwordBuffer.length);
  
  // Derive key using PBKDF2
  const baseKey = await crypto.subtle.importKey(
    'raw',
    combined,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Create verification hash
export async function createVerificationHash(
  derivedKey: CryptoKey,
  salt: Uint8Array
): Promise<string> {
  // Create a deterministic verification hash
  const encoder = new TextEncoder();
  const verificationString = 'verification_hash_for_zkkeynest';
  const verificationData = encoder.encode(verificationString);
  
  // Use a fixed IV for deterministic hashing
  const fixedIV = new Uint8Array(12); // All zeros
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: fixedIV
    },
    derivedKey,
    verificationData
  );
  
  // Create hash from encrypted data
  const hashBuffer = await crypto.subtle.digest('SHA-256', encryptedBuffer);
  
  // Combine with salt for additional security
  const combined = new Uint8Array(hashBuffer.byteLength + salt.byteLength);
  combined.set(new Uint8Array(hashBuffer));
  combined.set(salt, hashBuffer.byteLength);
  
  return btoa(String.fromCharCode(...combined));
}

// Encrypt API key
export async function encryptApiKey(
  apiKey: string,
  derivedKey: CryptoKey
): Promise<EncryptedData> {
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  
  // Generate random IV
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Encrypt the API key
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    derivedKey,
    data
  );
  
  return {
    encryptedData: btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer))),
    iv: btoa(String.fromCharCode(...iv))
  };
}

// Decrypt API key
export async function decryptApiKey(
  encryptedData: string,
  iv: string,
  derivedKey: CryptoKey
): Promise<string> {
  const encryptedBuffer = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
  const ivBuffer = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
  
  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivBuffer
    },
    derivedKey,
    encryptedBuffer
  );
  
  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}

// Generate share key for one-time sharing
export async function generateShareKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256
    },
    true,
    ['encrypt', 'decrypt']
  );
}

// Export share key to string
export async function exportShareKey(shareKey: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('raw', shareKey);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

// Import share key from string
export async function importShareKey(shareKeyString: string): Promise<CryptoKey> {
  const keyData = Uint8Array.from(atob(shareKeyString), c => c.charCodeAt(0));
  return crypto.subtle.importKey(
    'raw',
    keyData,
    {
      name: 'AES-GCM',
      length: 256
    },
    false,
    ['encrypt', 'decrypt']
  );
}

// Encrypt API key for sharing
export async function encryptForSharing(
  apiKey: string,
  shareKey: CryptoKey
): Promise<ShareData> {
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  
  // Generate random IV
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Encrypt the API key with share key
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    shareKey,
    data
  );
  
  // Export share key for storage
  const exportedShareKey = await exportShareKey(shareKey);
  
  return {
    encryptedData: btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer))),
    shareKey: exportedShareKey,
    iv: btoa(String.fromCharCode(...iv))
  };
}

// Decrypt shared API key
export async function decryptSharedApiKey(
  encryptedData: string,
  shareKeyString: string,
  iv: string
): Promise<string> {
  const shareKey = await importShareKey(shareKeyString);
  const encryptedBuffer = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
  const ivBuffer = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
  
  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivBuffer
    },
    shareKey,
    encryptedBuffer
  );
  
  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}

// Setup master password
export async function setupMasterPassword(
  password: string,
  userId: string
): Promise<VerificationData> {
  // Generate random salt
  const salt = crypto.getRandomValues(new Uint8Array(32));
  
  // Derive encryption key
  const derivedKey = await deriveKeyFromPassword(password, salt, userId);
  
  // Create verification hash
  const verificationHash = await createVerificationHash(derivedKey, salt);
  
  return {
    salt: btoa(String.fromCharCode(...salt)),
    verificationHash
  };
}

// Verify master password
export async function verifyMasterPassword(
  password: string,
  userId: string,
  storedSalt: string,
  storedHash: string
): Promise<boolean> {
  try {
    const salt = Uint8Array.from(atob(storedSalt), c => c.charCodeAt(0));
    const derivedKey = await deriveKeyFromPassword(password, salt, userId);
    const verificationHash = await createVerificationHash(derivedKey, salt);
    
    return verificationHash === storedHash;
  } catch (error) {
    console.error('Error verifying master password:', error);
    return false;
  }
}

 