"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Button } from "@/src/app/components/ui/button";
import { Input } from "@/src/app/components/ui/input";
import { Progress } from "@/src/app/components/ui/progress";
import { Badge } from "@/src/app/components/ui/badge";
import { Alert, AlertDescription } from "@/src/app/components/ui/alert";
import { Shield, Eye, EyeOff, Copy, RotateCcw, CheckCircle, XCircle, AlertTriangle, Zap } from "lucide-react";

interface PasswordAnalysis {
  strength: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
  score: number;
  entropy: number;
  timeToCrack: string;
  feedback: string[];
  suggestions: string[];
}

export default function PasswordStrengthPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [analysis, setAnalysis] = useState<PasswordAnalysis | null>(null);

  const analyzePassword = (input: string): PasswordAnalysis => {
    let score = 0;
    let entropy = 0;
    const feedback: string[] = [];
    const suggestions: string[] = [];

    // Length analysis
    if (input.length < 8) {
      feedback.push("Password is too short (minimum 8 characters)");
      suggestions.push("Increase password length to at least 8 characters");
    } else if (input.length >= 12) {
      score += 2;
      feedback.push("Good password length");
    } else {
      score += 1;
      feedback.push("Acceptable password length");
    }

    // Character variety analysis
    const hasLowercase = /[a-z]/.test(input);
    const hasUppercase = /[A-Z]/.test(input);
    const hasNumbers = /\d/.test(input);
    const hasSymbols = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(input);

    if (hasLowercase) score += 1;
    if (hasUppercase) score += 1;
    if (hasNumbers) score += 1;
    if (hasSymbols) score += 1;

    if (!hasLowercase) {
      feedback.push("Missing lowercase letters");
      suggestions.push("Add lowercase letters (a-z)");
    }
    if (!hasUppercase) {
      feedback.push("Missing uppercase letters");
      suggestions.push("Add uppercase letters (A-Z)");
    }
    if (!hasNumbers) {
      feedback.push("Missing numbers");
      suggestions.push("Add numbers (0-9)");
    }
    if (!hasSymbols) {
      feedback.push("Missing special characters");
      suggestions.push("Add special characters (!@#$%^&*)");
    }

    // Entropy calculation
    let charsetSize = 0;
    if (hasLowercase) charsetSize += 26;
    if (hasUppercase) charsetSize += 26;
    if (hasNumbers) charsetSize += 10;
    if (hasSymbols) charsetSize += 32; // Common symbols

    entropy = Math.log2(Math.pow(charsetSize, input.length));

    // Common patterns check
    const commonPatterns = [
      'password', '123456', 'qwerty', 'admin', 'letmein', 'welcome',
      'monkey', 'dragon', 'master', 'football', 'baseball', 'shadow'
    ];

    const lowerPassword = input.toLowerCase();
    if (commonPatterns.some(pattern => lowerPassword.includes(pattern))) {
      score -= 2;
      feedback.push("Contains common patterns or words");
      suggestions.push("Avoid common words and patterns");
    }

    // Sequential characters check
    const sequentialPatterns = ['abc', 'def', 'ghi', 'jkl', 'mno', 'pqr', 'stu', 'vwx', 'yz'];
    if (sequentialPatterns.some(pattern => lowerPassword.includes(pattern))) {
      score -= 1;
      feedback.push("Contains sequential characters");
      suggestions.push("Avoid sequential character patterns");
    }

    // Repeated characters check
    if (/(.)\1{2,}/.test(input)) {
      score -= 1;
      feedback.push("Contains repeated characters");
      suggestions.push("Avoid repeating the same character multiple times");
    }

    // Determine strength level
    let strength: PasswordAnalysis['strength'];
    let timeToCrack: string;

    if (score <= 1) {
      strength = 'very-weak';
      timeToCrack = 'Instantly';
    } else if (score <= 2) {
      strength = 'weak';
      timeToCrack = 'Minutes to hours';
    } else if (score <= 3) {
      strength = 'fair';
      timeToCrack = 'Days to weeks';
    } else if (score <= 4) {
      strength = 'good';
      timeToCrack = 'Months to years';
    } else if (score <= 5) {
      strength = 'strong';
      timeToCrack = 'Years to decades';
    } else {
      strength = 'very-strong';
      timeToCrack = 'Centuries';
    }

    return {
      strength,
      score: Math.max(0, Math.min(6, score)),
      entropy,
      timeToCrack,
      feedback,
      suggestions
    };
  };

  useEffect(() => {
    if (password) {
      const result = analyzePassword(password);
      setAnalysis(result);
    } else {
      setAnalysis(null);
    }
  }, [password]);

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'very-weak': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'weak': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'fair': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'good': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'strong': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'very-strong': return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getStrengthLabel = (strength: string) => {
    switch (strength) {
      case 'very-weak': return 'Very Weak';
      case 'weak': return 'Weak';
      case 'fair': return 'Fair';
      case 'good': return 'Good';
      case 'strong': return 'Strong';
      case 'very-strong': return 'Very Strong';
      default: return 'Unknown';
    }
  };

  const generatePassword = () => {
    let generated = '';
    
    // Use crypto.getRandomValues for secure random numbers
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);
    
    // Ensure at least one character from each selected type
    if (includeLowercase) {
      generated += lowercase[randomValues[0] % lowercase.length];
    }
    if (includeUppercase) {
      generated += uppercase[randomValues[1] % uppercase.length];
    }
    if (includeNumbers) {
      generated += numbers[randomValues[2] % numbers.length];
    }
    if (includeSymbols) {
      generated += symbols[randomValues[3] % symbols.length];
    }
    
    // Fill the rest with random characters
    const allChars = (includeLowercase ? lowercase : '') + 
                    (includeUppercase ? uppercase : '') + 
                    (includeNumbers ? numbers : '') + 
                    (includeSymbols ? symbols : '');
    
    for (let i = generated.length; i < length; i++) {
      generated += allChars[randomValues[i] % allChars.length];
    }
    
    // Shuffle the password using Fisher-Yates algorithm with crypto.getRandomValues
    const chars = generated.split('');
    for (let i = chars.length - 1; i > 0; i--) {
      const j = randomValues[i] % (i + 1);
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    
    setPassword(chars.join(''));
  };

  const copyPassword = () => {
    if (password) {
      navigator.clipboard.writeText(password);
    }
  };

  const clearPassword = () => {
    setPassword("");
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 animate-slide-in-left">Password Strength Meter</h1>
          <p className="text-muted-foreground text-lg animate-slide-in-right">
            Visual feedback on password entropy and security
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Password Input */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <span>Password Input</span>
              </CardTitle>
              <CardDescription>
                Enter a password to analyze its strength
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <div className="flex gap-2">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => setShowPassword(!showPassword)}
                    variant="outline"
                    size="icon"
                    className="hover-lift"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={generatePassword}
                  className="btn-enhanced hover-lift"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Generate Strong Password
                </Button>
                <Button
                  onClick={copyPassword}
                  variant="outline"
                  className="hover-lift"
                  disabled={!password}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button
                  onClick={clearPassword}
                  variant="outline"
                  className="hover-lift"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>

              {password && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Length: {password.length} characters</span>
                    <span>Entropy: {analysis?.entropy.toFixed(1)} bits</span>
                  </div>
                  <Progress value={(analysis?.score || 0) * 16.67} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Strength Analysis */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <span>Strength Analysis</span>
                {analysis && (
                  <Badge className={getStrengthColor(analysis.strength)}>
                    {getStrengthLabel(analysis.strength)}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Detailed analysis of your password security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysis ? (
                <>
                  {/* Security Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold">{analysis.score}/6</div>
                      <div className="text-sm text-muted-foreground">Strength Score</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold">{analysis.entropy.toFixed(0)}</div>
                      <div className="text-sm text-muted-foreground">Entropy (bits)</div>
                    </div>
                  </div>

                  {/* Time to Crack */}
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-sm font-medium mb-1">Time to Crack</div>
                    <div className="text-lg font-semibold">{analysis.timeToCrack}</div>
                  </div>

                  {/* Feedback */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Issues Found</h4>
                    {analysis.feedback.length > 0 ? (
                      <div className="space-y-1">
                        {analysis.feedback.map((item, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            {item.includes("Good") || item.includes("Acceptable") ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No issues found!</p>
                    )}
                  </div>

                  {/* Suggestions */}
                  {analysis.suggestions.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Suggestions</h4>
                      <div className="space-y-1">
                        {analysis.suggestions.map((suggestion, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            <span>{suggestion}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Enter a password to see the analysis</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="card-enhanced mt-6">
          <CardHeader>
            <CardTitle>Password Security Guidelines</CardTitle>
            <CardDescription>
              Best practices for creating strong passwords
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Do's</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Use at least 12 characters</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Include uppercase and lowercase letters</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Add numbers and special characters</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Use unique passwords for each account</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Consider using a password manager</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold">Don'ts</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>Use personal information (name, birthdate)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>Use common words or patterns</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>Reuse passwords across accounts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>Use sequential characters (123, abc)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>Share passwords with others</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 