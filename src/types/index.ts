import { Timestamp } from 'firebase/firestore';

// User interface
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  subscription: 'free' | 'pro' | 'team';
  masterPasswordSalt?: string;
  masterPasswordHash?: string;
  sessionTimeout?: number;
  stripeCustomerId?: string;
  schemaVersion?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// API Key interface
export interface ApiKey {
  id: string;
  userId: string;
  label: string;
  service: string;
  email: string;
  notes: string;
  encryptedData: string;
  iv: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  rotationReminder?: RotationReminder;
  tags?: string[]; // Added for tags system
  category?: string; // Added for categories system
  folderId?: string; // Added for folder/organization system
  entryType?: 'single' | 'env'; // 'single' for normal API key, 'env' for .env file
}

// Rotation reminder interface
export interface RotationReminder {
  enabled: boolean;
  frequency: '30' | '60' | '90' | '180' | '365'; // days
  lastRotated?: Timestamp;
  nextReminder?: Timestamp;
  isOverdue: boolean;
}

// Share interface
export interface Share {
  id: string;
  apiKeyId: string;
  createdBy: string;
  encryptedData: string;
  shareKey: string;
  iv: string;
  expiresAt: Timestamp;
  used: boolean;
  createdAt: Timestamp;
  sharedByEmail?: string;
}

// Vault state interface
export interface VaultState {
  isUnlocked: boolean;
  derivedKey: CryptoKey | null;
  unlockTime: number | null;
  sessionTimeout: number;
}

// Security error types
export enum SecurityError {
  INVALID_MASTER_PASSWORD = 'INVALID_MASTER_PASSWORD',
  VAULT_LOCKED = 'VAULT_LOCKED',
  SHARE_EXPIRED = 'SHARE_EXPIRED',
  SHARE_ALREADY_USED = 'SHARE_ALREADY_USED',
  ENCRYPTION_FAILED = 'ENCRYPTION_FAILED',
  DECRYPTION_FAILED = 'DECRYPTION_FAILED'
}

// Security exception class
export class SecurityException extends Error {
  constructor(
    public type: SecurityError,
    message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'SecurityException';
  }
}

// Subscription plans
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  maxKeys: number;
}

// Form schemas
export interface CreateApiKeyForm {
  label: string;
  service: string;
  email: string;
  apiKey: string;
  notes: string;
}

export interface MasterPasswordForm {
  password: string;
  confirmPassword: string;
}

export interface UnlockVaultForm {
  password: string;
}

// Service options for API keys
export const SERVICE_OPTIONS = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'github', label: 'GitHub' },
  { value: 'stripe', label: 'Stripe' },
  { value: 'aws', label: 'AWS' },
  { value: 'google', label: 'Google Cloud' },
  { value: 'azure', label: 'Azure' },
  { value: 'heroku', label: 'Heroku' },
  { value: 'digitalocean', label: 'DigitalOcean' },
  { value: 'vercel', label: 'Vercel' },
  { value: 'netlify', label: 'Netlify' },
  { value: 'other', label: 'Other' },
] as const;

export type ServiceType = typeof SERVICE_OPTIONS[number]['value']; 

// Folder interface for organization features
export interface Folder {
  id: string;
  userId: string;
  name: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Navigation interfaces
export interface NavigationLink {
  href: string;
  label: string;
  id: string;
}

export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navigationLinks: NavigationLink[];
} 