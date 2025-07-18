'use client';

import { useState } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function FirebaseTest() {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testFirebase = async () => {
    setIsLoading(true);
    setTestResult('Testing...');
    
    try {
      // Test 1: Try to read from a collection
      console.log('Testing Firestore read...');
      const testCollection = collection(db, 'test');
      await getDocs(testCollection);
      console.log('✅ Read test passed');
      
      // Test 2: Try to write to a collection
      console.log('Testing Firestore write...');
      const writeResult = await addDoc(collection(db, 'test'), {
        timestamp: new Date(),
        message: 'Firebase test successful'
      });
      console.log('✅ Write test passed, doc ID:', writeResult.id);
      
      setTestResult('✅ Firebase is working! Both read and write operations succeeded.');
    } catch (error) {
      console.error('❌ Firebase test failed:', error);
      setTestResult(`❌ Firebase test failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Firebase Connection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testFirebase} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Testing...' : 'Test Firebase Connection'}
        </Button>
        
        {testResult && (
          <div className="p-4 bg-muted rounded-lg">
            <pre className="text-sm whitespace-pre-wrap">{testResult}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 