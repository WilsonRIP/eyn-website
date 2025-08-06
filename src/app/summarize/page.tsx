"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Button } from "@/src/app/components/ui/button";
import { Textarea } from "@/src/app/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/app/components/ui/select";
import { Slider } from "@/src/app/components/ui/slider";
import { Progress } from "@/src/app/components/ui/progress";
import { Alert, AlertDescription } from "@/src/app/components/ui/alert";
import { FileText, Copy, Download, RotateCcw, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";

export default function TextSummarizerPage() {
  const [inputText, setInputText] = useState("");
  const [summarizedText, setSummarizedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [summaryLength, setSummaryLength] = useState([50]);
  const [summaryStyle, setSummaryStyle] = useState("concise");

  const sampleText = `Artificial Intelligence (AI) has emerged as one of the most transformative technologies of the 21st century, revolutionizing industries and reshaping how we live and work. From virtual assistants like Siri and Alexa to advanced machine learning algorithms that power recommendation systems, AI is becoming increasingly integrated into our daily lives.

The field of AI encompasses various subfields, including machine learning, natural language processing, computer vision, and robotics. Machine learning, in particular, has seen remarkable advancements with the development of deep learning neural networks that can process vast amounts of data and identify complex patterns.

In healthcare, AI is being used to diagnose diseases, predict patient outcomes, and develop personalized treatment plans. Medical imaging systems powered by AI can detect abnormalities in X-rays, MRIs, and CT scans with accuracy rates that rival or exceed human radiologists. Pharmaceutical companies are leveraging AI to accelerate drug discovery and development processes.

The business world has also embraced AI for automation, data analysis, and customer service. Chatbots handle customer inquiries 24/7, while predictive analytics help companies make data-driven decisions. AI-powered tools are streamlining operations, reducing costs, and improving efficiency across various sectors.

However, the rapid advancement of AI also raises important ethical considerations. Issues such as algorithmic bias, privacy concerns, and the potential for job displacement require careful consideration and regulation. Ensuring that AI systems are fair, transparent, and accountable is crucial for their responsible development and deployment.

As we look to the future, AI will continue to evolve and become even more sophisticated. The development of artificial general intelligence (AGI) - AI that can perform any intellectual task that a human can - remains a long-term goal for researchers. While AGI may still be decades away, the current progress in narrow AI applications is already providing significant value to society.

Education and workforce development will need to adapt to prepare people for an AI-driven economy. This includes teaching AI literacy, developing skills that complement AI systems, and creating new job opportunities that leverage human creativity and emotional intelligence alongside AI capabilities.

The responsible development and deployment of AI requires collaboration between technologists, policymakers, ethicists, and the public. By working together, we can harness the power of AI to solve complex problems, improve human well-being, and create a more prosperous and equitable future for all.`;

  const summarizeText = async () => {
    if (!inputText.trim()) {
      setError("Please enter some text to summarize");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError("");

    try {
      // Simulate processing with progress updates
      const simulateProgress = () => {
        const interval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 90) {
              clearInterval(interval);
              return 90;
            }
            return prev + 15;
          });
        }, 300);
        return interval;
      };

      const progressInterval = simulateProgress();

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate mock summary based on input and settings
      const summary = generateMockSummary(inputText, summaryLength[0], summaryStyle);
      setSummarizedText(summary);
      setProgress(100);
      clearInterval(progressInterval);
    } catch (error) {
      setError("Failed to summarize text. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const generateMockSummary = (text: string, length: number, style: string): string => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const targetSentenceCount = Math.max(2, Math.floor(sentences.length * (length / 100)));
    
    let selectedSentences = sentences.slice(0, targetSentenceCount);
    
    if (style === "detailed") {
      selectedSentences = sentences.slice(0, Math.min(targetSentenceCount + 2, sentences.length));
    } else if (style === "bullet") {
      return selectedSentences.map(sentence => `• ${sentence.trim()}`).join('\n');
    }
    
    return selectedSentences.map(sentence => sentence.trim()).join('. ') + '.';
  };

  const copyToClipboard = () => {
    if (summarizedText) {
      navigator.clipboard.writeText(summarizedText);
    }
  };

  const downloadSummary = () => {
    if (summarizedText) {
      const blob = new Blob([summarizedText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "summary.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const loadSampleText = () => {
    setInputText(sampleText);
    setError("");
    setSummarizedText("");
  };

  const clearAll = () => {
    setInputText("");
    setSummarizedText("");
    setError("");
    setProgress(0);
  };

  const getWordCount = (text: string) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 animate-slide-in-left">Text Summarizer</h1>
          <p className="text-muted-foreground text-lg animate-slide-in-right">
            Generate concise summaries of long articles and documents
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
                Paste your text here to generate a summary
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Word count: {getWordCount(inputText)}</span>
                  <span>Character count: {inputText.length}</span>
                </div>
                <Textarea
                  placeholder="Paste your text here to summarize..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[300px] font-mono text-sm input-enhanced"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={summarizeText} 
                  className="btn-enhanced hover-lift"
                  disabled={!inputText.trim() || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Summarizing...
                    </>
                  ) : (
                    "Generate Summary"
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
                <FileText className="h-5 w-5" />
                <span>Summary</span>
              </CardTitle>
              <CardDescription>
                Your summarized text will appear here
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Length:</span>
                      <span className="text-sm text-muted-foreground">{summaryLength[0]}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Style:</span>
                      <Select value={summaryStyle} onValueChange={setSummaryStyle}>
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="concise">Concise</SelectItem>
                          <SelectItem value="detailed">Detailed</SelectItem>
                          <SelectItem value="bullet">Bullet Points</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={copyToClipboard}
                      variant="outline"
                      size="sm"
                      className="hover-lift"
                      disabled={!summarizedText}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      onClick={downloadSummary}
                      variant="outline"
                      size="sm"
                      className="hover-lift"
                      disabled={!summarizedText}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Summary Length</label>
                  <Slider
                    value={summaryLength}
                    onValueChange={setSummaryLength}
                    max={100}
                    min={10}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>10%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
              
              <Textarea
                value={summarizedText}
                readOnly
                className="min-h-[300px] font-mono text-sm bg-muted/50 input-enhanced"
                placeholder="Summarized text will appear here..."
              />

              {summarizedText && (
                <div className="text-sm text-muted-foreground">
                  Summary length: {getWordCount(summarizedText)} words ({Math.round((getWordCount(summarizedText) / getWordCount(inputText)) * 100)}% of original)
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
            <CardDescription>
              Understanding the text summarization process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold">Text Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  The AI analyzes your text to identify key sentences, important concepts, and the overall structure of the content.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Key Information Extraction</h3>
                <p className="text-sm text-muted-foreground">
                  Important information is extracted while maintaining the original meaning and context of the text.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Summary Generation</h3>
                <p className="text-sm text-muted-foreground">
                  A coherent summary is generated based on your specified length and style preferences.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 