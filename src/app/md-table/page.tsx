"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Button } from "@/src/app/components/ui/button";
import { Textarea } from "@/src/app/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/app/components/ui/select";
import { Input } from "@/src/app/components/ui/input";
import { Alert, AlertDescription } from "@/src/app/components/ui/alert";
import { Table, FileText, Download, RotateCcw, CheckCircle, AlertTriangle, Upload, Settings } from "lucide-react";
import { Checkbox } from "@/src/app/components/ui/checkbox";
import { Label } from "@/src/app/components/ui/label";
import { CopyButton } from "@/src/app/components/ui/copy-button";

export default function MarkdownTableGeneratorPage() {
  const [inputData, setInputData] = useState("");
  const [outputTable, setOutputTable] = useState("");
  const [inputFormat, setInputFormat] = useState<"csv" | "json">("csv");
  const [tableStyle, setTableStyle] = useState<"standard" | "compact" | "grid">("standard");
  const [includeHeader, setIncludeHeader] = useState(true);
  const [alignment, setAlignment] = useState<"left" | "center" | "right">("left");
  const [error, setError] = useState("");
  
  // Additional table options
  const [tableOptions, setTableOptions] = useState({
    escapePipes: true,
    trimWhitespace: true,
    autoAlign: false,
    addRowNumbers: false,
    includeFooter: false,
    boldHeader: true,
    escapeSpecialChars: true,
    preserveEmptyCells: false
  });

  const sampleCSV = `Name,Age,City,Email
John Doe,30,New York,john@example.com
Jane Smith,25,Los Angeles,jane@example.com
Bob Johnson,35,Chicago,bob@example.com
Alice Brown,28,Boston,alice@example.com`;

  const sampleJSON = `[
  {"Name": "John Doe", "Age": 30, "City": "New York", "Email": "john@example.com"},
  {"Name": "Jane Smith", "Age": 25, "City": "Los Angeles", "Email": "jane@example.com"},
  {"Name": "Bob Johnson", "Age": 35, "City": "Chicago", "Email": "bob@example.com"},
  {"Name": "Alice Brown", "Age": 28, "City": "Boston", "Email": "alice@example.com"}
]`;

  const parseCSV = (csv: string): { headers: string[], rows: string[][] } => {
    const lines = csv.trim().split('\n');
    if (lines.length === 0) throw new Error("No data found");

    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1).map(line => 
      line.split(',').map(cell => cell.trim())
    );

    return { headers, rows };
  };

  const parseJSON = (json: string): { headers: string[], rows: string[][] } => {
    try {
      const data = JSON.parse(json);
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("JSON must be an array of objects");
      }

      const headers = Object.keys(data[0]);
      const rows = data.map(obj => headers.map(header => String(obj[header] || '')));

      return { headers, rows };
    } catch (error) {
      throw new Error("Invalid JSON format");
    }
  };

  const generateMarkdownTable = () => {
    if (!inputData.trim()) {
      setError("Please enter some data to convert");
      return;
    }

    try {
      setError("");
      
      let headers: string[];
      let rows: string[][];

      if (inputFormat === "csv") {
        const parsed = parseCSV(inputData);
        headers = parsed.headers;
        rows = parsed.rows;
      } else {
        const parsed = parseJSON(inputData);
        headers = parsed.headers;
        rows = parsed.rows;
      }

      if (headers.length === 0) {
        throw new Error("No headers found in data");
      }

      let markdown = "";

      // Generate table based on style
      if (tableStyle === "standard") {
        // Standard markdown table
        if (includeHeader) {
          markdown += "| " + headers.join(" | ") + " |\n";
          markdown += "| " + headers.map(() => getAlignmentSeparator(alignment)).join(" | ") + " |\n";
        }
        
        rows.forEach(row => {
          // Pad row to match header length
          const paddedRow = [...row];
          while (paddedRow.length < headers.length) {
            paddedRow.push("");
          }
          markdown += "| " + paddedRow.join(" | ") + " |\n";
        });
      } else if (tableStyle === "compact") {
        // Compact table without separators
        if (includeHeader) {
          markdown += headers.join(" | ") + "\n";
          markdown += headers.map(() => getAlignmentSeparator(alignment)).join(" | ") + "\n";
        }
        
        rows.forEach(row => {
          const paddedRow = [...row];
          while (paddedRow.length < headers.length) {
            paddedRow.push("");
          }
          markdown += paddedRow.join(" | ") + "\n";
        });
      } else if (tableStyle === "grid") {
        // Grid-style table with borders
        const maxWidths = headers.map((header, index) => {
          const columnValues = [header, ...rows.map(row => row[index] || "")];
          return Math.max(...columnValues.map(v => v.length));
        });

        // Top border
        markdown += "+" + maxWidths.map(width => "-".repeat(width + 2)).join("+") + "+\n";
        
        // Header
        if (includeHeader) {
          markdown += "| " + headers.map((header, index) => 
            header.padEnd(maxWidths[index])
          ).join(" | ") + " |\n";
          markdown += "+" + maxWidths.map(width => "-".repeat(width + 2)).join("+") + "+\n";
        }
        
        // Rows
        rows.forEach(row => {
          const paddedRow = [...row];
          while (paddedRow.length < headers.length) {
            paddedRow.push("");
          }
          markdown += "| " + paddedRow.map((cell, index) => 
            cell.padEnd(maxWidths[index])
          ).join(" | ") + " |\n";
        });
        
        // Bottom border
        markdown += "+" + maxWidths.map(width => "-".repeat(width + 2)).join("+") + "+\n";
      }

      setOutputTable(markdown.trim());
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to generate table");
      setOutputTable("");
    }
  };

  const getAlignmentSeparator = (align: string): string => {
    switch (align) {
      case "left": return ":---";
      case "center": return ":---:";
      case "right": return "---:";
      default: return "---";
    }
  };

  const copyToClipboard = () => {
    if (outputTable) {
      navigator.clipboard.writeText(outputTable);
    }
  };

  const downloadTable = () => {
    if (outputTable) {
      const blob = new Blob([outputTable], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "table.md";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const loadSampleData = () => {
    if (inputFormat === "csv") {
      setInputData(sampleCSV);
    } else {
      setInputData(sampleJSON);
    }
    setError("");
    setOutputTable("");
  };

  const clearAll = () => {
    setInputData("");
    setOutputTable("");
    setError("");
  };

  const handleFormatChange = (format: "csv" | "json") => {
    setInputFormat(format);
    setInputData("");
    setOutputTable("");
    setError("");
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 animate-slide-in-left">Markdown Table Generator</h1>
          <p className="text-muted-foreground text-lg animate-slide-in-right">
            Build markdown tables from CSV/JSON data with customizable formatting
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                <span>Input Data</span>
                {inputData && <CheckCircle className="h-5 w-5 text-green-500" />}
              </CardTitle>
              <CardDescription>
                Paste your CSV or JSON data here
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Format:</span>
                  <Select value={inputFormat} onValueChange={handleFormatChange}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Style:</span>
                  <Select value={tableStyle} onValueChange={setTableStyle}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="grid">Grid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Alignment:</span>
                  <Select value={alignment} onValueChange={setAlignment}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="includeHeader"
                    checked={includeHeader}
                    onCheckedChange={(checked) => setIncludeHeader(checked as boolean)}
                  />
                  <Label htmlFor="includeHeader" className="text-sm font-medium">
                    Include Header
                  </Label>
                </div>
              </div>

              <Textarea
                placeholder={inputFormat === "csv" ? "Paste CSV data here..." : "Paste JSON data here..."}
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
                className="min-h-[300px] font-mono text-sm input-enhanced"
              />
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={generateMarkdownTable} 
                  className="btn-enhanced hover-lift"
                  disabled={!inputData.trim()}
                >
                  <Table className="h-4 w-4 mr-2" />
                  Generate Table
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
                <span>Markdown Table</span>
              </CardTitle>
              <CardDescription>
                Your generated markdown table will appear here
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <CopyButton
                  text={outputTable}
                  variant="outline"
                  className="hover-lift"
                  disabled={!outputTable}
                >
                  Copy
                </CopyButton>
                <Button
                  onClick={downloadTable}
                  variant="outline"
                  className="hover-lift"
                  disabled={!outputTable}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
              
              <Textarea
                value={outputTable}
                readOnly
                className="min-h-[300px] font-mono text-sm bg-muted/50 input-enhanced"
                placeholder="Generated markdown table will appear here..."
              />

              {outputTable && (
                <div className="space-y-2">
                  <h4 className="font-medium">Preview</h4>
                  <div className="bg-muted/30 rounded-lg p-4 text-sm">
                    <pre className="whitespace-pre-wrap">{outputTable}</pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Table Options Panel */}
        <Card className="card-enhanced mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Table Generation Options
            </CardTitle>
            <CardDescription>
              Customize how your markdown table is generated
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold">Formatting Options</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="escapePipes" 
                      checked={tableOptions.escapePipes}
                      onCheckedChange={(checked) => 
                        setTableOptions(prev => ({ ...prev, escapePipes: checked as boolean }))
                      }
                    />
                    <Label htmlFor="escapePipes">Escape pipe characters</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="trimWhitespace" 
                      checked={tableOptions.trimWhitespace}
                      onCheckedChange={(checked) => 
                        setTableOptions(prev => ({ ...prev, trimWhitespace: checked as boolean }))
                      }
                    />
                    <Label htmlFor="trimWhitespace">Trim whitespace</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="autoAlign" 
                      checked={tableOptions.autoAlign}
                      onCheckedChange={(checked) => 
                        setTableOptions(prev => ({ ...prev, autoAlign: checked as boolean }))
                      }
                    />
                    <Label htmlFor="autoAlign">Auto-align columns</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="escapeSpecialChars" 
                      checked={tableOptions.escapeSpecialChars}
                      onCheckedChange={(checked) => 
                        setTableOptions(prev => ({ ...prev, escapeSpecialChars: checked as boolean }))
                      }
                    />
                    <Label htmlFor="escapeSpecialChars">Escape special characters</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Table Structure</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="addRowNumbers" 
                      checked={tableOptions.addRowNumbers}
                      onCheckedChange={(checked) => 
                        setTableOptions(prev => ({ ...prev, addRowNumbers: checked as boolean }))
                      }
                    />
                    <Label htmlFor="addRowNumbers">Add row numbers</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="includeFooter" 
                      checked={tableOptions.includeFooter}
                      onCheckedChange={(checked) => 
                        setTableOptions(prev => ({ ...prev, includeFooter: checked as boolean }))
                      }
                    />
                    <Label htmlFor="includeFooter">Include footer row</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="boldHeader" 
                      checked={tableOptions.boldHeader}
                      onCheckedChange={(checked) => 
                        setTableOptions(prev => ({ ...prev, boldHeader: checked as boolean }))
                      }
                    />
                    <Label htmlFor="boldHeader">Bold header text</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="preserveEmptyCells" 
                      checked={tableOptions.preserveEmptyCells}
                      onCheckedChange={(checked) => 
                        setTableOptions(prev => ({ ...prev, preserveEmptyCells: checked as boolean }))
                      }
                    />
                    <Label htmlFor="preserveEmptyCells">Preserve empty cells</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Export Options</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="includeTableCaption" 
                      checked={false}
                      onCheckedChange={() => {}}
                    />
                    <Label htmlFor="includeTableCaption">Include table caption</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="addTableClass" 
                      checked={false}
                      onCheckedChange={() => {}}
                    />
                    <Label htmlFor="addTableClass">Add CSS classes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="generateHTML" 
                      checked={false}
                      onCheckedChange={() => {}}
                    />
                    <Label htmlFor="generateHTML">Generate HTML table</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="includeMetadata" 
                      checked={false}
                      onCheckedChange={() => {}}
                    />
                    <Label htmlFor="includeMetadata">Include metadata</Label>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle>Table Styles</CardTitle>
            <CardDescription>
              Different markdown table formats and their use cases
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold">Standard Table</h3>
                <p className="text-sm text-muted-foreground">
                  Traditional markdown table with pipe separators. Most compatible with markdown renderers.
                </p>
                <pre className="text-xs bg-muted p-2 rounded">
{`| Name | Age | City |
|------|-----|------|
| John | 30  | NYC  |
| Jane | 25  | LA   |`}
                </pre>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Compact Table</h3>
                <p className="text-sm text-muted-foreground">
                  Minimal formatting without pipe separators. Cleaner appearance in some contexts.
                </p>
                <pre className="text-xs bg-muted p-2 rounded">
{`Name | Age | City
-----|-----|-----
John | 30  | NYC
Jane | 25  | LA`}
                </pre>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Grid Table</h3>
                <p className="text-sm text-muted-foreground">
                  ASCII-style table with borders. Good for documentation and technical writing.
                </p>
                <pre className="text-xs bg-muted p-2 rounded">
{`+------+-----+------+
| Name | Age | City |
+------+-----+------+
| John | 30  | NYC  |
| Jane | 25  | LA   |
+------+-----+------+`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 