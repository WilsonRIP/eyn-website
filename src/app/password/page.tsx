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
import { Copy, Eye, EyeOff, RefreshCw, Shield, Zap, Info, History, Trash2, Clock } from "lucide-react";
import { toast } from "react-hot-toast";
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
  const [settings, dispatch] = useReducer(settingsReducer, initialSettings);
  const [password, setPassword] = useState("");
  const [wordlist, setWordlist] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [entropy, setEntropy] = useState(0);
  const [crackTime, setCrackTime] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [copyAnimation, setCopyAnimation] = useState(false);

  // --- DATA & STATE HOOKS ---

  // Load wordlist on mount
  useEffect(() => {
    fetch('/api/words')
      .then(res => res.json())
      .then(data => setWordlist(data))
      .catch(() => toast.error("Could not load passphrase wordlist."));
  }, []);
  
  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem("passwordHistory");
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
        console.error("Failed to parse history from localStorage", error);
    }
  }, []);

  // Generate password logic
  const handleGenerate = useCallback(() => {
    let newPassword = "";
    if (settings.passwordType === "random") {
      newPassword = generateRandomPassword(settings);
    } else if (settings.passwordType === "passphrase") {
      newPassword = generatePassphrase(settings, wordlist);
    }
    setPassword(newPassword);
    
    // Update history, avoiding duplicates
    if (newPassword && !history.includes(newPassword)) {
        const updatedHistory = [newPassword, ...history].slice(0, 10);
        setHistory(updatedHistory);
        localStorage.setItem("passwordHistory", JSON.stringify(updatedHistory));
    }
  }, [settings, wordlist, history]);

  // Analyze password whenever settings change
  useEffect(() => {
    const newEntropy = calculateEntropy(settings, wordlist.length);
    const newCrackTime = estimateCrackTime(newEntropy);
    setEntropy(newEntropy);
    setCrackTime(newCrackTime);
  }, [settings, wordlist]);

  // Generate a new password whenever settings change
  useEffect(() => {
    handleGenerate();
  }, [handleGenerate]);

  // --- UI HANDLERS ---
  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success("Copied to clipboard!");
        if (text === password) { // Only animate main copy button
          setCopyAnimation(true);
          setTimeout(() => setCopyAnimation(false), 1000);
        }
      })
      .catch(() => toast.error("Failed to copy."));
  };
  
  const clearHistory = () => {
      setHistory([]);
      localStorage.removeItem("passwordHistory");
      toast.success("History cleared!");
  };

  const strength = getStrengthInfo(entropy);

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
            <h1 className="text-4xl font-bold">Secure Password Generator</h1>
            <p className="text-muted-foreground text-lg mt-2">Create strong, memorable, and cryptographically-random passwords.</p>
        </div>

        {/* --- MAIN CARDS --- */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            
          {/* Settings Card */}
          <Card className="card-enhanced lg:col-span-3">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Zap /> Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs 
                value={settings.passwordType} 
                onValueChange={(value) => dispatch({ type: 'SET_TYPE', payload: value})}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="random">Random Characters</TabsTrigger>
                  <TabsTrigger value="passphrase">Passphrase</TabsTrigger>
                </TabsList>
                
                {/* Random Password Settings */}
                <TabsContent value="random" className="space-y-6 pt-4">
                  <div>
                    <Label>Length: {settings.length}</Label>
                    <Slider value={[settings.length]} onValueChange={([val]) => dispatch({ type: 'SET_VALUE', payload: { key: 'length', value: val }})} max={64} min={8} step={1} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2"><Switch id="upper" checked={settings.includeUppercase} onCheckedChange={(val) => dispatch({ type: 'SET_VALUE', payload: { key: 'includeUppercase', value: val }})} /><Label htmlFor="upper">Uppercase (A-Z)</Label></div>
                    <div className="flex items-center space-x-2"><Switch id="lower" checked={settings.includeLowercase} onCheckedChange={(val) => dispatch({ type: 'SET_VALUE', payload: { key: 'includeLowercase', value: val }})} /><Label htmlFor="lower">Lowercase (a-z)</Label></div>
                    <div className="flex items-center space-x-2"><Switch id="nums" checked={settings.includeNumbers} onCheckedChange={(val) => dispatch({ type: 'SET_VALUE', payload: { key: 'includeNumbers', value: val }})} /><Label htmlFor="nums">Numbers (0-9)</Label></div>
                    <div className="flex items-center space-x-2"><Switch id="syms" checked={settings.includeSymbols} onCheckedChange={(val) => dispatch({ type: 'SET_VALUE', payload: { key: 'includeSymbols', value: val }})} /><Label htmlFor="syms">Symbols (!@#$)</Label></div>
                  </div>
                   <Accordion type="single" collapsible>
                      <AccordionItem value="advanced">
                          <AccordionTrigger>Advanced Options</AccordionTrigger>
                          <AccordionContent className="space-y-4 pt-4">
                            <div className="flex items-center space-x-2"><Switch id="similar" checked={settings.excludeSimilar} onCheckedChange={(val) => dispatch({ type: 'SET_VALUE', payload: { key: 'excludeSimilar', value: val }})} /><Label htmlFor="similar">Exclude Similar (i, l, 1, O, 0)</Label></div>
                            <div className="flex items-center space-x-2"><Switch id="ambiguous" checked={settings.excludeAmbiguous} onCheckedChange={(val) => dispatch({ type: 'SET_VALUE', payload: { key: 'excludeAmbiguous', value: val }})} /><Label htmlFor="ambiguous">Exclude Ambiguous ({}[]()/...)</Label></div>
                            <div><Label>Min. Digits: {settings.minDigits}</Label><Slider value={[settings.minDigits]} onValueChange={([val]) => dispatch({ type: 'SET_VALUE', payload: { key: 'minDigits', value: val }})} max={10} min={0} step={1} /></div>
                            <div><Label>Min. Symbols: {settings.minSymbols}</Label><Slider value={[settings.minSymbols]} onValueChange={([val]) => dispatch({ type: 'SET_VALUE', payload: { key: 'minSymbols', value: val }})} max={10} min={0} step={1} /></div>
                          </AccordionContent>
                      </AccordionItem>
                   </Accordion>
                </TabsContent>
                
                {/* Passphrase Settings */}
                <TabsContent value="passphrase" className="space-y-6 pt-4">
                    <div><Label>Word Count: {settings.wordCount}</Label><Slider value={[settings.wordCount]} onValueChange={([val]) => dispatch({ type: 'SET_VALUE', payload: { key: 'wordCount', value: val }})} max={10} min={3} step={1} /></div>
                    <div><Label>Separator Character</Label><Input value={settings.separator} onChange={(e) => dispatch({ type: 'SET_VALUE', payload: { key: 'separator', value: e.target.value }})} maxLength={3} /></div>
                    <div className="flex items-center space-x-2"><Switch id="caps" checked={settings.capitalizeWords} onCheckedChange={(val) => dispatch({ type: 'SET_VALUE', payload: { key: 'capitalizeWords', value: val }})} /><Label htmlFor="caps">Capitalize First Letter of Words</Label></div>
                    <div className="flex items-center space-x-2"><Switch id="add-nums" checked={settings.addNumbers} onCheckedChange={(val) => dispatch({ type: 'SET_VALUE', payload: { key: 'addNumbers', value: val }})} /><Label htmlFor="add-nums">Add a Number to the End</Label></div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter>
                 <Button onClick={handleGenerate} className="w-full btn-enhanced hover-lift"><RefreshCw className="mr-2 h-4 w-4" /> Regenerate</Button>
            </CardFooter>
          </Card>

          {/* Result Card */}
          <Card className="card-enhanced lg:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Shield /> Your Secure Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Input value={showPassword ? password : '•'.repeat(password.length)} readOnly className="font-mono text-lg flex-grow"/>
                    <Button variant="outline" size="icon" onClick={() => setShowPassword(!showPassword)}><span className="sr-only">Toggle visibility</span>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(password)} className={`transition-all duration-300 ${copyAnimation ? 'scale-110 bg-green-100 dark:bg-green-900/20' : ''}`}><span className="sr-only">Copy</span><Copy className={`h-4 w-4 ${copyAnimation ? 'text-green-600' : ''}`} /></Button>
                  </div>
                </div>
                <div>
                  <Label>Strength Analysis</Label>
                  <div className="space-y-2 mt-2">
                    <div className="w-full bg-muted rounded-full h-2.5"><div className={`h-2.5 rounded-full transition-all ${strength.color}`} style={{ width: `${Math.min((entropy / 128) * 100, 100)}%` }} /></div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium">{strength.label} ({entropy} bits)</span>
                      <span className="text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> ~{crackTime} to crack</span>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-800 dark:text-blue-200">
                    <div className="flex items-start gap-3"><Info className="h-5 w-5 flex-shrink-0 mt-0.5" /><p className="text-sm"><span className="font-bold">Security Note:</span> All passwords are generated locally in your browser. Nothing is ever sent to a server.</p></div>
                </div>
            </CardContent>
          </Card>
        </div>

        {/* --- History Card --- */}
        {history.length > 0 && (
            <Card className="card-enhanced">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <History />
                        <CardTitle>History</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm" onClick={clearHistory}><Trash2 className="mr-2 h-4 w-4" /> Clear</Button>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {history.map((histPass, index) => (
                            <li key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                                <span className="font-mono text-sm truncate">{histPass}</span>
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(histPass)}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}