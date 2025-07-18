import { ApiKey, User } from '@/types';
import { getApiKeys, getUser, updateApiKey, updateUserMasterPassword } from './database';

// Migration version tracking
export interface MigrationVersion {
  version: string;
  appliedAt: string;
  description: string;
}

// Migration result
export interface MigrationResult {
  success: boolean;
  migrated: number;
  errors: string[];
  version: string;
}

// Migration functions
export interface MigrationFunction {
  version: string;
  description: string;
  migrate: (userId: string) => Promise<MigrationResult>;
}

// Migration registry
const MIGRATIONS: MigrationFunction[] = [
  {
    version: '1.0.0',
    description: 'Initial schema - no migration needed',
    migrate: async () => ({
      success: true,
      migrated: 0,
      errors: [],
      version: '1.0.0'
    })
  },
  {
    version: '1.1.0',
    description: 'Add email field to API keys',
    migrate: async (userId: string) => {
      const errors: string[] = [];
      let migrated = 0;
      
      try {
        const apiKeys = await getApiKeys(userId);
        
        for (const apiKey of apiKeys) {
          try {
            // Check if email field exists, if not add it
            if (!apiKey.email) {
              await updateApiKey(apiKey.id, {
                ...apiKey,
                email: ''
              });
              migrated++;
            }
          } catch (error) {
            errors.push(`Failed to migrate API key ${apiKey.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
        
        return {
          success: errors.length === 0,
          migrated,
          errors,
          version: '1.1.0'
        };
      } catch (error) {
        return {
          success: false,
          migrated: 0,
          errors: [`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
          version: '1.1.0'
        };
      }
    }
  },
  {
    version: '1.2.0',
    description: 'Add notes field to API keys',
    migrate: async (userId: string) => {
      const errors: string[] = [];
      let migrated = 0;
      
      try {
        const apiKeys = await getApiKeys(userId);
        
        for (const apiKey of apiKeys) {
          try {
            // Check if notes field exists, if not add it
            if (!apiKey.notes) {
              await updateApiKey(apiKey.id, {
                ...apiKey,
                notes: ''
              });
              migrated++;
            }
          } catch (error) {
            errors.push(`Failed to migrate API key ${apiKey.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
        
        return {
          success: errors.length === 0,
          migrated,
          errors,
          version: '1.2.0'
        };
      } catch (error) {
        return {
          success: false,
          migrated: 0,
          errors: [`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
          version: '1.2.0'
        };
      }
    }
  }
];

// Get current schema version
export function getCurrentSchemaVersion(): string {
  return MIGRATIONS[MIGRATIONS.length - 1].version;
}

// Get pending migrations for a user
export async function getPendingMigrations(userId: string): Promise<MigrationFunction[]> {
  try {
    const user = await getUser(userId);
    const currentVersion = user?.schemaVersion || '1.0.0';
    
    return MIGRATIONS.filter(migration => 
      migration.version > currentVersion
    );
  } catch (error) {
    console.error('Error getting pending migrations:', error);
    return [];
  }
}

// Run migrations for a user
export async function runMigrations(userId: string): Promise<MigrationResult[]> {
  const pendingMigrations = await getPendingMigrations(userId);
  const results: MigrationResult[] = [];
  
  for (const migration of pendingMigrations) {
    try {
      console.log(`Running migration ${migration.version}: ${migration.description}`);
      const result = await migration.migrate(userId);
      results.push(result);
      
      if (!result.success) {
        console.error(`Migration ${migration.version} failed:`, result.errors);
        break; // Stop on first failure
      }
      
      console.log(`Migration ${migration.version} completed successfully`);
    } catch (error) {
      console.error(`Migration ${migration.version} failed:`, error);
      results.push({
        success: false,
        migrated: 0,
        errors: [`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        version: migration.version
      });
      break;
    }
  }
  
  return results;
}

// Validate data integrity
export async function validateDataIntegrity(userId: string): Promise<{
  valid: boolean;
  issues: string[];
}> {
  const issues: string[] = [];
  
  try {
    const apiKeys = await getApiKeys(userId);
    
    for (const apiKey of apiKeys) {
      // Check required fields
      if (!apiKey.label || apiKey.label.trim() === '') {
        issues.push(`API key ${apiKey.id} has empty label`);
      }
      
      if (!apiKey.service || apiKey.service.trim() === '') {
        issues.push(`API key ${apiKey.id} has empty service`);
      }
      
      if (!apiKey.encryptedData || apiKey.encryptedData.trim() === '') {
        issues.push(`API key ${apiKey.id} has empty encrypted data`);
      }
      
      if (!apiKey.iv || apiKey.iv.trim() === '') {
        issues.push(`API key ${apiKey.id} has empty IV`);
      }
      
      // Check field lengths
      if (apiKey.label && apiKey.label.length > 100) {
        issues.push(`API key ${apiKey.id} has label longer than 100 characters`);
      }
      
      if (apiKey.service && apiKey.service.length > 50) {
        issues.push(`API key ${apiKey.id} has service longer than 50 characters`);
      }
      
      if (apiKey.email && apiKey.email.length > 255) {
        issues.push(`API key ${apiKey.id} has email longer than 255 characters`);
      }
      
      if (apiKey.notes && apiKey.notes.length > 500) {
        issues.push(`API key ${apiKey.id} has notes longer than 500 characters`);
      }
    }
    
    return {
      valid: issues.length === 0,
      issues
    };
  } catch (error) {
    return {
      valid: false,
      issues: [`Failed to validate data integrity: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
}

// Repair data issues
export async function repairDataIssues(userId: string): Promise<{
  repaired: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let repaired = 0;
  
  try {
    const apiKeys = await getApiKeys(userId);
    
    for (const apiKey of apiKeys) {
      try {
        const updates: Partial<ApiKey> = {};
        let needsUpdate = false;
        
        // Fix empty labels
        if (!apiKey.label || apiKey.label.trim() === '') {
          updates.label = `API Key ${apiKey.id.slice(0, 8)}`;
          needsUpdate = true;
        }
        
        // Fix empty services
        if (!apiKey.service || apiKey.service.trim() === '') {
          updates.service = 'Unknown';
          needsUpdate = true;
        }
        
        // Truncate long fields
        if (apiKey.label && apiKey.label.length > 100) {
          updates.label = apiKey.label.substring(0, 100);
          needsUpdate = true;
        }
        
        if (apiKey.service && apiKey.service.length > 50) {
          updates.service = apiKey.service.substring(0, 50);
          needsUpdate = true;
        }
        
        if (apiKey.email && apiKey.email.length > 255) {
          updates.email = apiKey.email.substring(0, 255);
          needsUpdate = true;
        }
        
        if (apiKey.notes && apiKey.notes.length > 500) {
          updates.notes = apiKey.notes.substring(0, 500);
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          await updateApiKey(apiKey.id, updates);
          repaired++;
        }
      } catch (error) {
        errors.push(`Failed to repair API key ${apiKey.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    return { repaired, errors };
  } catch (error) {
    return {
      repaired: 0,
      errors: [`Failed to repair data issues: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
}

// Get migration history
export function getMigrationHistory(): MigrationFunction[] {
  return MIGRATIONS;
}

// Check if user needs migration
export async function needsMigration(userId: string): Promise<boolean> {
  const pendingMigrations = await getPendingMigrations(userId);
  return pendingMigrations.length > 0;
} 