"use client";

import React, { useState, useRef, useCallback } from "react";
import { Input } from "@/src/app/components/ui/input";
import { Label } from "@/src/app/components/ui/label";
import { Button } from "@/src/app/components/ui/button";
import { Badge } from "@/src/app/components/ui/badge";
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

interface MultiFileUploadProps {
  id?: string;
  label?: string;
  accept?: string;
  maxSize?: number; // in MB
  maxFiles?: number;
  onFilesChangeAction: (files: FileList | null) => void;
  disabled?: boolean;
  className?: string;
  error?: string;
  files?: FileList | null;
  placeholder?: string;
}

export default function MultiFileUpload({
  id = "multi-file-upload",
  label = "Upload Files",
  accept = "*/*",
  maxSize = 100, // 100MB default
  maxFiles = 10,
  onFilesChangeAction,
  disabled = false,
  className,
  error,
  files,
  placeholder = "Choose files or drag them here"
}: MultiFileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
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

  const validateFiles = useCallback((selectedFiles: FileList): { validFiles: File[], errors: string[] } => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    // Check max files limit
    if (selectedFiles.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} files allowed`);
      return { validFiles, errors };
    }

    // Validate each file
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const validationError = validateFile(file);
      if (validationError) {
        errors.push(`${file.name}: ${validationError}`);
      } else {
        validFiles.push(file);
      }
    }

    return { validFiles, errors };
  }, [validateFile, maxFiles]);

  const createFileList = useCallback((files: File[]): FileList => {
    const dataTransfer = new DataTransfer();
    files.forEach(file => dataTransfer.items.add(file));
    return dataTransfer.files;
  }, []);

  const handleFilesSelect = useCallback((selectedFiles: FileList) => {
    const { validFiles, errors } = validateFiles(selectedFiles);
    
    if (errors.length > 0) {
      // Show errors but don't clear existing files
      console.warn("File validation errors:", errors);
      return;
    }

    if (validFiles.length > 0) {
      const fileList = createFileList(validFiles);
      onFilesChangeAction(fileList);
    }
  }, [validateFiles, createFileList, onFilesChangeAction]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFilesSelect(selectedFiles);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      handleFilesSelect(droppedFiles);
    }
  }, [handleFilesSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleRemoveFile = (index: number) => {
    if (!files) return;
    
    const fileArray = Array.from(files);
    fileArray.splice(index, 1);
    
    if (fileArray.length === 0) {
      onFilesChangeAction(null);
    } else {
      const fileList = createFileList(fileArray);
      onFilesChangeAction(fileList);
    }
  };

  const handleRemoveAllFiles = () => {
    onFilesChangeAction(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <ImageIcon className="h-4 w-4" />;
    if (fileType.startsWith("video/")) return <VideoIcon className="h-4 w-4" />;
    if (fileType.startsWith("audio/")) return <AudioIcon className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const fileArray = files ? Array.from(files) : [];

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label htmlFor={id}>{label}</Label>}
      
                   <div
               className={cn(
                 "relative border-2 border-dashed rounded-lg p-6 transition-colors hover-lift",
                 isDragOver && "border-primary bg-primary/5",
                 error && "border-red-500 bg-red-50 dark:bg-red-950/20",
                 disabled && "opacity-50 cursor-not-allowed",
                 !disabled && "hover:border-primary/50 cursor-pointer"
               )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <Input
          ref={fileInputRef}
          id={id}
          type="file"
          accept={accept}
          multiple
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
        />

        {fileArray.length === 0 ? (
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-2">{placeholder}</p>
            <p className="text-xs text-muted-foreground">
              Max size: {maxSize}MB per file • Max files: {maxFiles}
            </p>
            {accept !== "*/*" && (
              <p className="text-xs text-muted-foreground mt-1">
                Accepted: {accept}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {fileArray.length} file{fileArray.length !== 1 ? 's' : ''} selected
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveAllFiles}
                disabled={disabled}
                className="h-8 px-2"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </div>
            
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {fileArray.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between p-2 bg-muted rounded-md"
                >
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    {getFileIcon(file.type)}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(index);
                    }}
                    disabled={disabled}
                    className="h-6 w-6 p-0 ml-2"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {fileArray.length > 0 && !error && (
        <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
          <CheckCircle className="h-4 w-4" />
          <span>{fileArray.length} file{fileArray.length !== 1 ? 's' : ''} selected successfully</span>
        </div>
      )}
    </div>
  );
} 