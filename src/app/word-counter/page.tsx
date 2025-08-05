"use client";

import { useState, useEffect } from "react";
import { useDebounce } from "@/src/hooks/use-debounce";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Button } from "@/src/app/components/ui/button";
import { Textarea } from "@/src/app/components/ui/textarea";
import { Badge } from "@/src/app/components/ui/badge";
import { Progress } from "@/src/app/components/ui/progress";
import { 
  Loader2, 
  Copy, 
  Download, 
  RotateCcw, 
  FileText, 
  BarChart3, 
  TrendingUp, 
  Target, 
  BrainCircuit,
  AlertTriangle,
  CheckCircle,
  Zap
} from "lucide-react";
import { toast } from "react-hot-toast";

// Define a type for our statistics object for type safety
type TextStats = {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  uniqueWords: number;
  averageWordLength: number;
  averageSentenceLength: number;
  readingTime: number;
  speakingTime: number;
  fleschScore: number;
  readingLevel: string;
  topWords: Array<{ word: string; count: number }>;
};

const INITIAL_STATS: TextStats = {
  characters: 0, words: 0, sentences: 0, paragraphs: 0, lines: 0,
  charactersNoSpaces: 0, uniqueWords: 0, averageWordLength: 0,
  averageSentenceLength: 0, readingTime: 0, speakingTime: 0,
  fleschScore: 0, readingLevel: 'N/A', topWords: [],
};

export default function WordCounterPage() {
  const [text, setText] = useState("");
  const [stats, setStats] = useState<TextStats>(INITIAL_STATS);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedText = useDebounce(text, 500); // 500ms debounce delay

  useEffect(() => {
    if (!debouncedText.trim()) {
      setStats(INITIAL_STATS);
      return;
    }

    const analyze = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: debouncedText }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch analysis');
        }

        const data: TextStats = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Analysis failed:", error);
        toast.error("Failed to analyze text. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    analyze();
  }, [debouncedText]);

  const copyToClipboard = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Text copied to clipboard!");
    } catch (err) {
      console.error('Failed to copy', err);
      toast.error("Failed to copy text");
    }
  };

  const downloadText = () => {
    if (!text) return;
    const reportContent = `
Text Statistics Report
Generated: ${new Date().toLocaleString()}
-----------------------------------
TEXT CONTENT:
${text}
-----------------------------------
STATISTICS:
- Characters (with spaces): ${stats.characters}
- Characters (no spaces): ${stats.charactersNoSpaces}
- Words: ${stats.words}
- Sentences: ${stats.sentences}
- Paragraphs: ${stats.paragraphs}
- Reading Time: ~${stats.readingTime} min
- Speaking Time: ~${stats.speakingTime} min
- Flesch Reading Score: ${stats.fleschScore} (${stats.readingLevel})
-----------------------------------
TOP 5 WORDS:
${stats.topWords.map((item, i) => `${i + 1}. "${item.word}" (${item.count} times)`).join('\n')}
    `;
    const blob = new Blob([reportContent.trim()], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "text-analysis-report.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded!");
  };

  const clearText = () => {
    setText("");
    toast.success("Text cleared!");
  };

  const loadSampleText = () => {
    setText(`Artificial intelligence (AI) is intelligence demonstrated by machines, as opposed to the natural intelligence displayed by animals and humans. It is a field of computer science that focuses on creating smart machines capable of performing tasks that typically require human intelligence.

Key areas of AI research include problem-solving, knowledge representation, planning, learning, natural language processing, perception, and the ability to move and manipulate objects. Long-term goals include achieving Artificial General Intelligence (AGI), which would surpass human intelligence across a wide range of cognitive tasks. This is a complex topic.`);
    toast.success("Sample text loaded!");
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Word & Character Counter
          </h1>
          <p className="text-muted-foreground text-lg">
            Analyze your text with real-time statistics and insights powered by our backend API
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Text Input 
                    {isLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
                  </span>
                  <div className="flex gap-2">
                    <Button onClick={loadSampleText} variant="outline" size="sm" className="hover-lift">
                      Load Sample
                    </Button>
                    <Button onClick={clearText} variant="outline" size="sm" className="hover-lift">
                      <RotateCcw className="h-4 w-4 mr-2" /> Clear
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  Type or paste text to see it analyzed by our backend API. Analysis updates automatically after you stop typing.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Start typing... analysis will begin automatically after you pause."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="min-h-[400px] font-mono text-sm resize-none"
                />
                <div className="flex gap-2">
                  <Button 
                    onClick={copyToClipboard} 
                    variant="outline" 
                    disabled={!text}
                    className="hover-lift"
                  >
                    <Copy className="h-4 w-4 mr-2" /> Copy Text
                  </Button>
                  <Button 
                    onClick={downloadText} 
                    variant="outline" 
                    disabled={!text}
                    className="hover-lift"
                  >
                    <Download className="h-4 w-4 mr-2" /> Download Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" /> 
                  Basic Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-muted/50 rounded-lg hover-lift">
                    <div className="text-2xl font-bold text-primary">{stats.characters}</div>
                    <div className="text-sm text-muted-foreground">Characters</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg hover-lift">
                    <div className="text-2xl font-bold text-primary">{stats.words}</div>
                    <div className="text-sm text-muted-foreground">Words</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg hover-lift">
                    <div className="text-2xl font-bold text-primary">{stats.sentences}</div>
                    <div className="text-sm text-muted-foreground">Sentences</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg hover-lift">
                    <div className="text-2xl font-bold text-primary">{stats.paragraphs}</div>
                    <div className="text-sm text-muted-foreground">Paragraphs</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5" /> 
                  Readability Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Flesch Score</span>
                    <Badge variant="secondary">{stats.fleschScore}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Reading Level</span>
                    <Badge variant="secondary">{stats.readingLevel}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Unique Words</span>
                    <Badge variant="secondary">{stats.uniqueWords}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Avg. Word Length</span>
                    <Badge variant="secondary">{stats.averageWordLength}</Badge>
                  </div>
                </div>
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Reading Time</span>
                    <span className="font-medium">~{stats.readingTime} min</span>
                  </div>
                  <Progress value={Math.min(stats.readingTime * 10, 100)} className="h-2" />
                  <div className="flex items-center justify-between text-sm">
                    <span>Speaking Time</span>
                    <span className="font-medium">~{stats.speakingTime} min</span>
                  </div>
                  <Progress value={Math.min(stats.speakingTime * 10, 100)} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {stats.topWords.length > 0 && (
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" /> 
                    Top 5 Words
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats.topWords.map((item) => (
                      <div key={item.word} className="flex items-center justify-between p-2 bg-muted/30 rounded hover-lift">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">"{item.word}"</span>
                        </div>
                        <Badge variant="outline">{item.count} times</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Text Analysis Tips */}
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Text Analysis Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-primary flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Best Practices
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Aim for 15-20 words per sentence for optimal readability</li>
                  <li>• Use active voice to make your writing more engaging</li>
                  <li>• Break up long paragraphs to improve readability</li>
                  <li>• Vary sentence length to maintain reader interest</li>
                  <li>• Use transition words to connect ideas smoothly</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-primary flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Writing Guidelines
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Flesch Score 60-70: Ideal for general audiences</li>
                  <li>• Flesch Score 70-80: Good for web content</li>
                  <li>• Flesch Score 80-90: Perfect for easy reading</li>
                  <li>• Keep paragraphs under 150 words</li>
                  <li>• Use bullet points for lists and key information</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Features */}
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Performance Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-primary mb-2">⚡</div>
                <h4 className="font-medium mb-2">Debounced Analysis</h4>
                <p className="text-muted-foreground">Analysis runs only after you stop typing for 500ms, preventing lag</p>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-primary mb-2">🖥️</div>
                <h4 className="font-medium mb-2">Backend Processing</h4>
                <p className="text-muted-foreground">Heavy calculations run on the server, keeping your browser responsive</p>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-primary mb-2">📊</div>
                <h4 className="font-medium mb-2">Advanced Metrics</h4>
                <p className="text-muted-foreground">Flesch Reading Ease score and comprehensive text analysis</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 