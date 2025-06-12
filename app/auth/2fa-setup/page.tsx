'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { FadeIn } from '@/components/animations/fade-in';
import { Smartphone, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { getAuthToken, isAuthenticated } from '@/lib/auth';

interface UserSession {
  isSignedIn: boolean;
  email?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

function TwoFactorSetupForm() {
  const [qrCode, setQrCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSettingUp, setIsSettingUp] = useState(true);
  const [email, setEmail] = useState('');
  const [userSession, setUserSession] = useState<UserSession>({ isSignedIn: false });
  const [showRegenerateOption, setShowRegenerateOption] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    initializeComponent();

    // Clean access_token from URL after reading
    const params = new URLSearchParams(window.location.search);
    if (params.has('access_token')) {
      params.delete('access_token');
      const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  const initializeComponent = async () => {
  const hash = window.location.hash;
  const params = new URLSearchParams(hash.slice(1));
  const tokenFromUrl = params.get('access_token');

  if (tokenFromUrl) {
    try {
      const payload = JSON.parse(atob(tokenFromUrl.split('.')[1]));
      const userEmail = payload.email;

      if (!userEmail) {
        setError('Could not extract email from token');
        setIsSettingUp(false);
        return;
      }

      setEmail(userEmail);
      await setupTwoFactor(userEmail);
      setShowRegenerateOption(false);
      setUserSession({ isSignedIn: false });

      // Clean fragment
      window.history.replaceState({}, '', window.location.pathname);
    } catch (err) {
      console.error('Token parsing failed', err);
      toast.error('Invalid token format');
      router.push('/auth/signin');
    }
    return;
  }


    // No token in URL, check current session token
    const token = getAuthToken();

    if (!token) {
      toast.error('Please sign in first to setup 2FA');
      router.push('/auth/signin');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userEmail = payload.email;

      if (!userEmail) {
        setError('Could not extract email from token');
        setIsSettingUp(false);
        return;
      }

      setEmail(userEmail);

      if (isAuthenticated()) {
        setUserSession({ isSignedIn: true, email: userEmail });
        setShowRegenerateOption(true);
        setIsSettingUp(false);
      } else {
        await setupTwoFactor(userEmail);
      }
    } catch (err) {
      console.error('Token parsing failed', err);
      toast.error('Invalid token format');
      router.push('/auth/signin');
    }
  };

  const setupTwoFactor = async (userEmail: string) => {
    setIsLoading(true);
    setError('');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${API_BASE_URL}/auth/2fa/setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Setup failed: ${errorText}`);
      }

      const data = await response.json();

      if (data.qr) {
        setQrCode(data.qr);
      } else {
        throw new Error('No QR code in response');
      }
    } catch (err: any) {
      let errorMessage = 'Failed to setup 2FA';
      if (err.name === 'AbortError') {
        errorMessage = 'Request timed out';
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      setIsSettingUp(false);
    }
  };

  const handleRegenerateQR = async () => {
    setIsRegenerating(true);
    setError('');
    try {
      await setupTwoFactor(email);
      toast.success('QR code regenerated');
      setShowRegenerateOption(false);
    } catch {
      toast.error('Failed to regenerate QR code');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleComplete = () => {
    toast.success('2FA setup complete');
    router.push(userSession.isSignedIn ? '/dashboard' : '/auth/signin');
  };

  const handleCancel = () => {
    router.push(userSession.isSignedIn ? '/dashboard' : '/auth/signin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background via-secondary/5 to-primary/5">
      <FadeIn>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Smartphone className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {showRegenerateOption ? 'Regenerate' : 'Setup'} Two-Factor Authentication
            </CardTitle>
            <CardDescription>
              {showRegenerateOption
                ? 'Generate a new QR code for your authenticator app'
                : 'Secure your account with an additional layer of protection'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(isSettingUp || isLoading) ? (
              <div className="flex flex-col items-center space-y-4">
                <LoadingSpinner size="lg" />
                <p className="text-sm text-muted-foreground">Setting up 2FA...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {showRegenerateOption && !qrCode && (
                  <div className="space-y-4">
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Warning:</strong> Regenerating your QR code will reset your 2FA secret.
                      </AlertDescription>
                    </Alert>

                    <div className="text-center space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Do you want to regenerate your 2FA QR code?
                      </p>

                      <div className="flex gap-3">
                        <Button
                          onClick={handleRegenerateQR}
                          disabled={isRegenerating}
                          variant="destructive"
                          className="flex-1"
                        >
                          {isRegenerating ? (
                            <>
                              <LoadingSpinner size="sm" className="mr-2" />
                              Regenerating...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Regenerate QR
                            </>
                          )}
                        </Button>
                        <Button onClick={handleCancel} variant="outline" className="flex-1">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {qrCode && (
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-semibold">Scan QR Code</h3>
                    <p className="text-sm text-muted-foreground">
                      Use your authenticator app to scan this QR code.
                    </p>

                    <div className="flex justify-center p-4 bg-white rounded-lg">
                      <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                    </div>

                    <div className="flex gap-3">
                      <Button onClick={handleComplete} className="flex-1">
                        Complete Setup
                      </Button>
                      <Button onClick={handleCancel} variant="outline" className="flex-1">
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}

export default function TwoFactorSetupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <TwoFactorSetupForm />
    </Suspense>
  );
}
