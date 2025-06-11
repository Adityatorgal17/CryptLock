'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { FadeIn } from '@/components/animations/fade-in';
import { ShieldOff, Settings, AlertTriangle } from 'lucide-react';
import { getAuthHeaders, clearVaultKey } from '@/lib/vault';
import { removeAuthToken, isAuthenticated } from '@/lib/auth';
import { toast } from 'sonner';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface UserProfile {
  email: string;
}

export default function SettingsPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error('You must be signed in');
      router.push('auth/signin');
      return;
    }

    fetchUserProfile();
  }, [router]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/get-email`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please sign in again.');
          removeAuthToken();
          clearVaultKey();
          router.push('auth/signin');
          return;
        }
        throw new Error('Failed to fetch user email');
      }

      const data = await response.json();
      setUserProfile({ email: data.email });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Failed to load user profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    if (!twoFactorToken.trim()) {
      toast.error('Please enter your 2FA code');
      return;
    }

    if (twoFactorToken.trim().length !== 6 || !/^\d{6}$/.test(twoFactorToken.trim())) {
      toast.error('2FA code must be exactly 6 digits and only contain numbers');
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/delete-account`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          confirmDelete: true,
          twoFactorToken: twoFactorToken.trim(),
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please sign in again.');
          removeAuthToken();
          clearVaultKey();
          sessionStorage.removeItem('auth_token');
          sessionStorage.removeItem('vault_key');
          router.push('auth/signin');
          return;
        }

        const error = await response.json().catch(() => ({ message: 'Failed to delete account' }));
        throw new Error(error.message || 'Failed to delete account');
      }

      // ✅ Clear all stored sensitive data
      removeAuthToken();
      clearVaultKey();
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('vault_key');

      toast.success('Account deleted successfully');
      router.push('/account-deleted');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast.error(error.message || 'Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  const resetDeleteForm = () => {
    setShowDeleteConfirm(false);
    setDeleteConfirmText('');
    setTwoFactorToken('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background via-secondary/5 to-primary/5">
      <FadeIn>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Settings className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Account Settings</CardTitle>
            <CardDescription>Manage your CryptLock account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-secondary/20 border border-secondary/30 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">Your email</p>
              <p className="font-medium text-primary break-all">
                {userProfile?.email || 'Loading...'}
              </p>
            </div>

            <div className="bg-secondary/20 border border-secondary/30 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">Two-Factor Authentication</p>
              <p className="font-medium text-primary flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                Enabled (Mandatory)
              </p>
            </div>

            {!showDeleteConfirm ? (
              <>
                <Alert variant="destructive" className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800 dark:text-orange-200">
                    Deleting your account will permanently erase all your vault data and cannot be undone.
                  </AlertDescription>
                </Alert>

                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                >
                  <ShieldOff className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </>
            ) : (
              <>
                <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-red-800 dark:text-red-200">
                    <strong>Final Warning:</strong> This action cannot be undone. All your passwords and data will be permanently deleted.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="confirmText" className="text-sm font-medium">
                      Type <span className="font-bold text-destructive">DELETE</span> to confirm:
                    </Label>
                    <Input
                      id="confirmText"
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="Type DELETE here"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="twoFactor" className="text-sm font-medium">
                      Enter your 2FA code: <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="twoFactor"
                      type="text"
                      aria-describedby="twofa-help"
                      value={twoFactorToken}
                      onChange={(e) => setTwoFactorToken(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      maxLength={6}
                      className="mt-1 text-center tracking-widest font-mono"
                      required
                    />
                    <small id="twofa-help" className="text-sm text-muted-foreground">
                      You can find this in your authenticator app.
                    </small>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={resetDeleteForm}
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={handleDeleteAccount}
                    disabled={isDeleting || deleteConfirmText !== 'DELETE' || twoFactorToken.trim().length !== 6}
                  >
                    {isDeleting ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <ShieldOff className="h-4 w-4 mr-2" />
                        Delete Forever
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}

            {/* Back to Dashboard */}
            <div className="pt-4 border-t">
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => {
                  if (showDeleteConfirm && !confirm('Are you sure you want to cancel account deletion?')) return;
                  router.push('/dashboard');
                }}
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
