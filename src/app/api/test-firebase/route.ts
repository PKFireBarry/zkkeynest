import { NextResponse } from 'next/server';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST() {
  try {
    console.log('Testing Firebase connection...');
    
    // Test basic Firebase connection
    const testRef = await addDoc(collection(db, 'test'), {
      message: 'Test connection',
      timestamp: serverTimestamp(),
    });
    
    console.log('Test document created:', testRef.id);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Firebase connection working',
      testId: testRef.id 
    });
  } catch (error) {
    console.error('Firebase test error:', error);
    return NextResponse.json({ 
      error: 'Firebase connection failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}