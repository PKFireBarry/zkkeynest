import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getApiKeys, updateApiKey } from '@/lib/database';
import { ApiKey, RotationReminder } from '@/types';

export async function POST() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all API keys for the user
    const apiKeys = await getApiKeys(userId);
    const now = new Date();
    const overdueKeys: ApiKey[] = [];
    const soonKeys: ApiKey[] = [];

    // Check each API key for rotation reminders
    for (const apiKey of apiKeys) {
      if (!apiKey.rotationReminder?.enabled) continue;

      const reminder = apiKey.rotationReminder;
      
      if (reminder.nextReminder) {
        const nextReminderDate = new Date(reminder.nextReminder.seconds * 1000);
        const daysUntil = Math.ceil((nextReminderDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        // Check if overdue
        if (daysUntil <= 0 && !reminder.isOverdue) {
          // Mark as overdue
          const updatedReminder: RotationReminder = {
            enabled: reminder.enabled,
            frequency: reminder.frequency,
            isOverdue: true,
            lastRotated: reminder.lastRotated,
            nextReminder: reminder.nextReminder,
          };
          
          await updateApiKey(apiKey.id, {
            rotationReminder: updatedReminder,
          });
          overdueKeys.push(apiKey);
        }
        // Check if due soon (within 7 days)
        else if (daysUntil <= 7 && daysUntil > 0) {
          soonKeys.push(apiKey);
        }
      }
    }

    return NextResponse.json({
      overdue: overdueKeys.length,
      soon: soonKeys.length,
      total: apiKeys.length,
    });
  } catch (error) {
    console.error('Error checking rotation reminders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 