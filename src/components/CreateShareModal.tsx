'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useVault } from '@/contexts/VaultContext';
import { createShare, dateToTimestamp } from '@/lib/database';
import { encryptForSharing, generateShareKey } from '@/lib/encryption';
import { ApiKey } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Share2, Copy, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { parseEnv } from '@/lib/parseEnv';

interface CreateShareModalProps {
  apiKey: ApiKey;
  onShareCreated?: () => void;
}

const EXPIRATION_OPTIONS = [
  { value: 1, label: '1 hour' },
  { value: 24, label: '24 hours' },
  { value: 72, label: '3 days' },
  { value: 168, label: '1 week' },
  { value: 720, label: '30 days' },
];

// Function to obfuscate API key values, showing only the first few characters
const obfuscateValue = (value: string): string => {
  if (!value) return '';
  // Show first 4 characters and replace the rest with asterisks
  const visibleChars = 4;
  const prefix = value.substring(0, visibleChars);
  const suffix = '*'.repeat(Math.min(8, value.length - visibleChars)); // Use at least 8 asterisks for visual consistency
  return `${prefix}${suffix}`;
};

export default function CreateShareModal({ apiKey, onShareCreated }: CreateShareModalProps) {
  const { user } = useUser();
  const { decryptKey } = useVault();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [expirationHours, setExpirationHours] = useState(24);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [shareAnonymously, setShareAnonymously] = useState(true);
  const [decryptedPreview, setDecryptedPreview] = useState<string | null>(null);

  // When modal opens, decrypt the API key for preview
  useEffect(() => {
    if (!isOpen) {
      setDecryptedPreview(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const decrypted = await decryptKey(apiKey.encryptedData, apiKey.iv);
        if (!cancelled) setDecryptedPreview(decrypted);
      } catch {
        if (!cancelled) setDecryptedPreview(null);
      }
    })();
    return () => { cancelled = true; };
  }, [isOpen, apiKey, decryptKey]);

  const handleCreateShare = async () => {
    if (!user) return;

    setIsCreating(true);
    setIsProcessing(true);
    setError('');

    try {
      // Decrypt the API key
      const decryptedApiKey = await decryptKey(apiKey.encryptedData, apiKey.iv);
      
      // Generate a new share key
      const shareKey = await generateShareKey();
      
      // Encrypt the API key for sharing
      const shareData = await encryptForSharing(decryptedApiKey, shareKey);
      console.log('Share data created:', {
        encryptedData: shareData.encryptedData.substring(0, 20) + '...',
        shareKey: shareData.shareKey.substring(0, 20) + '...',
        iv: shareData.iv.substring(0, 20) + '...',
      });
      
      // Calculate expiration time
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + expirationHours);
      
      // Create share in database
      const shareDataObj = {
        apiKeyId: apiKey.id,
        createdBy: user.id,
        encryptedData: shareData.encryptedData,
        shareKey: shareData.shareKey,
        iv: shareData.iv,
        expiresAt: dateToTimestamp(expiresAt),
        used: false,
        ...( !shareAnonymously && user.primaryEmailAddress?.emailAddress
            ? { sharedByEmail: user.primaryEmailAddress.emailAddress }
            : {} )
      };
      const shareId = await createShare(shareDataObj);
      
      console.log('Share created with ID:', shareId);
      
      // Generate share URL
      const baseUrl = window.location.origin;
      const url = `${baseUrl}/share/${shareId}`;
      console.log('Generated share URL:', url);
      console.log('Setting share URL in state:', url);
      setShareUrl(url);
      
      // Test the URL immediately
      setTimeout(() => {
        console.log('Current shareUrl state:', shareUrl);
        console.log('Testing share URL:', url);
        // You can test the URL by opening it in a new tab
        // window.open(url, '_blank');
      }, 100);
      
      // Don't call onShareCreated immediately to avoid modal closing
      // onShareCreated?.();
    } catch (err) {
      console.error('Error creating share:', err);
      setError('Failed to create share link');
    } finally {
      setIsCreating(false);
      setIsProcessing(false);
    }
  };

  const handleCopyUrl = async () => {
    if (shareUrl) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        setError('Failed to copy to clipboard');
      }
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setShareUrl(null);
    setError('');
    setCopied(false);
    // Call the callback when user closes the modal
    onShareCreated?.();
  };

  const formatExpiration = (hours: number) => {
    if (hours < 24) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else if (hours < 168) {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? 's' : ''}`;
    } else {
      const weeks = Math.floor(hours / 168);
      return `${weeks} week${weeks > 1 ? 's' : ''}`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      console.log('Dialog onOpenChange called with:', open);
      // Prevent closing while processing
      if (isProcessing) {
        console.log('Preventing dialog close while processing');
        return;
      }
      setIsOpen(open);
    }}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="hover:bg-[#6366f1]/5 hover:text-[#6366f1] hover:border-[#6366f1]/20 transition-all duration-200 min-h-[44px] px-4 h-auto w-auto"
        >
          <Share2 className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only sm:ml-2">Share</span>
        </Button>
      </DialogTrigger>
      {/* Use a wider modal for all cases */}
      <DialogContent className="w-full max-w-lg sm:max-w-xl overflow-x-visible p-0">
        <DialogHeader className="px-8 pt-8 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share API Key
          </DialogTitle>
          <DialogDescription>
            Create a secure, one-time use link to share this API key.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 px-8 pb-8">
          {/* API Key Info */}
          <div className="rounded-lg border bg-card p-4 mb-2">
            <div className="flex flex-col gap-1 mb-2">
              <span className="font-semibold text-base">{apiKey.label}</span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary">{apiKey.service}</Badge>
                {apiKey.email && <span>{apiKey.email}</span>}
              </div>
            </div>

            {/* .env preview */}
            {apiKey.entryType === 'env' && decryptedPreview && (
              <div className="bg-muted rounded-md border p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-xs">.env Key-Value Pairs</span>
                  <Button type="button" size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(parseEnv(decryptedPreview).map(({key, value}) => `${key}=${value}`).join('\n'))}>Copy All</Button>
                </div>
                <div className="space-y-1 max-h-56 w-full min-w-0 overflow-y-auto overflow-x-auto pr-1">
                  {parseEnv(decryptedPreview).map((pair, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        type="text"
                        readOnly
                        value={`${pair.key}=${obfuscateValue(pair.value)}`}
                        className="w-full max-w-[420px] overflow-x-auto font-mono text-xs bg-background border rounded px-2 py-1"
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
              </div>
            )}
            {/* single key preview */}
            {apiKey.entryType !== 'env' && decryptedPreview && (
              <div className="bg-muted rounded-md border p-3 flex items-center gap-2">
                <span className="font-mono text-xs bg-background border rounded px-2 py-1 flex-1 truncate">{obfuscateValue(decryptedPreview)}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => navigator.clipboard.writeText(decryptedPreview)}
                  title="Copy"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Anonymous/email toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="share-anonymous-toggle"
              checked={shareAnonymously}
              onChange={() => setShareAnonymously(v => !v)}
            />
            <Label htmlFor="share-anonymous-toggle" className="text-xs cursor-pointer">
              Share anonymously
            </Label>
            {!shareAnonymously && user?.primaryEmailAddress?.emailAddress && (
              <span className="text-xs text-muted-foreground">({user.primaryEmailAddress.emailAddress} will be shown to recipient)</span>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Footer for action buttons */}
          <div className="pt-4 border-t mt-6">
          {!shareUrl ? (
            <>
              {/* Expiration Settings */}
                <div className="space-y-2 mb-2">
                <Label htmlFor="expiration">Link Expiration</Label>
                <Select value={expirationHours.toString()} onValueChange={(value) => setExpirationHours(parseInt(value))}>
                  <SelectTrigger id="expiration">
                    <SelectValue placeholder="Select expiration time" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPIRATION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Link will expire in {formatExpiration(expirationHours)}
                </p>
              </div>

              {/* Security Warning */}
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Security Note:</strong> This link can only be used once and will be invalidated after use. 
                  Share it securely and only with trusted recipients.
                </AlertDescription>
              </Alert>

              <Button 
                onClick={handleCreateShare} 
                disabled={isCreating}
                  className="w-full mt-4"
              >
                {isCreating ? 'Creating...' : 'Create Share Link'}
              </Button>
            </>
          ) : (
            <>
              {/* Success Message */}
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Share link created successfully! The link can only be used once.
                </AlertDescription>
              </Alert>

              {/* Share URL */}
              <div className="space-y-2">
                <Label>Share Link</Label>
                <div className="relative">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="font-mono text-sm pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                    onClick={handleCopyUrl}
                  >
                      <Copy className="h-4 w-4" />
                  </Button>
                  </div>
              </div>
            </>
          )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 