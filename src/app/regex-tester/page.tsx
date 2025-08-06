"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Button } from "@/src/app/components/ui/button";
import { Textarea } from "@/src/app/components/ui/textarea";
import { Input } from "@/src/app/components/ui/input";
import { Alert, AlertDescription } from "@/src/app/components/ui/alert";
import { Badge } from "@/src/app/components/ui/badge";
import { Copy, RotateCcw, CheckCircle, XCircle, AlertTriangle, Code, FileText, Zap } from "lucide-react";

interface MatchResult {
  match: string;
  index: number;
  groups: string[];
}

export default function RegexTesterPage() {
  const [regex, setRegex] = useState("");
  const [testString, setTestString] = useState("");
  const [flags, setFlags] = useState("g");
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [replacedText, setReplacedText] = useState("");

  const testRegex = () => {
    if (!regex.trim()) {
      setErrorMessage("Please enter a regular expression");
      setIsValid(false);
      return;
    }

    try {
      const regexObj = new RegExp(regex, flags);
      const results: MatchResult[] = [];
      
      if (flags.includes('g')) {
        // Global match
        let match;
        while ((match = regexObj.exec(testString)) !== null) {
          results.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1)
          });
        }
      } else {
        // Single match
        const match = regexObj.exec(testString);
        if (match) {
          results.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1)
          });
        }
      }

      setMatches(results);
      setIsValid(true);
      setErrorMessage("");
    } catch (error) {
      setIsValid(false);
      setErrorMessage(error instanceof Error ? error.message : "Invalid regular expression");
      setMatches([]);
    }
  };

  const replaceText = () => {
    if (!regex.trim() || !replaceText.trim()) {
      setErrorMessage("Please enter both regex and replacement text");
      return;
    }

    try {
      const regexObj = new RegExp(regex, flags);
      const result = testString.replace(regexObj, replaceText);
      setReplacedText(result);
      setIsValid(true);
      setErrorMessage("");
    } catch (error) {
      setIsValid(false);
      setErrorMessage(error instanceof Error ? error.message : "Invalid regular expression");
      setReplacedText("");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const clearAll = () => {
    setRegex("");
    setTestString("");
    setFlags("g");
    setMatches([]);
    setIsValid(null);
    setErrorMessage("");
    setReplaceText("");
    setReplacedText("");
  };

  const loadSampleRegex = () => {
    setRegex("\\b\\w+@\\w+\\.\\w+\\b");
    setTestString("Contact us at john@example.com or jane@test.org for more information.");
    setFlags("g");
  };

  const toggleFlag = (flag: string) => {
    if (flags.includes(flag)) {
      setFlags(flags.replace(flag, ''));
    } else {
      setFlags(flags + flag);
    }
  };

  const highlightMatches = (text: string, matches: MatchResult[]): JSX.Element[] => {
    if (matches.length === 0) return [<span key="text">{text}</span>];
    
    const parts: JSX.Element[] = [];
    let lastIndex = 0;
    
    matches.forEach((match, index) => {
      // Add text before match
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${index}`}>
            {text.slice(lastIndex, match.index)}
          </span>
        );
      }
      
      // Add highlighted match
      parts.push(
        <span key={`match-${index}`} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {match.match}
        </span>
      );
      
      lastIndex = match.index + match.match.length;
    });
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(
        <span key="text-end">
          {text.slice(lastIndex)}
        </span>
      );
    }
    
    return parts;
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 animate-slide-in-left">Regex Tester</h1>
          <p className="text-muted-foreground text-lg animate-slide-in-right">
            Test and debug regular expressions with live matching and replacement
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                <span>Regular Expression</span>
                {isValid === true && <CheckCircle className="h-5 w-5 text-green-500" />}
                {isValid === false && <XCircle className="h-5 w-5 text-red-500" />}
              </CardTitle>
              <CardDescription>
                Enter your regular expression and test string
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Regex Pattern</label>
                <Input
                  placeholder="Enter regex pattern..."
                  value={regex}
                  onChange={(e) => setRegex(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Flags</label>
                <div className="flex flex-wrap gap-2">
                  {['g', 'i', 'm', 's', 'u', 'y'].map(flag => (
                    <Button
                      key={flag}
                      variant={flags.includes(flag) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleFlag(flag)}
                      className="w-8 h-8 p-0"
                    >
                      {flag}
                    </Button>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground">
                  g: global, i: case-insensitive, m: multiline, s: dotAll, u: unicode, y: sticky
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Test String</label>
                <Textarea
                  placeholder="Enter text to test against..."
                  value={testString}
                  onChange={(e) => setTestString(e.target.value)}
                  className="min-h-[150px] font-mono text-sm"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={testRegex} 
                  className="btn-enhanced hover-lift"
                  disabled={!regex.trim()}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Test Regex
                </Button>
                <Button 
                  onClick={loadSampleRegex} 
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
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <span>Match Results</span>
                {matches.length > 0 && (
                  <Badge variant="secondary">{matches.length} matches</Badge>
                )}
              </CardTitle>
              <CardDescription>
                View matches and highlighted text
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {matches.length > 0 ? (
                <>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Highlighted Text</h3>
                    <div className="p-3 bg-muted/50 rounded-lg font-mono text-sm">
                      {highlightMatches(testString, matches)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Match Details</h3>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {matches.map((match, index) => (
                        <div key={index} className="p-2 bg-muted/30 rounded border">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-mono text-sm">
                                <span className="text-muted-foreground">Match {index + 1}:</span> "{match.match}"
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Position: {match.index}
                              </div>
                              {match.groups.length > 0 && (
                                <div className="text-xs text-muted-foreground">
                                  Groups: {match.groups.map((group, i) => `$${i + 1}="${group}"`).join(', ')}
                                </div>
                              )}
                            </div>
                            <Button
                              onClick={() => copyToClipboard(match.match)}
                              variant="ghost"
                              size="sm"
                              className="shrink-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Match results will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle>Text Replacement</CardTitle>
            <CardDescription>
              Replace matched text with custom replacement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Replacement Text</label>
                <Input
                  placeholder="Enter replacement text..."
                  value={replaceText}
                  onChange={(e) => setReplaceText(e.target.value)}
                  className="font-mono text-sm"
                />
                <div className="text-xs text-muted-foreground">
                  Use $1, $2, etc. to reference capture groups
                </div>
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={replaceText} 
                  className="btn-enhanced hover-lift"
                  disabled={!regex.trim() || !replaceText.trim()}
                >
                  Replace
                </Button>
              </div>
            </div>

            {replacedText && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Result</label>
                <div className="p-3 bg-muted/50 rounded-lg font-mono text-sm">
                  {replacedText}
                </div>
                <Button
                  onClick={() => copyToClipboard(replacedText)}
                  variant="outline"
                  size="sm"
                  className="hover-lift"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Result
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle>Regex Cheat Sheet</CardTitle>
            <CardDescription>
              Common regex patterns and their meanings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Character Classes</h3>
                <div className="space-y-2 text-sm">
                  <div><code className="bg-muted px-1 rounded">\w</code> - Word character (a-z, A-Z, 0-9, _)</div>
                  <div><code className="bg-muted px-1 rounded">\d</code> - Digit (0-9)</div>
                  <div><code className="bg-muted px-1 rounded">\s</code> - Whitespace</div>
                  <div><code className="bg-muted px-1 rounded">.</code> - Any character (except newline)</div>
                  <div><code className="bg-muted px-1 rounded">[abc]</code> - Any character in brackets</div>
                  <div><code className="bg-muted px-1 rounded">[^abc]</code> - Any character not in brackets</div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold">Quantifiers</h3>
                <div className="space-y-2 text-sm">
                  <div><code className="bg-muted px-1 rounded">*</code> - Zero or more</div>
                  <div><code className="bg-muted px-1 rounded">+</code> - One or more</div>
                  <div><code className="bg-muted px-1 rounded">?</code> - Zero or one</div>
                  <div><code className="bg-muted px-1 rounded">{'{n}'}</code> - Exactly n times</div>
                  <div><code className="bg-muted px-1 rounded">{'{n,}'}</code> - n or more times</div>
                  <div><code className="bg-muted px-1 rounded">{'{n,m}'}</code> - Between n and m times</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 