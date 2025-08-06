"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Button } from "@/src/app/components/ui/button";
import { Textarea } from "@/src/app/components/ui/textarea";
import { Alert, AlertDescription } from "@/src/app/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/app/components/ui/select";
import { Copy, Download, RotateCcw, CheckCircle, XCircle, AlertTriangle, FileCode } from "lucide-react";

export default function CSSFormatterPage() {
  const [inputCSS, setInputCSS] = useState("");
  const [formattedCSS, setFormattedCSS] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [indentSize, setIndentSize] = useState(2);
  const [mode, setMode] = useState<"beautify" | "minify">("beautify");

  const formatCSS = () => {
    if (!inputCSS.trim()) {
      setErrorMessage("Please enter some CSS to format");
      setIsValid(false);
      return;
    }

    try {
      if (mode === "beautify") {
        const beautified = beautifyCSS(inputCSS, indentSize);
        setFormattedCSS(beautified);
        setIsValid(true);
        setErrorMessage("");
      } else {
        const minified = minifyCSS(inputCSS);
        setFormattedCSS(minified);
        setIsValid(true);
        setErrorMessage("");
      }
    } catch (error) {
      setIsValid(false);
      setErrorMessage(error instanceof Error ? error.message : "Invalid CSS");
      setFormattedCSS("");
    }
  };

  const beautifyCSS = (css: string, indent: number): string => {
    // Remove comments and normalize whitespace
    let formatted = css
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    let result = '';
    let indentLevel = 0;
    let inRule = false;
    let inMedia = false;

    for (let i = 0; i < formatted.length; i++) {
      const char = formatted[i];
      const nextChar = formatted[i + 1];

      if (char === '{') {
        result += ' {\n' + ' '.repeat(indent * (indentLevel + 1));
        indentLevel++;
        inRule = true;
      } else if (char === '}') {
        indentLevel--;
        result += '\n' + ' '.repeat(indent * indentLevel) + '}';
        if (indentLevel === 0) {
          result += '\n\n';
          inRule = false;
          inMedia = false;
        }
      } else if (char === ';' && inRule) {
        result += ';\n' + ' '.repeat(indent * indentLevel);
      } else if (char === ':' && nextChar !== ':') {
        result += ': ';
      } else if (char === '@' && formatted.substring(i, i + 6) === '@media') {
        inMedia = true;
        result += char;
      } else if (char === ' ' && (formatted[i - 1] === ':' || formatted[i - 1] === '{')) {
        // Skip extra spaces after : or {
        continue;
      } else {
        result += char;
      }
    }

    return result.trim();
  };

  const minifyCSS = (css: string): string => {
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\s*{\s*/g, '{') // Remove spaces around {
      .replace(/\s*}\s*/g, '}') // Remove spaces around }
      .replace(/\s*:\s*/g, ':') // Remove spaces around :
      .replace(/\s*;\s*/g, ';') // Remove spaces around ;
      .replace(/\s*,\s*/g, ',') // Remove spaces around ,
      .replace(/;\s*}/g, '}') // Remove semicolon before }
      .trim();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadCSS = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/css" });
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
    setInputCSS("");
    setFormattedCSS("");
    setIsValid(null);
    setErrorMessage("");
  };

  const loadSampleCSS = () => {
    const sample = `.container{max-width:1200px;margin:0 auto;padding:0 20px}.header{background:#333;color:white;padding:1rem}.nav{display:flex;justify-content:space-between;align-items:center}.nav a{color:white;text-decoration:none;padding:0.5rem 1rem}.nav a:hover{background:rgba(255,255,255,0.1)}.main{display:grid;grid-template-columns:1fr 2fr;gap:2rem;margin:2rem 0}.sidebar{background:#f5f5f5;padding:1rem}.content{padding:1rem}.footer{background:#333;color:white;text-align:center;padding:1rem;margin-top:2rem}`;
    setInputCSS(sample);
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 animate-slide-in-left">CSS Formatter & Minifier</h1>
          <p className="text-muted-foreground text-lg animate-slide-in-right">
            Beautify or minify your CSS code for better readability or performance
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCode className="h-5 w-5" />
                <span>Input CSS</span>
                {isValid === true && <CheckCircle className="h-5 w-5 text-green-500" />}
                {isValid === false && <XCircle className="h-5 w-5 text-red-500" />}
              </CardTitle>
              <CardDescription>
                Paste your CSS code here to format or minify
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste your CSS here..."
                value={inputCSS}
                onChange={(e) => setInputCSS(e.target.value)}
                className="min-h-[300px] font-mono text-sm input-enhanced"
              />
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={formatCSS} 
                  className="btn-enhanced hover-lift"
                  disabled={!inputCSS.trim()}
                >
                  {mode === "beautify" ? "Beautify CSS" : "Minify CSS"}
                </Button>
                <Button 
                  onClick={loadSampleCSS} 
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
              <CardTitle>Output CSS</CardTitle>
              <CardDescription>
                Your {mode === "beautify" ? "formatted" : "minified"} CSS will appear here
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Mode:</span>
                    <Select value={mode} onValueChange={(value: "beautify" | "minify") => setMode(value)}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beautify">Beautify</SelectItem>
                        <SelectItem value="minify">Minify</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {mode === "beautify" && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Indent:</span>
                      <Select value={indentSize.toString()} onValueChange={(value) => setIndentSize(Number(value))}>
                        <SelectTrigger className="w-[80px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="4">4</SelectItem>
                          <SelectItem value="8">8</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => copyToClipboard(formattedCSS)}
                    variant="outline"
                    size="sm"
                    className="hover-lift"
                    disabled={!formattedCSS}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    onClick={() => downloadCSS(formattedCSS, `formatted.${mode === "beautify" ? "css" : "min.css"}`)}
                    variant="outline"
                    size="sm"
                    className="hover-lift"
                    disabled={!formattedCSS}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
              
              <Textarea
                value={formattedCSS}
                readOnly
                className="min-h-[300px] font-mono text-sm bg-muted/50 input-enhanced"
                placeholder={`${mode === "beautify" ? "Formatted" : "Minified"} CSS will appear here...`}
              />
            </CardContent>
          </Card>
        </div>

        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle>CSS Statistics</CardTitle>
            <CardDescription>
              Information about your CSS code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {inputCSS ? inputCSS.length : 0}
                </div>
                <div className="text-sm text-muted-foreground">Characters</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {inputCSS ? (inputCSS.match(/[{}]/g) || []).length / 2 : 0}
                </div>
                <div className="text-sm text-muted-foreground">Rules</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {formattedCSS ? formattedCSS.length : 0}
                </div>
                <div className="text-sm text-muted-foreground">Output Size</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {inputCSS && formattedCSS ? Math.round((1 - formattedCSS.length / inputCSS.length) * 100) : 0}%
                </div>
                <div className="text-sm text-muted-foreground">Size Reduction</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 