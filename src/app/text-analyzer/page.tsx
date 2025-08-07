"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Button } from "@/src/app/components/ui/button";
import { Textarea } from "@/src/app/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/app/components/ui/select";
import { Alert, AlertDescription } from "@/src/app/components/ui/alert";
import { FileText, BarChart3, Copy, Download, RotateCcw, CheckCircle, AlertTriangle, Loader2, TrendingUp } from "lucide-react";

export default function TextAnalyzerPage() {
  const [inputText, setInputText] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [analysisType, setAnalysisType] = useState("comprehensive");

  const sampleText = `The rapid advancement of artificial intelligence has transformed how we approach problem-solving in various industries. Machine learning algorithms can now process vast amounts of data to identify patterns that humans might miss. This technology is being applied in healthcare for early disease detection, in finance for risk assessment, and in education for personalized learning experiences.

However, the integration of AI also raises important ethical considerations. Privacy concerns, algorithmic bias, and the potential for job displacement require careful consideration. It's crucial that we develop AI systems that are transparent, fair, and accountable to ensure they benefit society as a whole.`;

  const analyzeText = async () => {
    if (!inputText.trim()) {
      setError("Please enter some text to analyze");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      const response = await fetch('/api/text-analyzer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          analysisType: analysisType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze text');
      }

      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to analyze text. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    if (analysis) {
      navigator.clipboard.writeText(analysis);
    }
  };

  const downloadAnalysis = () => {
    if (analysis) {
      const blob = new Blob([analysis], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "text-analysis.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const loadSampleText = () => {
    setInputText(sampleText);
    setError("");
    setAnalysis("");
  };

  const clearAll = () => {
    setInputText("");
    setAnalysis("");
    setError("");
  };

  const getWordCount = (text: string) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  const getCharacterCount = (text: string) => {
    return text.length;
  };

  const getSentenceCount = (text: string) => {
    return text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 animate-slide-in-left">Text Analyzer</h1>
          <p className="text-muted-foreground text-lg animate-slide-in-right">
            Get detailed insights and analysis of your text using AI
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <span>Input Text</span>
                {inputText && <CheckCircle className="h-5 w-5 text-green-500" />}
              </CardTitle>
              <CardDescription>
                Paste your text here to get comprehensive analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Analysis Type:</span>
                    <Select value={analysisType} onValueChange={setAnalysisType}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="comprehensive">Comprehensive</SelectItem>
                        <SelectItem value="sentiment">Sentiment Analysis</SelectItem>
                        <SelectItem value="readability">Readability</SelectItem>
                        <SelectItem value="tone">Tone Analysis</SelectItem>
                        <SelectItem value="key-themes">Key Themes</SelectItem>
                        <SelectItem value="writing-style">Writing Style</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Words: {getWordCount(inputText)}</span>
                    <span>Characters: {getCharacterCount(inputText)}</span>
                    <span>Sentences: {getSentenceCount(inputText)}</span>
                  </div>
                  <Textarea
                    placeholder="Paste your text here for analysis..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="min-h-[300px] font-mono text-sm input-enhanced"
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={analyzeText} 
                  className="btn-enhanced hover-lift"
                  disabled={!inputText.trim() || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Analyze Text
                    </>
                  )}
                </Button>
                <Button 
                  onClick={loadSampleText} 
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
                <BarChart3 className="h-5 w-5" />
                <span>Analysis Results</span>
              </CardTitle>
              <CardDescription>
                AI-generated insights and analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  size="sm"
                  className="hover-lift"
                  disabled={!analysis}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button
                  onClick={downloadAnalysis}
                  variant="outline"
                  size="sm"
                  className="hover-lift"
                  disabled={!analysis}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
              
              <Textarea
                value={analysis}
                readOnly
                className="min-h-[400px] font-mono text-sm bg-muted/50 input-enhanced"
                placeholder="Text analysis will appear here..."
              />
            </CardContent>
          </Card>
        </div>

        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle>Analysis Types</CardTitle>
            <CardDescription>
              Different types of text analysis available
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold">Comprehensive</h3>
                <p className="text-sm text-muted-foreground">
                  Complete analysis including sentiment, readability, tone, and key themes.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Sentiment Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Analyzes the emotional tone and sentiment of the text.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Readability</h3>
                <p className="text-sm text-muted-foreground">
                  Evaluates how easy the text is to read and understand.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Tone Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Identifies the overall tone and style of the writing.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Key Themes</h3>
                <p className="text-sm text-muted-foreground">
                  Extracts and analyzes the main themes and topics discussed.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Writing Style</h3>
                <p className="text-sm text-muted-foreground">
                  Analyzes the writing style, structure, and linguistic patterns.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
