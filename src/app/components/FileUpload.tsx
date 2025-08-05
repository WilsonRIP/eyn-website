"use client";

import React, { useState, useRef, useCallback } from "react";
import { Input } from "@/src/app/components/ui/input";
import { Label } from "@/src/app/components/ui/label";
import { Button } from "@/src/app/components/ui/button";
import { Card, CardContent } from "@/src/app/components/ui/card";
import { 
  Upload, 
  X, 
  File, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Music as AudioIcon,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { cn } from "@/src/app/lib/utils";

interface FileUploadProps {
  id?: string;
  label?: string;
  accept?: string;
  maxSize?: number; // in MB
  onFileChangeAction: (file: File | null) => void;
  disabled?: boolean;
  showPreview?: boolean;
  className?: string;
  error?: string;
  file?: File | null;
  placeholder?: string;
}

export default function FileUpload({
  id = "file-upload",
  label = "Upload File",
  accept = "*/*",
  maxSize = 100, // 100MB default
  onFileChangeAction,
  disabled = false,
  showPreview = false,
  className,
  error,
  file,
  placeholder = "Choose a file or drag it here"
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((selectedFile: File): string | null => {
    // Check file size
    if (selectedFile.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }

    // Check file type if accept is specified
    if (accept !== "*/*") {
      const acceptedTypes = accept.split(",").map(type => type.trim());
      const fileType = selectedFile.type;
      const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase();
      
      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith(".")) {
          return fileExtension === type.slice(1);
        }
        if (type.endsWith("/*")) {
          return fileType.startsWith(type.slice(0, -1));
        }
        return fileType === type;
      });

      if (!isAccepted) {
        return `File type not supported. Accepted types: ${accept}`;
      }
    }

    return null;
  }, [accept, maxSize]);

  const handleFileSelect = useCallback((selectedFile: File) => {
    const validationError = validateFile(selectedFile);
    if (validationError) {
      onFileChangeAction(null);
      return;
    }

    onFileChangeAction(selectedFile);

    // Create preview if enabled and file is an image
    if (showPreview && selectedFile.type.startsWith("image/")) {
      const previewUrl = URL.createObjectURL(selectedFile);
      setPreview(previewUrl);
    } else {
      setPreview(null);
    }
  }, [validateFile, onFileChangeAction, showPreview]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleRemoveFile = () => {
    onFileChangeAction(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <ImageIcon className="h-8 w-8" />;
    if (fileType.startsWith("video/")) return <VideoIcon className="h-8 w-8" />;
    if (fileType.startsWith("audio/")) return <AudioIcon className="h-8 w-8" />;
    return <File className="h-8 w-8" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label htmlFor={id}>{label}</Label>}
      
                   <div
               className={cn(
                 "relative border-2 border-dashed rounded-lg p-6 transition-colors hover-lift",
                 isDragOver && "border-primary bg-primary/5",
                 error && "border-red-500 bg-red-50 dark:bg-red-950/20",
                 disabled && "opacity-50 cursor-not-allowed",
                 !file && !disabled && "hover:border-primary/50 cursor-pointer"
               )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && !file && fileInputRef.current?.click()}
      >
        <Input
          ref={fileInputRef}
          id={id}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
        />

        {!file ? (
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-2">{placeholder}</p>
            <p className="text-xs text-muted-foreground">
              Max size: {maxSize}MB
            </p>
            {accept !== "*/*" && (
              <p className="text-xs text-muted-foreground mt-1">
                Accepted: {accept}
              </p>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getFileIcon(file.type)}
              <div>
                <p className="text-sm font-medium truncate max-w-[200px]">
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveFile}
              disabled={disabled}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {file && !error && (
        <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
          <CheckCircle className="h-4 w-4" />
          <span>File selected successfully</span>
        </div>
      )}

                   {showPreview && preview && (
               <Card className="mt-4 card-enhanced animate-scale-in">
                 <CardContent className="p-4">
            <Label className="text-sm font-medium mb-2">Preview</Label>
            <div className="border rounded-md overflow-hidden">
              <img
                src={preview}
                alt="Preview"
                className="max-h-48 w-auto mx-auto object-contain"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 