import { ApiKey } from '@/types';
import { getApiKeys } from './database';
import { decryptApiKey } from './encryption';

// Backup data structure
export interface BackupData {
  version: string;
  exportedAt: string;
  backupKey?: string;
  backupKeyIv?: string;
  apiKeys: Array<{
    label: string;
    service: string;
    email: string;
    encryptedApiKey: string;
    backupIv: string;
    notes: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

// Export API keys as JSON (encrypted)
export async function exportApiKeys(
  userId: string,
  decryptKey: (encryptedData: string, iv: string) => Promise<string>,
  encryptBackupKey: (data: string) => Promise<{ encryptedData: string; iv: string }>
): Promise<BackupData> {
  try {
    const apiKeys = await getApiKeys(userId);
    
    const encryptedKeys = await Promise.all(
      apiKeys.map(async (key) => {
        // Decrypt the API key from the database
        const decryptedApiKey = await decryptKey(key.encryptedData, key.iv);
        
        // Re-encrypt for the backup file using a different key
        const { encryptedData: backupEncryptedData, iv: backupIv } = await encryptBackupKey(decryptedApiKey);
        
        return {
          label: key.label,
          service: key.service,
          email: key.email,
          encryptedApiKey: backupEncryptedData,
          backupIv: backupIv,
          notes: key.notes,
          createdAt: key.createdAt.toDate().toISOString(),
          updatedAt: key.updatedAt.toDate().toISOString(),
        };
      })
    );

    const backupData: BackupData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
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
export function validateBackupData(data: any): data is BackupData {
  if (!data || typeof data !== 'object') {
    return false;
  }

  if (!data.version || typeof data.version !== 'string') {
    return false;
  }

  if (!data.exportedAt || typeof data.exportedAt !== 'string') {
    return false;
  }

  // Check for backup key fields (optional for backward compatibility)
  if (data.backupKey && typeof data.backupKey !== 'string') {
    return false;
  }
  if (data.backupKeyIv && typeof data.backupKeyIv !== 'string') {
    return false;
  }

  if (!Array.isArray(data.apiKeys)) {
    return false;
  }

  // Validate each API key
  for (const key of data.apiKeys) {
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

  return true;
}

// Parse backup file
export function parseBackupFile(file: File): Promise<BackupData> {
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

// Import API keys from backup
export async function importApiKeys(
  backupData: BackupData,
  userId: string,
  decryptBackupKey: (encryptedData: string, iv: string) => Promise<string>,
  encryptKey: (apiKey: string) => Promise<{ encryptedData: string; iv: string }>,
  createApiKey: (data: any) => Promise<string>
): Promise<{ imported: number; errors: string[] }> {
  const errors: string[] = [];
  let imported = 0;

  for (const keyData of backupData.apiKeys) {
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

  return { imported, errors };
}

// Get backup statistics
export function getBackupStats(backupData: BackupData): {
  totalKeys: number;
  services: string[];
  exportDate: Date;
} {
  const services = [...new Set(backupData.apiKeys.map(key => key.service))];
  
  return {
    totalKeys: backupData.apiKeys.length,
    services,
    exportDate: new Date(backupData.exportedAt)
  };
} 