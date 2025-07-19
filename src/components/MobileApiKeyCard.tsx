'use client';

import { useState, useEffect } from 'react';
import { ApiKey, Folder } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Copy, Trash2, Key, Mail, RotateCcw, Share2 } from 'lucide-react';
import RotationReminderBadge from './RotationReminderBadge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useVault } from '@/contexts/VaultContext';
import { timestampToDate } from '@/lib/database';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText } from 'lucide-react';
import { parseEnv } from '@/lib/parseEnv';
import CreateShareModal from './CreateShareModal';
import RotationReminderSettings from './RotationReminderSettings';

interface MobileApiKeyCardProps {
  apiKey: ApiKey;
  folders: Folder[];
  onView: (apiKey: ApiKey) => void;
  onShare: () => void;
  onDelete: (id: string) => void;
  openDialogId: string | null;
  setOpenDialogId: (id: string | null) => void;
  onRefresh?: () => void;
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

export default function MobileApiKeyCard({
  apiKey,
  folders,
  onView,
  onShare,
  onDelete,
  openDialogId,
  setOpenDialogId,
  onRefresh
}: MobileApiKeyCardProps) {
  const { decryptKey } = useVault();
  const [decryptedKey, setDecryptedKey] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Decrypt key when dialog opens
  useEffect(() => {
    if (openDialogId === apiKey.id) {
      handleDecrypt();
    } else {
      setDecryptedKey(null);
      setError(null);
    }
  }, [openDialogId, apiKey.id]);

  const handleDecrypt = async () => {
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

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-2">
        <div className="flex flex-col gap-1">
          {/* Card content - top */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Key className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <span className="font-medium text-sm truncate">{apiKey.label}</span>
            </div>
            <div className="flex flex-wrap items-center gap-1">
              <Badge variant="secondary" className="text-xs">{apiKey.service}</Badge>
              {apiKey.category && (
                <Badge variant="outline" className="text-xs">{apiKey.category}</Badge>
              )}
              {apiKey.folderId && (
                <Badge variant="default" className="text-xs bg-muted-foreground text-background">
                  {folders.find(f => f.id === apiKey.folderId)?.name || 'Folder'}
                </Badge>
              )}
            </div>
            {apiKey.email && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Mail className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{apiKey.email}</span>
              </div>
            )}
            <RotationReminderBadge reminder={apiKey.rotationReminder} />
          </div>
          {/* Action buttons - horizontal row below content */}
          <div className="flex flex-row items-center gap-1 pt-1">
            <Dialog open={openDialogId === apiKey.id} onOpenChange={(open) => {
              if (open) {
                setOpenDialogId(apiKey.id);
                onView(apiKey);
              } else {
                setOpenDialogId(null);
              }
            }}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  {openDialogId === apiKey.id ? (
                    <EyeOff className="h-3 w-3" />
                  ) : (
                    <Eye className="h-3 w-3" />
                  )}
                </Button>
              </DialogTrigger>
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
            
            <CreateShareModal 
              apiKey={apiKey} 
              onShareCreated={onRefresh}
              customTrigger={
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  <Share2 className="h-3 w-3" />
                </Button>
              }
            />
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  <RotateCcw className="h-3 w-3" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Rotation Reminder Settings</DialogTitle>
                  <DialogDescription>
                    Configure when you want to be reminded to rotate this API key.
                  </DialogDescription>
                </DialogHeader>
                <RotationReminderSettings 
                  apiKey={apiKey} 
                  onUpdate={onRefresh}
                />
              </DialogContent>
            </Dialog>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(apiKey.id)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 