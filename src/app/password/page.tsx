"use client";

import React, { useState, useEffect, useReducer, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Button } from "@/src/app/components/ui/button";
import { Input } from "@/src/app/components/ui/input";
import { Label } from "@/src/app/components/ui/label";
import { Slider } from "@/src/app/components/ui/slider";
import { Switch } from "@/src/app/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/app/components/ui/select";
import { 
  Copy, Eye, EyeOff, RefreshCw, Shield, Zap, Info
} from "lucide-react";
import { toast } from "react-hot-toast";

// Import our new services
import {
  generateRandomPassword,
  generatePassphrase,
  calculateEntropy,
  getStrengthInfo,
} from "@/src/lib/password-service";

// --- STATE MANAGEMENT WITH useReducer ---

const initialSettings = {
  passwordType: "random",
  length: 16,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: true,
  excludeSimilar: false,
  excludeAmbiguous: false,
  minDigits: 1,
  minSymbols: 1,
  wordCount: 4,
  separator: "-",
  capitalizeWords: true,
  addNumbers: false,
};

function settingsReducer(state: typeof initialSettings, action: { type: string; payload: any }) {
  switch (action.type) {
    case 'SET_VALUE':
      return { ...state, [action.payload.key]: action.payload.value };
    default:
      return state;
  }
}

// --- MAIN COMPONENT ---

export default function PasswordGeneratorPage() {
  const [settings, dispatch] = useReducer(settingsReducer, initialSettings);
  const [password, setPassword] = useState("");
  const [wordlist, setWordlist] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [entropy, setEntropy] = useState(0);

  // Fetch the secure wordlist from our API on component mount
  useEffect(() => {
    fetch('/api/words')
      .then(res => res.json())
      .then(data => setWordlist(data))
      .catch(err => toast.error("Could not load passphrase wordlist."));
  }, []);
  
  const handleGenerate = useCallback(() => {
    let newPassword = "";
    if (settings.passwordType === "random") {
      newPassword = generateRandomPassword(settings);
    } else if (settings.passwordType === "passphrase") {
      newPassword = generatePassphrase(settings, wordlist);
    }
    setPassword(newPassword);
  }, [settings, wordlist]);

  // Update entropy whenever the password changes
  useEffect(() => {
    setEntropy(calculateEntropy(password));
  }, [password]);

  // Generate a password on initial load and when settings change
  useEffect(() => {
    handleGenerate();
  }, [handleGenerate]);

  const copyToClipboard = () => {
    if (!password) return;
    navigator.clipboard.writeText(password)
      .then(() => toast.success("Password copied!"))
      .catch(() => toast.error("Failed to copy."));
  };

  const strength = getStrengthInfo(entropy);

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
            <h1 className="text-4xl font-bold">Secure Password Generator</h1>
            <p className="text-muted-foreground text-lg">
                Create strong, cryptographically-random passwords.
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Settings Card */}
          <Card className="card-enhanced">
              <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Zap /> Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                  {/* Password Type */}
                  <div>
                      <Label>Password Type</Label>
                      <Select 
                          value={settings.passwordType} 
                          onValueChange={(value) => dispatch({ type: 'SET_VALUE', payload: { key: 'passwordType', value }})}
                      >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                              <SelectItem value="random">Random Characters</SelectItem>
                              <SelectItem value="passphrase">Passphrase (Words)</SelectItem>
                          </SelectContent>
                      </Select>
                  </div>
                  
                  {/* Type-Specific Settings */}
                  {settings.passwordType === 'random' ? (
                    <div className="space-y-4">
                      <div>
                        <Label>Length: {settings.length}</Label>
                        <Slider value={[settings.length]} onValueChange={([val]) => dispatch({ type: 'SET_VALUE', payload: { key: 'length', value: val }})} max={64} min={8} step={1} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2"><Switch id="upper" checked={settings.includeUppercase} onCheckedChange={(val) => dispatch({ type: 'SET_VALUE', payload: { key: 'includeUppercase', value: val }})} /><Label htmlFor="upper">Uppercase</Label></div>
                        <div className="flex items-center space-x-2"><Switch id="lower" checked={settings.includeLowercase} onCheckedChange={(val) => dispatch({ type: 'SET_VALUE', payload: { key: 'includeLowercase', value: val }})} /><Label htmlFor="lower">Lowercase</Label></div>
                        <div className="flex items-center space-x-2"><Switch id="nums" checked={settings.includeNumbers} onCheckedChange={(val) => dispatch({ type: 'SET_VALUE', payload: { key: 'includeNumbers', value: val }})} /><Label htmlFor="nums">Numbers</Label></div>
                        <div className="flex items-center space-x-2"><Switch id="syms" checked={settings.includeSymbols} onCheckedChange={(val) => dispatch({ type: 'SET_VALUE', payload: { key: 'includeSymbols', value: val }})} /><Label htmlFor="syms">Symbols</Label></div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label>Word Count: {settings.wordCount}</Label>
                        <Slider value={[settings.wordCount]} onValueChange={([val]) => dispatch({ type: 'SET_VALUE', payload: { key: 'wordCount', value: val }})} max={10} min={3} step={1} />
                      </div>
                      <div>
                        <Label>Separator</Label>
                        <Input value={settings.separator} onChange={(e) => dispatch({ type: 'SET_VALUE', payload: { key: 'separator', value: e.target.value }})} />
                      </div>
                       <div className="flex items-center space-x-2"><Switch id="caps" checked={settings.capitalizeWords} onCheckedChange={(val) => dispatch({ type: 'SET_VALUE', payload: { key: 'capitalizeWords', value: val }})} /><Label htmlFor="caps">Capitalize Words</Label></div>
                    </div>
                  )}

                  <Button onClick={handleGenerate} className="w-full btn-enhanced hover-lift">
                      <RefreshCw className="mr-2 h-4 w-4" /> Regenerate
                  </Button>
              </CardContent>
          </Card>

          {/* Result Card */}
          <Card className="card-enhanced">
              <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Shield /> Your Secure Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Password Display */}
                <div>
                  <Label>Generated Password</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={showPassword ? password : '•'.repeat(password.length)}
                      readOnly
                      className="font-mono text-lg"
                    />
                    <Button variant="outline" size="icon" onClick={() => setShowPassword(!showPassword)} className="btn-enhanced hover-lift">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline" size="icon" onClick={copyToClipboard} className="btn-enhanced hover-lift">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Strength Analysis */}
                <div>
                  <Label>Strength Analysis</Label>
                  <div className="space-y-2 mt-2">
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div className={`h-2.5 rounded-full transition-all ${strength.color}`} style={{ width: `${Math.min((entropy / 100) * 100, 100)}%` }} />
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium">{strength.label}</span>
                        <span className="text-muted-foreground font-mono" title="Entropy is a measure of a password's unpredictability. Higher is better.">
                          {entropy} bits
                        </span>
                      </div>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-800 dark:text-blue-200">
                    <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <p className="text-sm">
                            <span className="font-bold">Security Note:</span> All passwords are generated locally in your browser using a cryptographically secure random number generator. Nothing is ever sent to our servers.
                        </p>
                    </div>
                </div>

              </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 