"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Button } from "@/src/app/components/ui/button";
import { Textarea } from "@/src/app/components/ui/textarea";
import { Badge } from "@/src/app/components/ui/badge";
import { Progress } from "@/src/app/components/ui/progress";
import { Alert, AlertDescription } from "@/src/app/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/app/components/ui/tabs";
import { Smile, Frown, Meh, AlertTriangle, Brain, FileText, BarChart3, RefreshCw, Info } from "lucide-react";

interface SentimentResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  scores: {
    positive: number;
    negative: number;
    neutral: number;
  };
  keywords: {
    positive: string[];
    negative: string[];
  };
}

interface SentimentHistory {
  id: string;
  text: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  timestamp: Date;
}

export default function SentimentAnalyzerPage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<SentimentResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<SentimentHistory[]>([]);
  const [activeTab, setActiveTab] = useState("analyzer");

  // Sample positive and negative keywords for demonstration
  const positiveKeywords = [
    "good", "great", "excellent", "amazing", "wonderful", "fantastic", "awesome", 
    "love", "like", "happy", "pleased", "delighted", "satisfied", "perfect", 
    "brilliant", "outstanding", "superb", "marvelous", "terrific", "splendid"
  ];

  const negativeKeywords = [
    "bad", "terrible", "awful", "horrible", "hate", "dislike", "disappointed", 
    "sad", "angry", "upset", "frustrated", "annoyed", "disgusting", "worst", 
    "pathetic", "useless", "worthless", "boring", "unpleasant", "annoying"
  ];

  const analyzeSentiment = () => {
    if (!text.trim()) {
      setError("Please enter some text to analyze");
      return;
    }

    setIsLoading(true);
    setError("");

    // Simulate API call delay
    setTimeout(() => {
      try {
        const words = text.toLowerCase().split(/\s+/);
        const positiveCount = words.filter(word => 
          positiveKeywords.some(keyword => word.includes(keyword))
        ).length;
        
        const negativeCount = words.filter(word => 
          negativeKeywords.some(keyword => word.includes(keyword))
        ).length;
        
        const totalSentimentWords = positiveCount + negativeCount;
        
        // Calculate scores
        const positiveScore = totalSentimentWords > 0 ? positiveCount / totalSentimentWords : 0.33;
        const negativeScore = totalSentimentWords > 0 ? negativeCount / totalSentimentWords : 0.33;
        const neutralScore = totalSentimentWords > 0 ? 
          (words.length - totalSentimentWords) / words.length : 0.34;
        
        // Normalize scores to ensure they sum to 1
        const total = positiveScore + negativeScore + neutralScore;
        const normalizedPositive = positiveScore / total;
        const normalizedNegative = negativeScore / total;
        const normalizedNeutral = neutralScore / total;
        
        // Determine overall sentiment
        let sentiment: 'positive' | 'negative' | 'neutral';
        if (normalizedPositive > normalizedNegative && normalizedPositive > normalizedNeutral) {
          sentiment = 'positive';
        } else if (normalizedNegative > normalizedPositive && normalizedNegative > normalizedNeutral) {
          sentiment = 'negative';
        } else {
          sentiment = 'neutral';
        }
        
        // Calculate confidence based on the difference between scores
        const maxScore = Math.max(normalizedPositive, normalizedNegative, normalizedNeutral);
        const confidence = Math.min(0.5 + (maxScore - 0.33) * 3, 0.99);
        
        // Extract keywords found in text
        const foundPositiveKeywords = words.filter(word => 
          positiveKeywords.some(keyword => word.includes(keyword))
        );
        
        const foundNegativeKeywords = words.filter(word => 
          negativeKeywords.some(keyword => word.includes(keyword))
        );
        
        const analysisResult: SentimentResult = {
          sentiment,
          confidence,
          scores: {
            positive: normalizedPositive,
            negative: normalizedNegative,
            neutral: normalizedNeutral
          },
          keywords: {
            positive: [...new Set(foundPositiveKeywords)],
            negative: [...new Set(foundNegativeKeywords)]
          }
        };
        
        setResult(analysisResult);
        
        // Add to history
        const historyItem: SentimentHistory = {
          id: Date.now().toString(),
          text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
          sentiment,
          confidence,
          timestamp: new Date()
        };
        
        setHistory(prev => [historyItem, ...prev.slice(0, 9)]);
      } catch (err) {
        setError("Failed to analyze sentiment. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }, 1500);
  };

  const clearText = () => {
    setText("");
    setResult(null);
    setError("");
  };

  const getSentimentIcon = (sentiment: 'positive' | 'negative' | 'neutral') => {
    switch (sentiment) {
      case 'positive':
        return <Smile className="h-5 w-5 text-green-500" />;
      case 'negative':
        return <Frown className="h-5 w-5 text-red-500" />;
      case 'neutral':
        return <Meh className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getSentimentColor = (sentiment: 'positive' | 'negative' | 'neutral') => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600 bg-green-50 dark:bg-green-950/20';
      case 'negative':
        return 'text-red-600 bg-red-50 dark:bg-red-950/20';
      case 'neutral':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20';
    }
  };

  const formatConfidence = (confidence: number) => {
    return `${Math.round(confidence * 100)}%`;
  };

  const formatScore = (score: number) => {
    return `${Math.round(score * 100)}%`;
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 animate-slide-in-left">Sentiment Analyzer</h1>
          <p className="text-muted-foreground text-lg animate-slide-in-right">
            Detect positive, negative, or neutral tone in your text
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="analyzer">Analyzer</TabsTrigger>
            <TabsTrigger value="details">Analysis Details</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="analyzer" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input */}
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    <span>Text Input</span>
                  </CardTitle>
                  <CardDescription>
                    Enter text to analyze its sentiment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Enter text here to analyze sentiment..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="min-h-[200px]"
                  />
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={analyzeSentiment}
                      className="btn-enhanced hover-lift flex-1"
                      disabled={isLoading || !text.trim()}
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Brain className="h-4 w-4 mr-2" />
                          Analyze Sentiment
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={clearText}
                      variant="outline"
                      className="hover-lift"
                    >
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

              {/* Result */}
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Analysis Result</span>
                  </CardTitle>
                  <CardDescription>
                    Sentiment analysis of your text
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {result ? (
                    <div className="space-y-6">
                      {/* Sentiment Display */}
                      <div className="text-center">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${getSentimentColor(result.sentiment)}`}>
                          {getSentimentIcon(result.sentiment)}
                          <span className="font-semibold capitalize">{result.sentiment}</span>
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                          Confidence: {formatConfidence(result.confidence)}
                        </div>
                        <Progress value={result.confidence * 100} className="mt-2 h-2" />
                      </div>

                      {/* Score Breakdown */}
                      <div className="space-y-3">
                        <h4 className="font-medium">Sentiment Scores</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-1">
                              <Smile className="h-4 w-4 text-green-500" />
                              Positive
                            </span>
                            <span>{formatScore(result.scores.positive)}</span>
                          </div>
                          <Progress value={result.scores.positive * 100} className="h-2" />
                          
                          <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-1">
                              <Frown className="h-4 w-4 text-red-500" />
                              Negative
                            </span>
                            <span>{formatScore(result.scores.negative)}</span>
                          </div>
                          <Progress value={result.scores.negative * 100} className="h-2" />
                          
                          <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-1">
                              <Meh className="h-4 w-4 text-yellow-500" />
                              Neutral
                            </span>
                            <span>{formatScore(result.scores.neutral)}</span>
                          </div>
                          <Progress value={result.scores.neutral * 100} className="h-2" />
                        </div>
                      </div>

                      {/* Keywords */}
                      {(result.keywords.positive.length > 0 || result.keywords.negative.length > 0) && (
                        <div className="space-y-3">
                          <h4 className="font-medium">Detected Keywords</h4>
                          <div className="flex flex-wrap gap-2">
                            {result.keywords.positive.map((keyword, index) => (
                              <Badge key={index} variant="outline" className="text-green-600 border-green-200">
                                {keyword}
                              </Badge>
                            ))}
                            {result.keywords.negative.map((keyword, index) => (
                              <Badge key={index} variant="outline" className="text-red-600 border-red-200">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Enter text and click "Analyze Sentiment" to see results</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  <span>How Sentiment Analysis Works</span>
                </CardTitle>
                <CardDescription>
                  Understanding the sentiment analysis process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Analysis Method</h3>
                    <p className="text-sm text-muted-foreground">
                      Our sentiment analyzer uses a rule-based approach that identifies positive and negative keywords in your text. 
                      It calculates sentiment scores based on the frequency and context of these keywords.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-medium">Positive Keywords</h4>
                      <div className="flex flex-wrap gap-1">
                        {positiveKeywords.slice(0, 10).map((keyword, index) => (
                          <Badge key={index} variant="outline" className="text-green-600 border-green-200">
                            {keyword}
                          </Badge>
                        ))}
                        <Badge variant="outline">+{positiveKeywords.length - 10} more</Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Negative Keywords</h4>
                      <div className="flex flex-wrap gap-1">
                        {negativeKeywords.slice(0, 10).map((keyword, index) => (
                          <Badge key={index} variant="outline" className="text-red-600 border-red-200">
                            {keyword}
                          </Badge>
                        ))}
                        <Badge variant="outline">+{negativeKeywords.length - 10} more</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold">Interpreting Results</h3>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>• <span className="font-medium">Positive</span>: Text contains more positive keywords and expressions</li>
                      <li>• <span className="font-medium">Negative</span>: Text contains more negative keywords and expressions</li>
                      <li>• <span className="font-medium">Neutral</span>: Text has a balanced mix or lacks strong sentiment indicators</li>
                      <li>• <span className="font-medium">Confidence</span>: How certain the analysis is about the detected sentiment</li>
                    </ul>
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>Note:</strong> This is a simplified sentiment analyzer for demonstration purposes. 
                        Advanced sentiment analysis would use machine learning models for better accuracy.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  <span>Analysis History</span>
                </CardTitle>
                <CardDescription>
                  Your recent sentiment analyses
                </CardDescription>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No analysis history yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Your analyzed texts will appear here once you start using the analyzer
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {history.map((item) => (
                      <div key={item.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {getSentimentIcon(item.sentiment)}
                              <span className="font-medium capitalize">{item.sentiment}</span>
                              <Badge variant="outline">{formatConfidence(item.confidence)}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{item.text}</p>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {item.timestamp.toLocaleDateString()} {item.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="card-enhanced mt-6">
          <CardHeader>
            <CardTitle>Applications</CardTitle>
            <CardDescription>
              How sentiment analysis can be used
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold">Customer Feedback</h3>
                <p className="text-sm text-muted-foreground">
                  Analyze customer reviews and feedback to understand satisfaction levels and identify areas for improvement.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Social Media</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor brand mentions and social media conversations to gauge public opinion about products or services.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Market Research</h3>
                <p className="text-sm text-muted-foreground">
                  Analyze survey responses and market research data to understand consumer preferences and trends.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}