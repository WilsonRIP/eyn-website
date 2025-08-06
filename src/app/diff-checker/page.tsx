"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Button } from "@/src/app/components/ui/button";
import { Textarea } from "@/src/app/components/ui/textarea";
import { Alert, AlertDescription } from "@/src/app/components/ui/alert";
import { Badge } from "@/src/app/components/ui/badge";
import { Copy, RotateCcw, CheckCircle, XCircle, AlertTriangle, FileText, GitCompare, Download } from "lucide-react";

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  lineNumber?: number;
}

export default function DiffCheckerPage() {
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [diffResult, setDiffResult] = useState<DiffLine[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showLineNumbers, setShowLineNumbers] = useState(true);

  const compareTexts = () => {
    if (!text1.trim() && !text2.trim()) {
      setErrorMessage("Please enter at least one text to compare");
      return;
    }

    setIsComparing(true);
    setErrorMessage("");

    try {
      const lines1 = text1.split('\n');
      const lines2 = text2.split('\n');
      const diff = computeDiff(lines1, lines2);
      setDiffResult(diff);
    } catch (error) {
      setErrorMessage("Error computing diff");
      setDiffResult([]);
    } finally {
      setIsComparing(false);
    }
  };

  const computeDiff = (lines1: string[], lines2: string[]): DiffLine[] => {
    const result: DiffLine[] = [];
    const maxLength = Math.max(lines1.length, lines2.length);

    for (let i = 0; i < maxLength; i++) {
      const line1 = lines1[i] || '';
      const line2 = lines2[i] || '';

      if (line1 === line2) {
        result.push({
          type: 'unchanged',
          content: line1,
          lineNumber: i + 1
        });
      } else {
        if (line1) {
          result.push({
            type: 'removed',
            content: line1,
            lineNumber: i + 1
          });
        }
        if (line2) {
          result.push({
            type: 'added',
            content: line2,
            lineNumber: i + 1
          });
        }
      }
    }

    return result;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadDiff = () => {
    const diffText = diffResult.map(line => {
      const prefix = line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' ';
      return `${prefix} ${line.content}`;
    }).join('\n');

    const blob = new Blob([diffText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "diff-result.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setText1("");
    setText2("");
    setDiffResult([]);
    setErrorMessage("");
  };

  const loadSampleTexts = () => {
    const sample1 = `function calculateSum(a, b) {
  return a + b;
}

function multiply(x, y) {
  return x * y;
}`;

    const sample2 = `function calculateSum(a, b) {
  const result = a + b;
  return result;
}

function divide(x, y) {
  if (y === 0) {
    throw new Error("Division by zero");
  }
  return x / y;
}`;

    setText1(sample1);
    setText2(sample2);
  };

  const getDiffStats = () => {
    const added = diffResult.filter(line => line.type === 'added').length;
    const removed = diffResult.filter(line => line.type === 'removed').length;
    const unchanged = diffResult.filter(line => line.type === 'unchanged').length;
    return { added, removed, unchanged };
  };

  const renderDiffLine = (line: DiffLine, index: number) => {
    const baseClasses = "font-mono text-sm p-1 rounded";
    const lineNumberClasses = showLineNumbers ? "w-12 text-right pr-2 text-muted-foreground" : "";

    switch (line.type) {
      case 'added':
        return (
          <div key={index} className="flex bg-green-50 dark:bg-green-950/20 border-l-4 border-green-500">
            {showLineNumbers && (
              <div className={`${lineNumberClasses} select-none`}>
                {line.lineNumber}
              </div>
            )}
            <div className={`${baseClasses} flex-1 text-green-800 dark:text-green-200`}>
              + {line.content}
            </div>
          </div>
        );
      case 'removed':
        return (
          <div key={index} className="flex bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500">
            {showLineNumbers && (
              <div className={`${lineNumberClasses} select-none`}>
                {line.lineNumber}
              </div>
            )}
            <div className={`${baseClasses} flex-1 text-red-800 dark:text-red-200`}>
              - {line.content}
            </div>
          </div>
        );
      default:
        return (
          <div key={index} className="flex">
            {showLineNumbers && (
              <div className={`${lineNumberClasses} select-none`}>
                {line.lineNumber}
              </div>
            )}
            <div className={`${baseClasses} flex-1`}>
              {line.content}
            </div>
          </div>
        );
    }
  };

  const stats = getDiffStats();

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 animate-slide-in-left">Diff Checker</h1>
          <p className="text-muted-foreground text-lg animate-slide-in-right">
            Compare two text inputs and see the differences highlighted
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <span>Original Text</span>
              </CardTitle>
              <CardDescription>
                Enter the first text to compare
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter original text..."
                value={text1}
                onChange={(e) => setText1(e.target.value)}
                className="min-h-[300px] font-mono text-sm input-enhanced"
              />
            </CardContent>
          </Card>

          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <span>Modified Text</span>
              </CardTitle>
              <CardDescription>
                Enter the second text to compare
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter modified text..."
                value={text2}
                onChange={(e) => setText2(e.target.value)}
                className="min-h-[300px] font-mono text-sm input-enhanced"
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <Button 
            onClick={compareTexts} 
            className="btn-enhanced hover-lift"
            disabled={isComparing}
          >
            <GitCompare className="h-4 w-4 mr-2" />
            {isComparing ? "Comparing..." : "Compare Texts"}
          </Button>
          <Button 
            onClick={loadSampleTexts} 
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
          <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950 mb-6">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}

        {diffResult.length > 0 && (
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitCompare className="h-5 w-5" />
                <span>Diff Result</span>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    +{stats.added} added
                  </Badge>
                  <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    -{stats.removed} removed
                  </Badge>
                  <Badge variant="secondary">
                    {stats.unchanged} unchanged
                  </Badge>
                </div>
              </CardTitle>
              <CardDescription>
                Differences between the two texts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Show line numbers:</label>
                  <input
                    type="checkbox"
                    checked={showLineNumbers}
                    onChange={(e) => setShowLineNumbers(e.target.checked)}
                    className="rounded"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => copyToClipboard(diffResult.map(line => line.content).join('\n'))}
                    variant="outline"
                    size="sm"
                    className="hover-lift"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    onClick={downloadDiff}
                    variant="outline"
                    size="sm"
                    className="hover-lift"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted/50 p-2 border-b">
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span>Added</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-red-500 rounded"></div>
                      <span>Removed</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-gray-300 rounded"></div>
                      <span>Unchanged</span>
                    </div>
                  </div>
                </div>
                <div className="max-h-[500px] overflow-y-auto">
                  {diffResult.map((line, index) => renderDiffLine(line, index))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
            <CardDescription>
              Learn how to effectively use the diff checker
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Understanding the Output</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span>Green lines are additions in the modified text</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span>Red lines are deletions from the original text</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-300 rounded"></div>
                    <span>Gray lines are unchanged between both texts</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold">Best Practices</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Use for comparing code, documents, or configuration files</li>
                  <li>• Line-by-line comparison shows exact differences</li>
                  <li>• Toggle line numbers for easier reference</li>
                  <li>• Download results for sharing or documentation</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 