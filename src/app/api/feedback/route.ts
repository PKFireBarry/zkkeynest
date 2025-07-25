import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createFeedback, getFeedbacks, deleteFeedback } from '@/lib/database';
import { validateFeedbackForm } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Feedback submission attempt:', { body });
    
    validateFeedbackForm(body);

    // Try to get user ID, but don't fail if user is not logged in
    let userId = null;
    try {
      const authResult = await auth();
      userId = authResult.userId || null;
    } catch (authError) {
      // User is not logged in, continue with anonymous feedback
      console.log('User not logged in, proceeding with anonymous feedback');
    }

    const feedbackData = {
      ...body,
      userId,
    };
    
    console.log('Creating feedback with data:', feedbackData);
    
    const id = await createFeedback(feedbackData);
    
    console.log('Feedback created successfully with ID:', id);
    
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error submitting feedback - Full error:', error);
    
    if (error instanceof Error && error.name === 'ValidationException') {
      console.error('Validation error:', error.message);
      return NextResponse.json({ error: error.message, field: (error as any).field }, { status: 400 });
    }
    
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