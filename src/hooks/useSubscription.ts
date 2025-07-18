'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { getUser } from '@/lib/database';
import { SUBSCRIPTION_PLANS } from '@/lib/subscription-plans';

export type SubscriptionPlan = 'free' | 'pro' | 'team';

export function useSubscription() {
  const { user } = useUser();
  const [subscription, setSubscription] = useState<SubscriptionPlan>('free');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      try {
        const userData = await getUser(user.id);
        setSubscription(userData?.subscription || 'free');
      } catch (error) {
        console.error('Failed to fetch subscription status:', error);
        setSubscription('free');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  const currentPlan = SUBSCRIPTION_PLANS[subscription];

  // Feature access checks based on your Pro plan features
  const hasUnlimitedKeys = subscription !== 'free';
  const hasAdvancedSearch = subscription !== 'free'; // Advanced search & filtering
  const hasTagsAndCategories = subscription !== 'free'; // Tags & categories
  const hasFolderOrganization = subscription !== 'free'; // Folder organization
  const hasExportFunctionality = subscription !== 'free'; // Export functionality
  const hasTeamFeatures = subscription === 'team'; // Team features (coming soon)

  // Check if user can add more keys
  const canAddMoreKeys = (currentCount: number) => {
    if (hasUnlimitedKeys) return true;
    return currentCount < currentPlan.maxKeys;
  };

  return {
    subscription,
    currentPlan,
    isLoading,
    hasUnlimitedKeys,
    hasAdvancedSearch,
    hasTagsAndCategories,
    hasFolderOrganization,
    hasExportFunctionality,
    hasTeamFeatures,
    canAddMoreKeys,
    isPro: subscription === 'pro',
    isTeam: subscription === 'team',
    isFree: subscription === 'free'
  };
}