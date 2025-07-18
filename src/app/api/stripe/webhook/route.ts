import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe, STRIPE_CONFIG } from '@/lib/stripe';
import { updateUserSubscription } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        STRIPE_CONFIG.webhookSecret
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = event.data.object as any;
        const customerId = subscription.customer;
        
        // Get customer metadata to find userId
        const customer = await stripe.customers.retrieve(customerId as string);
        const userId = 'metadata' in customer ? customer.metadata?.userId : null;
        
        if (userId) {
          let subscriptionStatus = 'free';
          
          if (subscription.status === 'active') {
            // Determine plan based on price ID
            const priceId = subscription.items.data[0]?.price.id;
            
            if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
              subscriptionStatus = 'pro';
            } else if (priceId === process.env.STRIPE_TEAM_PRICE_ID) {
              subscriptionStatus = 'team';
            }
          } else if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
            subscriptionStatus = 'free';
          }
          
          await updateUserSubscription(userId, subscriptionStatus as 'free' | 'pro' | 'team');
          console.log(`Updated user ${userId} subscription to ${subscriptionStatus}`);
        }
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 