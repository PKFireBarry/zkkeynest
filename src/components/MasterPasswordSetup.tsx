'use client';

import { useState } from 'react';
import { useVault } from '@/contexts/VaultContext';
import { useUser } from '@clerk/nextjs';
import { updateUserMasterPassword } from '@/lib/database';
import { setupMasterPassword } from '@/lib/encryption';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ConfirmationModal from './ConfirmationModal';

export default function MasterPasswordSetup() {
  const { user } = useUser();
  const { setupVault } = useVault();
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    // Show confirmation modal instead of directly proceeding
    setShowConfirmModal(true);
  };

  const handleConfirmSetup = async () => {
    setIsLoading(true);

    try {
      // Setup vault in context
      await setupVault(password);

      // Store verification data in database
      if (user) {
        console.log('Setting up unlock password for user:', user.id);
        const verificationData = await setupMasterPassword(password, user.id);
        console.log('Verification data created:', verificationData);

        try {
          await updateUserMasterPassword(
            user.id,
            verificationData.salt,
            verificationData.verificationHash
          );
          console.log('User unlock password saved to database');
        } catch (dbError) {
          console.error('Failed to save to database:', dbError);
          // Still show success since encryption worked, but warn user
          setError('Password encrypted successfully, but failed to save to database. Please check Firebase configuration.');
          return;
        }
      }

      console.log('Unlock password setup completed successfully');
      setSuccess(true);

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to setup unlock password');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <Lock className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle>Unlock Password Set!</CardTitle>
          <CardDescription>
            Your vault is now secured. You can start adding API keys.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
          <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <CardTitle>Set Up Unlock Password</CardTitle>
        <CardDescription>
          This password will encrypt all your API keys. We cannot recover it if you forget it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">Unlock Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your unlock password"
                required
                minLength={8}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your unlock password"
                required
                minLength={8}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Setting up...' : 'Create Unlock Password'}
          </Button>
        </form>

        <ConfirmationModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmSetup}
          title="Confirm Unlock Password Setup"
          description={`⚠️ IMPORTANT: Your unlock password cannot be changed without clearing your vault first due to how the encryption works.

This means:
• If you forget your password, you'll lose access to all your API keys
• Changing the password later will require deleting all stored keys
• We cannot recover your password - it's encrypted locally

Are you sure you want to set "${password.replace(/./g, '•')}" as your unlock password?`}
          confirmText="Yes, Set Password"
          cancelText="No, Let Me Change It"
          variant="default"
          delaySeconds={3}
        />
      </CardContent>
    </Card>
  );
} 