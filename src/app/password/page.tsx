// src/app/page.tsx (or your password generator page file)
"use client";

import React, { useState, useEffect, useReducer, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/src/app/components/ui/card";
import { Button } from "@/src/app/components/ui/button";
import { Input } from "@/src/app/components/ui/input";
import { Label } from "@/src/app/components/ui/label";
import { Slider } from "@/src/app/components/ui/slider";
import { Switch } from "@/src/app/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/app/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/src/app/components/ui/accordion";
import { Copy, Eye, EyeOff, RefreshCw, Shield, Zap, Info, History, Trash2, Clock, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "@/src/contexts/AuthContext";
import { databaseService } from "@/src/lib/database-service";
import {
  generateRandomPassword,
  generatePassphrase,
  calculateEntropy,
  getStrengthInfo,
  estimateCrackTime,
  PasswordSettings,
} from "@/src/lib/password-service";

// --- STATE MANAGEMENT ---
const initialSettings: PasswordSettings = {
  passwordType: "random",
  length: 18,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: true,
  excludeSimilar: false,
  excludeAmbiguous: false,
  minDigits: 1,
  minSymbols: 1,
  wordCount: 5,
  separator: "-",
  capitalizeWords: true,
  addNumbers: true,
};

function settingsReducer(state: typeof initialSettings, action: { type: string; payload: any }) {
  switch (action.type) {
    case 'SET_VALUE':
      return { ...state, [action.payload.key]: action.payload.value };
    case 'SET_TYPE':
        return {...state, passwordType: action.payload };
    default:
      return state;
  }
}

// --- MAIN COMPONENT ---
export default function PasswordGeneratorPage() {
  const { user } = useAuth();
  const [settings, dispatch] = useReducer(settingsReducer, initialSettings);
  const [password, setPassword] = useState("");
  const [wordlist, setWordlist] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [entropy, setEntropy] = useState(0);
  const [crackTime, setCrackTime] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [copyAnimation, setCopyAnimation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savingHistory, setSavingHistory] = useState(false);

  // --- DATA & STATE HOOKS ---

  // Load wordlist on mount
  useEffect(() => {
    fetch('/api/words')
      .then(res => res.json())
      .then(data => setWordlist(data))
      .catch(() => toast.error("Could not load passphrase wordlist."));
  }, []);

  // Load user preferences and history on mount
  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      // Load history from localStorage for non-authenticated users
      loadLocalHistory();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      // Load user preferences
      const { data: preferences } = await databaseService.getUserPreferences(user.id, 'password-generator');
      if (preferences?.preferences) {
        dispatch({ type: 'SET_VALUE', payload: { key: 'passwordType', value: preferences.preferences.passwordType || 'random' } });
        Object.entries(preferences.preferences).forEach(([key, value]) => {
          if (key !== 'passwordType' && key in initialSettings) {
            dispatch({ type: 'SET_VALUE', payload: { key, value } });
          }
        });
      }

      // Load password history from database
      const { data: passwordHistory } = await databaseService.getPasswordHistory(user.id, 10);
      if (passwordHistory) {
        // Note: We don't show actual passwords for security, just placeholders
        setHistory(passwordHistory.map(() => '••••••••'));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      // Fallback to localStorage
      loadLocalHistory();
    }
  };

  const loadLocalHistory = () => {
    try {
      const storedHistory = localStorage.getItem("passwordHistory");
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to parse history from localStorage", error);
    }
  };

  // Save user preferences
  const saveUserPreferences = async () => {
    if (!user) return;

    try {
      await databaseService.saveUserPreferences(user.id, 'password-generator', settings);
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  // Save password to history
  const savePasswordToHistory = async (newPassword: string) => {
    if (!user) {
      // For non-authenticated users, save to localStorage
      if (newPassword && !history.includes(newPassword)) {
        const updatedHistory = [newPassword, ...history].slice(0, 10);
        setHistory(updatedHistory);
        localStorage.setItem("passwordHistory", JSON.stringify(updatedHistory));
      }
      return;
    }

    // For authenticated users, save to database
    setSavingHistory(true);
    try {
      // Create a hash of the password for storage (in a real app, you'd use proper hashing)
      const passwordHash = btoa(newPassword); // Simple base64 encoding for demo
      
      await databaseService.savePasswordHistory({
        user_id: user.id,
        password_hash: passwordHash,
        settings: settings
      });

      // Log activity
      await databaseService.logActivity({
        user_id: user.id,
        activity_type: 'password_generated',
        tool_name: 'password-generator',
        metadata: { 
          password_type: settings.passwordType,
          length: settings.passwordType === 'random' ? settings.length : settings.wordCount
        }
      });

      // Update tool statistics
      await databaseService.incrementToolUsage('password-generator');

      // Update local history with placeholder
      const updatedHistory = ['••••••••', ...history].slice(0, 10);
      setHistory(updatedHistory);

    } catch (error) {
      console.error('Error saving password history:', error);
      toast.error('Failed to save password history');
    } finally {
      setSavingHistory(false);
    }
  };

  // Generate password logic
  const handleGenerate = useCallback(() => {
    let newPassword = "";
    if (settings.passwordType === "random") {
      newPassword = generateRandomPassword(settings);
    } else if (settings.passwordType === "passphrase") {
      newPassword = generatePassphrase(settings, wordlist);
    }
    setPassword(newPassword);
    
    // Save to history
    savePasswordToHistory(newPassword);
    
    // Save preferences for authenticated users
    if (user) {
      saveUserPreferences();
    }
  }, [settings, wordlist, history, user]);

  // Auto-generate on mount and settings change
  useEffect(() => {
    if (wordlist.length > 0) {
      handleGenerate();
    }
  }, [wordlist, handleGenerate]);

  // --- COPY FUNCTIONALITY ---
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyAnimation(true);
      toast.success("Password copied to clipboard!");
      setTimeout(() => setCopyAnimation(false), 200);
    }).catch(() => {
      toast.error("Failed to copy password");
    });
  };

  // --- HISTORY MANAGEMENT ---
  const clearHistory = async () => {
    if (user) {
      try {
        await databaseService.clearPasswordHistory(user.id);
        setHistory([]);
        toast.success("Password history cleared");
        
        // Log activity
        await databaseService.logActivity({
          user_id: user.id,
          activity_type: 'password_history_cleared',
          tool_name: 'password-generator'
        });
      } catch (error) {
        console.error('Error clearing password history:', error);
        toast.error('Failed to clear password history');
      }
    } else {
      setHistory([]);
      localStorage.removeItem("passwordHistory");
      toast.success("Password history cleared");
    }
  };

  // --- STRENGTH CALCULATION ---
  useEffect(() => {
    if (password) {
      const passwordEntropy = calculateEntropy(password);
      setEntropy(passwordEntropy);
      setCrackTime(estimateCrackTime(passwordEntropy));
    }
  }, [password]);

  const strengthInfo = getStrengthInfo(entropy);

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Password Generator</h1>
          <p className="text-muted-foreground text-lg">
            Generate secure passwords and passphrases with customizable settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Generator */}
          <div className="lg:col-span-2 space-y-6">
            {/* Generated Password */}
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Generated Password
                </CardTitle>
                <CardDescription>
                  Your secure password is ready
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    readOnly
                    className="text-lg font-mono pr-20"
                    placeholder="Click generate to create a password"
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      className="h-8 w-8 p-0"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(password)}
                      className={`h-8 w-8 p-0 ${copyAnimation ? 'scale-110' : ''}`}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Password Strength */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Password Strength</span>
                    <span className={`text-sm font-medium ${strengthInfo.color}`}>
                      {strengthInfo.label}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${strengthInfo.color}`}
                      style={{ width: `${Math.min(100, (entropy / 128) * 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Entropy: {entropy.toFixed(1)} bits</span>
                    <span>Crack time: {crackTime}</span>
                  </div>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={loading || savingHistory}
                  className="w-full btn-enhanced hover-lift"
                >
                  {(loading || savingHistory) ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Generate New Password
                </Button>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Password Settings
                </CardTitle>
                <CardDescription>
                  Customize your password generation preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs value={settings.passwordType} onValueChange={(value) => dispatch({ type: 'SET_TYPE', payload: value })}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="random">Random Password</TabsTrigger>
                    <TabsTrigger value="passphrase">Passphrase</TabsTrigger>
                  </TabsList>

                  <TabsContent value="random" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <Label>Password Length: {settings.length}</Label>
                        <Slider
                          value={[settings.length]}
                          onValueChange={(value) => dispatch({ type: 'SET_VALUE', payload: { key: 'length', value: value[0] } })}
                          max={128}
                          min={8}
                          step={1}
                          className="mt-2"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="uppercase"
                            checked={settings.includeUppercase}
                            onCheckedChange={(checked) => dispatch({ type: 'SET_VALUE', payload: { key: 'includeUppercase', value: checked } })}
                          />
                          <Label htmlFor="uppercase">Uppercase (A-Z)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="lowercase"
                            checked={settings.includeLowercase}
                            onCheckedChange={(checked) => dispatch({ type: 'SET_VALUE', payload: { key: 'includeLowercase', value: checked } })}
                          />
                          <Label htmlFor="lowercase">Lowercase (a-z)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="numbers"
                            checked={settings.includeNumbers}
                            onCheckedChange={(checked) => dispatch({ type: 'SET_VALUE', payload: { key: 'includeNumbers', value: checked } })}
                          />
                          <Label htmlFor="numbers">Numbers (0-9)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="symbols"
                            checked={settings.includeSymbols}
                            onCheckedChange={(checked) => dispatch({ type: 'SET_VALUE', payload: { key: 'includeSymbols', value: checked } })}
                          />
                          <Label htmlFor="symbols">Symbols (!@#$%^&*)</Label>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="excludeSimilar"
                            checked={settings.excludeSimilar}
                            onCheckedChange={(checked) => dispatch({ type: 'SET_VALUE', payload: { key: 'excludeSimilar', value: checked } })}
                          />
                          <Label htmlFor="excludeSimilar">Exclude similar characters</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="excludeAmbiguous"
                            checked={settings.excludeAmbiguous}
                            onCheckedChange={(checked) => dispatch({ type: 'SET_VALUE', payload: { key: 'excludeAmbiguous', value: checked } })}
                          />
                          <Label htmlFor="excludeAmbiguous">Exclude ambiguous characters</Label>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Minimum Digits: {settings.minDigits}</Label>
                          <Slider
                            value={[settings.minDigits]}
                            onValueChange={(value) => dispatch({ type: 'SET_VALUE', payload: { key: 'minDigits', value: value[0] } })}
                            max={10}
                            min={0}
                            step={1}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label>Minimum Symbols: {settings.minSymbols}</Label>
                          <Slider
                            value={[settings.minSymbols]}
                            onValueChange={(value) => dispatch({ type: 'SET_VALUE', payload: { key: 'minSymbols', value: value[0] } })}
                            max={10}
                            min={0}
                            step={1}
                            className="mt-2"
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="passphrase" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <Label>Number of Words: {settings.wordCount}</Label>
                        <Slider
                          value={[settings.wordCount]}
                          onValueChange={(value) => dispatch({ type: 'SET_VALUE', payload: { key: 'wordCount', value: value[0] } })}
                          max={20}
                          min={3}
                          step={1}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label>Word Separator</Label>
                        <Input
                          value={settings.separator}
                          onChange={(e) => dispatch({ type: 'SET_VALUE', payload: { key: 'separator', value: e.target.value } })}
                          placeholder="Separator between words"
                          className="mt-2"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="capitalizeWords"
                            checked={settings.capitalizeWords}
                            onCheckedChange={(checked) => dispatch({ type: 'SET_VALUE', payload: { key: 'capitalizeWords', value: checked } })}
                          />
                          <Label htmlFor="capitalizeWords">Capitalize words</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="addNumbers"
                            checked={settings.addNumbers}
                            onCheckedChange={(checked) => dispatch({ type: 'SET_VALUE', payload: { key: 'addNumbers', value: checked } })}
                          />
                          <Label htmlFor="addNumbers">Add numbers</Label>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Password History */}
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Password History
                </CardTitle>
                <CardDescription>
                  Recently generated passwords
                </CardDescription>
              </CardHeader>
              <CardContent>
                {history.length > 0 ? (
                  <div className="space-y-2">
                    {history.slice(0, 5).map((pwd, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                        <span className="font-mono">{pwd}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(pwd === '••••••••' ? password : pwd)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearHistory}
                      className="w-full mt-2"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear History
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <History className="h-8 w-8 mx-auto mb-2" />
                    <p>No password history</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Password Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <p>• Use at least 12 characters for better security</p>
                  <p>• Include uppercase, lowercase, numbers, and symbols</p>
                  <p>• Avoid common patterns and personal information</p>
                  <p>• Consider using passphrases for easier memorization</p>
                  <p>• Use a password manager for secure storage</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}