"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Button } from "@/src/app/components/ui/button";
import { Textarea } from "@/src/app/components/ui/textarea";
import { Input } from "@/src/app/components/ui/input";
import { Badge } from "@/src/app/components/ui/badge";
import { Alert, AlertDescription } from "@/src/app/components/ui/alert";
import { FileCode, Upload, Copy, Download, RotateCcw, CheckCircle, AlertTriangle, FileDown, Zap } from "lucide-react";

interface OptimizationResult {
  originalSize: number;
  optimizedSize: number;
  reduction: number;
  reductionPercent: number;
  optimizedSvg: string;
}

export default function SVGOptimizerPage() {
  const [inputSvg, setInputSvg] = useState("");
  const [optimizedSvg, setOptimizedSvg] = useState("");
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sampleSvg = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style type="text/css">
      .circle { fill: #ff0000; stroke: #000000; stroke-width: 2px; }
    </style>
  </defs>
  <circle class="circle" cx="50" cy="50" r="40" />
  <text x="50" y="55" text-anchor="middle" font-family="Arial" font-size="12" fill="white">Hello</text>
</svg>`;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'image/svg+xml' || file.name.endsWith('.svg')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setInputSvg(content);
          setError("");
          setOptimizedSvg("");
          setResult(null);
        };
        reader.readAsText(file);
      } else {
        setError("Please select a valid SVG file");
      }
    }
  };

  const optimizeSvg = (svg: string): string => {
    let optimized = svg;

    // Remove comments
    optimized = optimized.replace(/<!--[\s\S]*?-->/g, '');

    // Remove unnecessary whitespace
    optimized = optimized.replace(/\s+/g, ' ');
    optimized = optimized.replace(/>\s+</g, '><');
    optimized = optimized.replace(/\s+>/g, '>');
    optimized = optimized.replace(/<\s+/g, '<');

    // Remove empty attributes
    optimized = optimized.replace(/\s+[a-zA-Z-]+=""/g, '');

    // Remove unnecessary quotes for single-word values
    optimized = optimized.replace(/"([a-zA-Z0-9]+)"/g, '$1');

    // Remove default xmlns if it's the standard one
    optimized = optimized.replace(/xmlns="http:\/\/www\.w3\.org\/2000\/svg"/g, '');

    // Remove unnecessary attributes
    optimized = optimized.replace(/\s+xmlns:xlink="http:\/\/www\.w3\.org\/1999\/xlink"/g, '');
    optimized = optimized.replace(/\s+version="1\.1"/g, '');

    // Optimize numbers (remove unnecessary decimals)
    optimized = optimized.replace(/(\d+)\.0/g, '$1');
    optimized = optimized.replace(/(\d+)\.00/g, '$1');

    // Remove unnecessary spaces in style attributes
    optimized = optimized.replace(/style="([^"]*)"/g, (match, style) => {
      const cleaned = style.replace(/\s*:\s*/g, ':').replace(/\s*;\s*/g, ';').trim();
      return `style="${cleaned}"`;
    });

    // Remove empty elements
    optimized = optimized.replace(/<([a-zA-Z]+)[^>]*>\s*<\/\1>/g, '');

    // Remove unnecessary groups
    optimized = optimized.replace(/<g[^>]*>\s*<\/g>/g, '');

    // Optimize path data (simplified)
    optimized = optimized.replace(/d="([^"]*)"/g, (match, pathData) => {
      // Remove unnecessary spaces and zeros
      let cleaned = pathData.replace(/\s+/g, ' ').trim();
      cleaned = cleaned.replace(/([MLHVCSQTAZmlhvcsqtaz])\s+/g, '$1');
      cleaned = cleaned.replace(/(\d+)\.0/g, '$1');
      cleaned = cleaned.replace(/(\d+)\.00/g, '$1');
      return `d="${cleaned}"`;
    });

    return optimized.trim();
  };

  const processOptimization = () => {
    if (!inputSvg.trim()) {
      setError("Please enter or upload an SVG");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      // Simulate processing time
      setTimeout(() => {
        const optimized = optimizeSvg(inputSvg);
        const originalSize = new Blob([inputSvg]).size;
        const optimizedSize = new Blob([optimized]).size;
        const reduction = originalSize - optimizedSize;
        const reductionPercent = (reduction / originalSize) * 100;

        setOptimizedSvg(optimized);
        setResult({
          originalSize,
          optimizedSize,
          reduction,
          reductionPercent
        });
        setIsProcessing(false);
      }, 1000);
    } catch (error) {
      setError("Failed to optimize SVG. Please check the input format.");
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    if (optimizedSvg) {
      navigator.clipboard.writeText(optimizedSvg);
    }
  };

  const downloadOptimized = () => {
    if (optimizedSvg) {
      const blob = new Blob([optimizedSvg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "optimized.svg";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const loadSample = () => {
    setInputSvg(sampleSvg);
    setError("");
    setOptimizedSvg("");
    setResult(null);
  };

  const clearAll = () => {
    setInputSvg("");
    setOptimizedSvg("");
    setResult(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 animate-slide-in-left">SVG Optimizer</h1>
          <p className="text-muted-foreground text-lg animate-slide-in-right">
            Minify and clean SVG markup for better performance
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                <span>Input SVG</span>
                {inputSvg && <CheckCircle className="h-5 w-5 text-green-500" />}
              </CardTitle>
              <CardDescription>
                Paste SVG code or upload an SVG file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".svg,image/svg+xml"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full hover-lift"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload SVG File
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Or paste SVG code below
                </p>
              </div>

              <Textarea
                placeholder="Paste your SVG code here..."
                value={inputSvg}
                onChange={(e) => setInputSvg(e.target.value)}
                className="min-h-[300px] font-mono text-sm input-enhanced"
              />
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={processOptimization} 
                  className="btn-enhanced hover-lift"
                  disabled={!inputSvg.trim() || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Zap className="h-4 w-4 mr-2 animate-spin" />
                      Optimizing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Optimize SVG
                    </>
                  )}
                </Button>
                <Button 
                  onClick={loadSample} 
                  variant="outline" 
                  className="hover-lift"
                >
                  Load Sample
                </Button>
                <Button 
                  onClick={clearAll} 
                  variant="outline" 
                  className="hover-lift"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear
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

          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCode className="h-5 w-5" />
                <span>Optimized SVG</span>
                {result && (
                  <Badge variant="outline" className="text-green-600">
                    {result.reductionPercent.toFixed(1)}% smaller
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Your optimized SVG will appear here
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {result && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">{formatFileSize(result.originalSize)}</div>
                    <div className="text-sm text-muted-foreground">Original Size</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">{formatFileSize(result.optimizedSize)}</div>
                    <div className="text-sm text-muted-foreground">Optimized Size</div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  className="hover-lift"
                  disabled={!optimizedSvg}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button
                  onClick={downloadOptimized}
                  variant="outline"
                  className="hover-lift"
                  disabled={!optimizedSvg}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
              
              <Textarea
                value={optimizedSvg}
                readOnly
                className="min-h-[300px] font-mono text-sm bg-muted/50 input-enhanced"
                placeholder="Optimized SVG will appear here..."
              />

              {result && (
                <div className="text-sm text-muted-foreground text-center">
                  Saved {formatFileSize(result.reduction)} ({result.reductionPercent.toFixed(1)}% reduction)
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle>Optimization Features</CardTitle>
            <CardDescription>
              What gets optimized in your SVG files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold">Remove Unnecessary Elements</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Comments and whitespace</li>
                  <li>• Empty attributes and elements</li>
                  <li>• Default namespace declarations</li>
                  <li>• Unnecessary groups</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Optimize Attributes</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Remove unnecessary quotes</li>
                  <li>• Simplify decimal numbers</li>
                  <li>• Clean up style attributes</li>
                  <li>• Optimize path data</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Performance Benefits</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Smaller file sizes</li>
                  <li>• Faster loading times</li>
                  <li>• Reduced bandwidth usage</li>
                  <li>• Better caching</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 