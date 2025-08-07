"use client";

import { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Button } from "@/src/app/components/ui/button";
import { Textarea } from "@/src/app/components/ui/textarea";
import { Input } from "@/src/app/components/ui/input";
import { Label } from "@/src/app/components/ui/label";
import { Badge } from "@/src/app/components/ui/badge";
import { Alert, AlertDescription } from "@/src/app/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/app/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/app/components/ui/select";
import { Slider } from "@/src/app/components/ui/slider";
import { Checkbox } from "@/src/app/components/ui/checkbox";
import { 
  FileText, 
  Search, 
  TrendingUp, 
  Filter, 
  Download, 
  RotateCcw, 
  Copy, 
  BarChart3, 
  Target,
  Zap,
  Settings,
  Info,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { CopyButton } from "@/src/app/components/ui/copy-button";

interface Keyword {
  word: string;
  frequency: number;
  score: number;
  type: 'noun' | 'verb' | 'adjective' | 'other';
  importance: 'high' | 'medium' | 'low';
}

interface ExtractionSettings {
  algorithm: 'tf-idf' | 'frequency' | 'rake' | 'textrank';
  maxKeywords: number;
  minLength: number;
  maxLength: number;
  includeNumbers: boolean;
  includeStopWords: boolean;
  caseSensitive: boolean;
  groupSimilar: boolean;
  sortBy: 'frequency' | 'score' | 'length' | 'alphabetical';
}

const stopWords = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he', 
  'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'will', 'with',
  'i', 'you', 'your', 'we', 'they', 'them', 'this', 'these', 'those', 'but', 'or',
  'if', 'then', 'else', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each',
  'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
  'same', 'so', 'than', 'too', 'very', 'can', 'will', 'just', 'should', 'now'
]);

const initialSettings: ExtractionSettings = {
  algorithm: 'tf-idf',
  maxKeywords: 20,
  minLength: 3,
  maxLength: 20,
  includeNumbers: false,
  includeStopWords: false,
  caseSensitive: false,
  groupSimilar: true,
  sortBy: 'score'
};

export default function KeywordExtractorPage() {
  const [inputText, setInputText] = useState("");
  const [extractedKeywords, setExtractedKeywords] = useState<Keyword[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [settings, setSettings] = useState<ExtractionSettings>(initialSettings);
  const [showSettings, setShowSettings] = useState(false);

  // Sample texts for quick testing
  const sampleTexts = [
    {
      name: "Technical Article",
      text: `Machine learning algorithms have revolutionized the way we process and analyze data. 
      Deep learning models, particularly neural networks, can identify complex patterns in large datasets. 
      Natural language processing techniques enable computers to understand and generate human language. 
      Artificial intelligence applications are becoming increasingly prevalent in modern technology.`
    },
    {
      name: "Business Report",
      text: `The quarterly financial performance shows significant growth in revenue streams. 
      Market analysis indicates strong consumer demand for innovative products. 
      Strategic partnerships have expanded our global presence and market share. 
      Operational efficiency improvements have reduced costs and increased profitability.`
    },
    {
      name: "Academic Paper",
      text: `The research methodology employed quantitative analysis techniques to examine 
      the correlation between environmental factors and population dynamics. 
      Statistical significance was determined through rigorous hypothesis testing procedures. 
      The findings contribute to existing literature on ecological sustainability practices.`
    }
  ];

  // Calculate TF-IDF score for a word
  const calculateTFIDF = useCallback((word: string, document: string, allDocuments: string[]) => {
    const wordRegex = new RegExp(`\\b${word}\\b`, 'gi');
    const tf = (document.match(wordRegex) || []).length / document.split(/\s+/).length;
    
    const documentsWithWord = allDocuments.filter(doc => 
      new RegExp(`\\b${word}\\b`, 'i').test(doc)
    ).length;
    
    const idf = Math.log(allDocuments.length / (documentsWithWord + 1));
    return tf * idf;
  }, []);

  // Extract keywords using different algorithms
  const extractKeywords = useCallback(async () => {
    if (!inputText.trim()) {
      setError("Please enter some text to extract keywords from.");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 800));

      const words = inputText
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => {
          if (!settings.includeNumbers && /\d/.test(word)) return false;
          if (!settings.includeStopWords && stopWords.has(word)) return false;
          if (word.length < settings.minLength || word.length > settings.maxLength) return false;
          return word.length > 0;
        });

      const wordFrequency: { [key: string]: number } = {};
      words.forEach(word => {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      });

      let keywords: Keyword[] = [];

      switch (settings.algorithm) {
        case 'frequency':
          keywords = Object.entries(wordFrequency)
            .map(([word, frequency]) => ({
              word: settings.caseSensitive ? word : word.toLowerCase(),
              frequency,
              score: frequency,
              type: 'other' as const,
              importance: frequency > 5 ? 'high' : frequency > 2 ? 'medium' : 'low' as const
            }));
          break;

        case 'tf-idf':
          const documents = [inputText]; // For simplicity, treat input as single document
          keywords = Object.entries(wordFrequency)
            .map(([word, frequency]) => ({
              word: settings.caseSensitive ? word : word.toLowerCase(),
              frequency,
              score: calculateTFIDF(word, inputText, documents),
              type: 'other' as const,
              importance: 'medium' as const
            }));
          break;

        case 'rake':
          // RAKE algorithm - extract keyphrases
          const phrases = inputText
            .toLowerCase()
            .split(/[.!?]+/)
            .map(sentence => sentence.trim())
            .filter(sentence => sentence.length > 0);

          const phraseScores: { [key: string]: number } = {};
          
          phrases.forEach(phrase => {
            const words = phrase.split(/\s+/).filter(word => 
              word.length >= settings.minLength && 
              !stopWords.has(word) &&
              !/\d/.test(word)
            );
            
            if (words.length >= 2) {
              const phraseText = words.join(' ');
              phraseScores[phraseText] = (phraseScores[phraseText] || 0) + words.length;
            }
          });

          keywords = Object.entries(phraseScores)
            .map(([phrase, score]) => ({
              word: phrase,
              frequency: 1,
              score,
              type: 'other' as const,
              importance: score > 3 ? 'high' : score > 1 ? 'medium' : 'low' as const
            }));
          break;

        case 'textrank':
          // Simplified TextRank algorithm
          const wordGraph: { [key: string]: Set<string> } = {};
          const windowSize = 4;
          
          for (let i = 0; i < words.length - windowSize + 1; i++) {
            const window = words.slice(i, i + windowSize);
            window.forEach((word1, idx1) => {
              if (!wordGraph[word1]) wordGraph[word1] = new Set();
              window.forEach((word2, idx2) => {
                if (idx1 !== idx2) {
                  wordGraph[word1].add(word2);
                }
              });
            });
          }

          keywords = Object.entries(wordGraph)
            .map(([word, connections]) => ({
              word: settings.caseSensitive ? word : word.toLowerCase(),
              frequency: wordFrequency[word] || 0,
              score: connections.size,
              type: 'other' as const,
              importance: connections.size > 5 ? 'high' : connections.size > 2 ? 'medium' : 'low' as const
            }));
          break;
      }

      // Sort keywords
      keywords.sort((a, b) => {
        switch (settings.sortBy) {
          case 'frequency':
            return b.frequency - a.frequency;
          case 'score':
            return b.score - a.score;
          case 'length':
            return b.word.length - a.word.length;
          case 'alphabetical':
            return a.word.localeCompare(b.word);
          default:
            return b.score - a.score;
        }
      });

      // Limit to max keywords
      keywords = keywords.slice(0, settings.maxKeywords);

      setExtractedKeywords(keywords);
    } catch (error) {
      setError("Failed to extract keywords. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [inputText, settings, calculateTFIDF]);

  // Load sample text
  const loadSample = (sampleIndex: number) => {
    setInputText(sampleTexts[sampleIndex].text);
    setError("");
  };

  // Clear all content
  const clearAll = () => {
    setInputText("");
    setExtractedKeywords([]);
    setError("");
  };

  // Download keywords as CSV
  const downloadKeywords = () => {
    if (extractedKeywords.length === 0) return;

    const csvContent = [
      'Keyword,Frequency,Score,Importance',
      ...extractedKeywords.map(kw => 
        `"${kw.word}",${kw.frequency},${kw.score.toFixed(3)},${kw.importance}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extracted-keywords.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Get importance color
  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Update settings
  const updateSetting = <K extends keyof ExtractionSettings>(
    key: K, 
    value: ExtractionSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 animate-slide-in-left">Keyword Extractor</h1>
          <p className="text-muted-foreground text-lg animate-slide-in-right">
            Extract the most important terms and phrases from your text using advanced algorithms
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  <span>Input Text</span>
                  <div className="flex gap-2 ml-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSettings(!showSettings)}
                      className="hover-lift"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
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
                </CardTitle>
                <CardDescription>
                  Paste or type your text to extract keywords
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter your text here to extract keywords..."
                  className="min-h-[300px] resize-none"
                />

                {/* Sample Texts */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Quick Samples</Label>
                  <div className="flex gap-2 flex-wrap">
                    {sampleTexts.map((sample, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => loadSample(index)}
                        className="hover-lift"
                      >
                        {sample.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={extractKeywords}
                  disabled={isProcessing || !inputText.trim()}
                  className="w-full btn-enhanced hover-lift"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Extracting Keywords...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Extract Keywords
                    </>
                  )}
                </Button>

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

            {/* Settings Panel */}
            {showSettings && (
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Extraction Settings
                  </CardTitle>
                  <CardDescription>
                    Configure how keywords are extracted and processed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label>Algorithm</Label>
                        <Select value={settings.algorithm} onValueChange={(value: any) => updateSetting('algorithm', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tf-idf">TF-IDF (Term Frequency-Inverse Document Frequency)</SelectItem>
                            <SelectItem value="frequency">Frequency-based</SelectItem>
                            <SelectItem value="rake">RAKE (Rapid Automatic Keyword Extraction)</SelectItem>
                            <SelectItem value="textrank">TextRank</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Sort By</Label>
                        <Select value={settings.sortBy} onValueChange={(value: any) => updateSetting('sortBy', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="score">Score</SelectItem>
                            <SelectItem value="frequency">Frequency</SelectItem>
                            <SelectItem value="length">Length</SelectItem>
                            <SelectItem value="alphabetical">Alphabetical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Max Keywords: {settings.maxKeywords}</Label>
                        <Slider
                          value={[settings.maxKeywords]}
                          onValueChange={(value) => updateSetting('maxKeywords', value[0])}
                          max={50}
                          min={5}
                          step={1}
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label>Word Length Range</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div>
                            <Label className="text-xs">Min: {settings.minLength}</Label>
                            <Slider
                              value={[settings.minLength]}
                              onValueChange={(value) => updateSetting('minLength', value[0])}
                              max={10}
                              min={1}
                              step={1}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Max: {settings.maxLength}</Label>
                            <Slider
                              value={[settings.maxLength]}
                              onValueChange={(value) => updateSetting('maxLength', value[0])}
                              max={30}
                              min={5}
                              step={1}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="includeNumbers" 
                            checked={settings.includeNumbers}
                            onCheckedChange={(checked) => updateSetting('includeNumbers', checked as boolean)}
                          />
                          <Label htmlFor="includeNumbers">Include numbers</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="includeStopWords" 
                            checked={settings.includeStopWords}
                            onCheckedChange={(checked) => updateSetting('includeStopWords', checked as boolean)}
                          />
                          <Label htmlFor="includeStopWords">Include stop words</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="caseSensitive" 
                            checked={settings.caseSensitive}
                            onCheckedChange={(checked) => updateSetting('caseSensitive', checked as boolean)}
                          />
                          <Label htmlFor="caseSensitive">Case sensitive</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="groupSimilar" 
                            checked={settings.groupSimilar}
                            onCheckedChange={(checked) => updateSetting('groupSimilar', checked as boolean)}
                          />
                          <Label htmlFor="groupSimilar">Group similar words</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Results Section */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  <span>Extracted Keywords</span>
                  {extractedKeywords.length > 0 && (
                    <Badge variant="secondary">{extractedKeywords.length}</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Most important terms from your text
                </CardDescription>
              </CardHeader>
              <CardContent>
                {extractedKeywords.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No keywords extracted yet</p>
                    <p className="text-sm mt-2">
                      Enter some text and click "Extract Keywords" to get started
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <CopyButton
                        text={extractedKeywords.map(kw => kw.word).join(', ')}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        Copy All
                      </CopyButton>
                      <Button
                        onClick={downloadKeywords}
                        variant="outline"
                        size="sm"
                        className="hover-lift"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>

                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {extractedKeywords.map((keyword, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium truncate">{keyword.word}</span>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getImportanceColor(keyword.importance)}`}
                              >
                                {keyword.importance}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Freq: {keyword.frequency} | Score: {keyword.score.toFixed(2)}
                            </div>
                          </div>
                          <CopyButton
                            text={keyword.word}
                            variant="ghost"
                            size="sm"
                            className="ml-2 shrink-0"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Algorithm Info */}
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Algorithm Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <div>
                    <h4 className="font-semibold">TF-IDF</h4>
                    <p className="text-muted-foreground">Measures word importance based on frequency and rarity across documents.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Frequency</h4>
                    <p className="text-muted-foreground">Simple count of how often each word appears in the text.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">RAKE</h4>
                    <p className="text-muted-foreground">Extracts keyphrases by analyzing word co-occurrence patterns.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">TextRank</h4>
                    <p className="text-muted-foreground">Uses graph-based ranking to identify important words based on connections.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
