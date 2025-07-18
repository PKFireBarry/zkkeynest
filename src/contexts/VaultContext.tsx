'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { 
  setupMasterPassword, 
  verifyMasterPassword, 
  deriveKeyFromPassword,
  encryptApiKey,
  decryptApiKey,
  VerificationData
} from '@/lib/encryption';
import { VaultState, SecurityError, SecurityException } from '@/types';

interface VaultContextType {
  vaultState: VaultState;
  isUnlocked: boolean;
  derivedKey: CryptoKey | null;
  setupVault: (password: string) => Promise<void>;
  unlockVault: (password: string) => Promise<boolean>;
  lockVault: () => void;
  encryptKey: (apiKey: string) => Promise<{ encryptedData: string; iv: string }>;
  decryptKey: (encryptedData: string, iv: string) => Promise<string>;
  checkVaultTimeout: () => boolean;
  updateSessionTimeout: (timeout: number) => Promise<void>;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  const [vaultState, setVaultState] = useState<VaultState>({
    isUnlocked: false,
    derivedKey: null,
    unlockTime: null,
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
  });

  // Check if vault is still unlocked
  const checkVaultTimeout = (): boolean => {
    if (!vaultState.isUnlocked || !vaultState.unlockTime) {
      return false;
    }
    
    const now = Date.now();
    const timeSinceUnlock = now - vaultState.unlockTime;
    
    if (timeSinceUnlock > vaultState.sessionTimeout) {
      // Auto-lock vault
      setVaultState(prev => ({
        ...prev,
        isUnlocked: false,
        derivedKey: null,
        unlockTime: null,
      }));
      return false;
    }
    
    return true;
  };

  // Check timeout on mount and every minute
  useEffect(() => {
    checkVaultTimeout();
    
    const interval = setInterval(() => {
      checkVaultTimeout();
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [vaultState.isUnlocked, vaultState.unlockTime]);

  // Lock vault when user changes
  useEffect(() => {
    if (!isSignedIn) {
      setVaultState({
        isUnlocked: false,
        derivedKey: null,
        unlockTime: null,
        sessionTimeout: 30 * 60 * 1000,
      });
    }
  }, [isSignedIn]);

  const setupVault = async (password: string): Promise<void> => {
    if (!user) {
      throw new SecurityException(
        SecurityError.VAULT_LOCKED,
        'User not authenticated'
      );
    }

    try {
      console.log('Setting up vault for user:', user.id);
      const verificationData: VerificationData = await setupMasterPassword(password, user.id);
      console.log('Verification data created:', verificationData);
      
      // Store verification data in user document (to be implemented)
      console.log('Master password setup complete', verificationData);
      
      // Derive key for immediate use
      const salt = Uint8Array.from(atob(verificationData.salt), c => c.charCodeAt(0));
      const derivedKey = await deriveKeyFromPassword(password, salt, user.id);
      console.log('Derived key created successfully');
      
      setVaultState({
        isUnlocked: true,
        derivedKey,
        unlockTime: Date.now(),
        sessionTimeout: 30 * 60 * 1000,
      });
      console.log('Vault state updated successfully');
    } catch (error) {
      console.error('Error in setupVault:', error);
      throw new SecurityException(
        SecurityError.ENCRYPTION_FAILED,
        'Failed to setup master password',
        error as Error
      );
    }
  };

  const unlockVault = async (password: string): Promise<boolean> => {
    if (!user) {
      throw new SecurityException(
        SecurityError.VAULT_LOCKED,
        'User not authenticated'
      );
    }
    try {
      console.log('Attempting to unlock vault for user:', user.id);
      
      // Fetch user data from Firestore to get salt/hash
      const { getUser } = await import('@/lib/database');
      const userData = await getUser(user.id);
      console.log('User data retrieved:', userData ? 'found' : 'not found');
      
      if (!userData?.masterPasswordSalt || !userData?.masterPasswordHash) {
        console.log('Missing salt or hash in user data');
        return false;
      }
      
      console.log('Verifying master password...');
      const isValid = await verifyMasterPassword(
        password,
        user.id,
        userData.masterPasswordSalt,
        userData.masterPasswordHash
      );
      console.log('Password verification result:', isValid);
      
      if (!isValid) {
        return false;
      }
      
      console.log('Deriving key for vault unlock...');
      const salt = Uint8Array.from(atob(userData.masterPasswordSalt), c => c.charCodeAt(0));
      const derivedKey = await deriveKeyFromPassword(password, salt, user.id);
      
      // Use user's session timeout setting or default to 30 minutes
      const sessionTimeout = userData.sessionTimeout || 30 * 60 * 1000;
      
      setVaultState({
        isUnlocked: true,
        derivedKey,
        unlockTime: Date.now(),
        sessionTimeout,
      });
      console.log('Vault unlocked successfully with session timeout:', sessionTimeout);
      return true;
    } catch (error) {
      console.error('Error in unlockVault:', error);
      throw new SecurityException(
        SecurityError.DECRYPTION_FAILED,
        'Failed to unlock vault',
        error as Error
      );
    }
  };

  const lockVault = (): void => {
    setVaultState({
      isUnlocked: false,
      derivedKey: null,
      unlockTime: null,
      sessionTimeout: 30 * 60 * 1000,
    });
  };

  const encryptKey = async (apiKey: string): Promise<{ encryptedData: string; iv: string }> => {
    if (!vaultState.isUnlocked || !vaultState.derivedKey) {
      throw new SecurityException(
        SecurityError.VAULT_LOCKED,
        'Vault is locked'
      );
    }
    try {
      return await encryptApiKey(apiKey, vaultState.derivedKey);
    } catch (error) {
      throw new SecurityException(
        SecurityError.ENCRYPTION_FAILED,
        'Failed to encrypt API key',
        error as Error
      );
    }
  };

  const decryptKey = async (encryptedData: string, iv: string): Promise<string> => {
    if (!vaultState.isUnlocked || !vaultState.derivedKey) {
      throw new SecurityException(
        SecurityError.VAULT_LOCKED,
        'Vault is locked'
      );
    }
    try {
      return await decryptApiKey(encryptedData, iv, vaultState.derivedKey);
    } catch (error) {
      throw new SecurityException(
        SecurityError.DECRYPTION_FAILED,
        'Failed to decrypt API key',
        error as Error
      );
    }
  };

  const updateSessionTimeout = async (timeout: number): Promise<void> => {
    if (!user) {
      throw new SecurityException(
        SecurityError.VAULT_LOCKED,
        'User not authenticated'
      );
    }

    try {
      const { updateUserSessionTimeout } = await import('@/lib/database');
      await updateUserSessionTimeout(user.id, timeout);
      
      // Update local state
      setVaultState(prev => ({
        ...prev,
        sessionTimeout: timeout,
      }));
    } catch (error) {
      console.error('Error updating session timeout:', error);
      throw new SecurityException(
        SecurityError.ENCRYPTION_FAILED,
        'Failed to update session timeout',
        error as Error
      );
    }
  };

  const value = {
    vaultState,
    isUnlocked: vaultState.isUnlocked,
    derivedKey: vaultState.derivedKey,
    setupVault,
    unlockVault,
    lockVault,
    encryptKey,
    decryptKey,
    checkVaultTimeout,
    updateSessionTimeout,
  };

  return (
    <VaultContext.Provider value={value}>
      {children}
    </VaultContext.Provider>
  );
}

export function useVault() {
  const context = useContext(VaultContext);
  if (context === undefined) {
    throw new Error('useVault must be used within a VaultProvider');
  }
  return context;
} 