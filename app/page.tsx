import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FadeIn } from '@/components/animations/fade-in';
import { SlideIn } from '@/components/animations/slide-in';
import { StaggerContainer } from '@/components/animations/stagger-container';
import { 
  Shield, 
  Lock, 
  Key, 
  Smartphone, 
  Download, 
  Upload, 
  Zap, 
  Eye, 
  Github,
  CheckCircle,
  Globe,
  Users,
  Gauge
} from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: Shield,
      title: 'End-to-End Encryption',
      description: 'Your passwords are encrypted locally before being stored, ensuring maximum security.',
    },
    {
      icon: Smartphone,
      title: 'Two-Factor Authentication',
      description: 'Add an extra layer of security with TOTP-based 2FA support.',
    },
    {
      icon: Key,
      title: 'Password Generator',
      description: 'Generate strong, unique passwords with customizable complexity.',
    },
    {
      icon: Gauge,
      title: 'Security Analysis',
      description: 'Check password strength and breach status to stay secure.',
    },
    {
      icon: Download,
      title: 'Import & Export',
      description: 'Easily migrate your passwords with secure import/export functionality.',
    },
    {
      icon: Globe,
      title: 'Cross-Platform',
      description: 'Access your passwords securely from any device, anywhere.',
    },
  ];

  const securityFeatures = [
    'Zero-knowledge architecture',
    'Client-side encryption',
    'Secure password sharing',
    'Breach monitoring',
    'Audit logging',
    'Auto-lock protection',
  ];

  const stats = [
    { label: 'Open Source', value: '100%', icon: Github },
    { label: 'Uptime', value: '99.9%', icon: Shield },
    { label: 'Users Protected', value: '10K+*', icon: Users },
    { label: 'Passwords Secured', value: '1M+*', icon: Lock },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto text-center">
          <FadeIn delay={0.2}>
            <Badge variant="outline" className="mb-4">
              Open Source Password Manager
            </Badge>
          </FadeIn>
          <FadeIn delay={0.4}>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Secure Your Digital Life with CryptLock
            </h1>
          </FadeIn>
          <FadeIn delay={0.6}>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              The most secure, user-friendly password manager built with privacy in mind. 
              Open source, zero-knowledge, and designed for everyone.
            </p>
          </FadeIn>
          <FadeIn delay={0.8}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/auth/signup">
                  Get Started Free
                  <Shield className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="https://github.com/yourusername/cryptlock" target="_blank">
                  View on GitHub
                  <Github className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 border-b">
        <div className="container mx-auto">
          <StaggerContainer staggerDelay={0.15}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={stat.label} className="text-center">
                  <stat.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
              <p className="text-xs text-muted-foreground mt-2 justify-self-center col-span-2 md:col-span-4">
                  *Illustrative numbers. Real-time stats coming soon.
            </p>
            </div>
          </StaggerContainer>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Everything You Need for Password Security
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                CryptLock provides all the tools you need to manage your passwords securely and efficiently.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <SlideIn key={feature.title} delay={index * 0.1} direction="up">
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <feature.icon className="h-12 w-12 text-primary mb-4" />
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </SlideIn>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-16 sm:py-20 lg:py-24 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">
            <SlideIn direction="left" delay={0.2}>
              <div className="order-2 lg:order-1">
                <Badge variant="outline" className="mb-4 text-xs sm:text-sm">
                  Enterprise-Grade Security
                </Badge>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
                  Built with Security in Mind
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
                  CryptLock ensures that your data remains private and secure using modern cryptographic standards, all executed locally in your browser.
                </p>
                
                {/* Security Features Grid */}
                <div className="space-y-3 sm:space-y-4">
                  <SlideIn direction="left" delay={0.4}>
                    <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="text-sm sm:text-base">
                          <strong className="font-semibold">Vault Key:</strong> Derived using PBKDF2(password + email, salt, 75,000 iterations)
                        </span>
                      </div>
                    </div>
                  </SlideIn>
                  
                  <SlideIn direction="left" delay={0.5}>
                    <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="text-sm sm:text-base">
                          <strong className="font-semibold">Auth Key:</strong> Computed as SHA-256(vaultKey + email) to identify vaults without revealing secrets
                        </span>
                      </div>
                    </div>
                  </SlideIn>
                  
                  <SlideIn direction="left" delay={0.6}>
                    <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="text-sm sm:text-base">
                          <strong className="font-semibold">AES-GCM Encryption:</strong> Used for vault encryption/decryption with a unique IV on every operation
                        </span>
                      </div>
                    </div>
                  </SlideIn>
                  
                  <SlideIn direction="left" delay={0.7}>
                    <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="text-sm sm:text-base">
                          <strong className="font-semibold">Zero-Knowledge Architecture:</strong> Vaults are encrypted on the client—only you can decrypt them
                        </span>
                      </div>
                    </div>
                  </SlideIn>
                </div>
              </div>
            </SlideIn>

            <SlideIn direction="right" delay={0.3}>
              <div className="order-1 lg:order-2">
                <Card className="p-6 sm:p-8 bg-gradient-to-br from-primary/5 to-blue-600/5 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="space-y-6 sm:space-y-8">
                    
                    {/* Security Feature 1 */}
                    <FadeIn delay={0.5}>
                      <div className="group">
                        <div className="flex items-start space-x-4 p-4 rounded-xl hover:bg-background/50 transition-all duration-200">
                          <div className="flex-shrink-0">
                            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                              <Lock className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-base sm:text-lg mb-1 group-hover:text-primary transition-colors">
                              AES-256-GCM Encryption
                            </h3>
                            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                              Client-side encryption with integrity protection
                            </p>
                          </div>
                        </div>
                      </div>
                    </FadeIn>

                    {/* Security Feature 2 */}
                    <FadeIn delay={0.7}>
                      <div className="group">
                        <div className="flex items-start space-x-4 p-4 rounded-xl hover:bg-background/50 transition-all duration-200">
                          <div className="flex-shrink-0">
                            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                              <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-base sm:text-lg mb-1 group-hover:text-primary transition-colors">
                              Zero-Knowledge Proof
                            </h3>
                            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                              We cannot access your data, by design
                            </p>
                          </div>
                        </div>
                      </div>
                    </FadeIn>

                    {/* Security Feature 3 */}
                    <FadeIn delay={0.9}>
                      <div className="group">
                        <div className="flex items-start space-x-4 p-4 rounded-xl hover:bg-background/50 transition-all duration-200">
                          <div className="flex-shrink-0">
                            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                              <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-base sm:text-lg mb-1 group-hover:text-primary transition-colors">
                              Client-Side Key Derivation
                            </h3>
                            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                              Cryptographic keys never leave your device
                            </p>
                          </div>
                        </div>
                      </div>
                    </FadeIn>

                  </div>
                </Card>
              </div>
            </SlideIn>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/10 via-primary/5 to-background border-t">
        <div className="container mx-auto text-center">
          <FadeIn delay={0.2}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Secure Your Passwords?
            </h2>
          </FadeIn>
          <FadeIn delay={0.4}>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust CryptLock to keep their digital lives secure.
            </p>
          </FadeIn>
          <FadeIn delay={0.6}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/auth/signup">
                  Get Started Free
                  <Shield className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth/signin">
                  Sign In
                </Link>
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}