"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Button } from "@/src/app/components/ui/button";
import { Textarea } from "@/src/app/components/ui/textarea";
import { Alert, AlertDescription } from "@/src/app/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/app/components/ui/select";
import { Copy, Download, RotateCcw, CheckCircle, XCircle, AlertTriangle, FileSpreadsheet, FileCode } from "lucide-react";

export default function CSVToJSONPage() {
  const [inputCSV, setInputCSV] = useState("");
  const [outputJSON, setOutputJSON] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [outputFormat, setOutputFormat] = useState<"array" | "object">("array");
  const [includeHeaders, setIncludeHeaders] = useState(true);

  const convertCSVToJSON = () => {
    if (!inputCSV.trim()) {
      setErrorMessage("Please enter some CSV data to convert");
      setIsValid(false);
      return;
    }

    try {
      const lines = inputCSV.trim().split('\n');
      if (lines.length === 0) {
        throw new Error("No data found in CSV");
      }

      // Parse CSV with proper handling of quoted fields
      const parseCSVLine = (line: string): string[] => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          
          if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
              // Escaped quote
              current += '"';
              i++;
            } else {
              // Toggle quote state
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        
        result.push(current.trim());
        return result;
      };

      const headers = parseCSVLine(lines[0]);
      const data = lines.slice(1).map(line => parseCSVLine(line));

      let jsonResult: any;

      if (outputFormat === "array") {
        if (includeHeaders) {
          jsonResult = data.map(row => {
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header] = row[index] || '';
            });
            return obj;
          });
        } else {
          jsonResult = data;
        }
      } else {
        // Object format with headers as keys
        jsonResult = {};
        headers.forEach((header, index) => {
          jsonResult[header] = data.map(row => row[index] || '');
        });
      }

      setOutputJSON(JSON.stringify(jsonResult, null, 2));
      setIsValid(true);
      setErrorMessage("");
    } catch (error) {
      setIsValid(false);
      setErrorMessage(error instanceof Error ? error.message : "Invalid CSV format");
      setOutputJSON("");
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
    setInputCSV("");
    setOutputJSON("");
    setIsValid(null);
    setErrorMessage("");
  };

  const loadSampleCSV = () => {
    const sample = `Name,Age,City,Email
John Doe,30,New York,john@example.com
Jane Smith,25,Los Angeles,jane@example.com
Bob Johnson,35,Chicago,bob@example.com
Alice Brown,28,Boston,alice@example.com`;
    setInputCSV(sample);
  };

  const convertJSONToCSV = () => {
    if (!outputJSON.trim()) {
      setErrorMessage("Please convert some CSV data first");
      return;
    }

    try {
      const data = JSON.parse(outputJSON);
      let csv = '';

      if (Array.isArray(data) && data.length > 0) {
        // Array of objects
        const headers = Object.keys(data[0]);
        csv += headers.join(',') + '\n';
        
        data.forEach(row => {
          const values = headers.map(header => {
            const value = row[header];
            // Escape quotes and wrap in quotes if contains comma or quote
            const escaped = String(value).replace(/"/g, '""');
            return escaped.includes(',') || escaped.includes('"') ? `"${escaped}"` : escaped;
          });
          csv += values.join(',') + '\n';
        });
      } else if (typeof data === 'object') {
        // Object with arrays
        const keys = Object.keys(data);
        const maxLength = Math.max(...keys.map(key => Array.isArray(data[key]) ? data[key].length : 1));
        
        csv += keys.join(',') + '\n';
        
        for (let i = 0; i < maxLength; i++) {
          const values = keys.map(key => {
            const value = Array.isArray(data[key]) ? data[key][i] || '' : data[key];
            const escaped = String(value).replace(/"/g, '""');
            return escaped.includes(',') || escaped.includes('"') ? `"${escaped}"` : escaped;
          });
          csv += values.join(',') + '\n';
        }
      }

      setInputCSV(csv.trim());
      setOutputJSON("");
      setIsValid(null);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage("Invalid JSON format for conversion back to CSV");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 animate-slide-in-left">CSV to JSON Converter</h1>
          <p className="text-muted-foreground text-lg animate-slide-in-right">
            Convert CSV data to JSON format and vice versa with customizable options
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                <span>Input CSV</span>
                {isValid === true && <CheckCircle className="h-5 w-5 text-green-500" />}
                {isValid === false && <XCircle className="h-5 w-5 text-red-500" />}
              </CardTitle>
              <CardDescription>
                Paste your CSV data here to convert to JSON
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste your CSV data here..."
                value={inputCSV}
                onChange={(e) => setInputCSV(e.target.value)}
                className="min-h-[300px] font-mono text-sm input-enhanced"
              />
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={convertCSVToJSON} 
                  className="btn-enhanced hover-lift"
                  disabled={!inputCSV.trim()}
                >
                  Convert to JSON
                </Button>
                <Button 
                  onClick={loadSampleCSV} 
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
                <FileCode className="h-5 w-5" />
                <span>Output JSON</span>
              </CardTitle>
              <CardDescription>
                Your converted JSON will appear here
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Format:</span>
                    <Select value={outputFormat} onValueChange={(value: "array" | "object") => setOutputFormat(value)}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="array">Array</SelectItem>
                        <SelectItem value="object">Object</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {outputFormat === "array" && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Headers:</span>
                      <Select value={includeHeaders.toString()} onValueChange={(value) => setIncludeHeaders(value === "true")}>
                        <SelectTrigger className="w-[80px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Include</SelectItem>
                          <SelectItem value="false">Exclude</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => copyToClipboard(outputJSON)}
                    variant="outline"
                    size="sm"
                    className="hover-lift"
                    disabled={!outputJSON}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    onClick={() => downloadJSON(outputJSON, "converted.json")}
                    variant="outline"
                    size="sm"
                    className="hover-lift"
                    disabled={!outputJSON}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
              
              <Textarea
                value={outputJSON}
                readOnly
                className="min-h-[300px] font-mono text-sm bg-muted/50 input-enhanced"
                placeholder="Converted JSON will appear here..."
              />

              {outputJSON && (
                <Button
                  onClick={convertJSONToCSV}
                  variant="outline"
                  className="w-full hover-lift"
                >
                  Convert Back to CSV
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle>Conversion Options</CardTitle>
            <CardDescription>
              Customize how your CSV is converted to JSON
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold">Array Format</h3>
                <p className="text-sm text-muted-foreground">
                  Converts CSV to an array of objects. Each row becomes an object with column headers as keys.
                </p>
                <pre className="text-xs bg-muted p-2 rounded">
{`[
  {"Name": "John", "Age": "30"},
  {"Name": "Jane", "Age": "25"}
]`}
                </pre>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Object Format</h3>
                <p className="text-sm text-muted-foreground">
                  Converts CSV to an object where each column header becomes a key with an array of values.
                </p>
                <pre className="text-xs bg-muted p-2 rounded">
{`{
  "Name": ["John", "Jane"],
  "Age": ["30", "25"]
}`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 