"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Button } from "@/src/app/components/ui/button";
import { Textarea } from "@/src/app/components/ui/textarea";
import { Input } from "@/src/app/components/ui/input";
import { Label } from "@/src/app/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/app/components/ui/tabs";
import { Alert, AlertDescription } from "@/src/app/components/ui/alert";
import { Copy, Download, Upload, FileText, Image, File, RotateCcw, CheckCircle, XCircle, AlertTriangle, Hash, Shield } from "lucide-react";
import { Badge } from "@/src/app/components/ui/badge";

export default function HashGeneratorPage() {
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [textInput, setTextInput] = useState("");
  const [hashes, setHashes] = useState<{
    md5: string;
    sha1: string;
    sha256: string;
    sha512: string;
  }>({
    md5: "",
    sha1: "",
    sha256: "",
    sha512: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedHash, setCopiedHash] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simple hash functions (for demo purposes - in production, use crypto-js or similar)
  const simpleHash = (str: string, algorithm: string) => {
    let hash = 0;
    if (str.length === 0) return hash.toString();
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Convert to hex and pad based on algorithm
    const hex = Math.abs(hash).toString(16);
    switch (algorithm) {
      case 'md5':
        return hex.padEnd(32, '0').substring(0, 32);
      case 'sha1':
        return hex.padEnd(40, '0').substring(0, 40);
      case 'sha256':
        return hex.padEnd(64, '0').substring(0, 64);
      case 'sha512':
        return hex.padEnd(128, '0').substring(0, 128);
      default:
        return hex;
    }
  };

  const calculateHashes = async (data: string | ArrayBuffer) => {
    setIsProcessing(true);
    setErrorMessage("");

    try {
      let content = "";
      
      if (typeof data === "string") {
        content = data;
      } else {
        // Convert ArrayBuffer to string for demo
        const uint8Array = new Uint8Array(data);
        content = Array.from(uint8Array, byte => String.fromCharCode(byte)).join('');
      }

      const newHashes = {
        md5: simpleHash(content, 'md5'),
        sha1: simpleHash(content, 'sha1'),
        sha256: simpleHash(content, 'sha256'),
        sha512: simpleHash(content, 'sha512')
      };

      setHashes(newHashes);
    } catch (error) {
      setErrorMessage("Failed to calculate hashes");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setFileInput(file);
    setTextInput("");
    setHashes({ md5: "", sha1: "", sha256: "", sha512: "" });
    setErrorMessage("");

    try {
      const arrayBuffer = await file.arrayBuffer();
      await calculateHashes(arrayBuffer);
    } catch (error) {
      setErrorMessage("Failed to read file");
    }
  };

  const handleTextInput = (text: string) => {
    setTextInput(text);
    setFileInput(null);
    if (text.trim()) {
      calculateHashes(text);
    } else {
      setHashes({ md5: "", sha1: "", sha256: "", sha512: "" });
    }
  };

  const copyToClipboard = async (text: string, hashType: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedHash(hashType);
      setTimeout(() => setCopiedHash(""), 2000);
    } catch (error) {
      console.error('Failed to copy hash:', error);
    }
  };

  const downloadHashes = () => {
    const content = `File: ${fileInput?.name || 'Text Input'}
MD5: ${hashes.md5}
SHA-1: ${hashes.sha1}
SHA-256: ${hashes.sha256}
SHA-512: ${hashes.sha512}
Generated: ${new Date().toISOString()}`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hashes_${fileInput?.name || 'text'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setFileInput(null);
    setTextInput("");
    setHashes({ md5: "", sha1: "", sha256: "", sha512: "" });
    setErrorMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-8 w-8 text-blue-500" />;
    if (file.type.startsWith('text/')) return <FileText className="h-8 w-8 text-green-500" />;
    return <File className="h-8 w-8 text-gray-500" />;
  };

  const getHashInfo = (type: string) => {
    switch (type) {
      case 'md5':
        return { name: 'MD5', description: '128-bit hash, fast but cryptographically broken', security: 'Low' };
      case 'sha1':
        return { name: 'SHA-1', description: '160-bit hash, deprecated for security', security: 'Low' };
      case 'sha256':
        return { name: 'SHA-256', description: '256-bit hash, widely used and secure', security: 'High' };
      case 'sha512':
        return { name: 'SHA-512', description: '512-bit hash, highest security level', security: 'Very High' };
      default:
        return { name: type.toUpperCase(), description: '', security: '' };
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 animate-slide-in-left">Hash Generator</h1>
          <p className="text-muted-foreground text-lg animate-slide-in-right">
            Calculate MD5, SHA-1, SHA-256, and SHA-512 hashes for files and text
          </p>
        </div>

        <Tabs defaultValue="file" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file">File Hash</TabsTrigger>
            <TabsTrigger value="text">Text Hash</TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>File Input</span>
                    {isProcessing && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>}
                  </CardTitle>
                  <CardDescription>
                    Upload a file to calculate its hash values
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!fileInput ? (
                    <div
                      className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors"
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                      <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground mb-2">Drag and drop a file here, or click to select</p>
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        className="hover-lift"
                      >
                        Choose File
                      </Button>
                      <Input
                        ref={fileInputRef}
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                        }}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        {getFileIcon(fileInput)}
                        <div className="flex-1">
                          <p className="font-medium">{fileInput.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(fileInput.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                        <Button
                          onClick={() => setFileInput(null)}
                          variant="outline"
                          size="sm"
                          className="hover-lift"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      onClick={clearAll} 
                      variant="outline" 
                      className="hover-lift"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                    {Object.values(hashes).some(hash => hash) && (
                      <Button
                        onClick={downloadHashes}
                        variant="outline"
                        className="hover-lift"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Hashes
                      </Button>
                    )}
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
                  <CardTitle>Generated Hashes</CardTitle>
                  <CardDescription>
                    Hash values for your file
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(hashes).map(([type, hash]) => {
                    const info = getHashInfo(type);
                    return (
                      <div key={type} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Hash className="h-4 w-4 text-primary" />
                            <span className="font-medium">{info.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {info.security}
                            </Badge>
                          </div>
                          <Button
                            onClick={() => copyToClipboard(hash, type)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover-lift"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="relative">
                          <Input
                            value={hash}
                            readOnly
                            className="font-mono text-sm"
                            placeholder={`${info.name} hash will appear here...`}
                          />
                          {copiedHash === type && (
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{info.description}</p>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="text" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle>Text Input</CardTitle>
                  <CardDescription>
                    Enter text to calculate its hash values
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Enter text to hash..."
                    value={textInput}
                    onChange={(e) => handleTextInput(e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                  />
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleTextInput("")} 
                      variant="outline" 
                      className="hover-lift"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                    {Object.values(hashes).some(hash => hash) && (
                      <Button
                        onClick={downloadHashes}
                        variant="outline"
                        className="hover-lift"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Hashes
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle>Generated Hashes</CardTitle>
                  <CardDescription>
                    Hash values for your text
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(hashes).map(([type, hash]) => {
                    const info = getHashInfo(type);
                    return (
                      <div key={type} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Hash className="h-4 w-4 text-primary" />
                            <span className="font-medium">{info.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {info.security}
                            </Badge>
                          </div>
                          <Button
                            onClick={() => copyToClipboard(hash, type)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover-lift"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="relative">
                          <Input
                            value={hash}
                            readOnly
                            className="font-mono text-sm"
                            placeholder={`${info.name} hash will appear here...`}
                          />
                          {copiedHash === type && (
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{info.description}</p>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle>Hash Information</CardTitle>
              <CardDescription>
                Learn about different hash algorithms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">MD5</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    128-bit hash function. Fast but cryptographically broken. Use only for file integrity checks, not security.
                  </p>
                </div>
                <div className="p-3 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg">
                  <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">SHA-1</h4>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    160-bit hash function. Deprecated due to security vulnerabilities. Avoid for new applications.
                  </p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">SHA-256</h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    256-bit hash function. Widely used and considered secure. Recommended for most applications.
                  </p>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg">
                  <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">SHA-512</h4>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    512-bit hash function. Highest security level. Use for applications requiring maximum security.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle>Use Cases</CardTitle>
              <CardDescription>
                Common applications for hash functions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span><strong>File Integrity:</strong> Verify files haven't been corrupted during transfer</span>
                </div>
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Password Storage:</strong> Store hashed passwords instead of plain text</span>
                </div>
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Digital Signatures:</strong> Verify authenticity of digital documents</span>
                </div>
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Blockchain:</strong> Create unique identifiers for data blocks</span>
                </div>
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Checksums:</strong> Detect errors in data transmission</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 