import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { createFeedback, getFeedbacks, deleteFeedback } from '@/lib/database';
import { validateFeedbackForm } from '@/lib/validation';
import { isAdmin } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const body = await request.json();
    validateFeedbackForm(body);

    const feedbackData = {
      ...body,
      userId: userId || undefined,
    };
    const id = await createFeedback(feedbackData);
    return NextResponse.json({ success: true, id });
  } catch (error) {
    if (error instanceof Error && error.name === 'ValidationException') {
      return NextResponse.json({ error: error.message, field: (error as any).field }, { status: 400 });
    }
    console.error('Error submitting feedback:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Simple admin check - only allow your specific user ID
    const isAdminUser = userId === 'user_2zvYkVykg0hZDCqGFOMHNnWkyWM';
    
    if (!isAdminUser) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const feedbacks = await getFeedbacks();
    return NextResponse.json({ feedbacks });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Simple admin check - only allow your specific user ID
    const isAdminUser = userId === 'user_2zvYkVykg0hZDCqGFOMHNnWkyWM';
    
    if (!isAdminUser) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const { searchParams } = new URL(request.url);
    const feedbackId = searchParams.get('id');
    
    if (!feedbackId) {
      return NextResponse.json({ error: 'Feedback ID is required' }, { status: 400 });
    }
    
    await deleteFeedback(feedbackId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 