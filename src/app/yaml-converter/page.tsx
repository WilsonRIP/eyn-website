"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Button } from "@/src/app/components/ui/button";
import { Textarea } from "@/src/app/components/ui/textarea";
import { Alert, AlertDescription } from "@/src/app/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/app/components/ui/select";
import { Copy, Download, RotateCcw, CheckCircle, XCircle, AlertTriangle, FileCode, FileText } from "lucide-react";

export default function YAMLConverterPage() {
  const [inputData, setInputData] = useState("");
  const [outputData, setOutputData] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [conversionMode, setConversionMode] = useState<"yaml-to-json" | "json-to-yaml">("yaml-to-json");
  const [indentSize, setIndentSize] = useState(2);

  const convertData = () => {
    if (!inputData.trim()) {
      setErrorMessage(`Please enter some ${conversionMode === "yaml-to-json" ? "YAML" : "JSON"} data to convert`);
      setIsValid(false);
      return;
    }

    try {
      if (conversionMode === "yaml-to-json") {
        const jsonResult = yamlToJson(inputData);
        setOutputData(JSON.stringify(jsonResult, null, indentSize));
      } else {
        const yamlResult = jsonToYaml(JSON.parse(inputData), indentSize);
        setOutputData(yamlResult);
      }
      
      setIsValid(true);
      setErrorMessage("");
    } catch (error) {
      setIsValid(false);
      setErrorMessage(error instanceof Error ? error.message : `Invalid ${conversionMode === "yaml-to-json" ? "YAML" : "JSON"} format`);
      setOutputData("");
    }
  };

  const yamlToJson = (yaml: string): any => {
    const lines = yaml.split('\n');
    const result: any = {};
    const stack: Array<{ obj: any; indent: number }> = [];
    let currentIndent = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('#')) continue;

      const indent = lines[i].length - lines[i].trimStart().length;
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();

      // Remove quotes from key if present
      const cleanKey = key.replace(/^["']|["']$/g, '');

      // Pop stack until we find the right level
      while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
        stack.pop();
      }

      let currentObj: any;
      if (stack.length === 0) {
        currentObj = result;
      } else {
        currentObj = stack[stack.length - 1].obj;
      }

      if (value === '') {
        // This is likely an object
        const newObj: any = {};
        currentObj[cleanKey] = newObj;
        stack.push({ obj: newObj, indent });
      } else if (value.startsWith('[') && value.endsWith(']')) {
        // Array
        try {
          currentObj[cleanKey] = JSON.parse(value);
        } catch {
          // Simple array parsing
          const arrayContent = value.slice(1, -1);
          currentObj[cleanKey] = arrayContent.split(',').map(item => item.trim().replace(/^["']|["']$/g, ''));
        }
      } else if (value.startsWith('{') && value.endsWith('}')) {
        // Object
        try {
          currentObj[cleanKey] = JSON.parse(value);
        } catch {
          currentObj[cleanKey] = {};
        }
      } else if (value === 'true' || value === 'false') {
        currentObj[cleanKey] = value === 'true';
      } else if (!isNaN(Number(value))) {
        currentObj[cleanKey] = Number(value);
      } else {
        // String - remove quotes if present
        currentObj[cleanKey] = value.replace(/^["']|["']$/g, '');
      }
    }

    return result;
  };

  const jsonToYaml = (obj: any, indent: number = 2): string => {
    const convertValue = (value: any, currentIndent: number): string => {
      if (value === null) return 'null';
      if (typeof value === 'boolean') return value.toString();
      if (typeof value === 'number') return value.toString();
      if (typeof value === 'string') return value;
      
      if (Array.isArray(value)) {
        if (value.length === 0) return '[]';
        return value.map(item => 
          ' '.repeat(currentIndent) + '- ' + convertValue(item, currentIndent + indent)
        ).join('\n');
      }
      
      if (typeof value === 'object') {
        if (Object.keys(value).length === 0) return '{}';
        return Object.entries(value).map(([key, val]) => 
          ' '.repeat(currentIndent) + key + ': ' + convertValue(val, currentIndent + indent)
        ).join('\n');
      }
      
      return String(value);
    };

    return convertValue(obj, 0);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { 
      type: filename.endsWith('.json') ? "application/json" : "text/yaml" 
    });
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
    setInputData("");
    setOutputData("");
    setIsValid(null);
    setErrorMessage("");
  };

  const loadSampleData = () => {
    if (conversionMode === "yaml-to-json") {
      const sample = `# Sample YAML configuration
name: John Doe
age: 30
email: john@example.com
active: true
address:
  street: 123 Main St
  city: Anytown
  country: USA
hobbies:
  - reading
  - gaming
  - coding
settings:
  theme: dark
  notifications: true
  language: en`;
      setInputData(sample);
    } else {
      const sample = `{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "active": true,
  "address": {
    "street": "123 Main St",
    "city": "Anytown",
    "country": "USA"
  },
  "hobbies": ["reading", "gaming", "coding"],
  "settings": {
    "theme": "dark",
    "notifications": true,
    "language": "en"
  }
}`;
      setInputData(sample);
    }
  };

  const swapConversion = () => {
    setConversionMode(conversionMode === "yaml-to-json" ? "json-to-yaml" : "yaml-to-json");
    setInputData(outputData);
    setOutputData("");
    setIsValid(null);
    setErrorMessage("");
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 animate-slide-in-left">YAML ↔ JSON Converter</h1>
          <p className="text-muted-foreground text-lg animate-slide-in-right">
            Convert between YAML and JSON formats with customizable indentation
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {conversionMode === "yaml-to-json" ? (
                  <FileText className="h-5 w-5" />
                ) : (
                  <FileCode className="h-5 w-5" />
                )}
                <span>Input {conversionMode === "yaml-to-json" ? "YAML" : "JSON"}</span>
                {isValid === true && <CheckCircle className="h-5 w-5 text-green-500" />}
                {isValid === false && <XCircle className="h-5 w-5 text-red-500" />}
              </CardTitle>
              <CardDescription>
                Paste your {conversionMode === "yaml-to-json" ? "YAML" : "JSON"} data here to convert
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder={`Paste your ${conversionMode === "yaml-to-json" ? "YAML" : "JSON"} here...`}
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
                className="min-h-[300px] font-mono text-sm input-enhanced"
              />
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={convertData} 
                  className="btn-enhanced hover-lift"
                  disabled={!inputData.trim()}
                >
                  Convert to {conversionMode === "yaml-to-json" ? "JSON" : "YAML"}
                </Button>
                <Button 
                  onClick={loadSampleData} 
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
                {conversionMode === "yaml-to-json" ? (
                  <FileCode className="h-5 w-5" />
                ) : (
                  <FileText className="h-5 w-5" />
                )}
                <span>Output {conversionMode === "yaml-to-json" ? "JSON" : "YAML"}</span>
              </CardTitle>
              <CardDescription>
                Your converted {conversionMode === "yaml-to-json" ? "JSON" : "YAML"} will appear here
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Mode:</span>
                    <Select value={conversionMode} onValueChange={(value: "yaml-to-json" | "json-to-yaml") => setConversionMode(value)}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yaml-to-json">YAML → JSON</SelectItem>
                        <SelectItem value="json-to-yaml">JSON → YAML</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {conversionMode === "json-to-yaml" && (
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
                    onClick={() => copyToClipboard(outputData)}
                    variant="outline"
                    size="sm"
                    className="hover-lift"
                    disabled={!outputData}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    onClick={() => downloadFile(outputData, `converted.${conversionMode === "yaml-to-json" ? "json" : "yaml"}`)}
                    variant="outline"
                    size="sm"
                    className="hover-lift"
                    disabled={!outputData}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
              
              <Textarea
                value={outputData}
                readOnly
                className="min-h-[300px] font-mono text-sm bg-muted/50 input-enhanced"
                placeholder={`Converted ${conversionMode === "yaml-to-json" ? "JSON" : "YAML"} will appear here...`}
              />

              {outputData && (
                <Button
                  onClick={swapConversion}
                  variant="outline"
                  className="w-full hover-lift"
                >
                  Swap Conversion Direction
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle>Format Information</CardTitle>
            <CardDescription>
              Learn about YAML and JSON formats
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold">YAML (YAML Ain't Markup Language)</h3>
                <p className="text-sm text-muted-foreground">
                  A human-readable data serialization format that uses indentation to represent structure.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Uses indentation for structure</li>
                  <li>• Supports comments with #</li>
                  <li>• More readable than JSON</li>
                  <li>• Commonly used for configuration files</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">JSON (JavaScript Object Notation)</h3>
                <p className="text-sm text-muted-foreground">
                  A lightweight data interchange format that's easy for machines to parse and generate.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Uses braces and brackets for structure</li>
                  <li>• No comments support</li>
                  <li>• More compact than YAML</li>
                  <li>• Standard for web APIs</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 