import { useCallback, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Button } from "@/src/app/components/ui/button";
import { Upload } from "lucide-react";

interface FileUploaderProps {
  isLoading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileSelect: (file: File) => void;
}

export function FileUploader({ isLoading, fileInputRef, handleFileSelect }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  }, [handleFileSelect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          <span>File Upload</span>
        </CardTitle>
        <CardDescription>Drag & drop or click to select a file</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragging ? 'border-primary bg-primary/10' : 'border-muted'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/tiff,audio/mpeg,audio/wav,audio/flac"
            onChange={handleInputChange}
            className="hidden"
          />
          <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">
            {isDragging ? 'Drop the file here' : 'Drop a file or click to select'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Supports JPG, PNG, MP3, WAV, etc.</p>
        </div>
      </CardContent>
    </Card>
  );
}