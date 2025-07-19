import { ApiKey } from '@/types';
import { getApiKeys } from './database';
import { decryptApiKey, deriveKeyFromPassword, createVerificationHash, verifyMasterPassword } from './encryption';

// Backup data structure with encryption metadata
export interface BackupData {
  version: string;
  exportedAt: string;
  // Encryption metadata for backup recovery using original unlock password
  backupPasswordSalt?: string;
  backupPasswordHash?: string;
  backupKey?: string;
  backupKeyIv?: string;
  apiKeys: Array<{
    // All metadata is encrypted to protect user privacy
    encryptedLabel: string;
    encryptedService: string;
    encryptedEmail: string;
    encryptedNotes: string;
    encryptedApiKey: string;
    backupIv: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

// Legacy backup data structure for v1.0.0 and v2.0.0
export interface LegacyBackupData {
  version: string;
  exportedAt: string;
  backupPasswordSalt?: string;
  backupPasswordHash?: string;
  backupKey?: string;
  backupKeyIv?: string;
  apiKeys: Array<{
    label: string;
    service: string;
    email: string;
    notes: string;
    encryptedApiKey: string;
    backupIv: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

// Export API keys as JSON (encrypted with current unlock password)
export async function exportApiKeys(
  userId: string,
  decryptKey: (encryptedData: string, iv: string) => Promise<string>,
  currentUnlockPassword: string
): Promise<BackupData> {
  try {
    const apiKeys = await getApiKeys(userId);
    
    // Generate salt and derive key from current unlock password
    const backupSalt = crypto.getRandomValues(new Uint8Array(32));
    const backupDerivedKey = await deriveKeyFromPassword(currentUnlockPassword, backupSalt, userId);
    
    // Create verification hash for the unlock password
    const backupPasswordHash = await createVerificationHash(backupDerivedKey, backupSalt);
    
    // Create a backup-specific encryption key
    const backupKey = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    
    const encryptBackupData = async (data: string) => {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      const encryptedBuffer = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        backupKey,
        dataBuffer
      );
      
      return {
        encryptedData: btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer))),
        iv: btoa(String.fromCharCode(...iv))
      };
    };
    
    const encryptedKeys = await Promise.all(
      apiKeys.map(async (key) => {
        // Decrypt the API key from the database
        const decryptedApiKey = await decryptKey(key.encryptedData, key.iv);
        
        // Encrypt all metadata fields to protect user privacy
        const { encryptedData: encryptedLabel, iv: labelIv } = await encryptBackupData(key.label);
        const { encryptedData: encryptedService, iv: serviceIv } = await encryptBackupData(key.service);
        const { encryptedData: encryptedEmail, iv: emailIv } = await encryptBackupData(key.email || '');
        const { encryptedData: encryptedNotes, iv: notesIv } = await encryptBackupData(key.notes || '');
        const { encryptedData: encryptedApiKey, iv: apiKeyIv } = await encryptBackupData(decryptedApiKey);
        
        return {
          encryptedLabel,
          encryptedService,
          encryptedEmail,
          encryptedNotes,
          encryptedApiKey,
          backupIv: btoa(String.fromCharCode(...new Uint8Array([
            ...Uint8Array.from(atob(labelIv), c => c.charCodeAt(0)),
            ...Uint8Array.from(atob(serviceIv), c => c.charCodeAt(0)),
            ...Uint8Array.from(atob(emailIv), c => c.charCodeAt(0)),
            ...Uint8Array.from(atob(notesIv), c => c.charCodeAt(0)),
            ...Uint8Array.from(atob(apiKeyIv), c => c.charCodeAt(0))
          ]))),
          createdAt: key.createdAt.toDate().toISOString(),
          updatedAt: key.updatedAt.toDate().toISOString(),
        };
      })
    );

    // Export the backup key and encrypt it with the current unlock password
    const backupKeyExport = await crypto.subtle.exportKey('raw', backupKey);
    const backupKeyString = btoa(String.fromCharCode(...new Uint8Array(backupKeyExport)));
    
    // Encrypt the backup key with the current unlock password
    const backupKeyEncoder = new TextEncoder();
    const backupKeyData = backupKeyEncoder.encode(backupKeyString);
    const backupKeyIv = crypto.getRandomValues(new Uint8Array(12));
    
    const encryptedBackupKeyBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: backupKeyIv },
      backupDerivedKey,
      backupKeyData
    );

    const backupData: BackupData = {
      version: '2.1.0', // New version with encrypted metadata
      exportedAt: new Date().toISOString(),
      backupPasswordSalt: btoa(String.fromCharCode(...backupSalt)),
      backupPasswordHash: backupPasswordHash,
      backupKey: btoa(String.fromCharCode(...new Uint8Array(encryptedBackupKeyBuffer))),
      backupKeyIv: btoa(String.fromCharCode(...backupKeyIv)),
      apiKeys: encryptedKeys,
    };

    return backupData;
  } catch (error) {
    throw new Error(`Failed to export API keys: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Generate backup filename
export function generateBackupFilename(): string {
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 19).replace(/:/g, '-');
  return `zkkeynest-backup-${timestamp}.json`;
}

// Download backup file
export function downloadBackup(backupData: BackupData, filename?: string): void {
  const dataStr = JSON.stringify(backupData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || generateBackupFilename();
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

// Validate backup data structure
export function validateBackupData(data: any): data is BackupData | LegacyBackupData {
  if (!data || typeof data !== 'object') {
    return false;
  }

  if (!data.version || typeof data.version !== 'string') {
    return false;
  }

  if (!data.exportedAt || typeof data.exportedAt !== 'string') {
    return false;
  }

  // Check for backup password fields (required for v2.0.0+)
  if (data.version >= '2.0.0') {
    if (!data.backupPasswordSalt || typeof data.backupPasswordSalt !== 'string') {
      return false;
    }
    if (!data.backupPasswordHash || typeof data.backupPasswordHash !== 'string') {
      return false;
    }
    if (!data.backupKey || typeof data.backupKey !== 'string') {
      return false;
    }
    if (!data.backupKeyIv || typeof data.backupKeyIv !== 'string') {
      return false;
    }
  } else {
    // Backward compatibility for v1.0.0
  if (data.backupKey && typeof data.backupKey !== 'string') {
    return false;
  }
  if (data.backupKeyIv && typeof data.backupKeyIv !== 'string') {
    return false;
    }
  }

  if (!Array.isArray(data.apiKeys)) {
    return false;
  }

  // Validate each API key based on version
  for (const key of data.apiKeys) {
    if (data.version >= '2.1.0') {
      // New version with encrypted metadata
      if (!key.encryptedLabel || typeof key.encryptedLabel !== 'string') {
        return false;
      }
      if (!key.encryptedService || typeof key.encryptedService !== 'string') {
        return false;
      }
      if (!key.encryptedEmail || typeof key.encryptedEmail !== 'string') {
        return false;
      }
      if (!key.encryptedNotes || typeof key.encryptedNotes !== 'string') {
        return false;
      }
      if (!key.encryptedApiKey || typeof key.encryptedApiKey !== 'string') {
        return false;
      }
      if (!key.backupIv || typeof key.backupIv !== 'string') {
        return false;
      }
    } else {
      // Legacy versions with plain text metadata
    if (!key.label || typeof key.label !== 'string') {
      return false;
    }
    if (!key.service || typeof key.service !== 'string') {
      return false;
    }
    if (!key.encryptedApiKey || typeof key.encryptedApiKey !== 'string') {
      return false;
    }
    if (!key.backupIv || typeof key.backupIv !== 'string') {
      return false;
    }
    if (key.email && typeof key.email !== 'string') {
      return false;
    }
    if (key.notes && typeof key.notes !== 'string') {
      return false;
      }
    }
  }

  return true;
}

// Parse backup file
export function parseBackupFile(file: File): Promise<BackupData | LegacyBackupData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        if (validateBackupData(data)) {
          resolve(data);
        } else {
          reject(new Error('Invalid backup file format'));
        }
      } catch (error) {
        reject(new Error('Failed to parse backup file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read backup file'));
    };
    
    reader.readAsText(file);
  });
}

// Import API keys from backup with unlock password-based recovery
export async function importApiKeys(
  backupData: BackupData | LegacyBackupData,
  userId: string,
  originalUnlockPassword: string,
  encryptKey: (apiKey: string) => Promise<{ encryptedData: string; iv: string }>,
  createApiKey: (data: any) => Promise<string>,
  decryptKey?: (encryptedData: string, iv: string) => Promise<string> // Optional for legacy support
): Promise<{ imported: number; errors: string[] }> {
  const errors: string[] = [];
  let imported = 0;

  try {
    // Handle different backup versions
    if (backupData.version >= '2.1.0') {
      // New version with encrypted metadata
      const newBackupData = backupData as BackupData;
      if (!newBackupData.backupPasswordSalt || !newBackupData.backupPasswordHash || 
          !newBackupData.backupKey || !newBackupData.backupKeyIv) {
        throw new Error('Backup file is missing required encryption metadata');
      }

      // Verify the original unlock password using unified verification
      const isValidPassword = await verifyMasterPassword(
        originalUnlockPassword,
        userId,
        newBackupData.backupPasswordSalt,
        newBackupData.backupPasswordHash
      );
      
      if (!isValidPassword) {
        throw new Error('Incorrect unlock password. Please enter the password you used when creating this backup.');
      }

      // Derive the backup key for decryption
      const backupSalt = Uint8Array.from(atob(newBackupData.backupPasswordSalt), c => c.charCodeAt(0));
      const backupDerivedKey = await deriveKeyFromPassword(originalUnlockPassword, backupSalt, userId);

      // Decrypt the backup key
      const encryptedBackupKeyBuffer = Uint8Array.from(atob(newBackupData.backupKey), c => c.charCodeAt(0));
      const backupKeyIv = Uint8Array.from(atob(newBackupData.backupKeyIv), c => c.charCodeAt(0));
      
      const decryptedBackupKeyBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: backupKeyIv },
        backupDerivedKey,
        encryptedBackupKeyBuffer
      );
      
      const backupKeyString = new TextDecoder().decode(decryptedBackupKeyBuffer);
      const backupKeyBuffer = Uint8Array.from(atob(backupKeyString), c => c.charCodeAt(0));
      const backupKey = await crypto.subtle.importKey(
        'raw',
        backupKeyBuffer,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
      );

      // Decrypt each API key and metadata using the backup key
      for (const keyData of newBackupData.apiKeys) {
        try {
          // Decrypt all metadata fields
          const decryptBackupData = async (encryptedData: string, iv: string) => {
            const encryptedBuffer = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
            const ivBuffer = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
            
            const decryptedBuffer = await crypto.subtle.decrypt(
              { name: 'AES-GCM', iv: ivBuffer },
              backupKey,
              encryptedBuffer
            );
            
            return new TextDecoder().decode(decryptedBuffer);
          };

          // Extract IVs from the combined backupIv (5 IVs of 12 bytes each = 60 bytes total)
          const allIvs = Uint8Array.from(atob(keyData.backupIv), c => c.charCodeAt(0));
          const labelIv = allIvs.slice(0, 12);
          const serviceIv = allIvs.slice(12, 24);
          const emailIv = allIvs.slice(24, 36);
          const notesIv = allIvs.slice(36, 48);
          const apiKeyIv = allIvs.slice(48, 60);

          // Decrypt all fields
          const label = await decryptBackupData(keyData.encryptedLabel, btoa(String.fromCharCode(...labelIv)));
          const service = await decryptBackupData(keyData.encryptedService, btoa(String.fromCharCode(...serviceIv)));
          const email = await decryptBackupData(keyData.encryptedEmail, btoa(String.fromCharCode(...emailIv)));
          const notes = await decryptBackupData(keyData.encryptedNotes, btoa(String.fromCharCode(...notesIv)));
          const apiKey = await decryptBackupData(keyData.encryptedApiKey, btoa(String.fromCharCode(...apiKeyIv)));
          
          // Re-encrypt the API key for the database
          const { encryptedData, iv } = await encryptKey(apiKey);
          
          // Create the API key in the database
          await createApiKey({
            userId,
            label,
            service,
            email,
            notes,
            encryptedData,
            iv
          });
          
          imported++;
        } catch (error) {
          errors.push(`Failed to import API key: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    } else if (backupData.version >= '2.0.0') {
      // Version 2.0.0 with encrypted API keys but plain text metadata
      const legacyBackupData = backupData as LegacyBackupData;
      if (!legacyBackupData.backupPasswordSalt || !legacyBackupData.backupPasswordHash || 
          !legacyBackupData.backupKey || !legacyBackupData.backupKeyIv) {
        throw new Error('Backup file is missing required encryption metadata');
      }

      // Verify the original unlock password using unified verification
      const isValidPassword = await verifyMasterPassword(
        originalUnlockPassword,
        userId,
        legacyBackupData.backupPasswordSalt,
        legacyBackupData.backupPasswordHash
      );
      
      if (!isValidPassword) {
        throw new Error('Incorrect unlock password. Please enter the password you used when creating this backup.');
      }

      // Derive the backup key for decryption
      const backupSalt = Uint8Array.from(atob(legacyBackupData.backupPasswordSalt), c => c.charCodeAt(0));
      const backupDerivedKey = await deriveKeyFromPassword(originalUnlockPassword, backupSalt, userId);

      // Decrypt the backup key
      const encryptedBackupKeyBuffer = Uint8Array.from(atob(legacyBackupData.backupKey), c => c.charCodeAt(0));
      const backupKeyIv = Uint8Array.from(atob(legacyBackupData.backupKeyIv), c => c.charCodeAt(0));
      
      const decryptedBackupKeyBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: backupKeyIv },
        backupDerivedKey,
        encryptedBackupKeyBuffer
      );
      
      const backupKeyString = new TextDecoder().decode(decryptedBackupKeyBuffer);
      const backupKeyBuffer = Uint8Array.from(atob(backupKeyString), c => c.charCodeAt(0));
      const backupKey = await crypto.subtle.importKey(
        'raw',
        backupKeyBuffer,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
      );

      // Decrypt each API key using the backup key (metadata is plain text in v2.0.0)
      for (const keyData of legacyBackupData.apiKeys) {
        try {
          const encryptedBuffer = Uint8Array.from(atob(keyData.encryptedApiKey), c => c.charCodeAt(0));
          const ivBuffer = Uint8Array.from(atob(keyData.backupIv), c => c.charCodeAt(0));
          
          const decryptedBuffer = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: ivBuffer },
            backupKey,
            encryptedBuffer
          );
          
          const decryptedApiKey = new TextDecoder().decode(decryptedBuffer);
          
          // Re-encrypt for the database
          const { encryptedData, iv } = await encryptKey(decryptedApiKey);
          
          // Create the API key in the database
          await createApiKey({
            userId,
            label: keyData.label,
            service: keyData.service,
            email: keyData.email || '',
            notes: keyData.notes || '',
            encryptedData,
            iv
          });
          
          imported++;
        } catch (error) {
          errors.push(`Failed to import "${keyData.label}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    } else {
      // Legacy v1.0.0 backup format - requires current unlock password
      const legacyBackupData = backupData as LegacyBackupData;
      if (!decryptKey) {
        throw new Error('Legacy backup format detected. This backup requires your current unlock password to import.');
      }
      
      if (!legacyBackupData.backupKey || !legacyBackupData.backupKeyIv) {
        throw new Error('Legacy backup file is missing encryption key');
      }
      
      // Create a function to decrypt backup keys for legacy format
      const decryptBackupKey = async (encryptedData: string, iv: string) => {
        // First decrypt the backup key using the user's unlock password
        const backupKeyString = await decryptKey(legacyBackupData.backupKey!, legacyBackupData.backupKeyIv!);
        const backupKeyBuffer = Uint8Array.from(atob(backupKeyString), c => c.charCodeAt(0));
        const backupKey = await crypto.subtle.importKey(
          'raw',
          backupKeyBuffer,
          { name: 'AES-GCM', length: 256 },
          false,
          ['decrypt']
        );
        
        // Now decrypt the API key using the backup key
        const encryptedBuffer = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
        const ivBuffer = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
        
        const decryptedBuffer = await crypto.subtle.decrypt(
          { name: 'AES-GCM', iv: ivBuffer },
          backupKey,
          encryptedBuffer
        );
        
        const decoder = new TextDecoder();
        return decoder.decode(decryptedBuffer);
      };
      
      // Import each API key using legacy decryption
      for (const keyData of legacyBackupData.apiKeys) {
    try {
      // Decrypt the API key from the backup
      const decryptedApiKey = await decryptBackupKey(keyData.encryptedApiKey, keyData.backupIv);
      
      // Re-encrypt for the database
      const { encryptedData, iv } = await encryptKey(decryptedApiKey);
      
      // Create the API key in the database
      await createApiKey({
        userId,
        label: keyData.label,
        service: keyData.service,
        email: keyData.email || '',
        notes: keyData.notes || '',
        encryptedData,
        iv
      });
      
      imported++;
    } catch (error) {
      errors.push(`Failed to import "${keyData.label}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
      }
    }
  } catch (error) {
    errors.push(`Backup import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return { imported, errors };
}

// Get backup statistics
export function getBackupStats(backupData: BackupData | LegacyBackupData): {
  totalKeys: number;
  services: string[];
  exportDate: Date;
} {
  // For encrypted metadata (v2.1.0+), we can't extract services without decryption
  // For legacy formats, we can extract services from plain text metadata
  let services: string[] = [];
  
  if (backupData.version >= '2.1.0') {
    // New format with encrypted metadata - can't extract services without decryption
    services = [];
  } else {
    // Legacy format with plain text metadata
    const legacyData = backupData as LegacyBackupData;
    services = [...new Set(legacyData.apiKeys.map(key => key.service))];
  }
  
  return {
    totalKeys: backupData.apiKeys.length,
    services,
    exportDate: new Date(backupData.exportedAt)
  };
}
