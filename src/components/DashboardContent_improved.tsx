'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { useVault } from '@/contexts/VaultContext';
import { getUser } from '@/lib/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Shield, Crown, CheckCircle } from 'lucide-react';
import DashboardSidebar, { useSidebarPreferences } from './DashboardSidebar';
import { SidebarView } from '@/types/sidebar';
import MasterPasswordSetup from './MasterPasswordSetup';
import VaultUnlock from './VaultUnlock';
import AddApiKeyForm from './AddApiKeyForm';
import ApiKeyList from './ApiKeyList';
import DataManagement from './DataManagement';
import SessionTimeoutSettings from './SessionTimeoutSettings';
import BillingDashboard from './BillingDashboard';
import RotationReminderNotifications from './RotationReminderNotifications';
import { clearUserData } from '@/lib/database';
import { AlertTriangle } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { cn } from '@/lib/utils';
import FolderDragAndDrop from './FolderDragAndDrop';
import { ToastProvider } from './ui/toast';
import ConfirmationModal from './ConfirmationModal';

// SessionTimeoutTimer: shows time remaining - always visible across all sidebar views
function SessionTimeoutTimer() {
  const { vaultState } = useVault();
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!vaultState.isUnlocked || !vaultState.unlockTime) {
      setTimeRemaining(null);
      return;
    }
    const updateTimeRemaining = () => {
      const now = Date.now();
      const elapsed = now - (vaultState.unlockTime || 0);
      const remaining = Math.max(0, vaultState.sessionTimeout - elapsed);
      setTimeRemaining(remaining);
    };
    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [vaultState.isUnlocked, vaultState.unlockTime, vaultState.sessionTimeout]);

  if (!vaultState.isUnlocked || timeRemaining === null) return null;

  const minutes = Math.floor(timeRemaining / (1000 * 60));
  const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
  const formatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  
  // Determine if session is about to expire (less than 2 minutes)
  const isExpiringSoon = timeRemaining < 2 * 60 * 1000;
  const isCritical = timeRemaining < 30 * 1000; // Less than 30 seconds

  return (
    <div 
      className={cn(
        "flex items-center gap-2 rounded-xl px-4 py-3 w-fit transition-all duration-300 shadow-sm",
        // Enhanced visibility when session is about to expire
        isExpiringSoon 
          ? isCritical 
            ? "bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-800/50 animate-pulse" 
            : "bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/50"
          : "bg-muted border border-border"
      )}
      role="status"
      aria-live="polite"
      aria-label={`Session timeout: ${formatted} remaining`}
    >
      <AlertTriangle 
        className={cn(
          "h-4 w-4 transition-colors duration-300",
          isCritical 
            ? "text-red-600 dark:text-red-400 animate-pulse" 
            : isExpiringSoon 
              ? "text-amber-600 dark:text-amber-400" 
              : "text-amber-500"
        )} 
        aria-hidden="true"
      />
      <span className="text-sm font-medium hidden sm:inline">
        Session time left:
      </span>
      <span className="text-sm font-medium sm:hidden">
        Session:
      </span>
      <span 
        className={cn(
          "text-sm font-mono font-semibold transition-colors duration-300",
          isCritical 
            ? "text-red-600 dark:text-red-400" 
            : isExpiringSoon 
              ? "text-amber-700 dark:text-amber-300" 
              : "text-foreground"
        )}
      >
        {formatted}
      </span>
    </div>
  );
}

interface DashboardContentProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

function DashboardContentInner({ activeView, onViewChange }: DashboardContentProps) {
  const { user } = useUser();
  const { isUnlocked, lockVault } = useVault();
  const { hasFolderOrganization } = useSubscription();

  // Handle lock vault action
  const handleLockVault = () => {
    lockVault();
  };

  // Handle the lock-vault view change using useEffect
  useEffect(() => {
    if (activeView === 'lock-vault') {
      // Use setTimeout to defer the state update until after render
      setTimeout(() => {
        handleLockVault();
      }, 0);
    }
  }, [activeView]);

  const [hasMasterPassword, setHasMasterPassword] = useState<boolean | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [apiKeysCount, setApiKeysCount] = useState(0);
  const [viewMode, setViewMode] = useState<'list' | 'folder'>('list');

  const handleAddSuccess = () => {
    setShowAddForm(false);
    // Trigger a refresh of the API keys list
    setRefreshTrigger(prev => prev + 1);
  };

  const handleRefreshKeys = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Listen for sidebar actions (lock vault)
  useEffect(() => {
    const handleSidebarAction = (event: CustomEvent) => {
      const { action } = event.detail;
      if (action === 'lock-vault') {
        handleLockVault();
      }
    };

    window.addEventListener('sidebar-action', handleSidebarAction as EventListener);
    return () => {
      window.removeEventListener('sidebar-action', handleSidebarAction as EventListener);
    };
  }, []);

  useEffect(() => {
    const checkMasterPassword = async () => {
      if (!user) return;

      try {
        const userData = await getUser(user.id);
        setHasMasterPassword(!!userData?.masterPasswordSalt);

        // Also load API keys count for usage display
        if (userData?.masterPasswordSalt) {
          const { getApiKeys } = await import('@/lib/database');
          const apiKeys = await getApiKeys(user.id);
          setApiKeysCount(apiKeys.length);
        }
      } catch (error) {
        console.error('Failed to check unlock password status:', error);
        // If Firebase is not configured or permissions are missing, 
        // assume user needs to set up unlock password
        setHasMasterPassword(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkMasterPassword();
  }, [user]);



  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  // User hasn't set up unlock password yet
  if (hasMasterPassword === false) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-4xl w-full mx-auto space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4 leading-tight">
              Welcome to <span className="bg-gradient-to-r from-[#6366f1] to-[#a21caf] bg-clip-text text-transparent">zKkeynest</span>
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              Set up your unlock password to start securely storing API keys.
            </p>
          </div>

          <MasterPasswordSetup />
        </div>
      </div>
    );
  }

  // User has unlock password but vault is locked
  if (hasMasterPassword && !isUnlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-4xl w-full mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4 leading-tight">
              <span className="bg-gradient-to-r from-[#6366f1] to-[#a21caf] bg-clip-text text-transparent">Unlock Your Vault</span>
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              Enter your unlock password to access your API keys.
            </p>
          </div>
          <VaultUnlock />
        </div>
      </div>
    );
  }

  // Render main content based on active view
  function renderMainContent() {
    const currentView = activeView || 'api-keys'; // Fallback to api-keys if activeView is undefined
    switch (currentView) {
      case 'api-keys':
        return (
          <div className="space-y-6">
            {/* Welcome Header */}
            <div className="text-center mb-8 sm:mb-12">
              <div className="flex flex-col items-center max-w-4xl w-full gap-6 mx-auto">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <Badge className="flex items-center gap-2 px-4 py-2 text-sm bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 font-medium">
                    <Shield className="h-4 w-4" />
                    Vault Unlocked
                  </Badge>
                  
                  {/* Subscription Status Badge */}
                  <Badge 
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium ${
                      hasFolderOrganization 
                        ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                        : 'bg-gray-50 dark:bg-gray-950/20 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800'
                    }`}
                  >
                    {hasFolderOrganization ? (
                      <>
                        <Crown className="h-4 w-4" />
                        Pro Plan
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Free Plan
                      </>
                    )}
                  </Badge>
                </div>
                
                <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
                  Welcome back, <span className="bg-gradient-to-r from-[#6366f1] to-[#a21caf] bg-clip-text text-transparent">{user?.firstName || 'User'}</span>!
                </h1>
                
                <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
                  Your secure API key vault is unlocked and ready to use.
                </p>
              </div>
            </div>

            {/* Add API Key Section */}
            {showAddForm ? (
              <AddApiKeyForm
                onSuccess={handleAddSuccess}
                onCancel={() => setShowAddForm(false)}
              />
            ) : (
              <div className="space-y-6">
                {/* API Keys Header Card */}
                <Card className="bg-card border-border shadow-sm rounded-xl hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Header and Description */}
                      <div>
                        <p className="text-muted-foreground text-sm sm:text-base">
                          Store and manage your API keys securely with zero-knowledge encryption.
                        </p>
                      </div>
                      
                      {/* Usage Display */}
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Usage:</span>
                        <Badge variant="secondary" className="font-medium">
                          {apiKeysCount} keys
                        </Badge>
                      </div>
                      
                      {/* Controls Row - View Mode and Add Button */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
                        {/* Left side - View Mode Toggle (Pro Feature) */}
                        <div className="flex items-center gap-4">
                          {hasFolderOrganization && (
                            <>
                              <div className="text-sm font-semibold text-foreground">View Mode:</div>
                              <div className="flex border rounded-xl overflow-hidden shadow-sm bg-background w-fit">
                                <Button
                                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                                  size="sm"
                                  onClick={() => setViewMode('list')}
                                  className={cn(
                                    "rounded-none border-0 transition-all duration-200 flex-1 sm:flex-none",
                                    viewMode === 'list' && "bg-gradient-to-r from-[#6366f1] to-[#a21caf] text-white shadow-lg"
                                  )}
                                >
                                  List View
                                </Button>
                                <Button
                                  variant={viewMode === 'folder' ? 'default' : 'ghost'}
                                  size="sm"
                                  onClick={() => setViewMode('folder')}
                                  className={cn(
                                    "rounded-none border-0 transition-all duration-200 flex-1 sm:flex-none",
                                    viewMode === 'folder' && "bg-gradient-to-r from-[#6366f1] to-[#a21caf] text-white shadow-lg"
                                  )}
                                >
                                  Folder View
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                        
                        {/* Right side - Add API Key Button */}
                        <Button 
                          onClick={() => setShowAddForm(true)}
                          className="bg-gradient-to-r from-[#6366f1] to-[#a21caf] text-white shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto"
                          size="lg"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add API Key
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Rotation Reminder Notifications */}
                <RotationReminderNotifications onRefresh={handleRefreshKeys} />
              </div>
            )}

            {/* Folder View - Pro Feature */}
            {hasFolderOrganization && viewMode === 'folder' && (
              <FolderDragAndDrop onRefresh={handleRefreshKeys} />
            )}

            {/* List View */}
            {(!hasFolderOrganization || viewMode === 'list') && (
              <ApiKeyList key={refreshTrigger} onRefresh={handleRefreshKeys} />
            )}
          </div>
        );

      case 'data-management':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-2 leading-tight">
                <span className="bg-gradient-to-r from-[#6366f1] to-[#a21caf] bg-clip-text text-transparent">Data Management</span>
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
                Import, export, and manage your API key data.
              </p>
            </div>
            <DataManagement onRefresh={handleRefreshKeys} />
          </div>
        );

      case 'billing':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-2 leading-tight">
                <span className="bg-gradient-to-r from-[#6366f1] to-[#a21caf] bg-clip-text text-transparent">Billing & Subscription</span>
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
                Manage your subscription and billing information.
              </p>
            </div>
            <BillingDashboard onUpgrade={handleRefreshKeys} />
          </div>
        );

      case 'session-timeout':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-2 leading-tight">
                <span className="bg-gradient-to-r from-[#6366f1] to-[#a21caf] bg-clip-text text-transparent">Session Timeout Settings</span>
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
                Configure how long your vault stays unlocked.
              </p>
            </div>
            <SessionTimeoutSettings />
          </div>
        );

      default:
        // Always default to API keys view - this should never show "Select a view"
        // Fall back to the same content as 'api-keys' case
        return (
          <div className="space-y-6">
            {/* Welcome Header */}
            <div className="text-center mb-8 sm:mb-12">
              <div className="flex flex-col items-center max-w-4xl w-full gap-6 mx-auto">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <Badge className="flex items-center gap-2 px-4 py-2 text-sm bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 font-medium">
                    <Shield className="h-4 w-4" />
                    Vault Unlocked
                  </Badge>
                  
                  {/* Subscription Status Badge */}
                  <Badge 
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium ${
                      hasFolderOrganization 
                        ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                        : 'bg-gray-50 dark:bg-gray-950/20 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800'
                    }`}
                  >
                    {hasFolderOrganization ? (
                      <>
                        <Crown className="h-4 w-4" />
                        Pro Plan
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Free Plan
                      </>
                    )}
                  </Badge>
                </div>
                
                <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
                  Welcome back, <span className="bg-gradient-to-r from-[#6366f1] to-[#a21caf] bg-clip-text text-transparent">{user?.firstName || 'User'}</span>!
                </h1>
                
                <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
                  Your secure API key vault is unlocked and ready to use.
                </p>
              </div>
            </div>

            {/* Add API Key Section */}
            {showAddForm ? (
              <AddApiKeyForm
                onSuccess={handleAddSuccess}
                onCancel={() => setShowAddForm(false)}
              />
            ) : (
              <div className="space-y-6">
                {/* API Keys Header Card */}
                <Card className="bg-card border-border shadow-sm rounded-xl hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Header and Description */}
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">API Keys</h2>
                        <p className="text-muted-foreground text-sm sm:text-base">
                          Store and manage your API keys securely with zero-knowledge encryption.
                        </p>
                      </div>
                      
                      {/* Usage Display */}
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Usage:</span>
                        <Badge variant="secondary" className="font-medium">
                          {apiKeysCount} keys
                        </Badge>
                      </div>
                      
                      {/* Controls Row - View Mode and Add Button */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
                        {/* Left side - View Mode Toggle (Pro Feature) */}
                        <div className="flex items-center gap-4">
                          {hasFolderOrganization && (
                            <>
                              <div className="text-sm font-semibold text-foreground">View Mode:</div>
                              <div className="flex border rounded-xl overflow-hidden shadow-sm bg-background w-fit">
                                <Button
                                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                                  size="sm"
                                  onClick={() => setViewMode('list')}
                                  className={cn(
                                    "rounded-none border-0 transition-all duration-200 flex-1 sm:flex-none",
                                    viewMode === 'list' && "bg-gradient-to-r from-[#6366f1] to-[#a21caf] text-white shadow-lg"
                                  )}
                                >
                                  List View
                                </Button>
                                <Button
                                  variant={viewMode === 'folder' ? 'default' : 'ghost'}
                                  size="sm"
                                  onClick={() => setViewMode('folder')}
                                  className={cn(
                                    "rounded-none border-0 transition-all duration-200 flex-1 sm:flex-none",
                                    viewMode === 'folder' && "bg-gradient-to-r from-[#6366f1] to-[#a21caf] text-white shadow-lg"
                                  )}
                                >
                                  Folder View
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                        
                        {/* Right side - Add API Key Button */}
                        <Button 
                          onClick={() => setShowAddForm(true)}
                          className="bg-gradient-to-r from-[#6366f1] to-[#a21caf] text-white shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto"
                          size="lg"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add API Key
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Rotation Reminder Notifications */}
                <RotationReminderNotifications onRefresh={handleRefreshKeys} />
              </div>
            )}

            {/* Folder View - Pro Feature */}
            {hasFolderOrganization && viewMode === 'folder' && (
              <FolderDragAndDrop onRefresh={handleRefreshKeys} />
            )}

            {/* List View */}
            {(!hasFolderOrganization || viewMode === 'list') && (
              <ApiKeyList key={refreshTrigger} onRefresh={handleRefreshKeys} />
            )}
          </div>
        );
    }
  }

  // Vault is unlocked - show main dashboard
  return (
    <div className="min-h-screen bg-background pt-20 overflow-x-hidden w-full">
      <main className="w-full px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-center">
        <div className="w-full max-w-6xl mx-auto">
          {/* Session Timer - positioned at top right */}
          <div className="mb-6 flex justify-end">
            <SessionTimeoutTimer />
          </div>
          
          {renderMainContent()}
        </div>
      </main>
    </div>
  );
}

export default function DashboardContent({ activeView, onViewChange }: DashboardContentProps) {
  return (
    <ToastProvider>
      <DashboardContentInner activeView={activeView} onViewChange={onViewChange} />
    </ToastProvider>
  );
}