"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Button } from "@/src/app/components/ui/button";
import { Textarea } from "@/src/app/components/ui/textarea";
import { Input } from "@/src/app/components/ui/input";
import { Label } from "@/src/app/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/app/components/ui/tabs";
import { Alert, AlertDescription } from "@/src/app/components/ui/alert";
import { Copy, Download, Upload, FileText, Image, File, RotateCcw, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export default function Base64Page() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [fileOutput, setFileOutput] = useState<string>("");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const encodeText = () => {
    if (!inputText.trim()) {
      setErrorMessage("Please enter some text to encode");
      setIsValid(false);
      return;
    }

    try {
      const encoded = btoa(inputText);
      setOutputText(encoded);
      setIsValid(true);
      setErrorMessage("");
    } catch (error) {
      setIsValid(false);
      setErrorMessage("Failed to encode text");
    }
  };

  const decodeText = () => {
    if (!inputText.trim()) {
      setErrorMessage("Please enter some Base64 text to decode");
      setIsValid(false);
      return;
    }

    try {
      const decoded = atob(inputText);
      setOutputText(decoded);
      setIsValid(true);
      setErrorMessage("");
    } catch (error) {
      setIsValid(false);
      setErrorMessage("Invalid Base64 string");
    }
  };

  const handleFileUpload = (file: File) => {
    setFileInput(file);
    setFileOutput("");
    setIsValid(null);
    setErrorMessage("");
  };

  const encodeFile = async () => {
    if (!fileInput) {
      setErrorMessage("Please select a file to encode");
      setIsValid(false);
      return;
    }

    setIsProcessing(true);
    try {
      const arrayBuffer = await fileInput.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const binaryString = Array.from(uint8Array, byte => String.fromCharCode(byte)).join('');
      const encoded = btoa(binaryString);
      setFileOutput(encoded);
      setIsValid(true);
      setErrorMessage("");
    } catch (error) {
      setIsValid(false);
      setErrorMessage("Failed to encode file");
    } finally {
      setIsProcessing(false);
    }
  };

  const decodeFile = async () => {
    if (!inputText.trim()) {
      setErrorMessage("Please enter Base64 data to decode");
      setIsValid(false);
      return;
    }

    setIsProcessing(true);
    try {
      const binaryString = atob(inputText);
      const uint8Array = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([uint8Array]);
      const url = URL.createObjectURL(blob);
      setFileOutput(url);
      setIsValid(true);
      setErrorMessage("");
    } catch (error) {
      setIsValid(false);
      setErrorMessage("Invalid Base64 data");
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadDecodedFile = () => {
    if (!fileOutput || !fileInput) return;
    
    const a = document.createElement("a");
    a.href = fileOutput;
    a.download = `decoded_${fileInput.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const clearAll = () => {
    setInputText("");
    setOutputText("");
    setFileInput(null);
    setFileOutput("");
    setIsValid(null);
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

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 animate-slide-in-left">Base64 Encoder / Decoder</h1>
          <p className="text-muted-foreground text-lg animate-slide-in-right">
            Encode text and files to Base64 or decode Base64 back to original format
          </p>
        </div>

        <Tabs defaultValue="text" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text">Text Encoding</TabsTrigger>
            <TabsTrigger value="file">File Encoding</TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>Input Text</span>
                    {isValid === true && <CheckCircle className="h-5 w-5 text-green-500" />}
                    {isValid === false && <XCircle className="h-5 w-5 text-red-500" />}
                  </CardTitle>
                  <CardDescription>
                    Enter text to encode or Base64 to decode
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder={mode === "encode" ? "Enter text to encode to Base64..." : "Enter Base64 to decode..."}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="min-h-[200px] font-mono text-sm input-enhanced"
                  />
                  
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      onClick={mode === "encode" ? encodeText : decodeText} 
                      className="btn-enhanced hover-lift"
                      disabled={!inputText.trim()}
                    >
                      {mode === "encode" ? "Encode to Base64" : "Decode from Base64"}
                    </Button>
                    <Button 
                      onClick={() => setMode(mode === "encode" ? "decode" : "encode")} 
                      variant="outline" 
                      className="hover-lift"
                    >
                      Switch Mode
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
                  <CardTitle>Output</CardTitle>
                  <CardDescription>
                    {mode === "encode" ? "Base64 encoded text" : "Decoded text"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={outputText}
                    readOnly
                    className="min-h-[200px] font-mono text-sm bg-muted/50 input-enhanced"
                    placeholder={mode === "encode" ? "Base64 output will appear here..." : "Decoded text will appear here..."}
                  />
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => copyToClipboard(outputText)}
                      variant="outline"
                      className="hover-lift"
                      disabled={!outputText}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      onClick={() => downloadFile(outputText, mode === "encode" ? "encoded.txt" : "decoded.txt")}
                      variant="outline"
                      className="hover-lift"
                      disabled={!outputText}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="file" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>File Input</span>
                    {isValid === true && <CheckCircle className="h-5 w-5 text-green-500" />}
                    {isValid === false && <XCircle className="h-5 w-5 text-red-500" />}
                  </CardTitle>
                  <CardDescription>
                    Upload a file to encode or paste Base64 to decode
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

                  <div className="flex flex-wrap gap-2">
                    <Button 
                      onClick={encodeFile} 
                      className="btn-enhanced hover-lift"
                      disabled={!fileInput || isProcessing}
                    >
                      {isProcessing ? "Processing..." : "Encode File"}
                    </Button>
                    <Button 
                      onClick={decodeFile} 
                      className="btn-enhanced hover-lift"
                      disabled={!inputText.trim() || isProcessing}
                    >
                      {isProcessing ? "Processing..." : "Decode to File"}
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
                  <CardTitle>Output</CardTitle>
                  <CardDescription>
                    Encoded Base64 or decoded file preview
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fileOutput && (
                    <>
                      {fileOutput.startsWith('data:') || fileOutput.startsWith('blob:') ? (
                        <div className="space-y-4">
                          <div className="border rounded-lg p-4">
                            <p className="text-sm font-medium mb-2">Decoded File Preview:</p>
                            {fileInput?.type.startsWith('image/') ? (
                              <img 
                                src={fileOutput} 
                                alt="Decoded file" 
                                className="max-w-full h-auto rounded"
                              />
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                File decoded successfully. Click download to save.
                              </p>
                            )}
                          </div>
                          <Button
                            onClick={downloadDecodedFile}
                            className="btn-enhanced hover-lift"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download Decoded File
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Textarea
                            value={fileOutput}
                            readOnly
                            className="min-h-[200px] font-mono text-sm bg-muted/50 input-enhanced"
                            placeholder="Base64 encoded file will appear here..."
                          />
                          <div className="flex gap-2">
                            <Button
                              onClick={() => copyToClipboard(fileOutput)}
                              variant="outline"
                              className="hover-lift"
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copy Base64
                            </Button>
                            <Button
                              onClick={() => downloadFile(fileOutput, "encoded_file.txt")}
                              variant="outline"
                              className="hover-lift"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download Base64
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <Card className="card-enhanced mt-6">
          <CardHeader>
            <CardTitle>Base64 Information</CardTitle>
            <CardDescription>
              Learn about Base64 encoding
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">33%</div>
                <div className="text-sm text-muted-foreground">Size Increase</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">A-Z, a-z, 0-9, +, /</div>
                <div className="text-sm text-muted-foreground">Character Set</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">Binary Safe</div>
                <div className="text-sm text-muted-foreground">Encoding Type</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 