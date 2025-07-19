'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useVault } from '@/contexts/VaultContext';
import { getApiKeys, deleteApiKey, getFolders } from '@/lib/database';
import { ApiKey, Folder } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye, EyeOff, Copy, Trash2, Key, Mail, FileText, Search, Share2, RotateCcw, CheckSquare, Square } from 'lucide-react';
import { timestampToDate } from '@/lib/database';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import ApiKeySearch from './ApiKeySearch';
import CreateShareModal from './CreateShareModal';
import RotationReminderBadge from './RotationReminderBadge';
import RotationReminderSettings from './RotationReminderSettings';
import ConfirmationModal from './ConfirmationModal';
import { parseEnv } from '@/lib/parseEnv';
import { useSubscription } from '@/hooks/useSubscription';

interface ApiKeyListProps {
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

export default function ApiKeyList({ onRefresh }: ApiKeyListProps) {
  const { user } = useUser();
  const { decryptKey } = useVault();
  const { hasAdvancedSearch } = useSubscription();
  
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [filteredApiKeys, setFilteredApiKeys] = useState<ApiKey[]>([]);
  const [decryptedKeys, setDecryptedKeys] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [folders, setFolders] = useState<Folder[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState<ApiKey | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  const loadApiKeys = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError('');
      const keys = await getApiKeys(user.id);
      setApiKeys(keys);
      setFilteredApiKeys(keys); // Initialize filtered keys with all keys
    } catch (err) {
      console.error('Error loading API keys:', err);
      setError('Failed to load API keys');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApiKeys();
  }, [user]);

  // Load folders for display
  useEffect(() => {
    if (!user) return;
    (async () => {
      const userFolders = await getFolders(user.id);
      setFolders(userFolders);
    })();
  }, [user]);

  const handleDecryptKey = async (apiKey: ApiKey) => {
    try {
      const decryptedKey = await decryptKey(apiKey.encryptedData, apiKey.iv);
      setDecryptedKeys(prev => ({ ...prev, [apiKey.id]: decryptedKey }));
      setShowKeys(prev => ({ ...prev, [apiKey.id]: true }));
    } catch (err) {
      setError('Failed to decrypt API key');
    }
  };

  const handleCopyKey = async (keyId: string) => {
    const key = decryptedKeys[keyId];
    if (key) {
      try {
        await navigator.clipboard.writeText(key);
        // You could add a toast notification here
      } catch (err) {
        setError('Failed to copy to clipboard');
      }
    }
  };

  const handleDeleteKey = (keyId: string) => {
    const key = apiKeys.find(k => k.id === keyId);
    if (key) {
      setKeyToDelete(key);
      setShowDeleteModal(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!keyToDelete) return;
    
    try {
      await deleteApiKey(keyToDelete.id);
      setApiKeys(prev => prev.filter(key => key.id !== keyToDelete.id));
      setFilteredApiKeys(prev => prev.filter(key => key.id !== keyToDelete.id));
      setDecryptedKeys(prev => {
        const newKeys = { ...prev };
        delete newKeys[keyToDelete.id];
        return newKeys;
      });
      setShowKeys(prev => {
        const newShow = { ...prev };
        delete newShow[keyToDelete.id];
        return newShow;
      });
      // Notify parent component about the refresh
      onRefresh?.();
    } catch (err) {
      setError('Failed to delete API key');
    }
  };

  const handleKeySelection = (keyId: string, selected: boolean) => {
    setSelectedKeys(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(keyId);
      } else {
        newSet.delete(keyId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedKeys.size === filteredApiKeys.length) {
      setSelectedKeys(new Set());
    } else {
      setSelectedKeys(new Set(filteredApiKeys.map(key => key.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedKeys.size > 0) {
      setShowBulkDeleteModal(true);
    }
  };

  const handleConfirmBulkDelete = async () => {
    try {
      const deletionPromises = Array.from(selectedKeys).map(keyId => deleteApiKey(keyId));
      await Promise.all(deletionPromises);
      
      setApiKeys(prev => prev.filter(key => !selectedKeys.has(key.id)));
      setFilteredApiKeys(prev => prev.filter(key => !selectedKeys.has(key.id)));
      setDecryptedKeys(prev => {
        const newKeys = { ...prev };
        selectedKeys.forEach(keyId => delete newKeys[keyId]);
        return newKeys;
      });
      setShowKeys(prev => {
        const newShow = { ...prev };
        selectedKeys.forEach(keyId => delete newShow[keyId]);
        return newShow;
      });
      setSelectedKeys(new Set());
      onRefresh?.();
    } catch (err) {
      setError('Failed to delete API keys');
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
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Loading API keys...</p>
      </div>
    );
  }

  if (apiKeys.length === 0) {
    return (
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardContent className="text-center py-8 px-6">
          <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No API Keys Yet</h3>
          <p className="text-muted-foreground">
            Add your first API key to get started with secure key management.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Show search and filters only if there are API keys AND user has advanced search
  const showSearchAndFilters = apiKeys.length > 0 && hasAdvancedSearch;

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Search and Filter Component - Pro Feature */}
      {showSearchAndFilters && (
        <ApiKeySearch 
          apiKeys={apiKeys}
          onFilteredKeysChange={setFilteredApiKeys}
        />
      )}

      {/* Bulk Actions Header */}
      {filteredApiKeys.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              className="flex items-center gap-2"
            >
              {selectedKeys.size === filteredApiKeys.length && filteredApiKeys.length > 0 ? (
                <CheckSquare className="h-4 w-4" />
              ) : (
                <Square className="h-4 w-4" />
              )}
              Select All ({filteredApiKeys.length})
            </Button>
            {selectedKeys.size > 0 && (
              <span className="text-sm text-muted-foreground">
                {selectedKeys.size} selected
              </span>
            )}
          </div>
          {selectedKeys.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Selected ({selectedKeys.size})
            </Button>
          )}
        </div>
      )}
      
      <div className="grid gap-6">
        {filteredApiKeys.length === 0 ? (
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="text-center py-8">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredApiKeys.map((apiKey) => (
            <Card key={apiKey.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="px-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleKeySelection(apiKey.id, !selectedKeys.has(apiKey.id))}
                      className="mt-1 p-1 h-6 w-6"
                    >
                      {selectedKeys.has(apiKey.id) ? (
                        <CheckSquare className="h-4 w-4 text-primary" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </Button>
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
                              {apiKey.tags.slice(0, 3).map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                              ))}
                              {apiKey.tags.length > 3 && (
                                <Badge variant="secondary" className="text-xs">+{apiKey.tags.length - 3}</Badge>
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
                          handleDecryptKey(apiKey);
                        } else {
                          setOpenDialogId(null);
                          // Reset the show state when dialog is closed
                          setShowKeys(prev => ({ ...prev, [apiKey.id]: false }));
                        }
                      }}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:bg-[#6366f1]/5 hover:text-[#6366f1] hover:border-[#6366f1]/20 transition-all duration-200 min-h-[44px] px-4"
                        >
                          {openDialogId === apiKey.id ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
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
                          {showKeys[apiKey.id] && decryptedKeys[apiKey.id] && (
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">{apiKey.entryType === 'env' ? '.env Key-Value Pairs' : 'API Key'}</Label>
                              {apiKey.entryType === 'env' ? (
                                <div className="space-y-2">
                                  <div className="flex gap-2 mb-2">
                                    <Button type="button" size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(decryptedKeys[apiKey.id])}>Copy All</Button>
                                  </div>
                                  {parseEnv(decryptedKeys[apiKey.id]).map((pair, idx) => (
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
                                    value={obfuscateValue(decryptedKeys[apiKey.id])}
                                    readOnly
                                    className="font-mono text-sm"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                    onClick={() => handleCopyKey(apiKey.id)}
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
                          className="hover:bg-[#6366f1]/5 hover:text-[#6366f1] hover:border-[#6366f1]/20 transition-all duration-200 min-h-[44px] px-4"
                        >
                          <RotateCcw className="h-4 w-4" />
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
                      onClick={() => handleDeleteKey(apiKey.id)}
                      className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950/20 dark:hover:text-red-400 dark:hover:border-red-800/50 transition-all duration-200 min-h-[44px] px-4"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setKeyToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete API Key"
        description={`Are you sure you want to delete the API key "${keyToDelete?.label}"?

This action cannot be undone. The encrypted API key will be permanently removed from your vault.`}
        confirmText="Delete API Key"
        cancelText="Cancel"
        variant="destructive"
        delaySeconds={3}
      />

      <ConfirmationModal
        isOpen={showBulkDeleteModal}
        onClose={() => {
          setShowBulkDeleteModal(false);
        }}
        onConfirm={handleConfirmBulkDelete}
        title="Delete Multiple API Keys"
        description={`Are you sure you want to delete ${selectedKeys.size} API key${selectedKeys.size === 1 ? '' : 's'}?

This action cannot be undone. The selected encrypted API keys will be permanently removed from your vault.`}
        confirmText={`Delete ${selectedKeys.size} API Key${selectedKeys.size === 1 ? '' : 's'}`}
        cancelText="Cancel"
        variant="destructive"
        delaySeconds={3}
      />
    </div>
  );
} 