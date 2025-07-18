'use client';

import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { RotationReminder } from '@/types';

interface RotationReminderBadgeProps {
  reminder?: RotationReminder;
}

export default function RotationReminderBadge({ reminder }: RotationReminderBadgeProps) {
  if (!reminder?.enabled) {
    return null;
  }

  const getReminderStatus = () => {
    if (reminder.isOverdue) {
      return {
        variant: 'destructive' as const,
        icon: <AlertTriangle className="h-3 w-3" />,
        text: 'Overdue',
        tooltip: 'Key rotation is overdue'
      };
    }

    if (reminder.nextReminder) {
      const nextDate = new Date(reminder.nextReminder.seconds * 1000);
      const daysUntil = Math.ceil((nextDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      if (daysUntil <= 0) {
        return {
          variant: 'destructive' as const,
          icon: <AlertTriangle className="h-3 w-3" />,
          text: 'Due',
          tooltip: 'Key rotation is due'
        };
      }
      
      if (daysUntil <= 7) {
        return {
          variant: 'secondary' as const,
          icon: <Clock className="h-3 w-3" />,
          text: `${daysUntil}d`,
          tooltip: `Due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`
        };
      }
      
      return {
        variant: 'outline' as const,
        icon: <CheckCircle className="h-3 w-3" />,
        text: `${daysUntil}d`,
        tooltip: `Due in ${daysUntil} days`
      };
    }

    return null;
  };

  const status = getReminderStatus();
  
  if (!status) {
    return null;
  }

  return (
    <Badge 
      variant={status.variant} 
      className="flex items-center gap-1 text-xs"
      title={status.tooltip}
    >
      {status.icon}
      {status.text}
    </Badge>
  );
} 