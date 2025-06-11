'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FadeIn } from '@/components/animations/fade-in';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background via-secondary/5 to-primary/5">
      <FadeIn>
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-16 w-16 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold">Something went wrong!</CardTitle>
            <CardDescription>
              An unexpected error occurred while loading this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {error.message || 'Please try refreshing the page or contact support if the problem persists.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button onClick={reset}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button variant="outline" asChild>
                <a href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}