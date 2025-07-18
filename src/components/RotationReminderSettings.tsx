'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, CheckCircle, RotateCcw } from 'lucide-react';
import { updateApiKey } from '@/lib/database';
import { ApiKey, RotationReminder } from '@/types';

interface RotationReminderSettingsProps {
  apiKey: ApiKey;
  onUpdate?: () => void;
}

const ROTATION_FREQUENCIES = [
  { value: '30', label: '30 days' },
  { value: '60', label: '60 days' },
  { value: '90', label: '90 days' },
  { value: '180', label: '180 days' },
  { value: '365', label: '1 year' },
] as const;

export default function RotationReminderSettings({ apiKey, onUpdate }: RotationReminderSettingsProps) {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [reminder, setReminder] = useState<RotationReminder>({
    enabled: apiKey.rotationReminder?.enabled || false,
    frequency: apiKey.rotationReminder?.frequency || '90',
    lastRotated: apiKey.rotationReminder?.lastRotated,
    nextReminder: apiKey.rotationReminder?.nextReminder,
    isOverdue: apiKey.rotationReminder?.isOverdue || false,
  });

  const handleToggleReminder = async (enabled: boolean) => {
    if (!user) return;
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const updatedReminder: RotationReminder = {
        ...reminder,
        enabled,
        isOverdue: false,
      };
      
      // Calculate next reminder date if enabling
      if (enabled && !reminder.lastRotated) {
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + parseInt(reminder.frequency));
        updatedReminder.nextReminder = new Date(nextDate) as any;
      }
      
      // Remove undefined values to avoid Firestore errors
      const cleanReminder = Object.fromEntries(
        Object.entries(updatedReminder).filter(([_, value]) => value !== undefined)
      ) as RotationReminder;
      
      await updateApiKey(apiKey.id, {
        rotationReminder: cleanReminder,
      });
      
      setReminder(updatedReminder);
      setSuccess('Rotation reminder updated successfully');
      onUpdate?.();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update rotation reminder');
      console.error('Error updating rotation reminder:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFrequencyChange = async (frequency: string) => {
    if (!user) return;
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const updatedReminder: RotationReminder = {
        ...reminder,
        frequency: frequency as RotationReminder['frequency'],
        isOverdue: false,
      };
      
      // Recalculate next reminder date
      if (reminder.enabled) {
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + parseInt(frequency));
        updatedReminder.nextReminder = new Date(nextDate) as any;
      }
      
      // Remove undefined values to avoid Firestore errors
      const cleanReminder = Object.fromEntries(
        Object.entries(updatedReminder).filter(([_, value]) => value !== undefined)
      ) as RotationReminder;
      
      await updateApiKey(apiKey.id, {
        rotationReminder: cleanReminder,
      });
      
      setReminder(updatedReminder);
      setSuccess('Rotation frequency updated successfully');
      onUpdate?.();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update rotation frequency');
      console.error('Error updating rotation frequency:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkRotated = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const now = new Date();
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + parseInt(reminder.frequency));
      
      const updatedReminder: RotationReminder = {
        ...reminder,
        lastRotated: now as any,
        nextReminder: nextDate as any,
        isOverdue: false,
      };
      
      // Remove undefined values to avoid Firestore errors
      const cleanReminder = Object.fromEntries(
        Object.entries(updatedReminder).filter(([_, value]) => value !== undefined)
      ) as RotationReminder;
      
      await updateApiKey(apiKey.id, {
        rotationReminder: cleanReminder,
      });
      
      setReminder(updatedReminder);
      setSuccess('Key marked as rotated successfully');
      onUpdate?.();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to mark key as rotated');
      console.error('Error marking key as rotated:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getReminderStatus = () => {
    if (!reminder.enabled) {
      return { status: 'disabled', message: 'Rotation reminders disabled', icon: null };
    }
    
    if (reminder.isOverdue) {
      return { 
        status: 'overdue', 
        message: 'Key rotation overdue', 
        icon: <AlertTriangle className="h-4 w-4 text-destructive" />
      };
    }
    
    if (reminder.nextReminder) {
      const nextDate = new Date(reminder.nextReminder.seconds * 1000);
      const daysUntil = Math.ceil((nextDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      if (daysUntil <= 7) {
        return { 
          status: 'soon', 
          message: `Due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`, 
          icon: <Clock className="h-4 w-4 text-yellow-500" />
        };
      }
      
      return { 
        status: 'upcoming', 
        message: `Due in ${daysUntil} days`, 
        icon: <CheckCircle className="h-4 w-4 text-green-500" />
      };
    }
    
    return { status: 'unknown', message: 'No reminder set', icon: null };
  };

  const status = getReminderStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RotateCcw className="h-5 w-5" />
          Rotation Reminder
        </CardTitle>
        <CardDescription>
          Get notified when it's time to rotate your API key for better security.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Enable/Disable Switch */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="rotation-reminder">Enable rotation reminders</Label>
            <p className="text-sm text-muted-foreground">
              Get notified when it's time to rotate this API key
            </p>
          </div>
          <Switch
            id="rotation-reminder"
            checked={reminder.enabled}
            onCheckedChange={handleToggleReminder}
            disabled={isLoading}
          />
        </div>

        {/* Frequency Selection */}
        {reminder.enabled && (
          <div className="space-y-2">
            <Label htmlFor="rotation-frequency">Reminder frequency</Label>
            <Select
              value={reminder.frequency}
              onValueChange={handleFrequencyChange}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                {ROTATION_FREQUENCIES.map((freq) => (
                  <SelectItem key={freq.value} value={freq.value}>
                    {freq.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Status Display */}
        {reminder.enabled && (
          <div className="space-y-2">
            <Label>Status</Label>
            <div className="flex items-center gap-2">
              {status.icon}
              <span className="text-sm">{status.message}</span>
              {status.status === 'overdue' && (
                <Badge variant="destructive">Overdue</Badge>
              )}
              {status.status === 'soon' && (
                <Badge variant="secondary">Soon</Badge>
              )}
            </div>
            
            {reminder.lastRotated && (
              <p className="text-xs text-muted-foreground">
                Last rotated: {new Date(reminder.lastRotated.seconds * 1000).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        {/* Mark as Rotated Button */}
        {reminder.enabled && (reminder.isOverdue || status.status === 'soon') && (
          <Button
            onClick={handleMarkRotated}
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Mark as Rotated
          </Button>
        )}
      </CardContent>
    </Card>
  );
} 