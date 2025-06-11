'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { FadeIn } from '@/components/animations/fade-in';
import { SlideIn } from '@/components/animations/slide-in';
import { 
  Key, 
  Shield, 
  AlertTriangle, 
  Copy, 
  Check, 
  Gauge,
  RefreshCw,
  Eye,
  EyeOff,
  Info
} from 'lucide-react';
import { generatePassword, PasswordGeneratorOptions } from '@/lib/vault';
import { isAuthenticated } from '@/lib/auth';
import { toast } from 'sonner';
import { getAuthHeaders } from '@/lib/vault';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function ToolsPage() {
  const [isAuthenticated_, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Password Generator State
  const [generatorOptions, setGeneratorOptions] = useState<PasswordGeneratorOptions>({
    length: 16,
    includeSpecialChars: true,
    includeNumbers: true,
    includeUppercase: true,
    includeLowercase: true,
  });
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);

  // Entropy Checker State
  const [entropyPassword, setEntropyPassword] = useState('');
  const [entropyScore, setEntropyScore] = useState<number | null>(null);
  const [isCheckingEntropy, setIsCheckingEntropy] = useState(false);
  const [showEntropyPassword, setShowEntropyPassword] = useState(false);

  // Breach Checker State
  const [breachPassword, setBreachPassword] = useState('');
  const [breachResult, setBreachResult] = useState<boolean | null>(null);
  const [isCheckingBreach, setIsCheckingBreach] = useState(false);
  const [showBreachPassword, setShowBreachPassword] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/signin');
      return;
    }
    setIsAuthenticated(true);
  }, []);

  const handleGeneratePassword = async () => {
    setIsGenerating(true);
    try {
      const chars = {
        lowercase: 'abcdefghijklmnopqrstuvwxyz',
        uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        numbers: '0123456789',
        special: '!@#$%^&*()_+-=[]{}|;:,.<>?',
      };

      let charset = '';
      if (generatorOptions.includeLowercase) charset += chars.lowercase;
      if (generatorOptions.includeUppercase) charset += chars.uppercase;
      if (generatorOptions.includeNumbers) charset += chars.numbers;
      if (generatorOptions.includeSpecialChars) charset += chars.special;

      if (!charset) {
        toast.error('Please select at least one character type');
        return;
      }

      let password = '';
      for (let i = 0; i < generatorOptions.length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
      }

      setGeneratedPassword(password);
      toast.success('Password generated successfully');
    } catch (error) {
      toast.error('Failed to generate password');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyGeneratedPassword = async () => {
    try {
      await navigator.clipboard.writeText(generatedPassword);
      setPasswordCopied(true);
      toast.success('Password copied to clipboard');
      setTimeout(() => setPasswordCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy password');
    }
  };

  const handleCheckEntropy = async () => {
    if (!entropyPassword) {
      toast.error('Please enter a password to check');
      return;
    }

    setIsCheckingEntropy(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/tools/entropy`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          password: entropyPassword
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(error.error || 'Failed to check entropy');
      }

      const data = await response.json();
      
      if (typeof data.entropy !== 'number' || isNaN(data.entropy)) {
        console.error('Invalid entropy value:', data.entropy);
        throw new Error('Invalid entropy value received from server');
      }
      
      setEntropyScore(data.entropy);
      
      toast.success(`Password strength: ${data.strength} (${data.entropy.toFixed(2)} bits)`);
      
    } catch (error) {
      console.error('Entropy check error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to check entropy');
      setEntropyScore(0);
    } finally {
      setIsCheckingEntropy(false);
    }
  };

  const handleCheckBreach = async () => {
    if (!breachPassword) {
      toast.error('Please enter a password to check');
      return;
    }

    setIsCheckingBreach(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/tools/breach-check`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          password: breachPassword
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(error.error || 'Failed to check breach status');
      }

      const data = await response.json();
      
      setBreachResult(data.pwned);
      
      if (data.pwned) {
        toast.error(`Password found in ${data.breachCount.toLocaleString()} known breaches!`);
      } else {
        toast.success('Password not found in known breaches');
      }
      
    } catch (error) {
      console.error('Breach check error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to check breach status');
    } finally {
      setIsCheckingBreach(false);
    }
  };

  const getEntropyLabel = (score: number) => {
    if (score < 30) return { label: 'Very Weak', color: 'destructive' };
    if (score < 50) return { label: 'Weak', color: 'destructive' };
    if (score < 70) return { label: 'Fair', color: 'secondary' };
    if (score < 90) return { label: 'Strong', color: 'default' };
    return { label: 'Very Strong', color: 'default' };
  };

  if (!isAuthenticated_) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12 px-6 max-w-4xl">
        <FadeIn>
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <Key className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Security Tools</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Generate secure passwords and analyze their strength with our comprehensive security toolkit
            </p>
          </div>
        </FadeIn>

        <div className="space-y-12">
          {/* Password Generator */}
          <SlideIn delay={0.1}>
            <Card className="border-2 hover:border-primary/20 transition-colors">
              <CardHeader className="text-center pb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/10 mb-4">
                  <RefreshCw className="h-6 w-6 text-blue-500" />
                </div>
                <CardTitle className="text-2xl">Password Generator</CardTitle>
                <CardDescription className="text-base">
                  Create strong, secure passwords with customizable parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Controls */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <Label className="text-base font-medium mb-4 block">
                        Password Length: {generatorOptions.length}
                      </Label>
                      <Slider
                        value={[generatorOptions.length]}
                        onValueChange={(value) => 
                          setGeneratorOptions({...generatorOptions, length: value[0]})
                        }
                        min={8}
                        max={64}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground mt-2">
                        <span>8</span>
                        <span>64</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Character Types</Label>
                    <div className="space-y-3">
                      {[
                        { key: 'includeLowercase', label: 'Lowercase (a-z)' },
                        { key: 'includeUppercase', label: 'Uppercase (A-Z)' },
                        { key: 'includeNumbers', label: 'Numbers (0-9)' },
                        { key: 'includeSpecialChars', label: 'Special Characters (!@#...)' }
                      ].map(({ key, label }) => (
                        <div key={key} className="flex items-center space-x-3">
                          <Switch
                            checked={generatorOptions[key as keyof PasswordGeneratorOptions] as boolean}
                            onCheckedChange={(checked) =>
                              setGeneratorOptions({...generatorOptions, [key]: checked})
                            }
                          />
                          <Label className="text-sm">{label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                <div className="flex justify-center">
                  <Button 
                    onClick={handleGeneratePassword} 
                    disabled={isGenerating}
                    size="lg"
                    className="px-8"
                  >
                    {isGenerating ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-5 w-5 mr-2" />
                        Generate Password
                      </>
                    )}
                  </Button>
                </div>

                {/* Generated Password */}
                {generatedPassword && (
                  <div className="bg-muted/30 rounded-lg p-6 space-y-4">
                    <Label className="text-base font-medium">Generated Password</Label>
                    <div className="flex space-x-3">
                      <Input
                        value={generatedPassword}
                        readOnly
                        className="font-mono text-lg h-12"
                      />
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={copyGeneratedPassword}
                        className="px-4"
                      >
                        {passwordCopied ? (
                          <Check className="h-5 w-5 text-green-500" />
                        ) : (
                          <Copy className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </SlideIn>

          {/* Analysis Tools */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Entropy Checker */}
            <SlideIn delay={0.2}>
              <Card className="border-2 hover:border-primary/20 transition-colors h-full">
                <CardHeader className="text-center pb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10 mb-4">
                    <Gauge className="h-6 w-6 text-green-500" />
                  </div>
                  <CardTitle className="text-xl">Entropy Checker</CardTitle>
                  <CardDescription>
                    Analyze password strength and entropy
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="entropy-password" className="text-base">Password to Analyze</Label>
                    <div className="relative">
                      <Input
                        id="entropy-password"
                        type={showEntropyPassword ? 'text' : 'password'}
                        placeholder="Enter password"
                        value={entropyPassword}
                        onChange={(e) => setEntropyPassword(e.target.value)}
                        className="h-12 pr-12"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowEntropyPassword(!showEntropyPassword)}
                      >
                        {showEntropyPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button 
                    onClick={handleCheckEntropy} 
                    disabled={isCheckingEntropy} 
                    className="w-full h-12"
                  >
                    {isCheckingEntropy ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Gauge className="h-4 w-4 mr-2" />
                        Check Strength
                      </>
                    )}
                  </Button>

                  {entropyScore !== null && (
                    <Alert className="border-2">
                      <Shield className="h-4 w-4" />
                      <AlertDescription className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Entropy: {entropyScore.toFixed(1)} bits</span>
                          <Badge variant={getEntropyLabel(entropyScore).color as any}>
                            {getEntropyLabel(entropyScore).label}
                          </Badge>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-3">
                          <div 
                            className="bg-primary h-3 rounded-full transition-all duration-500" 
                            style={{ width: `${Math.min((entropyScore / 100) * 100, 100)}%` }}
                          />
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </SlideIn>

            {/* Breach Checker */}
            <SlideIn delay={0.3}>
              <Card className="border-2 hover:border-primary/20 transition-colors h-full">
                <CardHeader className="text-center pb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-500/10 mb-4">
                    <AlertTriangle className="h-6 w-6 text-orange-500" />
                  </div>
                  <CardTitle className="text-xl">Breach Checker</CardTitle>
                  <CardDescription>
                    Check if password was compromised
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="breach-password" className="text-base">Password to Check</Label>
                    <div className="relative">
                      <Input
                        id="breach-password"
                        type={showBreachPassword ? 'text' : 'password'}
                        placeholder="Enter password"
                        value={breachPassword}
                        onChange={(e) => setBreachPassword(e.target.value)}
                        className="h-12 pr-12"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowBreachPassword(!showBreachPassword)}
                      >
                        {showBreachPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button 
                    onClick={handleCheckBreach} 
                    disabled={isCheckingBreach} 
                    className="w-full h-12"
                  >
                    {isCheckingBreach ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Checking...
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Check Breaches
                      </>
                    )}
                  </Button>

                  {breachResult !== null && (
                    <Alert 
                      variant={breachResult ? "destructive" : "default"}
                      className="border-2"
                    >
                      {breachResult ? (
                        <AlertTriangle className="h-4 w-4" />
                      ) : (
                        <Shield className="h-4 w-4" />
                      )}
                      <AlertDescription className="font-medium">
                        {breachResult 
                          ? "⚠️ Password found in data breaches - change immediately!"
                          : "✅ Password not found in known breaches"
                        }
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </SlideIn>
          </div>

          {/* Security Tips */}
          <SlideIn delay={0.4}>
            <Card className="border-2 bg-muted/20">
              <CardHeader className="text-center pb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-500/10 mb-4">
                  <Info className="h-6 w-6 text-purple-500" />
                </div>
                <CardTitle className="text-xl">Security Guidelines</CardTitle>
                <CardDescription>Best practices for password security</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5 text-green-500" />
                      Strong Passwords
                    </h4>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        Use at least 12 characters
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        Mix uppercase, lowercase, numbers, symbols
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        Avoid dictionary words and personal info
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        Use unique passwords for each account
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      <Key className="h-5 w-5 text-blue-500" />
                      Security Practices
                    </h4>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        Enable two-factor authentication
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        Use a reputable password manager
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        Check for breaches regularly
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        Keep all software updated
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </SlideIn>
        </div>
      </div>
    </div>
  );
}