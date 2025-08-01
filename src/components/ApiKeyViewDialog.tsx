'use client';

import { useState, useEffect } from 'react';
import { ApiKey } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, FileText } from 'lucide-react';
import { timestampToDate } from '@/lib/database';
import { useVault } from '@/contexts/VaultContext';
import { parseEnv } from '@/lib/parseEnv';

interface ApiKeyViewDialogProps {
  apiKey: ApiKey | null;
  isOpen: boolean;
  onClose: () => void;
}

// Function to obfuscate API key values, showing only the first few characters
const obfuscateValue = (value: string): string => {
  if (!value) return '';
  // Show first 4 characters and replace the rest with asterisks
  const visibleChars = 4;
  const prefix = value.substring(0, Math.min(visibleChars, value.length));
  const remainingChars = Math.max(0, value.length - visibleChars);
  const suffix = '*'.repeat(Math.min(8, remainingChars)); // Use at least 8 asterisks for visual consistency
  return `${prefix}${suffix}`;
};

export default function ApiKeyViewDialog({ apiKey, isOpen, onClose }: ApiKeyViewDialogProps) {
  const { decryptKey } = useVault();
  const [decryptedKey, setDecryptedKey] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && apiKey) {
      handleDecrypt();
    } else {
      setDecryptedKey(null);
      setError(null);
    }
  }, [isOpen, apiKey]);

  const handleDecrypt = async () => {
    if (!apiKey) return;
    
    try {
      setIsDecrypting(true);
      setError(null);
      const key = await decryptKey(apiKey.encryptedData, apiKey.iv);
      setDecryptedKey(key);
    } catch (err) {
      console.error('Failed to decrypt API key:', err);
      setError('Failed to decrypt API key');
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleCopy = async () => {
    if (!decryptedKey) return;
    
    try {
      await navigator.clipboard.writeText(decryptedKey);
      // You could add a toast notification here
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (!apiKey) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{apiKey.label}</DialogTitle>
          <DialogDescription>
            Your decrypted API key. Keep this secure.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {isDecrypting ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Decrypting...</p>
            </div>
          ) : error ? (
            <div className="text-destructive text-sm">{error}</div>
          ) : decryptedKey && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">{apiKey.entryType === 'env' ? '.env Key-Value Pairs' : 'API Key'}</Label>
              {apiKey.entryType === 'env' ? (
                <div className="space-y-2">
                  <div className="flex gap-2 mb-2">
                    <Button type="button" size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(decryptedKey)}>Copy All</Button>
                  </div>
                  {parseEnv(decryptedKey).map((pair, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Input
                        value={`${pair.key}=${obfuscateValue(pair.value)}`}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => navigator.clipboard.writeText(`${pair.key}=${pair.value}`)}
                        title="Copy"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="relative">
                  <Input
                    value={obfuscateValue(decryptedKey)}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={handleCopy}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
          {apiKey.notes && (
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1">
                <FileText className="h-3 w-3" />
                Notes
              </Label>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                {apiKey.notes}
              </p>
            </div>
          )}
          <div className="text-xs text-muted-foreground">
            Created: {formatDate(timestampToDate(apiKey.createdAt))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}