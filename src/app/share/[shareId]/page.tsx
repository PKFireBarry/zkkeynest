'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getShare, markShareAsUsed } from '@/lib/database';
import { decryptSharedApiKey } from '@/lib/encryption';
import { Share } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Copy, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { timestampToDate } from '@/lib/database';
import { parseEnv } from '@/lib/parseEnv';

// Function to obfuscate API key values, showing only the first few characters
const obfuscateValue = (value: string): string => {
  if (!value) return '';
  // Show first 4 characters and replace the rest with asterisks
  const visibleChars = 4;
  const prefix = value.substring(0, visibleChars);
  const suffix = '*'.repeat(Math.min(8, value.length - visibleChars)); // Use at least 8 asterisks for visual consistency
  return `${prefix}${suffix}`;
};

export default function SharePage() {
  const params = useParams();
  const shareId = params.shareId as string;
  
  const [share, setShare] = useState<Share | null>(null);
  const [decryptedApiKey, setDecryptedApiKey] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUsed, setIsUsed] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  useEffect(() => {
    const loadShare = async () => {
      if (!shareId) return;

      try {
        setIsLoading(true);
        setError('');

        const shareData = await getShare(shareId);
        
        if (!shareData) {
          setError('Share link not found or has been deleted');
          return;
        }

        // Check if share is already used
        if (shareData.used) {
          setIsUsed(true);
          setError('This share link has already been used');
          return;
        }

        // Check if share is expired
        const now = new Date();
        const expiresAt = timestampToDate(shareData.expiresAt);
        
        if (now > expiresAt) {
          setIsExpired(true);
          setError('This share link has expired');
          return;
        }

        setShare(shareData);

        // Decrypt the API key
        const decrypted = await decryptSharedApiKey(
          shareData.encryptedData,
          shareData.shareKey,
          shareData.iv
        );
        
        setDecryptedApiKey(decrypted);

        // Mark share as used
        await markShareAsUsed(shareId);
        
      } catch (err) {
        console.error('Error loading share:', err);
        setError('Failed to load shared API key');
      } finally {
        setIsLoading(false);
      }
    };

    loadShare();
  }, [shareId]);

  const handleCopyApiKey = async () => {
    if (decryptedApiKey) {
      try {
        await navigator.clipboard.writeText(decryptedApiKey);
        // You could add a toast notification here
      } catch (err) {
        setError('Failed to copy to clipboard');
      }
    }
  };

  const handleCopyEnvPair = async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1500);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading shared API key...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              {isUsed ? (
                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              ) : isExpired ? (
                <Clock className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              ) : (
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              )}
              <h2 className="text-lg font-semibold mb-2">
                {isUsed ? 'Link Already Used' : isExpired ? 'Link Expired' : 'Error'}
              </h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Please close this tab manually for security.
                </p>
                <Button onClick={() => {
                  try {
                    window.close();
                  } catch (e) {
                    // If window.close() fails, show a message
                    alert('Please close this tab manually for security.');
                  }
                }}>
                  Close Tab
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!share || !decryptedApiKey) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">Invalid Share Link</h2>
              <p className="text-muted-foreground mb-4">
                This share link is invalid or has been deleted.
              </p>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Please close this tab manually for security.
                </p>
                <Button onClick={() => {
                  try {
                    window.close();
                  } catch (e) {
                    // If window.close() fails, show a message
                    alert('Please close this tab manually for security.');
                  }
                }}>
                  Close Tab
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Shared API Key
          </CardTitle>
          <CardDescription>
            This API key has been shared with you securely. Copy it now as this link can only be used once.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Success Alert */}
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Success!</strong> This share link has been used and is now invalidated for security.
            </AlertDescription>
          </Alert>

          {/* API Key Display */}
          {/* .env or single key display */}
          {decryptedApiKey && decryptedApiKey.includes('=') && decryptedApiKey.split('\n').some(line => line.includes('=') && !line.trim().startsWith('#')) ? (
            <div className="space-y-2">
              <Label className="text-sm font-medium">.env Key-Value Pairs</Label>
              <div className="flex gap-2 mb-2">
                <Button type="button" size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(parseEnv(decryptedApiKey).map(({key, value}) => `${key}=${value}`).join('\n'))}>Copy All</Button>
              </div>
              <div className="space-y-1 max-h-56 w-full min-w-0 overflow-y-auto overflow-x-auto pr-1">
                {parseEnv(decryptedApiKey).map((pair, idx) => (
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
                      onClick={() => handleCopyEnvPair(`${pair.key}=${pair.value}`, idx)}
                      title="Copy"
                      className={copiedIdx === idx ? 'bg-green-500/20' : 'hover:bg-accent'}
                    >
                      {copiedIdx === idx ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label className="text-sm font-medium">API Key</Label>
              <div className="relative">
                <Input
                  value={showApiKey ? decryptedApiKey : obfuscateValue(decryptedApiKey || '')}
                  readOnly
                  className="font-mono text-sm pr-20"
                />
                <div className="absolute right-0 top-0 h-full flex items-center gap-1 px-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="h-8 w-8 p-0"
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyApiKey}
                    className="h-8 w-8 p-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Share Info */}
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Shared by:</span>
              <span className="font-medium">{share.sharedByEmail ? share.sharedByEmail : 'Anonymous'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Created:</span>
              <span>{formatDate(timestampToDate(share.createdAt))}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Expires:</span>
              <span>{formatDate(timestampToDate(share.expiresAt))}</span>
            </div>
          </div>

          {/* Security Note */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Security Note:</strong> This API key is now visible to you. 
              Copy it immediately and close this window for security.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground text-center">
              Please close this tab manually for security.
            </p>
            <Button onClick={() => {
              try {
                window.close();
              } catch (e) {
                // If window.close() fails, show a message
                alert('Please close this tab manually for security.');
              }
            }} className="w-full">
              Close Tab
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 