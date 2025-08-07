"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Button } from "@/src/app/components/ui/button";
import { Textarea } from "@/src/app/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/app/components/ui/select";
import { Alert, AlertDescription } from "@/src/app/components/ui/alert";
import { Code, FileText, Copy, Download, RotateCcw, CheckCircle, AlertTriangle, Loader2, Lightbulb } from "lucide-react";

export default function CodeExplainerPage() {
  const [codeInput, setCodeInput] = useState("");
  const [explanation, setExplanation] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [explanationType, setExplanationType] = useState("detailed");
  const [language, setLanguage] = useState("auto");

  const sampleCode = `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const result = fibonacci(10);
console.log(result);`;

  const explainCode = async () => {
    if (!codeInput.trim()) {
      setError("Please enter some code to explain");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      const response = await fetch('/api/code-explainer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: codeInput,
          explanationType: explanationType,
          language: language,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to explain code');
      }

      const data = await response.json();
      setExplanation(data.explanation);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to explain code. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    if (explanation) {
      navigator.clipboard.writeText(explanation);
    }
  };

  const downloadExplanation = () => {
    if (explanation) {
      const blob = new Blob([explanation], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "code-explanation.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const loadSampleCode = () => {
    setCodeInput(sampleCode);
    setError("");
    setExplanation("");
  };

  const clearAll = () => {
    setCodeInput("");
    setExplanation("");
    setError("");
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 animate-slide-in-left">Code Explainer</h1>
          <p className="text-muted-foreground text-lg animate-slide-in-right">
            Get detailed explanations of code snippets using AI
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                <span>Input Code</span>
                {codeInput && <CheckCircle className="h-5 w-5 text-green-500" />}
              </CardTitle>
              <CardDescription>
                Paste your code here to get an explanation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Language:</span>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto Detect</SelectItem>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                        <SelectItem value="cpp">C++</SelectItem>
                        <SelectItem value="csharp">C#</SelectItem>
                        <SelectItem value="php">PHP</SelectItem>
                        <SelectItem value="ruby">Ruby</SelectItem>
                        <SelectItem value="go">Go</SelectItem>
                        <SelectItem value="rust">Rust</SelectItem>
                        <SelectItem value="typescript">TypeScript</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Type:</span>
                    <Select value={explanationType} onValueChange={setExplanationType}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="detailed">Detailed</SelectItem>
                        <SelectItem value="simple">Simple</SelectItem>
                        <SelectItem value="line-by-line">Line by Line</SelectItem>
                        <SelectItem value="algorithm">Algorithm Focus</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Textarea
                  placeholder="Paste your code here..."
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  className="min-h-[300px] font-mono text-sm input-enhanced"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={explainCode} 
                  className="btn-enhanced hover-lift"
                  disabled={!codeInput.trim() || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Explaining...
                    </>
                  ) : (
                    <>
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Explain Code
                    </>
                  )}
                </Button>
                <Button 
                  onClick={loadSampleCode} 
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
                <FileText className="h-5 w-5" />
                <span>Explanation</span>
              </CardTitle>
              <CardDescription>
                AI-generated explanation of your code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  size="sm"
                  className="hover-lift"
                  disabled={!explanation}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button
                  onClick={downloadExplanation}
                  variant="outline"
                  size="sm"
                  className="hover-lift"
                  disabled={!explanation}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
              
              <Textarea
                value={explanation}
                readOnly
                className="min-h-[400px] font-mono text-sm bg-muted/50 input-enhanced"
                placeholder="Code explanation will appear here..."
              />
            </CardContent>
          </Card>
        </div>

        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
            <CardDescription>
              Understanding the code explanation process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold">Code Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  The AI analyzes your code to understand its structure, syntax, and logic flow.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Context Understanding</h3>
                <p className="text-sm text-muted-foreground">
                  It identifies programming patterns, algorithms, and best practices used in your code.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Explanation Generation</h3>
                <p className="text-sm text-muted-foreground">
                  A comprehensive explanation is generated based on your preferred explanation type and detail level.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
