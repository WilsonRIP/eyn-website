"use client";

import React, { useState, useRef } from "react";
import { Input } from "@/src/app/components/ui/input";
import { Button } from "@/src/app/components/ui/button";
import { Slider } from "@/src/app/components/ui/slider";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/app/components/ui/card";
import { Label } from "@/src/app/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/app/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/app/components/ui/select";
import {
  Loader2,
  Image as ImageIcon,
  Video as VideoIcon,
  Music as AudioIcon,
  File as FileIcon,
  Download,
} from "lucide-react";
import { toast } from "react-hot-toast";
import FileUpload from "@/src/app/components/FileUpload";
import MultiFileUpload from "@/src/app/components/MultiFileUpload";

// Helper function to check if URL is valid
const isValidUrl = (value: string) => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

export default function CompressPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 animate-fade-in">
      <div className="container mx-auto flex justify-center">
        <Tabs defaultValue="image" className="w-full max-w-2xl">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="image">
              <ImageIcon className="mr-2 h-4 w-4" /> Images
            </TabsTrigger>
            <TabsTrigger value="video">
              <VideoIcon className="mr-2 h-4 w-4" /> Videos
            </TabsTrigger>
            <TabsTrigger value="audio">
              <AudioIcon className="mr-2 h-4 w-4" /> Audio
            </TabsTrigger>
            <TabsTrigger value="file">
              <FileIcon className="mr-2 h-4 w-4" /> Other Files
            </TabsTrigger>
          </TabsList>

          {/* IMAGE COMPRESSION TAB */}
          <TabsContent value="image">
            <ImageCompressor />
          </TabsContent>

          {/* VIDEO COMPRESSION TAB */}
          <TabsContent value="video">
            <VideoCompressor />
          </TabsContent>

          {/* AUDIO COMPRESSION TAB */}
          <TabsContent value="audio">
            <AudioCompressor />
          </TabsContent>

          {/* FILE COMPRESSION TAB */}
          <TabsContent value="file">
            <FileCompressor />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Image Compression Component
function ImageCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState("jpg");
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [compressedFilename, setCompressedFilename] = useState<string | null>(
    null
  );

  const handleFileChange = (selectedFile: File | null) => {
    setFile(selectedFile);
    setCompressedUrl(null);
    setCompressedFilename(null);
  };

  const handleCompress = async () => {
    if (!file) return;

    setIsCompressing(true);
    setCompressedUrl(null);
    setCompressedFilename(null);

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("format", format);
      formData.append("quality", quality.toString());

      const response = await fetch("/api/compress/image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to compress image");
      }

      // Get the filename from Content-Disposition header
      const disposition = response.headers.get("Content-Disposition");
      const filenameMatch = disposition?.match(/filename="(.+)"/);
      const filename = filenameMatch
        ? filenameMatch[1]
        : `compressed.${format}`;

      // Create a blob URL for the compressed image
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      setCompressedUrl(url);
      setCompressedFilename(filename);
      toast.success("Image compressed successfully!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to compress image");
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDownload = () => {
    if (compressedUrl && compressedFilename) {
      const a = document.createElement("a");
      a.href = compressedUrl;
      a.download = compressedFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <Card className="w-full card-enhanced">
      <CardHeader>
        <CardTitle>Image Compressor</CardTitle>
        <CardDescription>
          Compress and optimize your images with custom settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FileUpload
          id="image-file"
          label="Select Image"
          accept="image/*"
          onFileChange={handleFileChange}
          disabled={isCompressing}
          showPreview={true}
          file={file}
          maxSize={50}
          placeholder="Choose an image file or drag it here"
        />

        <div className="space-y-2">
          <Label htmlFor="format">Output Format</Label>
          <Select
            defaultValue={format}
            onValueChange={setFormat}
            disabled={isCompressing || !file}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="jpg">JPEG</SelectItem>
              <SelectItem value="png">PNG</SelectItem>
              <SelectItem value="webp">WebP</SelectItem>
              <SelectItem value="avif">AVIF</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="quality">Quality: {quality}%</Label>
          </div>
          <Slider
            id="quality"
            min={1}
            max={100}
            step={1}
            value={[quality]}
            onValueChange={(value) => setQuality(value[0])}
            disabled={isCompressing || !file}
            className="py-2"
          />
        </div>

        {compressedUrl && (
          <div className="space-y-2 border-t pt-4">
            <Label>Compressed Image</Label>
            <div className="border rounded-md overflow-hidden">
              <img
                src={compressedUrl}
                alt="Compressed"
                className="max-h-48 w-auto mx-auto object-contain"
              />
            </div>
            <Button
              variant="outline"
              className="w-full hover-lift"
              onClick={handleDownload}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Compressed Image
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          className="w-full btn-enhanced hover-lift"
          onClick={handleCompress}
          disabled={!file || isCompressing}
        >
          {isCompressing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Compressing...
            </>
          ) : (
            "Compress Image"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

// Video Compression Component
function VideoCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [bitrate, setBitrate] = useState(1000); // kbps
  const [resolution, setResolution] = useState("720p");
  const [format, setFormat] = useState("mp4");
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [compressedFilename, setCompressedFilename] = useState<string | null>(
    null
  );

  const handleFileChange = (selectedFile: File | null) => {
    setFile(selectedFile);
    setCompressedUrl(null);
    setCompressedFilename(null);
  };

  const handleCompress = async () => {
    if (!file) return;

    setIsCompressing(true);
    setCompressedUrl(null);
    setCompressedFilename(null);

    try {
      const formData = new FormData();
      formData.append("video", file);
      formData.append("format", format);
      formData.append("bitrate", bitrate.toString());
      formData.append("resolution", resolution);

      const response = await fetch("/api/compress/video", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to compress video");
      }

      // Get the filename from Content-Disposition header
      const disposition = response.headers.get("Content-Disposition");
      const filenameMatch = disposition?.match(/filename="(.+)"/);
      const filename = filenameMatch
        ? filenameMatch[1]
        : `compressed.${format}`;

      // Create a blob URL for the compressed video
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      setCompressedUrl(url);
      setCompressedFilename(filename);
      toast.success("Video compressed successfully!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to compress video");
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDownload = () => {
    if (compressedUrl && compressedFilename) {
      const a = document.createElement("a");
      a.href = compressedUrl;
      a.download = compressedFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <Card className="w-full card-enhanced">
      <CardHeader>
        <CardTitle>Video Compressor</CardTitle>
        <CardDescription>
          Compress videos with custom quality and resolution settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FileUpload
          id="video-file"
          label="Select Video"
          accept="video/*"
          onFileChange={handleFileChange}
          disabled={isCompressing}
          file={file}
          maxSize={500}
          placeholder="Choose a video file or drag it here"
        />

        <div className="space-y-2">
          <Label htmlFor="format">Output Format</Label>
          <Select
            defaultValue={format}
            onValueChange={setFormat}
            disabled={isCompressing || !file}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mp4">MP4</SelectItem>
              <SelectItem value="webm">WebM</SelectItem>
              <SelectItem value="mov">MOV</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="resolution">Resolution</Label>
          <Select
            defaultValue={resolution}
            onValueChange={setResolution}
            disabled={isCompressing || !file}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select resolution" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="480p">480p</SelectItem>
              <SelectItem value="720p">720p</SelectItem>
              <SelectItem value="1080p">1080p</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="bitrate">Bitrate: {bitrate} kbps</Label>
          </div>
          <Slider
            id="bitrate"
            min={100}
            max={5000}
            step={100}
            value={[bitrate]}
            onValueChange={(value) => setBitrate(value[0])}
            disabled={isCompressing || !file}
            className="py-2"
          />
        </div>

        {compressedUrl && (
          <div className="space-y-2 border-t pt-4">
            <Label>Compressed Video</Label>
            <Button
              variant="outline"
              className="w-full hover-lift"
              onClick={handleDownload}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Compressed Video
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          className="w-full btn-enhanced hover-lift"
          onClick={handleCompress}
          disabled={!file || isCompressing}
        >
          {isCompressing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Compressing...
            </>
          ) : (
            "Compress Video"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

// Audio Compression Component
function AudioCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [bitrate, setBitrate] = useState(128); // kbps
  const [format, setFormat] = useState("mp3");
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [compressedFilename, setCompressedFilename] = useState<string | null>(
    null
  );

  const handleFileChange = (selectedFile: File | null) => {
    setFile(selectedFile);
    setCompressedUrl(null);
    setCompressedFilename(null);
  };

  const handleCompress = async () => {
    if (!file) return;

    setIsCompressing(true);
    setCompressedUrl(null);
    setCompressedFilename(null);

    try {
      const formData = new FormData();
      formData.append("audio", file);
      formData.append("format", format);
      formData.append("bitrate", bitrate.toString());

      const response = await fetch("/api/compress/audio", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to compress audio");
      }

      // Get the filename from Content-Disposition header
      const disposition = response.headers.get("Content-Disposition");
      const filenameMatch = disposition?.match(/filename="(.+)"/);
      const filename = filenameMatch
        ? filenameMatch[1]
        : `compressed.${format}`;

      // Create a blob URL for the compressed audio
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      setCompressedUrl(url);
      setCompressedFilename(filename);
      toast.success("Audio compressed successfully!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to compress audio");
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDownload = () => {
    if (compressedUrl && compressedFilename) {
      const a = document.createElement("a");
      a.href = compressedUrl;
      a.download = compressedFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <Card className="w-full card-enhanced">
      <CardHeader>
        <CardTitle>Audio Compressor</CardTitle>
        <CardDescription>
          Compress audio files with custom bitrate and format settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FileUpload
          id="audio-file"
          label="Select Audio"
          accept="audio/*"
          onFileChange={handleFileChange}
          disabled={isCompressing}
          file={file}
          maxSize={100}
          placeholder="Choose an audio file or drag it here"
        />

        <div className="space-y-2">
          <Label htmlFor="format">Output Format</Label>
          <Select
            defaultValue={format}
            onValueChange={setFormat}
            disabled={isCompressing || !file}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mp3">MP3</SelectItem>
              <SelectItem value="ogg">OGG</SelectItem>
              <SelectItem value="aac">AAC</SelectItem>
              <SelectItem value="wav">WAV</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="bitrate">Bitrate: {bitrate} kbps</Label>
          </div>
          <Slider
            id="bitrate"
            min={32}
            max={320}
            step={8}
            value={[bitrate]}
            onValueChange={(value) => setBitrate(value[0])}
            disabled={isCompressing || !file}
            className="py-2"
          />
        </div>

        {compressedUrl && (
          <div className="space-y-2 border-t pt-4">
            <Label>Compressed Audio</Label>
            <audio controls className="w-full">
              <source src={compressedUrl} type={`audio/${format}`} />
              Your browser does not support the audio element.
            </audio>
            <Button
              variant="outline"
              className="w-full hover-lift"
              onClick={handleDownload}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Compressed Audio
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          className="w-full btn-enhanced hover-lift"
          onClick={handleCompress}
          disabled={!file || isCompressing}
        >
          {isCompressing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Compressing...
            </>
          ) : (
            "Compress Audio"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

// Generic File Compression Component
function FileCompressor() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [compressionLevel, setCompressionLevel] = useState(6);
  const [format, setFormat] = useState("zip");
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [compressedFilename, setCompressedFilename] = useState<string | null>(
    null
  );

  const handleFileChange = (selectedFiles: FileList | null) => {
    setFiles(selectedFiles);
    setCompressedUrl(null);
    setCompressedFilename(null);
  };

  const handleCompress = async () => {
    if (!files || files.length === 0) return;

    setIsCompressing(true);
    setCompressedUrl(null);
    setCompressedFilename(null);

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }
      formData.append("format", format);
      formData.append("level", compressionLevel.toString());

      const response = await fetch("/api/compress/file", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to compress files");
      }

      // Get the filename from Content-Disposition header
      const disposition = response.headers.get("Content-Disposition");
      const filenameMatch = disposition?.match(/filename="(.+)"/);
      const filename = filenameMatch
        ? filenameMatch[1]
        : `compressed.${format}`;

      // Create a blob URL for the compressed file
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      setCompressedUrl(url);
      setCompressedFilename(filename);
      toast.success("Files compressed successfully!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to compress files");
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDownload = () => {
    if (compressedUrl && compressedFilename) {
      const a = document.createElement("a");
      a.href = compressedUrl;
      a.download = compressedFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <Card className="w-full card-enhanced">
      <CardHeader>
        <CardTitle>File Compressor</CardTitle>
        <CardDescription>
          Compress any files into an archive with custom compression settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <MultiFileUpload
          id="files"
          label="Select Files"
          onFilesChange={handleFileChange}
          disabled={isCompressing}
          files={files}
          maxSize={100}
          maxFiles={20}
          placeholder="Choose files to compress or drag them here"
        />

        <div className="space-y-2">
          <Label htmlFor="format">Archive Format</Label>
          <Select
            defaultValue={format}
            onValueChange={setFormat}
            disabled={isCompressing || !files}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="zip">ZIP</SelectItem>
              <SelectItem value="tar">TAR</SelectItem>
              <SelectItem value="gz">GZ</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="level">
              Compression Level: {compressionLevel} (1-9)
            </Label>
          </div>
          <Slider
            id="level"
            min={1}
            max={9}
            step={1}
            value={[compressionLevel]}
            onValueChange={(value) => setCompressionLevel(value[0])}
            disabled={isCompressing || !files}
            className="py-2"
          />
        </div>

        {compressedUrl && (
          <div className="space-y-2 border-t pt-4">
            <Label>Compressed Archive</Label>
            <Button
              variant="outline"
              className="w-full hover-lift"
              onClick={handleDownload}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Compressed Archive
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          className="w-full btn-enhanced hover-lift"
          onClick={handleCompress}
          disabled={!files || files.length === 0 || isCompressing}
        >
          {isCompressing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Compressing...
            </>
          ) : (
            "Compress Files"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
