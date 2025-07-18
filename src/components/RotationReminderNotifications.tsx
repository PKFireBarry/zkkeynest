'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, CheckCircle, RotateCcw } from 'lucide-react';

interface RotationReminderNotificationsProps {
  onRefresh?: () => void;
}

interface ReminderStats {
  overdue: number;
  soon: number;
  total: number;
}

export default function RotationReminderNotifications({ onRefresh }: RotationReminderNotificationsProps) {
  const { user } = useUser();
  const [stats, setStats] = useState<ReminderStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const checkReminders = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch('/api/rotation-reminders/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to check rotation reminders');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error checking rotation reminders:', err);
      setError('Failed to check rotation reminders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkReminders();
  }, [user]);

  if (isLoading) {
    return null; // Don't show loading state for notifications
  }

  if (error) {
    return null; // Don't show error state for notifications
  }

  if (!stats || (stats.overdue === 0 && stats.soon === 0)) {
    return null; // Don't show anything if no reminders
  }

  return (
    <Card className="border-l-4 border-l-yellow-500">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <RotateCcw className="h-5 w-5" />
          Rotation Reminders
        </CardTitle>
        <CardDescription>
          Some of your API keys need attention
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {stats.overdue > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>
                <strong>{stats.overdue}</strong> API key{stats.overdue !== 1 ? 's' : ''} overdue for rotation
              </span>
              <Badge variant="destructive">Overdue</Badge>
            </AlertDescription>
          </Alert>
        )}
        
        {stats.soon > 0 && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>
                <strong>{stats.soon}</strong> API key{stats.soon !== 1 ? 's' : ''} due for rotation soon
              </span>
              <Badge variant="secondary">Soon</Badge>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex justify-between items-center pt-2">
          <p className="text-sm text-muted-foreground">
            Total API keys: {stats.total}
          </p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={checkReminders}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 