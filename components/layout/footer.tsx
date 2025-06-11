import Link from 'next/link';
import { Shield, Github, Mail, Globe } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Simplified Footer Content - Centered */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0 items-center text-center">
            {/* Copyright */}
            <p className="text-sm text-muted-foreground md:text-left">
              © 2025 CryptLock. All rights reserved.
            </p>
            
            {/* Connect Section */}
            <div className="flex flex-col items-center space-y-3">
              <h3 className="text-sm font-semibold">Connect</h3>
              <div className="flex space-x-4">
                <Link
                  href="https://github.com/Adityatorgal17/CryptLock"
                  target="_blank"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Github className="h-5 w-5" />
                </Link>
                <Link
                  href="mailto:support-cryptlock@adityatorgal.me"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Mail className="h-5 w-5" />
                </Link>
                <Link
                  href="https://cryptlock.adityatorgal.me"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Globe className="h-5 w-5" />
                </Link>
              </div>
            </div>
            
            {/* Made with love */}
            <span className="text-sm text-muted-foreground md:text-right">
              Made with ❤️ for security
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}