import { Card, CardContent, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Button } from "@/src/app/components/ui/button";
import { Badge } from "@/src/app/components/ui/badge";
import { Edit, Eye, Info, Music, RotateCcw, Image as ImageIcon } from "lucide-react";

interface FileDetailsProps {
  file: File;
  filePreviewUrl: string;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  resetMetadata: () => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function FileDetails({ file, filePreviewUrl, isEditing, setIsEditing, resetMetadata }: FileDetailsProps) {
  const isImage = file.type.startsWith('image/');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          <span>File Preview & Info</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          {isImage ? (
             <ImageIcon className="h-10 w-10 text-muted-foreground" />
          ) : (
            <Music className="h-10 w-10 text-muted-foreground" />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate" title={file.name}>{file.name}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{formatFileSize(file.size)}</span>
              <Badge variant="outline">{file.type}</Badge>
            </div>
          </div>
        </div>

        {isImage ? (
          <img src={filePreviewUrl} alt="File preview" className="rounded-lg max-h-48 w-full object-contain bg-muted" />
        ) : (
          <audio controls src={filePreviewUrl} className="w-full">
            Your browser does not support the audio element.
          </audio>
        )}

        <div className="flex gap-2">
          <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? 'secondary' : 'default'} className="flex-1">
            {isEditing ? <><Eye className="h-4 w-4 mr-2" />View</> : <><Edit className="h-4 w-4 mr-2" />Edit</>}
          </Button>
          <Button onClick={resetMetadata} variant="outline" size="icon" title="Reset Changes">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}