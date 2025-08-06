"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Button } from "@/src/app/components/ui/button";
import { Textarea } from "@/src/app/components/ui/textarea";
import { Badge } from "@/src/app/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/app/components/ui/tabs";
import { Alert, AlertDescription } from "@/src/app/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/app/components/ui/select";
import { Copy, Download, RotateCcw, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export default function JSONFormatterPage() {
  const [inputJson, setInputJson] = useState("");
  const [formattedJson, setFormattedJson] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [indentSize, setIndentSize] = useState(2);

  const formatJSON = () => {
    if (!inputJson.trim()) {
      setErrorMessage("Please enter some JSON to format");
      setIsValid(false);
      return;
    }

    try {
      const parsed = JSON.parse(inputJson);
      const formatted = JSON.stringify(parsed, null, indentSize);
      setFormattedJson(formatted);
      setIsValid(true);
      setErrorMessage("");
    } catch (error) {
      setIsValid(false);
      setErrorMessage(error instanceof Error ? error.message : "Invalid JSON");
      setFormattedJson("");
    }
  };

  const validateJSON = () => {
    if (!inputJson.trim()) {
      setErrorMessage("Please enter some JSON to validate");
      setIsValid(false);
      return;
    }

    try {
      JSON.parse(inputJson);
      setIsValid(true);
      setErrorMessage("");
      setFormattedJson(JSON.stringify(JSON.parse(inputJson), null, indentSize));
    } catch (error) {
      setIsValid(false);
      setErrorMessage(error instanceof Error ? error.message : "Invalid JSON");
      setFormattedJson("");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadJSON = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "application/json" });
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
    setInputJson("");
    setFormattedJson("");
    setIsValid(null);
    setErrorMessage("");
  };

  const loadSampleJSON = () => {
    const sample = `{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "address": {
    "street": "123 Main St",
    "city": "Anytown",
    "country": "USA"
  },
  "hobbies": ["reading", "gaming", "coding"],
  "active": true
}`;
    setInputJson(sample);
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 animate-slide-in-left">JSON Formatter & Validator</h1>
          <p className="text-muted-foreground text-lg animate-slide-in-right">
            Format, validate, and beautify your JSON data with ease
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>Input JSON</span>
                {isValid === true && <CheckCircle className="h-5 w-5 text-green-500" />}
                {isValid === false && <XCircle className="h-5 w-5 text-red-500" />}
              </CardTitle>
              <CardDescription>
                Paste your JSON data here to format and validate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste your JSON here..."
                value={inputJson}
                onChange={(e) => setInputJson(e.target.value)}
                className="min-h-[300px] font-mono text-sm input-enhanced"
              />
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={formatJSON} 
                  className="btn-enhanced hover-lift"
                  disabled={!inputJson.trim()}
                >
                  Format JSON
                </Button>
                <Button 
                  onClick={validateJSON} 
                  variant="outline" 
                  className="hover-lift"
                  disabled={!inputJson.trim()}
                >
                  Validate Only
                </Button>
                <Button 
                  onClick={loadSampleJSON} 
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
              <CardTitle>Formatted Output</CardTitle>
              <CardDescription>
                Your formatted and validated JSON will appear here
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Indent Size:</span>
                  <Select value={indentSize.toString()} onValueChange={(value) => setIndentSize(Number(value))}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 spaces</SelectItem>
                      <SelectItem value="4">4 spaces</SelectItem>
                      <SelectItem value="8">8 spaces</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => copyToClipboard(formattedJson)}
                    variant="outline"
                    size="sm"
                    className="hover-lift"
                    disabled={!formattedJson}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    onClick={() => downloadJSON(formattedJson, "formatted.json")}
                    variant="outline"
                    size="sm"
                    className="hover-lift"
                    disabled={!formattedJson}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
              
              <Textarea
                value={formattedJson}
                readOnly
                className="min-h-[300px] font-mono text-sm bg-muted/50 input-enhanced"
                placeholder="Formatted JSON will appear here..."
              />
            </CardContent>
          </Card>
        </div>

        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle>JSON Statistics</CardTitle>
            <CardDescription>
              Information about your JSON data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {inputJson ? inputJson.length : 0}
                </div>
                <div className="text-sm text-muted-foreground">Characters</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {inputJson ? inputJson.split('\n').length : 0}
                </div>
                <div className="text-sm text-muted-foreground">Lines</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {isValid === true ? "Valid" : isValid === false ? "Invalid" : "Unknown"}
                </div>
                <div className="text-sm text-muted-foreground">Status</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {formattedJson ? formattedJson.length : 0}
                </div>
                <div className="text-sm text-muted-foreground">Formatted Size</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 