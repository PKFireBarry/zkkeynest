'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useVault } from '@/contexts/VaultContext';
import { createApiKey, getUser, getApiKeys, createFolder, getFolders } from '@/lib/database';
import { sanitizeApiKeyData, validateCreateApiKeyForm } from '@/lib/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, X, AlertTriangle } from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '@/lib/subscription-plans';
import { Badge } from '@/components/ui/badge';
import { parseEnv, EnvKeyValue } from '@/lib/parseEnv';
import type { Folder } from '@/types/index';
import { Timestamp } from 'firebase/firestore';
import { useSubscription } from '@/hooks/useSubscription';

interface AddApiKeyFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}



export default function AddApiKeyForm({ onSuccess, onCancel }: AddApiKeyFormProps) {
  const { user } = useUser();
  const { encryptKey } = useVault();
  const { hasTagsAndCategories, hasFolderOrganization, isFree } = useSubscription();
  
  const [formData, setFormData] = useState({
    label: '',
    service: '',
    email: '',
    apiKey: '',
    notes: ''
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentUsage, setCurrentUsage] = useState(0);
  const [currentPlan, setCurrentPlan] = useState<'free' | 'pro' | 'team'>('free');
  const [isLoadingUsage, setIsLoadingUsage] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [category, setCategory] = useState('');
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>('');
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [isEnvMode, setIsEnvMode] = useState(false);
  const [envPairs, setEnvPairs] = useState<EnvKeyValue[]>([]);
  const [rawEnvText, setRawEnvText] = useState('');
  const [envError, setEnvError] = useState('');

  // Load user's current usage and plan
  useEffect(() => {
    const loadUsage = async () => {
      if (!user) return;
      
      try {
        setIsLoadingUsage(true);
        
        // Get user's subscription plan
        const userData = await getUser(user.id);
        const subscription = userData?.subscription || 'free';
        setCurrentPlan(subscription);
        
        // Get current API key count
        const apiKeys = await getApiKeys(user.id);
        setCurrentUsage(apiKeys.length);
      } catch (error) {
        console.error('Failed to load usage data:', error);
      } finally {
        setIsLoadingUsage(false);
      }
    };

    loadUsage();
  }, [user]);

  // Load folders for the user
  useEffect(() => {
    if (!user) return;
    (async () => {
      const userFolders = await getFolders(user.id);
      setFolders(userFolders);
    })();
  }, [user]);

  // Handle .env file drop or selection
  const handleEnvFile = async (file: File) => {
    setEnvError('');
    try {
      const text = await file.text();
      const pairs = parseEnv(text);
      if (pairs.length === 0) {
        setEnvError('No valid key-value pairs found in file.');
        return;
      }
      setIsEnvMode(true);
      setEnvPairs(pairs);
      setRawEnvText(text);
    } catch (err) {
      setEnvError('Failed to read or parse .env file.');
    }
  };

  // Handle drag-and-drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.startsWith('.env')) {
        handleEnvFile(file);
      } else {
        setEnvError('Only .env files are supported.');
      }
    }
  };
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.name.startsWith('.env')) {
        handleEnvFile(file);
      } else {
        setEnvError('Only .env files are supported.');
      }
    }
  };

  // Handle editing env pairs
  const handleEnvPairChange = (idx: number, field: 'key' | 'value', value: string) => {
    setEnvPairs(prev => prev.map((pair, i) => i === idx ? { ...pair, [field]: value } : pair));
  };
  const handleRemoveEnvPair = (idx: number) => {
    setEnvPairs(prev => prev.filter((_, i) => i !== idx));
  };
  const handleAddEnvPair = () => {
    setEnvPairs(prev => [...prev, { key: '', value: '' }]);
  };
  const handleCopyAllEnv = () => {
    const text = envPairs.map(({ key, value }) => `${key}=${value}`).join('\n');
    navigator.clipboard.writeText(text);
  };
  const handleCopyEnvPair = (idx: number) => {
    const { key, value } = envPairs[idx];
    navigator.clipboard.writeText(`${key}=${value}`);
  };
  const handleClearEnvMode = () => {
    setIsEnvMode(false);
    setEnvPairs([]);
    setRawEnvText('');
    setEnvError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    setIsLoading(true);
    
    try {
      // Check usage limits
      const plan = SUBSCRIPTION_PLANS[currentPlan];
      if (plan.maxKeys !== -1 && currentUsage >= plan.maxKeys) {
        throw new Error(`You've reached your limit of ${plan.maxKeys} API keys. Upgrade to Pro for unlimited storage.`);
      }
      
      if (isEnvMode) {
        // Validate env pairs
        if (envPairs.length === 0) throw new Error('No key-value pairs to save.');
        const envString = envPairs.map(({ key, value }) => `${key}=${value}`).join('\n');
        const { encryptedData, iv } = await encryptKey(envString);
        if (user) {
          await createApiKey({
            userId: user.id,
            label: formData.label,
            service: formData.service,
            email: formData.email,
            notes: formData.notes,
            encryptedData,
            iv,
            tags: hasTagsAndCategories ? tags : [],
            category: hasTagsAndCategories ? category : '',
            folderId: hasFolderOrganization ? (selectedFolderId || undefined) : undefined,
            entryType: 'env',
          });
        }
      } else {
        // Sanitize and validate the form data
        const sanitizedData = sanitizeApiKeyData(formData);
        validateCreateApiKeyForm(sanitizedData);
        
        // Encrypt the API key
        const { encryptedData, iv } = await encryptKey(sanitizedData.apiKey);
        
        // Save to database
        if (user) {
          await createApiKey({
            userId: user.id,
            label: sanitizedData.label,
            service: sanitizedData.service,
            email: sanitizedData.email,
            notes: sanitizedData.notes,
            encryptedData,
            iv,
            tags: hasTagsAndCategories ? tags : [],
            category: hasTagsAndCategories ? category : '',
            folderId: hasFolderOrganization ? (selectedFolderId || undefined) : undefined,
            entryType: 'single',
          });
        }
      }
      
      // Reset form
      setFormData({
        label: '',
        service: '',
        email: '',
        apiKey: '',
        notes: ''
      });
      setIsEnvMode(false);
      setEnvPairs([]);
      setRawEnvText('');
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save API key');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getUsageDisplay = () => {
    const plan = SUBSCRIPTION_PLANS[currentPlan];
    const isUnlimited = plan.maxKeys === -1;
    const percentage = isUnlimited ? 0 : (currentUsage / plan.maxKeys) * 100;
    
    return {
      current: currentUsage,
      limit: plan.maxKeys,
      isUnlimited,
      percentage,
      isAtLimit: !isUnlimited && currentUsage >= plan.maxKeys,
      isNearLimit: !isUnlimited && percentage >= 80
    };
  };

  // Tag input handlers
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };
  const handleRemoveTag = (tag: string) => setTags(tags.filter(t => t !== tag));

  // Folder creation handler
  const handleCreateFolder = async () => {
    if (!user || !newFolderName.trim()) return;
    const folderId = await createFolder({ userId: user.id, name: newFolderName.trim() });
    setFolders([
      ...folders,
      {
        id: folderId,
        userId: user.id,
        name: newFolderName.trim(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
    ]);
    setSelectedFolderId(folderId);
    setNewFolderName('');
    setShowNewFolderInput(false);
  };

  const usage = getUsageDisplay();

  if (isLoadingUsage) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading usage data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 border-border shadow-sm rounded-xl">
      <CardHeader className="p-6 border-b border-border">
        <CardTitle className="flex items-center justify-between text-xl sm:text-2xl font-bold">
          <span className="bg-gradient-to-r from-[#6366f1] to-[#a21caf] bg-clip-text text-transparent">
            Add New API Key
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onCancel}
            className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400 transition-all duration-200 rounded-xl"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
        <CardDescription className="text-base text-muted-foreground">
          Store your API key securely with zero-knowledge encryption.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6 p-6">
        {/* Usage Display */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Usage</span>
            <span className="font-medium">
              {usage.current} {usage.isUnlimited ? 'keys' : `of ${usage.limit} keys`}
            </span>
          </div>
          
          {!usage.isUnlimited && (
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  usage.isAtLimit ? 'bg-destructive' : 
                  usage.isNearLimit ? 'bg-yellow-500' : 'bg-primary'
                }`}
                style={{ width: `${Math.min(usage.percentage, 100)}%` }}
              />
            </div>
          )}
          
          {usage.isAtLimit && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You've reached your limit of {usage.limit} API keys. 
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-destructive underline"
                  onClick={() => window.open('/dashboard?billing=true', '_blank')}
                >
                  Upgrade to Pro for unlimited storage.
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          {usage.isNearLimit && !usage.isAtLimit && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You're approaching your limit. Consider upgrading to Pro for unlimited storage.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="label">Label *</Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) => handleInputChange('label', e.target.value)}
                placeholder="e.g., OpenAI Production"
                className="min-h-[44px]"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="service">Service *</Label>
              <Input
                id="service"
                value={formData.service}
                onChange={(e) => handleInputChange('service', e.target.value)}
                placeholder="e.g., OpenAI, GitHub, Stripe"
                className="min-h-[44px]"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="e.g., api@yourcompany.com"
            />
          </div>

          {/* .env file drag-and-drop/upload UI */}
          <div
            className="border-2 border-dashed border-primary/30 rounded-md p-4 text-center mb-4 cursor-pointer bg-muted hover:bg-muted/70 transition"
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
          >
            <input
              type="file"
              accept=".env,.env.*"
              className="hidden"
              id="env-file-input"
              onChange={handleFileInput}
              tabIndex={-1}
            />
            <label htmlFor="env-file-input" className="cursor-pointer block">
              Drag & drop a .env file here, or <span className="underline">click to upload</span>
            </label>
            {envError && <div className="text-destructive text-sm mt-2">{envError}</div>}
          </div>
          {/* If in env mode, show env pairs UI */}
          {isEnvMode && (
            <div className="mb-4 border rounded-md p-4 bg-secondary/50">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">.env Key-Value Pairs</span>
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="secondary" 
                    onClick={handleAddEnvPair}
                    className="hover:bg-[#6366f1]/10 hover:text-[#6366f1] transition-all duration-200"
                  >
                    Add Pair
                  </Button>
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="outline" 
                    onClick={handleCopyAllEnv}
                    className="hover:bg-[#6366f1]/5 hover:text-[#6366f1] hover:border-[#6366f1]/20 transition-all duration-200"
                  >
                    Copy All
                  </Button>
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="ghost" 
                    onClick={handleClearEnvMode}
                    className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400 transition-all duration-200"
                  >
                    Clear
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                {envPairs.map((pair, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Input
                      value={pair.key}
                      onChange={e => handleEnvPairChange(idx, 'key', e.target.value)}
                      placeholder="KEY"
                      className="w-1/3"
                    />
                    <Input
                      value={pair.value}
                      onChange={e => handleEnvPairChange(idx, 'value', e.target.value)}
                      placeholder="value"
                      className="w-1/2"
                    />
                    <Button type="button" size="icon" variant="ghost" onClick={() => handleCopyEnvPair(idx)} title="Copy">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button type="button" size="icon" variant="destructive" onClick={() => handleRemoveEnvPair(idx)} title="Remove">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* If not in env mode, show single API key input */}
          {!isEnvMode && (
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key *</Label>
              <div className="relative">
                <Input
                  id="apiKey"
                  type={showApiKey ? 'text' : 'password'}
                  value={formData.apiKey}
                  onChange={(e) => handleInputChange('apiKey', e.target.value)}
                  placeholder="e.g., sk-1234567890abcdef..."
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Add any additional notes about this API key..."
              rows={3}
            />
          </div>

          {/* Category Input - Pro Feature */}
          {hasTagsAndCategories && (
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="Enter category (optional)"
                value={category}
                onChange={e => setCategory(e.target.value)}
              />
            </div>
          )}

          {/* Tags Input - Pro Feature */}
          {hasTagsAndCategories && (
            <div>
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2 flex-wrap mb-2">
                {tags.map(tag => (
                  <Badge key={tag} className="flex items-center gap-1">
                    {tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-1 text-xs">×</button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  placeholder="Add tag"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                />
                <Button 
                  type="button" 
                  onClick={handleAddTag} 
                  variant="secondary"
                  className="hover:bg-[#6366f1]/10 hover:text-[#6366f1] transition-all duration-200"
                >
                  Add
                </Button>
              </div>
            </div>
          )}

          {/* Folder Selection - Pro Feature */}
          {hasFolderOrganization && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="folder" className="flex items-center gap-2">
                  <span>Folder</span>
                  <Badge variant="outline" className="font-normal">Pro Feature</Badge>
                </Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Organize your API keys by placing them in folders
                </p>
              </div>
              
              {showNewFolderInput ? (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="New folder name"
                      value={newFolderName}
                      onChange={e => setNewFolderName(e.target.value)}
                      className="flex-1"
                      autoFocus
                    />
                    <Button 
                      type="button" 
                      size="sm" 
                      onClick={handleCreateFolder}
                      disabled={!newFolderName.trim()}
                      className="bg-gradient-to-r from-[#6366f1] to-[#a21caf] text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Create
                    </Button>
                    <Button 
                      type="button" 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => setShowNewFolderInput(false)}
                      className="hover:bg-[#6366f1]/5 hover:text-[#6366f1] transition-all duration-200"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 items-center">
                  <Select 
                    value={selectedFolderId || 'no-folder'} 
                    onValueChange={setSelectedFolderId}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select folder (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-folder">No Folder</SelectItem>
                      {folders.map(folder => (
                        <SelectItem key={folder.id} value={folder.id}>{folder.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowNewFolderInput(true)}
                  >
                    New Folder
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <Button 
              type="submit" 
              disabled={isLoading || usage.isAtLimit}
              className="bg-gradient-to-r from-[#6366f1] to-[#a21caf] text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3 text-base font-semibold min-h-[44px]"
              size="lg"
            >
              {isLoading ? 'Saving...' : 'Save API Key'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              className="hover:bg-[#6366f1]/5 hover:text-[#6366f1] hover:border-[#6366f1]/20 transition-all duration-200 px-8 py-3 text-base font-semibold min-h-[44px]"
              size="lg"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 