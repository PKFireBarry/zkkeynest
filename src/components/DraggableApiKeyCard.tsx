'use client';

import { useRef } from 'react';
import { ApiKey, Folder } from '@/types';
import { Card, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { Eye, EyeOff, Copy, Trash2, Key, Mail, RotateCcw, Share2, GripVertical } from 'lucide-react';
import RotationReminderBadge from './RotationReminderBadge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useVault } from '@/contexts/VaultContext';
import { useState, useEffect } from 'react';
import { timestampToDate } from '@/lib/database';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText } from 'lucide-react';
import { parseEnv } from '@/lib/parseEnv';
import CreateShareModal from './CreateShareModal';
import RotationReminderSettings from './RotationReminderSettings';

interface DraggableApiKeyCardProps {
  apiKey: ApiKey;
  folders: Folder[];
  isDragging: boolean;
  onView: (apiKey: ApiKey) => void;
  onShare: () => void;
  onDelete: (id: string) => void;
  onDragStart: (apiKey: ApiKey) => void;
  onDragEnd: () => void;
  openDialogId: string | null;
  setOpenDialogId: (id: string | null) => void;
  onRefresh?: () => void;
}

// Function to obfuscate API key values, showing only the first few characters
const obfuscateValue = (value: string): string => {
  if (!value) return '';
  // Show first 4 characters and replace the rest with asterisks
  const visibleChars = 4;
  const prefix = value.substring(0, visibleChars);
  const suffix = '*'.repeat(Math.min(8, value.length - visibleChars)); // Use at least 8 asterisks for visual consistency
  return `${prefix}${suffix}`;
};

export default function DraggableApiKeyCard({
  apiKey,
  folders,
  isDragging,
  onView,
  onShare,
  onDelete,
  onDragStart,
  onDragEnd,
  openDialogId,
  setOpenDialogId,
  onRefresh
}: DraggableApiKeyCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { decryptKey } = useVault();
  const [decryptedKey, setDecryptedKey] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTouchDragging, setIsTouchDragging] = useState(false);
  const [touchStartPos, setTouchStartPos] = useState<{ x: number; y: number } | null>(null);

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

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    // Set the drag data
    e.dataTransfer.setData('application/json', JSON.stringify({
      apiKeyId: apiKey.id,
      currentFolderId: apiKey.folderId
    }));
    
    // Set the drag image to be the card itself
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      e.dataTransfer.setDragImage(
        cardRef.current,
        e.clientX - rect.left,
        e.clientY - rect.top
      );
    }
    
    onDragStart(apiKey);
  };

  // Touch event handlers for mobile drag and drop
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    setTouchStartPos({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStartPos) return;
    
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartPos.x);
    const deltaY = Math.abs(touch.clientY - touchStartPos.y);
    
    // Start drag if moved more than 10 pixels
    if ((deltaX > 10 || deltaY > 10) && !isTouchDragging) {
      setIsTouchDragging(true);
      onDragStart(apiKey);
      e.preventDefault(); // Prevent scrolling
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isTouchDragging) {
      const touch = e.changedTouches[0];
      const elementAtPoint = document.elementFromPoint(touch.clientX, touch.clientY);
      
      // Find the nearest droppable element
      const droppableElement = elementAtPoint?.closest('[data-droppable]');
      if (droppableElement) {
        const folderId = droppableElement.getAttribute('data-folder-id');
        // Trigger drop event
        const dropEvent = new CustomEvent('touch-drop', {
          detail: { apiKey, folderId: folderId === 'null' ? null : folderId }
        });
        droppableElement.dispatchEvent(dropEvent);
      }
      
      setIsTouchDragging(false);
      onDragEnd();
    }
    setTouchStartPos(null);
  };

  return (
    <Card 
      ref={cardRef}
      className={`hover:shadow-lg transition-shadow duration-200 ${isDragging || isTouchDragging ? 'opacity-50 border-dashed border-primary' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <CardHeader className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="mt-1 cursor-grab flex-shrink-0">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-2 flex-1 min-w-0">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Key className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{apiKey.label}</span>
              </CardTitle>
              <CardDescription className="flex flex-wrap items-center gap-2 text-sm">
                <Badge variant="secondary" className="text-xs">{apiKey.service}</Badge>
                {apiKey.category && (
                  <Badge variant="outline" className="text-xs">{apiKey.category}</Badge>
                )}
                {apiKey.folderId && (
                  <Badge variant="default" className="text-xs bg-muted-foreground text-background">
                    {folders.find(f => f.id === apiKey.folderId)?.name || 'Folder'}
                  </Badge>
                )}
                {apiKey.tags && apiKey.tags.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {apiKey.tags.slice(0, 2).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                    {apiKey.tags.length > 2 && (
                      <Badge variant="secondary" className="text-xs">+{apiKey.tags.length - 2}</Badge>
                    )}
                  </div>
                )}
                {apiKey.email && (
                  <span className="flex items-center gap-1 text-xs truncate">
                    <Mail className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{apiKey.email}</span>
                  </span>
                )}
                <RotationReminderBadge reminder={apiKey.rotationReminder} />
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Dialog open={openDialogId === apiKey.id} onOpenChange={(open) => {
                if (open) {
                  setOpenDialogId(apiKey.id);
                  onView(apiKey);
                } else {
                  setOpenDialogId(null);
                }
              }}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-[#6366f1]/5 hover:text-[#6366f1] hover:border-[#6366f1]/20 transition-all duration-200 min-h-[44px] px-4 h-auto w-auto"
                >
                  {openDialogId === apiKey.id ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span className="sr-only sm:not-sr-only sm:ml-2">
                    {openDialogId === apiKey.id ? 'Hide' : 'View'}
                  </span>
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
            
            <CreateShareModal apiKey={apiKey} onShareCreated={onRefresh} />
            
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="hover:bg-[#6366f1]/5 hover:text-[#6366f1] hover:border-[#6366f1]/20 transition-all duration-200 min-h-[44px] px-4 h-auto w-auto"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only sm:ml-2">Rotate</span>
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
              className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950/20 dark:hover:text-red-400 dark:hover:border-red-800/50 transition-all duration-200 min-h-[44px] px-4 h-auto w-auto"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only sm:ml-2">Delete</span>
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}