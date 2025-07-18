import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { 
  createStripeCustomer, 
  getStripeCustomer, 
  createCheckoutSession,
  SUBSCRIPTION_PLANS 
} from '@/lib/stripe';
import { getUser, updateUserStripeCustomerId } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { planId } = await request.json();
    
    if (!planId || !SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS]) {
      return NextResponse.json(
        { error: 'Invalid plan ID' },
        { status: 400 }
      );
    }

    const plan = SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS];
    
    if (plan.id === 'free') {
      return NextResponse.json(
        { error: 'Cannot upgrade to free plan' },
        { status: 400 }
      );
    }

    // Get user data
    const userData = await getUser(userId);
    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get or create Stripe customer
    let customer = await getStripeCustomer(userId);
    
    if (!customer) {
      customer = await createStripeCustomer(
        userId,
        userData.email,
        userData.displayName
      );
      
      // Update user with Stripe customer ID
      await updateUserStripeCustomerId(userId, customer.id);
    }

    // Create checkout session
    const successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`;
    const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canceled=true`;
    
    const session = await createCheckoutSession(
      customer.id,
      plan.priceId!,
      successUrl,
      cancelUrl
    );

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 