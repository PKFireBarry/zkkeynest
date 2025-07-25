import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    console.log('Simple feedback API called');
    
    const body = await request.json();
    console.log('Request body:', body);
    
    // Basic validation
    if (!body.type || !body.message) {
      return NextResponse.json({ error: 'Type and message are required' }, { status: 400 });
    }
    
    // Create feedback without Clerk auth
    const feedbackData = {
      type: body.type,
      message: body.message,
      email: body.email || null,
      userId: null, // No auth required
      createdAt: serverTimestamp(),
    };
    
    console.log('Creating feedback with data:', feedbackData);
    
    const feedbackRef = await addDoc(collection(db, 'feedback'), feedbackData);
    
    console.log('Feedback created with ID:', feedbackRef.id);
    
    return NextResponse.json({ success: true, id: feedbackRef.id });
  } catch (error) {
    console.error('Simple feedback error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}