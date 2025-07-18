'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { getUser } from '@/lib/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, Crown, Users, Zap, CheckCircle, Shield, Key, Share2, RotateCcw, Clock, Download, Database, Lock, Search } from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '@/lib/subscription-plans';

interface BillingDashboardProps {
  onUpgrade?: () => void;
}

export default function BillingDashboard({ onUpgrade }: BillingDashboardProps) {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentSubscription, setCurrentSubscription] = useState<'free' | 'pro' | 'team'>('free');
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);

  // Fetch user's subscription status from database
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) return;
      
      try {
        const userData = await getUser(user.id);
        setCurrentSubscription(userData?.subscription || 'free');
      } catch (error) {
        console.error('Failed to fetch subscription status:', error);
        setCurrentSubscription('free');
      } finally {
        setIsLoadingSubscription(false);
      }
    };

    fetchSubscription();
  }, [user]);

  const currentPlan = SUBSCRIPTION_PLANS[currentSubscription];

  if (isLoadingSubscription) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading subscription status...</p>
        </div>
      </div>
    );
  }

  const handleUpgrade = async (planId: string) => {
    if (planId === 'free') return;
    
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      const stripe = await import('@stripe/stripe-js');
      const stripeInstance = await stripe.loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
      );

      if (stripeInstance) {
        const { error } = await stripeInstance.redirectToCheckout({
          sessionId: data.sessionId,
        });

        if (error) {
          throw new Error(error.message);
        }
      }
    } catch (err) {
      console.error('Error creating checkout session:', err);
      setError(err instanceof Error ? err.message : 'Failed to create checkout session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create portal session');
      }

      // Redirect to Stripe Customer Portal
      window.location.href = data.url;
    } catch (err) {
      console.error('Error creating portal session:', err);
      setError(err instanceof Error ? err.message : 'Failed to create portal session');
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh subscription status after successful payment
  const refreshSubscription = async () => {
    if (!user) return;
    
    try {
      const userData = await getUser(user.id);
      setCurrentSubscription(userData?.subscription || 'free');
    } catch (error) {
      console.error('Failed to refresh subscription status:', error);
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free':
        return <CheckCircle className="h-6 w-6" />;
      case 'pro':
        return <Crown className="h-6 w-6" />;
      case 'team':
        return <Users className="h-6 w-6" />;
      default:
        return <CreditCard className="h-6 w-6" />;
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'free':
        return {
          color: 'text-green-500',
          bgColor: 'bg-green-50 dark:bg-green-950'
        };
      case 'pro':
        return {
          color: 'text-blue-500',
          bgColor: 'bg-blue-50 dark:bg-blue-950'
        };
      case 'team':
        return {
          color: 'text-purple-500',
          bgColor: 'bg-purple-50 dark:bg-purple-950'
        };
      default:
        return {
          color: 'text-gray-500',
          bgColor: 'bg-gray-50 dark:bg-gray-950'
        };
    }
  };

  const getPlanFeatures = (planId: string) => {
    const baseFeatures = {
      free: [
        { icon: Key, title: 'Up to 10 API Keys', description: 'Store and manage up to 10 API keys with full encryption' },
        { icon: Shield, title: 'Zero-Knowledge Encryption', description: 'Your keys are encrypted client-side with AES-256' },
        { icon: Lock, title: 'Unlock Password Protection', description: 'Additional security layer never stored on servers' },
        { icon: Share2, title: 'One-Time Secure Sharing', description: 'Create encrypted share links that expire after use' },
        { icon: Clock, title: 'Session Timeout Settings', description: 'Configurable auto-lock for vault security' },
        { icon: RotateCcw, title: 'Rotation Reminders', description: 'Automated reminders for API key rotation' }
      ],
      pro: [
        { icon: Database, title: 'Unlimited API Keys', description: 'Store as many API keys as you need without limits' },
        { icon: Search, title: 'Advanced Search & Organization', description: 'Powerful search, tags, categories, and folders' },
        { icon: Download, title: 'Export Functionality', description: 'Export keys as encrypted backup files' },
        { icon: CheckCircle, title: 'Everything in Free', description: 'All free plan features plus unlimited storage' }
      ],
      team: [
        { icon: Users, title: 'Shared Vaults', description: 'Create shared vaults for team API key access' },
        { icon: Shield, title: 'Role-Based Permissions', description: 'Control who can view, edit, or share keys' },
        { icon: Clock, title: 'Activity Logging', description: 'Track access for security and compliance' },
        { icon: CheckCircle, title: 'Everything in Pro', description: 'All pro features plus team collaboration' }
      ]
    };
    return baseFeatures[planId as keyof typeof baseFeatures] || [];
  };

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getPlanIcon(currentSubscription)}
            Current Plan: {currentPlan.name}
          </CardTitle>
          <CardDescription>
            You are currently on the {currentPlan.name} plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Plan</span>
            <Badge variant={currentSubscription === 'free' ? 'secondary' : 'default'}>
              {currentPlan.name}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Price</span>
            <span className="font-medium">
              {currentPlan.price === 0 ? 'Free' : `$${currentPlan.price}/month`}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">API Key Limit</span>
            <span className="font-medium">
              {currentPlan.maxKeys === -1 ? 'Unlimited' : `${currentPlan.maxKeys} keys`}
            </span>
          </div>

          <div className="flex gap-2">
            {currentSubscription !== 'free' && (
              <Button 
                onClick={handleManageBilling}
                disabled={isLoading}
                variant="outline"
                className="flex-1"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {isLoading ? 'Loading...' : 'Manage Billing'}
              </Button>
            )}
            <Button 
              onClick={refreshSubscription}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Available Plans</h3>
        
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          {Object.entries(SUBSCRIPTION_PLANS).map(([planId, plan]) => (
            <Card key={planId} className={`relative ${planId === currentSubscription ? 'ring-2 ring-primary' : ''}`}>
              {planId === currentSubscription && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Current Plan
                  </Badge>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getPlanIcon(planId)}
                  {plan.name}
                </CardTitle>
                <CardDescription>
                  {plan.price === 0 ? 'Free forever' : `$${plan.price}/month`}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleUpgrade(planId)}
                  disabled={isLoading || planId === currentSubscription || planId === 'team'}
                  className="w-full"
                  variant={planId === currentSubscription ? 'outline' : 'default'}
                >
                  {planId === currentSubscription 
                    ? 'Current Plan' 
                    : planId === 'team' 
                    ? 'Coming Soon' 
                    : isLoading 
                    ? 'Loading...' 
                    : planId === 'free' 
                    ? 'Downgrade' 
                    : 'Upgrade'
                  }
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 