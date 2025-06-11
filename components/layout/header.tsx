'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Shield, Menu, X, Github } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isAuthenticated, removeAuthToken } from '@/lib/auth';
import { clearVaultKey } from '@/lib/vault';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [screenWidth, setScreenWidth] = useState(0);
  const pathname = usePathname();
  const isAuth = isAuthenticated();

  // Track screen width for dynamic layout
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    handleResize(); // Set initial width
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSignOut = () => {
    removeAuthToken();
    clearVaultKey();
    window.location.href = '/';
  };

  const navigation = isAuth
    ? [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Tools', href: '/tools' },
        { name: 'Settings', href: '/settings' },
      ]
    : [
        { name: 'Home', href: '/' },
        { name: 'Features', href: '/#features' },
        { name: 'Security', href: '/#security' },
      ];

  // Determine layout based on screen width and content
  const isLargeScreen = screenWidth >= 1024;
  const isMediumScreen = screenWidth >= 768;
  const shouldCenterNav = isLargeScreen;
  const shouldShowFullNav = isMediumScreen;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="relative flex h-16 items-center justify-between">
          
          {/* Logo - Always on the left */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-xl lg:text-2xl font-bold">CryptLock</span>
            </Link>
          </div>

          {/* Navigation - Dynamic positioning */}
          {shouldShowFullNav && (
            <nav className={cn(
              "flex items-center",
              shouldCenterNav 
                ? "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" 
                : "flex-1 justify-center mx-8"
            )}>
              <div className="flex items-center space-x-4 lg:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'text-sm font-medium transition-colors hover:text-primary whitespace-nowrap px-2 py-1 rounded-md',
                      pathname === item.href
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground hover:bg-accent'
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </nav>
          )}

          {/* Right Side - Dynamic layout */}
          <div className="flex items-center space-x-2 lg:space-x-3 flex-shrink-0">
            {/* Desktop actions */}
            <div className="hidden lg:flex items-center space-x-3">
              <ThemeToggle />
              <Button variant="outline" size="sm" asChild>
                <Link
                  href="https://github.com/yourusername/cryptlock"
                  target="_blank"
                >
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </Link>
              </Button>
              {isAuth ? (
                <Button onClick={handleSignOut} variant="outline" size="sm">
                  Sign Out
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/auth/signin">Sign In</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/auth/signup">Get Started</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Tablet actions */}
            <div className="hidden md:flex lg:hidden items-center space-x-2">
              <ThemeToggle />
              <Button variant="outline" size="sm" asChild>
                <Link
                  href="https://github.com/yourusername/cryptlock"
                  target="_blank"
                >
                  <Github className="h-4 w-4" />
                </Link>
              </Button>
              {isAuth ? (
                <Button onClick={handleSignOut} variant="outline" size="sm">
                  Out
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/auth/signin">In</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/auth/signup">Start</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="md:hidden border-t">
          <div className="space-y-1 px-4 pb-6 pt-4 bg-background/95">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'block px-3 py-3 text-sm font-medium transition-colors hover:text-primary rounded-md',
                  pathname === item.href
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:bg-accent'
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            <div className="pt-4 space-y-3 border-t mt-4">
              <div className="flex items-center justify-between px-3">
                <span className="text-sm font-medium">Theme</span>
                <ThemeToggle />
              </div>
              
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <Link
                  href="https://github.com/yourusername/cryptlock"
                  target="_blank"
                >
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </Link>
              </Button>
              
              {isAuth ? (
                <Button onClick={handleSignOut} variant="outline" size="sm" className="w-full">
                  Sign Out
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href="/auth/signin">Sign In</Link>
                  </Button>
                  <Button size="sm" className="w-full" asChild>
                    <Link href="/auth/signup">Get Started</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}