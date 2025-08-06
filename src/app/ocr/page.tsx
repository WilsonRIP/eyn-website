"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Button } from "@/src/app/components/ui/button";
import { Textarea } from "@/src/app/components/ui/textarea";
import { Alert, AlertDescription } from "@/src/app/components/ui/alert";
import { Progress } from "@/src/app/components/ui/progress";
import { Upload, FileText, Copy, Download, RotateCcw, CheckCircle, XCircle, AlertTriangle, Eye, EyeOff } from "lucide-react";

export default function OCRPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        setError("");
        setExtractedText("");
      } else {
        setError("Please select a valid image file (JPEG, PNG, GIF, etc.)");
      }
    }
  };

  const extractText = async () => {
    if (!selectedFile) {
      setError("Please select an image file first");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError("");

    try {
      // Simulate OCR processing with progress updates
      const simulateProgress = () => {
        const interval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 90) {
              clearInterval(interval);
              return 90;
            }
            return prev + 10;
          });
        }, 200);
        return interval;
      };

      const progressInterval = simulateProgress();

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('image', selectedFile);

      // Simulate API call to OCR service
      await new Promise(resolve => setTimeout(resolve, 2000));

      // For demo purposes, we'll simulate extracted text
      // In a real implementation, you would call an OCR API like Tesseract.js or a cloud service
      const mockExtractedText = `Sample extracted text from image:

This is a demonstration of OCR (Optical Character Recognition) functionality.
The text would be extracted from the uploaded image using advanced image processing algorithms.

Key features:
• High accuracy text recognition
• Support for multiple languages
• Handles various image formats
• Preserves text formatting

Note: This is a simulated result for demonstration purposes.`;

      setExtractedText(mockExtractedText);
      setProgress(100);
      clearInterval(progressInterval);
    } catch (error) {
      setError("Failed to extract text from image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    if (extractedText) {
      navigator.clipboard.writeText(extractedText);
    }
  };

  const downloadText = () => {
    if (extractedText) {
      const blob = new Blob([extractedText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "extracted-text.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const clearAll = () => {
    setSelectedFile(null);
    setExtractedText("");
    setError("");
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 animate-slide-in-left">Image-to-Text OCR</h1>
          <p className="text-muted-foreground text-lg animate-slide-in-right">
            Extract plain-text from uploaded images using optical character recognition
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                <span>Upload Image</span>
                {selectedFile && <CheckCircle className="h-5 w-5 text-green-500" />}
              </CardTitle>
              <CardDescription>
                Select an image file to extract text from
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full hover-lift"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Image File
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Supports JPEG, PNG, GIF, BMP, TIFF
                </p>
              </div>

              {selectedFile && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm font-medium">{selectedFile.name}</span>
                    </div>
                    <Button
                      onClick={togglePreview}
                      variant="ghost"
                      size="sm"
                      className="hover-lift"
                    >
                      {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>

                  {showPreview && (
                    <div className="relative">
                      <img
                        src={URL.createObjectURL(selectedFile)}
                        alt="Preview"
                        className="w-full max-h-64 object-contain rounded-lg border"
                      />
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={extractText}
                      className="btn-enhanced hover-lift"
                      disabled={isProcessing}
                    >
                      {isProcessing ? "Extracting..." : "Extract Text"}
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

                  {isProcessing && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Processing image...</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="w-full" />
                    </div>
                  )}
                </div>
              )}

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
                <span>Extracted Text</span>
              </CardTitle>
              <CardDescription>
                The extracted text will appear here
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={extractedText}
                readOnly
                className="min-h-[300px] font-mono text-sm bg-muted/50 input-enhanced"
                placeholder="Extracted text will appear here..."
              />

              {extractedText && (
                <div className="flex gap-2">
                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    className="hover-lift"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Text
                  </Button>
                  <Button
                    onClick={downloadText}
                    variant="outline"
                    className="hover-lift"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle>How OCR Works</CardTitle>
            <CardDescription>
              Understanding the optical character recognition process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold">1. Image Processing</h3>
                <p className="text-sm text-muted-foreground">
                  The image is preprocessed to improve text recognition accuracy by adjusting contrast, removing noise, and enhancing clarity.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">2. Text Detection</h3>
                <p className="text-sm text-muted-foreground">
                  Advanced algorithms identify text regions in the image, separating text from graphics and background elements.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">3. Character Recognition</h3>
                <p className="text-sm text-muted-foreground">
                  Individual characters are recognized using machine learning models trained on millions of text samples.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 