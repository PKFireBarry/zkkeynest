'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Clock, Shield, AlertTriangle } from 'lucide-react';
import { useVault } from '@/contexts/VaultContext';
import { updateUserSessionTimeout } from '@/lib/database';

const TIMEOUT_OPTIONS = [
  { value: 5 * 60 * 1000, label: '5 minutes' },
  { value: 15 * 60 * 1000, label: '15 minutes' },
  { value: 30 * 60 * 1000, label: '30 minutes' },
  { value: 60 * 60 * 1000, label: '1 hour' },
  { value: 2 * 60 * 60 * 1000, label: '2 hours' },
  { value: 4 * 60 * 60 * 1000, label: '4 hours' },
  { value: 8 * 60 * 60 * 1000, label: '8 hours' },
  { value: 24 * 60 * 60 * 1000, label: '24 hours' },
];

export default function SessionTimeoutSettings() {
  const { user } = useUser();
  const { vaultState, checkVaultTimeout, updateSessionTimeout } = useVault();
  
  const [selectedTimeout, setSelectedTimeout] = useState<number>(vaultState.sessionTimeout);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  // Update selected timeout when vault state changes
  useEffect(() => {
    setSelectedTimeout(vaultState.sessionTimeout);
  }, [vaultState.sessionTimeout]);

  // Calculate time remaining if vault is unlocked
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

  const handleTimeoutChange = (value: string) => {
    setSelectedTimeout(parseInt(value));
    setIsSaved(false);
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      await updateSessionTimeout(selectedTimeout);
      setIsSaved(true);
      
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save session timeout:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatTimeRemaining = (ms: number): string => {
    const minutes = Math.floor(ms / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTimeoutOption = (value: number) => {
    return TIMEOUT_OPTIONS.find(option => option.value === value)?.label || 'Custom';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Session Timeout Settings
        </CardTitle>
        <CardDescription>
          Configure how long your vault stays unlocked before automatically locking for security.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Current Status</span>
          </div>
          <Badge variant={vaultState.isUnlocked ? "default" : "secondary"}>
            {vaultState.isUnlocked ? "Unlocked" : "Locked"}
          </Badge>
        </div>

        {/* Time Remaining */}
        {vaultState.isUnlocked && timeRemaining !== null && (
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium">Time Remaining</span>
            </div>
            <span className="text-sm font-mono">
              {formatTimeRemaining(timeRemaining)}
            </span>
          </div>
        )}

        {/* Timeout Selection */}
        <div className="space-y-2">
          <Label htmlFor="timeout-select">Session Timeout</Label>
          <Select value={selectedTimeout.toString()} onValueChange={handleTimeoutChange}>
            <SelectTrigger id="timeout-select">
              <SelectValue placeholder="Select timeout duration" />
            </SelectTrigger>
            <SelectContent>
              {TIMEOUT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Current Setting */}
        <div className="text-sm text-muted-foreground">
          Current setting: <span className="font-medium">{getTimeoutOption(selectedTimeout)}</span>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleSave} 
            disabled={isSaving || selectedTimeout === vaultState.sessionTimeout}
            size="sm"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
          {isSaved && (
            <Badge variant="outline" className="text-green-600 border-green-600">
              Saved!
            </Badge>
          )}
        </div>

        {/* Security Note */}
        <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
          <strong>Security Note:</strong> Shorter timeouts provide better security by automatically 
          locking your vault when inactive. Longer timeouts provide convenience but reduce security.
        </div>
      </CardContent>
    </Card>
  );
} 