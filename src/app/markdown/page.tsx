"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Button } from "@/src/app/components/ui/button";
import { Textarea } from "@/src/app/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/app/components/ui/tabs";
import { Badge } from "@/src/app/components/ui/badge";
import { Download, RotateCcw, Eye, Edit, FileText, Settings } from "lucide-react";
import { Checkbox } from "@/src/app/components/ui/checkbox";
import { Label } from "@/src/app/components/ui/label";
import { CopyButton } from "@/src/app/components/ui/copy-button";

export default function MarkdownPage() {
  const [markdown, setMarkdown] = useState("");
  const [html, setHtml] = useState("");
  const [viewMode, setViewMode] = useState<"split" | "edit" | "preview">("split");
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [lineCount, setLineCount] = useState(0);
  
  // Settings state
  const [settings, setSettings] = useState({
    autoSave: false,
    syntaxHighlighting: true,
    lineNumbers: false,
    wordWrap: true,
    spellCheck: false,
    darkMode: false,
    includeCSS: true,
    includeMeta: true
  });

  // Sample markdown content
  const sampleMarkdown = `# Welcome to Markdown Previewer

## Features

This is a **real-time** markdown previewer with the following features:

- **Live Preview**: See your markdown rendered instantly
- **Syntax Highlighting**: Beautiful code formatting
- **Multiple Views**: Split, edit-only, or preview-only modes
- **Export Options**: Download as HTML or copy to clipboard

## Code Example

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));
\`\`\`

## Lists

### Unordered List
- Item 1
- Item 2
  - Nested item
  - Another nested item
- Item 3

### Ordered List
1. First step
2. Second step
3. Third step

## Links and Images

[Visit GitHub](https://github.com)

![Sample Image](https://via.placeholder.com/300x200)

## Tables

| Feature | Description | Status |
|---------|-------------|--------|
| Live Preview | Real-time rendering | ✅ |
| Export | Download functionality | ✅ |
| Syntax Highlighting | Code formatting | ✅ |

## Blockquotes

> This is a blockquote. It can contain multiple lines and is great for highlighting important information.

## Emphasis

*Italic text* and **bold text** and ***bold italic text***

## Task Lists

- [x] Create markdown previewer
- [x] Add real-time preview
- [x] Implement export features
- [ ] Add more themes
- [ ] Support for custom CSS

---

*Happy writing!* ✨`;

  useEffect(() => {
    // Simple markdown to HTML conversion
    const convertMarkdownToHtml = (md: string) => {
      let html = md;

      // Headers
      html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
      html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
      html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

      // Bold and italic
      html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
      html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

      // Code blocks
      html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>');
      html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

      // Links
      html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

      // Images
      html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded" />');

      // Lists
      html = html.replace(/^\s*[-*+]\s+(.+)$/gm, '<li>$1</li>');
      html = html.replace(/^\s*\d+\.\s+(.+)$/gm, '<li>$1</li>');

      // Wrap lists
      html = html.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');

      // Blockquotes
      html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');

      // Horizontal rules
      html = html.replace(/^---$/gm, '<hr />');

      // Task lists
      html = html.replace(/^\s*- \[([ x])\]\s+(.+)$/gm, '<li><input type="checkbox" $1 disabled /> $2</li>');

      // Tables (basic support)
      html = html.replace(/\|(.+)\|/g, (match, content) => {
        const cells = content.split('|').map((cell: string) => `<td>${cell.trim()}</td>`).join('');
        return `<tr>${cells}</tr>`;
      });

      // Paragraphs
      html = html.replace(/\n\n/g, '</p><p>');
      html = '<p>' + html + '</p>';

      // Clean up empty paragraphs
      html = html.replace(/<p><\/p>/g, '');
      html = html.replace(/<p>(<h[1-6]>.*<\/h[1-6]>)<\/p>/g, '$1');
      html = html.replace(/<p>(<ul>.*<\/ul>)<\/p>/g, '$1');
      html = html.replace(/<p>(<blockquote>.*<\/blockquote>)<\/p>/g, '$1');
      html = html.replace(/<p>(<hr \/>)<\/p>/g, '$1');

      return html;
    };

    setHtml(convertMarkdownToHtml(markdown));
  }, [markdown]);

  useEffect(() => {
    // Update statistics
    const words = markdown.trim() ? markdown.trim().split(/\s+/).length : 0;
    const chars = markdown.length;
    const lines = markdown ? markdown.split('\n').length : 0;

    setWordCount(words);
    setCharCount(chars);
    setLineCount(lines);
  }, [markdown]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
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
    setMarkdown("");
  };

  const loadSample = () => {
    setMarkdown(sampleMarkdown);
  };

  const downloadHTML = () => {
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown Preview</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; font-family: 'Courier New', monospace; }
        pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
        blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 15px; color: #666; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f4f4f4; }
        img { max-width: 100%; height: auto; }
    </style>
</head>
<body>
${html}
</body>
</html>`;
    downloadFile(fullHtml, "markdown-preview.html", "text/html");
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 animate-slide-in-left">Markdown Previewer</h1>
          <p className="text-muted-foreground text-lg animate-slide-in-right">
            Write markdown on the left, see the rendered preview on the right
          </p>
        </div>

        <div className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setViewMode("split")}
                variant={viewMode === "split" ? "default" : "outline"}
                size="sm"
                className="hover-lift"
              >
                <Eye className="h-4 w-4 mr-2" />
                Split View
              </Button>
              <Button
                onClick={() => setViewMode("edit")}
                variant={viewMode === "edit" ? "default" : "outline"}
                size="sm"
                className="hover-lift"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Only
              </Button>
              <Button
                onClick={() => setViewMode("preview")}
                variant={viewMode === "preview" ? "default" : "outline"}
                size="sm"
                className="hover-lift"
              >
                <FileText className="h-4 w-4 mr-2" />
                Preview Only
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary">{wordCount} words</Badge>
                <Badge variant="secondary">{charCount} chars</Badge>
                <Badge variant="secondary">{lineCount} lines</Badge>
              </div>
              <Button
                onClick={() => setViewMode(settings.darkMode ? "split" : "preview")}
                variant="outline"
                size="sm"
                className="hover-lift"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-6" style={{
          gridTemplateColumns: viewMode === "split" ? "1fr 1fr" : "1fr"
        }}>
          {(viewMode === "split" || viewMode === "edit") && (
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Markdown Editor</span>
                  <div className="flex gap-2">
                    <Button
                      onClick={loadSample}
                      variant="outline"
                      size="sm"
                      className="hover-lift"
                    >
                      Load Sample
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
                  Write your markdown content here
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  className="min-h-[600px] font-mono text-sm input-enhanced resize-none"
                  placeholder="Start writing your markdown here..."
                />
              </CardContent>
            </Card>
          )}

          {(viewMode === "split" || viewMode === "preview") && (
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Preview</span>
                  <div className="flex gap-2">
                    <CopyButton
                      text={html}
                      variant="outline"
                      size="sm"
                      className="hover-lift"
                    >
                      Copy HTML
                    </CopyButton>
                    <Button
                      onClick={downloadHTML}
                      variant="outline"
                      size="sm"
                      className="hover-lift"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download HTML
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  Live preview of your markdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  className="min-h-[600px] prose prose-sm max-w-none dark:prose-invert prose-headings:scroll-m-20 prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:leading-7 prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg prose-img:rounded-lg prose-table:border-collapse prose-th:border prose-th:p-2 prose-td:border prose-td:p-2"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Settings Panel */}
        <Card className="card-enhanced mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Editor Settings
            </CardTitle>
            <CardDescription>
              Customize your markdown editing experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold">Editor Options</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="autoSave" 
                      checked={settings.autoSave}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, autoSave: checked as boolean }))
                      }
                    />
                    <Label htmlFor="autoSave">Auto-save to localStorage</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="syntaxHighlighting" 
                      checked={settings.syntaxHighlighting}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, syntaxHighlighting: checked as boolean }))
                      }
                    />
                    <Label htmlFor="syntaxHighlighting">Syntax highlighting</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="lineNumbers" 
                      checked={settings.lineNumbers}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, lineNumbers: checked as boolean }))
                      }
                    />
                    <Label htmlFor="lineNumbers">Show line numbers</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="wordWrap" 
                      checked={settings.wordWrap}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, wordWrap: checked as boolean }))
                      }
                    />
                    <Label htmlFor="wordWrap">Word wrap</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Writing Tools</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="spellCheck" 
                      checked={settings.spellCheck}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, spellCheck: checked as boolean }))
                      }
                    />
                    <Label htmlFor="spellCheck">Spell check</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="darkMode" 
                      checked={settings.darkMode}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, darkMode: checked as boolean }))
                      }
                    />
                    <Label htmlFor="darkMode">Dark mode preview</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Export Options</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="includeCSS" 
                      checked={settings.includeCSS}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, includeCSS: checked as boolean }))
                      }
                    />
                    <Label htmlFor="includeCSS">Include CSS styles</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="includeMeta" 
                      checked={settings.includeMeta}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, includeMeta: checked as boolean }))
                      }
                    />
                    <Label htmlFor="includeMeta">Include meta tags</Label>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-enhanced mt-6">
          <CardHeader>
            <CardTitle>Markdown Cheat Sheet</CardTitle>
            <CardDescription>
              Quick reference for markdown syntax
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold">Headers</h4>
                <div className="text-sm space-y-1">
                  <code># H1</code><br />
                  <code>## H2</code><br />
                  <code>### H3</code>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold">Text Formatting</h4>
                <div className="text-sm space-y-1">
                  <code>**bold**</code><br />
                  <code>*italic*</code><br />
                  <code>`code`</code>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold">Lists</h4>
                <div className="text-sm space-y-1">
                  <code>- item</code><br />
                  <code>1. item</code><br />
                  <code>- [ ] task</code>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold">Links & Images</h4>
                <div className="text-sm space-y-1">
                  <code>[text](url)</code><br />
                  <code>![alt](url)</code>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold">Code Blocks</h4>
                <div className="text-sm space-y-1">
                  <code>```language</code><br />
                  <code>code here</code><br />
                  <code>```</code>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold">Other</h4>
                <div className="text-sm space-y-1">
                  <code>&gt; quote</code><br />
                  <code>---</code> (horizontal rule)<br />
                  <code>| table |</code>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 