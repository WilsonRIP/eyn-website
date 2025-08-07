"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Button } from "@/src/app/components/ui/button";
import { Input } from "@/src/app/components/ui/input";
import { Badge } from "@/src/app/components/ui/badge";
import { Alert, AlertDescription } from "@/src/app/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/app/components/ui/tabs";
import { Checkbox } from "@/src/app/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/app/components/ui/select";
import { Separator } from "@/src/app/components/ui/separator";
import { 
  Link, 
  Copy, 
  RotateCcw, 
  History, 
  Settings, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  Trash2,
  Download
} from "lucide-react";

interface SlugHistory {
  id: string;
  input: string;
  slug: string;
  timestamp: Date;
}

interface SlugOptions {
  separator: 'dash' | 'underscore' | 'none';
  case: 'lower' | 'upper' | 'as-is';
  removeStopWords: boolean;
  allowNumbers: boolean;
  maxLength: number;
  customReplacements: { [key: string]: string };
}

export default function SlugGeneratorPage() {
  const [input, setInput] = useState("");
  const [slug, setSlug] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<SlugHistory[]>([]);
  const [activeTab, setActiveTab] = useState("generator");
  
  const [options, setOptions] = useState<SlugOptions>({
    separator: 'dash',
    case: 'lower',
    removeStopWords: true,
    allowNumbers: true,
    maxLength: 100,
    customReplacements: {
      '&': 'and',
      '@': 'at',
      '%': 'percent',
      '$': 'dollar',
      '€': 'euro',
      '£': 'pound',
      '¥': 'yen',
      '+': 'plus',
      '=': 'equals'
    }
  });

  // Common stop words to remove
  const stopWords = [
    'a', 'an', 'the', 'and', 'or', 'but', 'of', 'at', 'by', 'for', 'with', 'about', 
    'to', 'in', 'on', 'that', 'this', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall', 'should', 
    'can', 'could', 'may', 'might', 'must', 'i', 'you', 'he', 'she', 'it', 'we', 'they'
  ];

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("slugGeneratorHistory");
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed)) {
          // Convert timestamp strings back to Date objects
          const historyWithDates = parsed.map(item => ({
            ...item,
            timestamp: new Date(item.timestamp)
          }));
          setHistory(historyWithDates);
        }
      } catch (e) {
        console.error("Failed to parse slug history", e);
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("slugGeneratorHistory", JSON.stringify(history));
  }, [history]);

  // Generate slug when input or options change
  useEffect(() => {
    if (input.trim()) {
      generateSlug();
    } else {
      setSlug("");
    }
  }, [input, options]);

  const generateSlug = () => {
    if (!input.trim()) {
      setSlug("");
      return;
    }

    try {
      let result = input;
      
      // Apply custom replacements
      Object.entries(options.customReplacements).forEach(([key, value]) => {
        const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        result = result.replace(regex, ` ${value} `);
      });
      
      // Remove special characters except spaces, letters, numbers, and separators
      result = result.replace(/[^\w\s-]/g, ' ');
      
      // Remove numbers if not allowed
      if (!options.allowNumbers) {
        result = result.replace(/[0-9]/g, '');
      }
      
      // Replace spaces with separator
      if (options.separator === 'dash') {
        result = result.replace(/\s+/g, '-');
      } else if (options.separator === 'underscore') {
        result = result.replace(/\s+/g, '_');
      } else {
        result = result.replace(/\s+/g, '');
      }
      
      // Remove stop words if enabled
      if (options.removeStopWords) {
        const regex = new RegExp(`\\b(${stopWords.join('|')})\\b`, 'gi');
        result = result.replace(regex, '');
        
        // Clean up multiple separators that might result from removing stop words
        if (options.separator === 'dash') {
          result = result.replace(/-+/g, '-').replace(/^-|-$/g, '');
        } else if (options.separator === 'underscore') {
          result = result.replace(/_+/g, '_').replace(/^_|_$/g, '');
        }
      }
      
      // Apply case conversion
      if (options.case === 'lower') {
        result = result.toLowerCase();
      } else if (options.case === 'upper') {
        result = result.toUpperCase();
      }
      
      // Apply max length
      if (options.maxLength > 0 && result.length > options.maxLength) {
        result = result.substring(0, options.maxLength);
        
        // Trim at separator to avoid cutting words in half
        if (options.separator === 'dash') {
          const lastDash = result.lastIndexOf('-');
          if (lastDash > 0) {
            result = result.substring(0, lastDash);
          }
        } else if (options.separator === 'underscore') {
          const lastUnderscore = result.lastIndexOf('_');
          if (lastUnderscore > 0) {
            result = result.substring(0, lastUnderscore);
          }
        }
      }
      
      // Clean up any remaining edge cases
      if (options.separator === 'dash') {
        result = result.replace(/-+/g, '-').replace(/^-|-$/g, '');
      } else if (options.separator === 'underscore') {
        result = result.replace(/_+/g, '_').replace(/^_|_$/g, '');
      }
      
      setSlug(result);
      setError("");
    } catch (err) {
      setError("Failed to generate slug. Please check your input.");
      setSlug("");
    }
  };

  const copyToClipboard = () => {
    if (slug) {
      navigator.clipboard.writeText(slug);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const addToHistory = () => {
    if (input && slug) {
      const historyItem: SlugHistory = {
        id: Date.now().toString(),
        input,
        slug,
        timestamp: new Date()
      };
      
      setHistory(prev => [historyItem, ...prev.slice(0, 19)]); // Keep last 20
    }
  };

  const clearInput = () => {
    setInput("");
    setSlug("");
    setError("");
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const downloadHistory = () => {
    if (history.length === 0) return;
    
    const data = history.map(item => ({
      input: item.input,
      slug: item.slug,
      timestamp: item.timestamp.toISOString()
    }));
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `slug-history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadFromHistory = (item: SlugHistory) => {
    setInput(item.input);
    setActiveTab("generator");
  };

  const updateOption = <K extends keyof SlugOptions>(key: K, value: SlugOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const addCustomReplacement = (key: string, value: string) => {
    if (key && value) {
      setOptions(prev => ({
        ...prev,
        customReplacements: {
          ...prev.customReplacements,
          [key]: value
        }
      }));
    }
  };

  const removeCustomReplacement = (key: string) => {
    setOptions(prev => {
      const newReplacements = { ...prev.customReplacements };
      delete newReplacements[key];
      return {
        ...prev,
        customReplacements: newReplacements
      };
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 animate-slide-in-left">Slug Generator</h1>
          <p className="text-muted-foreground text-lg animate-slide-in-right">
            Convert titles and text into URL-friendly slugs
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="generator">Generator</TabsTrigger>
            <TabsTrigger value="options">Options</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input */}
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Link className="h-5 w-5" />
                    <span>Text Input</span>
                  </CardTitle>
                  <CardDescription>
                    Enter text to convert into a URL-friendly slug
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Enter your title or text here..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="text-lg"
                  />
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={addToHistory}
                      className="btn-enhanced hover-lift flex-1"
                      disabled={!input || !slug}
                    >
                      Save to History
                    </Button>
                    <Button
                      onClick={clearInput}
                      variant="outline"
                      className="hover-lift"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>

                  {error && (
                    <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800 dark:text-red-200">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Result */}
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Link className="h-5 w-5" />
                    <span>Generated Slug</span>
                    {slug && <CheckCircle className="h-5 w-5 text-green-500" />}
                  </CardTitle>
                  <CardDescription>
                    URL-friendly version of your text
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-lg font-mono break-all">
                      {slug || <span className="text-muted-foreground">Your slug will appear here</span>}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={copyToClipboard}
                      className="btn-enhanced hover-lift flex-1"
                      disabled={!slug}
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy to Clipboard
                        </>
                      )}
                    </Button>
                  </div>

                  {slug && (
                    <div className="text-sm text-muted-foreground">
                      Length: {slug.length} characters
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="options" className="space-y-6">
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  <span>Slug Options</span>
                </CardTitle>
                <CardDescription>
                  Customize how slugs are generated
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Separator</label>
                      <Select 
                        value={options.separator} 
                        onValueChange={(value: 'dash' | 'underscore' | 'none') => updateOption('separator', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dash">Dash (-)</SelectItem>
                          <SelectItem value="underscore">Underscore (_)</SelectItem>
                          <SelectItem value="none">No Separator</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Case</label>
                      <Select 
                        value={options.case} 
                        onValueChange={(value: 'lower' | 'upper' | 'as-is') => updateOption('case', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lower">Lowercase</SelectItem>
                          <SelectItem value="upper">Uppercase</SelectItem>
                          <SelectItem value="as-is">As Is</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Max Length</label>
                      <Input
                        type="number"
                        min="0"
                        max="500"
                        value={options.maxLength}
                        onChange={(e) => updateOption('maxLength', parseInt(e.target.value) || 100)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Set to 0 for no limit
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="removeStopWords"
                        checked={options.removeStopWords}
                        onCheckedChange={(checked) => updateOption('removeStopWords', !!checked)}
                      />
                      <label htmlFor="removeStopWords" className="text-sm font-medium">
                        Remove Stop Words
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="allowNumbers"
                        checked={options.allowNumbers}
                        onCheckedChange={(checked) => updateOption('allowNumbers', !!checked)}
                      />
                      <label htmlFor="allowNumbers" className="text-sm font-medium">
                        Allow Numbers
                      </label>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Custom Replacements</label>
                      <div className="space-y-2">
                        {Object.entries(options.customReplacements).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-2">
                            <Badge variant="outline" className="flex-1 justify-between">
                              <span>{key}</span>
                              <span>→</span>
                              <span>{value}</span>
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCustomReplacement(key)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Common symbols are automatically replaced with words
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  <span>Slug History</span>
                  {history.length > 0 && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={clearHistory}>
                        Clear History
                      </Button>
                      <Button variant="outline" size="sm" onClick={downloadHistory}>
                        <Download className="h-4 w-4 mr-1" />
                        Export
                      </Button>
                    </div>
                  )}
                </CardTitle>
                <CardDescription>
                  Your previously generated slugs
                </CardDescription>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No slug history yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Your generated slugs will appear here once you start using the generator
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {history.map((item) => (
                      <div key={item.id} className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => loadFromHistory(item)}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium mb-1">{item.input}</div>
                            <div className="text-sm font-mono text-blue-600">{item.slug}</div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {item.timestamp.toLocaleDateString()} {item.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="card-enhanced mt-6">
          <CardHeader>
            <CardTitle>About URL Slugs</CardTitle>
            <CardDescription>
              Understanding slugs and best practices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold">What is a URL Slug?</h3>
                <p className="text-sm text-muted-foreground">
                  A URL slug is the part of a URL that identifies a page in human-readable keywords. 
                  It's usually the last part of the URL after the domain name.
                </p>
                <div className="p-3 bg-muted/50 rounded-lg font-mono text-sm">
                  https://example.com/<span className="text-blue-600">this-is-a-slug</span>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold">Best Practices</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Use lowercase letters</li>
                  <li>• Replace spaces with hyphens (-)</li>
                  <li>• Keep it short and descriptive</li>
                  <li>• Remove special characters</li>
                  <li>• Include relevant keywords</li>
                  <li>• Make it readable and memorable</li>
                </ul>
              </div>
            </div>
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Tip:</strong> Good slugs improve SEO by making URLs more readable and descriptive. 
                They also help users understand what a page is about before clicking.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}