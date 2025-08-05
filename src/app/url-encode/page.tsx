"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Button } from "@/src/app/components/ui/button";
import { Textarea } from "@/src/app/components/ui/textarea";
import { Input } from "@/src/app/components/ui/input";
import { Label } from "@/src/app/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/app/components/ui/tabs";
import { Alert, AlertDescription } from "@/src/app/components/ui/alert";
import { Copy, Download, RotateCcw, CheckCircle, XCircle, AlertTriangle, ExternalLink, Link, Settings } from "lucide-react";

export default function URLEncodePage() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [encodingType, setEncodingType] = useState<"full" | "component" | "path">("full");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [urlPreview, setUrlPreview] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Sample URLs for testing
  const sampleUrls = {
    simple: "https://example.com/path with spaces",
    complex: "https://api.example.com/search?q=hello world&category=tech&sort=date",
    special: "https://example.com/path/to/file?param=value with & symbols",
    unicode: "https://example.com/search?q=привет мир&lang=ru"
  };

  useEffect(() => {
    if (!inputText.trim()) {
      setOutputText("");
      setUrlPreview("");
      setIsValid(null);
      setErrorMessage("");
      return;
    }

    try {
      let result = "";
      
      if (mode === "encode") {
        switch (encodingType) {
          case "full":
            result = encodeURI(inputText);
            break;
          case "component":
            result = encodeURIComponent(inputText);
            break;
          case "path":
            // Encode path components but preserve slashes
            result = inputText.split('/').map(part => encodeURIComponent(part)).join('/');
            break;
        }
      } else {
        switch (encodingType) {
          case "full":
            result = decodeURI(inputText);
            break;
          case "component":
            result = decodeURIComponent(inputText);
            break;
          case "path":
            // Decode path components
            result = inputText.split('/').map(part => decodeURIComponent(part)).join('/');
            break;
        }
      }

      setOutputText(result);
      setIsValid(true);
      setErrorMessage("");

      // Generate URL preview
      if (mode === "encode" && encodingType === "full") {
        try {
          new URL(result);
          setUrlPreview(result);
        } catch {
          setUrlPreview("");
        }
      } else if (mode === "decode") {
        try {
          new URL(result);
          setUrlPreview(result);
        } catch {
          setUrlPreview("");
        }
      } else {
        setUrlPreview("");
      }
    } catch (error) {
      setIsValid(false);
      setErrorMessage(error instanceof Error ? error.message : "Invalid URL encoding");
      setOutputText("");
      setUrlPreview("");
    }
  }, [inputText, mode, encodingType]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setInputText("");
    setOutputText("");
    setUrlPreview("");
    setIsValid(null);
    setErrorMessage("");
  };

  const loadSample = (type: keyof typeof sampleUrls) => {
    setInputText(sampleUrls[type]);
  };

  const testUrl = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getEncodingDescription = () => {
    switch (encodingType) {
      case "full":
        return mode === "encode" 
          ? "Encodes the entire URL, preserving URL structure"
          : "Decodes the entire URL";
      case "component":
        return mode === "encode"
          ? "Encodes individual URL components (query parameters, etc.)"
          : "Decodes individual URL components";
      case "path":
        return mode === "encode"
          ? "Encodes path segments while preserving slashes"
          : "Decodes path segments";
    }
  };

  const getCharacterStats = (text: string) => {
    const original = text.length;
    const encoded = outputText.length;
    const difference = encoded - original;
    const percentage = original > 0 ? ((difference / original) * 100).toFixed(1) : "0";

    return { original, encoded, difference, percentage };
  };

  const stats = getCharacterStats(inputText);

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 animate-slide-in-left">URL Encoder / Decoder</h1>
          <p className="text-muted-foreground text-lg animate-slide-in-right">
            Encode and decode URLs with different encoding options
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>Input</span>
                {isValid === true && <CheckCircle className="h-5 w-5 text-green-500" />}
                {isValid === false && <XCircle className="h-5 w-5 text-red-500" />}
              </CardTitle>
              <CardDescription>
                Enter text to encode or encoded URL to decode
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Mode</Label>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setMode("encode")}
                      variant={mode === "encode" ? "default" : "outline"}
                      size="sm"
                      className="hover-lift"
                    >
                      Encode
                    </Button>
                    <Button
                      onClick={() => setMode("decode")}
                      variant={mode === "decode" ? "default" : "outline"}
                      size="sm"
                      className="hover-lift"
                    >
                      Decode
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Encoding Type</Label>
                  <select
                    value={encodingType}
                    onChange={(e) => setEncodingType(e.target.value as "full" | "component" | "path")}
                    className="px-3 py-1 border rounded text-sm"
                  >
                    <option value="full">Full URL</option>
                    <option value="component">Component</option>
                    <option value="path">Path Only</option>
                  </select>
                </div>

                <p className="text-xs text-muted-foreground">
                  {getEncodingDescription()}
                </p>
              </div>

              <Textarea
                placeholder={mode === "encode" ? "Enter text to encode..." : "Enter encoded URL to decode..."}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[200px] font-mono text-sm input-enhanced"
              />
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={() => loadSample("simple")} 
                  variant="outline" 
                  size="sm"
                  className="hover-lift"
                >
                  Simple URL
                </Button>
                <Button 
                  onClick={() => loadSample("complex")} 
                  variant="outline" 
                  size="sm"
                  className="hover-lift"
                >
                  Complex URL
                </Button>
                <Button 
                  onClick={() => loadSample("unicode")} 
                  variant="outline" 
                  size="sm"
                  className="hover-lift"
                >
                  Unicode URL
                </Button>
                <Button 
                  onClick={clearAll} 
                  variant="outline" 
                  size="sm"
                  className="hover-lift"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>

              {errorMessage && (
                <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800 dark:text-red-200">
                    {errorMessage}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle>Output</CardTitle>
              <CardDescription>
                {mode === "encode" ? "Encoded URL" : "Decoded URL"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={outputText}
                readOnly
                className="min-h-[200px] font-mono text-sm bg-muted/50 input-enhanced"
                placeholder={mode === "encode" ? "Encoded URL will appear here..." : "Decoded URL will appear here..."}
              />
              
              <div className="flex gap-2">
                <Button
                  onClick={() => copyToClipboard(outputText)}
                  variant="outline"
                  className="hover-lift"
                  disabled={!outputText}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button
                  onClick={() => downloadFile(outputText, "url.txt")}
                  variant="outline"
                  className="hover-lift"
                  disabled={!outputText}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                {urlPreview && (
                  <Button
                    onClick={() => testUrl(urlPreview)}
                    variant="outline"
                    className="hover-lift"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Test URL
                  </Button>
                )}
              </div>

              {urlPreview && (
                <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Link className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">
                      Valid URL Preview:
                    </span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300 break-all">
                    {urlPreview}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle>URL Statistics</CardTitle>
              <CardDescription>
                Information about the URL encoding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {stats.original}
                  </div>
                  <div className="text-sm text-muted-foreground">Original Length</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {stats.encoded}
                  </div>
                  <div className="text-sm text-muted-foreground">Encoded Length</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {stats.difference > 0 ? "+" : ""}{stats.difference}
                  </div>
                  <div className="text-sm text-muted-foreground">Difference</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {stats.percentage}%
                  </div>
                  <div className="text-sm text-muted-foreground">Size Change</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle>Common URL Characters</CardTitle>
              <CardDescription>
                Characters that need encoding in URLs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Reserved Characters</h4>
                  <div className="space-y-1">
                    <div><code>:</code> → <code>%3A</code></div>
                    <div><code>/</code> → <code>%2F</code></div>
                    <div><code>?</code> → <code>%3F</code></div>
                    <div><code>#</code> → <code>%23</code></div>
                    <div><code>[</code> → <code>%5B</code></div>
                    <div><code>]</code> → <code>%5D</code></div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Unsafe Characters</h4>
                  <div className="space-y-1">
                    <div><code>space</code> → <code>%20</code></div>
                    <div><code>&</code> → <code>%26</code></div>
                    <div><code>=</code> → <code>%3D</code></div>
                    <div><code>+</code> → <code>%2B</code></div>
                    <div><code>$</code> → <code>%24</code></div>
                    <div><code>,</code> → <code>%2C</code></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle>URL Encoding Examples</CardTitle>
            <CardDescription>
              Common use cases and examples
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold">Query Parameters</h4>
                <div className="text-sm space-y-2">
                  <div>
                    <p className="font-medium">Original:</p>
                    <code className="text-xs">q=hello world&sort=date</code>
                  </div>
                  <div>
                    <p className="font-medium">Encoded:</p>
                    <code className="text-xs">q=hello%20world&sort=date</code>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold">File Paths</h4>
                <div className="text-sm space-y-2">
                  <div>
                    <p className="font-medium">Original:</p>
                    <code className="text-xs">/path/to/file with spaces.txt</code>
                  </div>
                  <div>
                    <p className="font-medium">Encoded:</p>
                    <code className="text-xs">/path/to/file%20with%20spaces.txt</code>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold">Unicode Characters</h4>
                <div className="text-sm space-y-2">
                  <div>
                    <p className="font-medium">Original:</p>
                    <code className="text-xs">q=привет мир</code>
                  </div>
                  <div>
                    <p className="font-medium">Encoded:</p>
                    <code className="text-xs">q=%D0%BF%D1%80%D0%B8%D0%B2%D0%B5%D1%82%20%D0%BC%D0%B8%D1%80</code>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 