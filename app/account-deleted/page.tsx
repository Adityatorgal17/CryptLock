'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { FadeIn } from '@/components/animations/fade-in';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

export default function AccountDeletedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/10 to-primary/10 px-4">
      <FadeIn>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-emerald-500" />
            </div>
            <CardTitle className="text-2xl font-bold">Account Deleted</CardTitle>
            <CardDescription>
              Your CryptLock account has been permanently deleted.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" onClick={() => router.push('auth/signup')}>
              Sign Up Again
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => router.push('/')}>
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
