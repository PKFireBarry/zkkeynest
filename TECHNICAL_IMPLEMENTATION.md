# zKkeynest Technical Implementation Guide

## Security Architecture Overview

### Zero-Knowledge Design
- All encryption/decryption happens client-side
- Server never sees plaintext API keys
- Master password never leaves the browser
- Verification only through hashed values

## Encryption Implementation

### 1. Master Password Setup

```typescript
// Key derivation using PBKDF2
async function deriveKeyFromPassword(
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
```

### 2. Verification Hash Creation

```typescript
async function createVerificationHash(
  derivedKey: CryptoKey,
  salt: Uint8Array
): Promise<string> {
  // Create a verification hash from the derived key
  const keyBuffer = await crypto.subtle.exportKey('raw', derivedKey);
  const hashBuffer = await crypto.subtle.digest('SHA-256', keyBuffer);
  
  // Combine with salt for additional security
  const combined = new Uint8Array(hashBuffer.byteLength + salt.byteLength);
  combined.set(new Uint8Array(hashBuffer));
  combined.set(salt, hashBuffer.byteLength);
  
  return btoa(String.fromCharCode(...combined));
}
```

### 3. API Key Encryption

```typescript
async function encryptApiKey(
  apiKey: string,
  derivedKey: CryptoKey
): Promise<{ encryptedData: string; iv: string }> {
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
```

### 4. API Key Decryption

```typescript
async function decryptApiKey(
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
```

## Master Password Flow Implementation

### 1. Initial Setup

```typescript
async function setupMasterPassword(
  password: string,
  userId: string
): Promise<{
  salt: string;
  verificationHash: string;
}> {
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
```

### 2. Password Verification

```typescript
async function verifyMasterPassword(
  password: string,
  userId: string,
  storedSalt: string,
  storedHash: string
): Promise<boolean> {
  const salt = Uint8Array.from(atob(storedSalt), c => c.charCodeAt(0));
  const derivedKey = await deriveKeyFromPassword(password, salt, userId);
  const verificationHash = await createVerificationHash(derivedKey, salt);
  
  return verificationHash === storedHash;
}
```

## One-Time Sharing Implementation

### 1. Share Creation

```typescript
async function createShare(
  apiKey: string,
  expiresIn: number = 24 * 60 * 60 * 1000 // 24 hours
): Promise<{
  shareId: string;
  shareUrl: string;
  expiresAt: Date;
}> {
  // Generate unique share key
  const shareKey = crypto.getRandomValues(new Uint8Array(32));
  const shareCryptoKey = await crypto.subtle.importKey(
    'raw',
    shareKey,
    'AES-GCM',
    false,
    ['encrypt', 'decrypt']
  );
  
  // Encrypt API key with share key
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    shareCryptoKey,
    data
  );
  
  const shareId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + expiresIn);
  
  // Store share data in Firestore
  await addDoc(collection(db, 'shares'), {
    id: shareId,
    encryptedData: btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer))),
    iv: btoa(String.fromCharCode(...iv)),
    shareKey: btoa(String.fromCharCode(...shareKey)),
    expiresAt,
    used: false,
    createdAt: serverTimestamp()
  });
  
  return {
    shareId,
    shareUrl: `${window.location.origin}/share/${shareId}`,
    expiresAt
  };
}
```

### 2. Share Access

```typescript
async function accessShare(
  shareId: string,
  pin?: string
): Promise<{ apiKey: string; metadata: any } | null> {
  // Get share data from Firestore
  const shareDoc = await getDoc(doc(db, 'shares', shareId));
  
  if (!shareDoc.exists()) {
    throw new Error('Share not found');
  }
  
  const shareData = shareDoc.data();
  
  // Check if expired
  if (shareData.expiresAt.toDate() < new Date()) {
    throw new Error('Share has expired');
  }
  
  // Check if already used
  if (shareData.used) {
    throw new Error('Share has already been used');
  }
  
  // Decrypt API key
  const shareKey = Uint8Array.from(atob(shareData.shareKey), c => c.charCodeAt(0));
  const shareCryptoKey = await crypto.subtle.importKey(
    'raw',
    shareKey,
    'AES-GCM',
    false,
    ['encrypt', 'decrypt']
  );
  
  const encryptedBuffer = Uint8Array.from(atob(shareData.encryptedData), c => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(shareData.iv), c => c.charCodeAt(0));
  
  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    shareCryptoKey,
    encryptedBuffer
  );
  
  const decoder = new TextDecoder();
  const apiKey = decoder.decode(decryptedBuffer);
  
  // Mark as used
  await updateDoc(doc(db, 'shares', shareId), {
    used: true,
    usedAt: serverTimestamp()
  });
  
  return {
    apiKey,
    metadata: {
      createdAt: shareData.createdAt,
      expiresAt: shareData.expiresAt
    }
  };
}
```

## Firebase Security Rules

### Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // API keys belong to users
    match /apiKeys/{keyId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // Shares can be read by anyone with the link
    match /shares/{shareId} {
      allow read: if true; // Anyone can read share metadata
      allow write: if request.auth != null; // Only authenticated users can create shares
    }
  }
}
```

## Session Management

### Vault Unlock State

```typescript
interface VaultState {
  isUnlocked: boolean;
  derivedKey: CryptoKey | null;
  unlockTime: number | null;
  sessionTimeout: number; // 30 minutes default
}

// Store vault state in memory (never persisted)
let vaultState: VaultState = {
  isUnlocked: false,
  derivedKey: null,
  unlockTime: null,
  sessionTimeout: 30 * 60 * 1000 // 30 minutes
};

// Check if vault is still unlocked
function isVaultUnlocked(): boolean {
  if (!vaultState.isUnlocked || !vaultState.unlockTime) {
    return false;
  }
  
  const now = Date.now();
  const timeSinceUnlock = now - vaultState.unlockTime;
  
  if (timeSinceUnlock > vaultState.sessionTimeout) {
    // Auto-lock vault
    vaultState.isUnlocked = false;
    vaultState.derivedKey = null;
    vaultState.unlockTime = null;
    return false;
  }
  
  return true;
}
```

## Error Handling

### Security Error Types

```typescript
enum SecurityError {
  INVALID_MASTER_PASSWORD = 'INVALID_MASTER_PASSWORD',
  VAULT_LOCKED = 'VAULT_LOCKED',
  SHARE_EXPIRED = 'SHARE_EXPIRED',
  SHARE_ALREADY_USED = 'SHARE_ALREADY_USED',
  ENCRYPTION_FAILED = 'ENCRYPTION_FAILED',
  DECRYPTION_FAILED = 'DECRYPTION_FAILED'
}

class SecurityException extends Error {
  constructor(
    public type: SecurityError,
    message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'SecurityException';
  }
}
```

## Performance Optimizations

### Key Caching

```typescript
// Cache derived keys in memory for session
const keyCache = new Map<string, CryptoKey>();

async function getDerivedKey(
  password: string,
  userId: string,
  salt: string
): Promise<CryptoKey> {
  const cacheKey = `${userId}:${salt}`;
  
  if (keyCache.has(cacheKey)) {
    return keyCache.get(cacheKey)!;
  }
  
  const saltBuffer = Uint8Array.from(atob(salt), c => c.charCodeAt(0));
  const derivedKey = await deriveKeyFromPassword(password, saltBuffer, userId);
  
  keyCache.set(cacheKey, derivedKey);
  return derivedKey;
}
```

### Batch Operations

```typescript
async function decryptMultipleKeys(
  encryptedKeys: Array<{ id: string; encryptedData: string; iv: string }>,
  derivedKey: CryptoKey
): Promise<Array<{ id: string; apiKey: string }>> {
  const promises = encryptedKeys.map(async (key) => {
    try {
      const apiKey = await decryptApiKey(key.encryptedData, key.iv, derivedKey);
      return { id: key.id, apiKey };
    } catch (error) {
      console.error(`Failed to decrypt key ${key.id}:`, error);
      return { id: key.id, apiKey: null };
    }
  });
  
  return Promise.all(promises);
}
```

## Testing Security Implementation

### Unit Tests

```typescript
describe('Encryption Utilities', () => {
  test('should encrypt and decrypt API key correctly', async () => {
    const password = 'test-password';
    const userId = 'test-user';
    const apiKey = 'sk-test1234567890abcdef';
    
    const salt = crypto.getRandomValues(new Uint8Array(32));
    const derivedKey = await deriveKeyFromPassword(password, salt, userId);
    
    const { encryptedData, iv } = await encryptApiKey(apiKey, derivedKey);
    const decryptedKey = await decryptApiKey(encryptedData, iv, derivedKey);
    
    expect(decryptedKey).toBe(apiKey);
  });
  
  test('should reject incorrect master password', async () => {
    const correctPassword = 'correct-password';
    const wrongPassword = 'wrong-password';
    const userId = 'test-user';
    
    const salt = crypto.getRandomValues(new Uint8Array(32));
    const correctKey = await deriveKeyFromPassword(correctPassword, salt, userId);
    const correctHash = await createVerificationHash(correctKey, salt);
    
    const isValid = await verifyMasterPassword(
      wrongPassword,
      userId,
      btoa(String.fromCharCode(...salt)),
      correctHash
    );
    
    expect(isValid).toBe(false);
  });
});
```

## Security Best Practices

### Implementation Checklist

- [ ] Use Web Crypto API for all cryptographic operations
- [ ] Generate cryptographically secure random values
- [ ] Never store master passwords or derived keys
- [ ] Implement proper session management
- [ ] Use HTTPS for all communications
- [ ] Validate all inputs and outputs
- [ ] Implement rate limiting for authentication attempts
- [ ] Log security events (without sensitive data)
- [ ] Regular security audits and penetration testing
- [ ] Keep dependencies updated
- [ ] Implement proper error handling without information leakage 