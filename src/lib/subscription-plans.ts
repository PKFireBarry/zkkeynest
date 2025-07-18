// Subscription plans configuration (safe for client-side use)
export const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    priceId: null,
    features: [
      'Up to 10 API keys',
      'Zero-knowledge encryption',
      'One-time sharing',
      'Rotation reminders',
    ],
    maxKeys: 10,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 3.00,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    features: [
      'Unlimited API keys',
      'Advanced search & organization',
      'Export functionality',
      'Everything in Free',
    ],
    maxKeys: -1, // Unlimited
  },
  team: {
    id: 'team',
    name: 'Team',
    price: 10.00,
    priceId: process.env.STRIPE_TEAM_PRICE_ID!,
    features: [
      'Shared vaults',
      'Role-based permissions',
      'Activity logging',
      'Everything in Pro',
    ],
    maxKeys: -1, // Unlimited
  },
} as const;

export type SubscriptionPlanId = keyof typeof SUBSCRIPTION_PLANS; 