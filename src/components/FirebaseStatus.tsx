'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, ExternalLink } from 'lucide-react';

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export default function FirebaseStatus() {
  const [configStatus, setConfigStatus] = useState<'loading' | 'configured' | 'missing'>('loading');
  const [config, setConfig] = useState<Partial<FirebaseConfig>>({});

  useEffect(() => {
    const checkConfig = () => {
      // Check if Firebase is actually working by testing a simple operation
      const testFirebase = async () => {
        try {
          // Try to access Firestore to see if it's working
          const { collection, getDocs } = await import('firebase/firestore');
          const { db } = await import('@/lib/firebase');
          
          // This will fail if Firebase isn't configured, succeed if it is
          await getDocs(collection(db, 'test'));
          
          setConfigStatus('configured');
          setConfig({
            apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'configured',
            authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'configured',
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'configured',
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'configured',
            messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'configured',
            appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'configured'
          });
        } catch (error) {
          console.log('Firebase test failed:', error);
          setConfigStatus('missing');
        }
      };
      
      testFirebase();
    };

    checkConfig();
  }, []);

  if (configStatus === 'loading') {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-sm text-muted-foreground">Checking Firebase configuration...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (configStatus === 'configured') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Firebase Configured
          </CardTitle>
          <CardDescription>
            Your Firebase project is properly configured and ready to use.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Project ID</Badge>
              <code className="text-sm bg-muted px-2 py-1 rounded">
                {config.projectId}
              </code>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Auth Domain</Badge>
              <code className="text-sm bg-muted px-2 py-1 rounded">
                {config.authDomain}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <XCircle className="h-5 w-5 text-red-600" />
          Firebase Not Configured
        </CardTitle>
        <CardDescription>
          Firebase is required for storing encrypted API keys. Please set up your Firebase project.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            The app will work for testing encryption, but API keys won't be saved without Firebase.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-2">
          <h4 className="font-medium">Missing Environment Variables:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <code className="bg-muted px-2 py-1 rounded">NEXT_PUBLIC_FIREBASE_API_KEY</code>
            <code className="bg-muted px-2 py-1 rounded">NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN</code>
            <code className="bg-muted px-2 py-1 rounded">NEXT_PUBLIC_FIREBASE_PROJECT_ID</code>
            <code className="bg-muted px-2 py-1 rounded">NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET</code>
            <code className="bg-muted px-2 py-1 rounded">NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID</code>
            <code className="bg-muted px-2 py-1 rounded">NEXT_PUBLIC_FIREBASE_APP_ID</code>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button asChild>
            <a href="/FIREBASE_SETUP.md" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Setup Guide
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer">
              Firebase Console
            </a>
          </Button>
        </div>
        
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Important Note for Clerk Users</h4>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Since you're using Clerk for authentication, you need to use open Firestore rules for development. 
            See the setup guide for the correct security rules configuration.
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 