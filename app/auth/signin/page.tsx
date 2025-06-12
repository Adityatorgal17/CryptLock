'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { FadeIn } from '@/components/animations/fade-in';
import { Shield, Eye, EyeOff, Smartphone } from 'lucide-react';
import { setAuthToken } from '@/lib/auth';
import { toast } from 'sonner';
import { deriveVaultKey, hexToUint8Array } from '@/lib/utils';
import { setVaultKey } from '@/lib/vault';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function SigninPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !token) {
      setError('All fields are required');
      return;
    }

    if (token.length !== 6) {
      setError('2FA code must be 6 digits');
      return;
    }

    setIsLoading(true);

      try {
      const response = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, token }),
      });

      const data = await response.json();

      if (!response.ok) {
        handleErrorResponse(data.error);
        return;
      }

      const { session, salt } = data;
      const accessToken = session?.access_token;

      if (!accessToken || !salt) {
        setError('Invalid response from server');
        toast.error('Signin failed');
        return;
      }

      setAuthToken(accessToken);

      const saltArray = hexToUint8Array(salt);
      const vaultKey = await deriveVaultKey(password, email, saltArray);
      setVaultKey(vaultKey);

      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Failed to connect to server. Please check your connection and try again.');
      toast.error('Connection failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleErrorResponse = (msg: string) => {
    if (msg?.includes('2FA not set up')) {
      setError('2FA is not set up for this account. Please complete 2FA setup first.');
      toast.error('2FA setup required');
    } else if (msg?.includes('Invalid 2FA token')) {
      setError('Invalid 2FA code. Please check your authenticator app and try again.');
      toast.error('Invalid 2FA code');
    } else if (msg?.includes('User not found')) {
      setError('No account found with this email. Please check your email or sign up.');
      toast.error('Account not found');
    } else if (msg?.includes('Invalid email or password')) {
      setError('Incorrect email or password. Please try again.');
      toast.error('Invalid credentials');
    } else {
      setError(msg || 'Signin failed. Please try again.');
      toast.error('Signin failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background via-secondary/5 to-primary/5">
      <FadeIn>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Shield className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your CryptLock account
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
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
                <Label htmlFor="token">2FA Code</Label>
                <Input
                  id="token"
                  type="text"
                  placeholder="Enter 6-digit code from your authenticator app"
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  required
                  disabled={isLoading}
                  className="text-center text-lg tracking-wider placeholder:text-sm"
                />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Smartphone className="h-4 w-4" />
                  <span>Open your authenticator app to get the code</span>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !email || !password || token.length !== 6}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              <div className="text-center">
                <Alert>
                  <AlertDescription className="text-sm">
                    <strong>Need to set up 2FA?</strong>
                    <br />
                    If you haven't set up two-factor authentication yet, you'll need to complete the 2FA setup process first.
                  </AlertDescription>
                </Alert>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <Link href="/auth/signup" className="font-medium text-primary hover:underline">
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}