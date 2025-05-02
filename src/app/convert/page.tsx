"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  FormEvent,
} from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/src/app/components/ui/card";
import { Label } from "@/src/app/components/ui/label";
import { Input } from "@/src/app/components/ui/input";
import { Button } from "@/src/app/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/src/app/components/ui/select";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/src/app/components/ui/tabs";
import { Progress } from "@/src/app/components/ui/progress";
import {
  Loader2 as LoaderIcon,
  Download as DownloadIcon,
  Image as ImageIcon,
  Video as VideoIcon,
  Music,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { loadFFmpeg } from "@/src/lib/ffmpeg";
import type { FFmpeg as FFmpegType } from "@ffmpeg/ffmpeg";

/* -------------------------------------------------------------------------- */
/*                           Types & configuration                            */
/* -------------------------------------------------------------------------- */

type ConversionType = "image" | "video" | "audio";
type ImageFormat =
  | "png"
  | "jpg"
  | "jpeg"
  | "webp"
  | "gif"
  | "bmp"
  | "tiff"
  | "avif";
type VideoFormat =
  | "mp4"
  | "webm"
  | "avi"
  | "mov"
  | "mkv"
  | "flv"
  | "mpg"
  | "mpeg"
  | "ogv"
  | "m4v";
type AudioFormat = "mp3" | "wav" | "ogg" | "flac" | "aac" | "m4a";
type TargetFormat = ImageFormat | VideoFormat | AudioFormat;

const imageFormats: ImageFormat[] = [
  "png",
  "jpg",
  "jpeg",
  "webp",
  "gif",
  "bmp",
  "tiff",
  "avif",
];
const videoFormats: VideoFormat[] = [
  "mp4",
  "webm",
  "avi",
  "mov",
  "mkv",
  "flv",
  "mpg",
  "mpeg",
  "ogv",
  "m4v",
];
const audioFormats: AudioFormat[] = ["mp3", "wav", "ogg", "flac", "aac", "m4a"];

const formatMap: Record<ConversionType, TargetFormat[]> = {
  image: imageFormats,
  video: videoFormats,
  audio: audioFormats,
};

const acceptMap: Record<ConversionType, string> = {
  image: "image/*",
  video: "video/*",
  audio: "audio/*",
};

/* -------------------------------------------------------------------------- */
/*                              helper – canvas                               */
/* -------------------------------------------------------------------------- */

async function convertImageOnCanvas(
  file: File,
  target: ImageFormat
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0);

  const mime =
    target === "jpg" || target === "jpeg"
      ? "image/jpeg"
      : target === "gif"
        ? "image/gif"
        : target === "bmp"
          ? "image/bmp"
          : target === "tiff"
            ? "image/tiff"
            : target === "avif"
              ? "image/avif"
              : `image/${target}`;

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(
      (b) => resolve(b),
      mime,
      mime === "image/jpeg" || mime === "image/webp" ? 0.92 : undefined
    )
  );
  if (!blob) throw new Error("Canvas export failed");
  return blob;
}

/* -------------------------------------------------------------------------- */
/*                             React component                                */
/* -------------------------------------------------------------------------- */

export default function ConvertPage() {
  const [tab, setTab] = useState<ConversionType>("video");
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<TargetFormat | "">("");
  const [progress, setProgress] = useState(0);

  const [isConverting, setIsConverting] = useState(false);
  const [isFFmpegLoading, setIsFFmpegLoading] = useState(false);
  const [isFFmpegReady, setIsFFmpegReady] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputName, setOutputName] = useState<string | null>(null);

  const ffmpegRef = useRef<FFmpegType | null>(null);
  const progressListenerRef = useRef<(() => void) | null>(null);

  /* Load multithreaded FFmpeg-WASM if needed (for fallback video) */
  const loadEngine = useCallback(async () => {
    if (ffmpegRef.current || isFFmpegLoading) return;
    setIsFFmpegLoading(true);
    toast.loading("Loading FFmpeg…", { id: "ffmpeg-toast" });
    try {
      const ffmpeg = await loadFFmpeg();
      ffmpegRef.current = ffmpeg;
      setIsFFmpegReady(true);
      toast.success("FFmpeg ready ✔", { id: "ffmpeg-toast" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
      toast.error(`Failed to load FFmpeg: ${msg}`, { id: "ffmpeg-toast" });
    } finally {
      setIsFFmpegLoading(false);
    }
  }, [isFFmpegLoading]);

  useEffect(() => {
    if (tab === "video" && !isFFmpegReady) loadEngine();
  }, [tab, isFFmpegReady, loadEngine]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
    setError(null);
    setOutputUrl(null);
    setOutputName(null);
    setProgress(0);
  };

  const onFormatChange = (v: string) => {
    setFormat(v as TargetFormat);
    setError(null);
  };

  const convert = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);
      if (!file || !format) {
        setError("Please choose a file and a target format.");
        return;
      }

      // ——— AUDIO via serverless endpoint ———
      if (tab === "audio") {
        setIsConverting(true);
        toast.loading("Uploading & converting audio…", { id: "convert-toast" });
        const form = new FormData();
        form.append("file", file);
        form.append("format", format);

        try {
          const res = await fetch("/api/convert/audio", {
            method: "POST",
            body: form,
          });
          if (!res.ok) throw new Error(`Server error ${res.status}`);
          const blob = await res.blob();
          if (outputUrl) URL.revokeObjectURL(outputUrl);
          const url = URL.createObjectURL(blob);
          setOutputUrl(url);
          setOutputName(`converted.${format}`);
          toast.success("Audio converted ✔", { id: "convert-toast" });
        } catch (err: any) {
          setError(err.message || "Audio conversion failed");
          toast.error(err.message || "Conversion error", {
            id: "convert-toast",
          });
        } finally {
          setIsConverting(false);
        }
        return;
      }

      // ——— VIDEO via serverless endpoint ———
      if (tab === "video") {
        setIsConverting(true);
        toast.loading("Uploading & converting video…", { id: "convert-toast" });
        const form = new FormData();
        form.append("file", file);
        form.append("format", format);

        try {
          const res = await fetch("/api/convert/video", {
            method: "POST",
            body: form,
          });
          if (!res.ok) throw new Error(`Server error ${res.status}`);
          const blob = await res.blob();
          if (outputUrl) URL.revokeObjectURL(outputUrl);
          const url = URL.createObjectURL(blob);
          setOutputUrl(url);
          setOutputName(`converted.${format}`);
          toast.success("Video converted ✔", { id: "convert-toast" });
        } catch (err: any) {
          setError(err.message || "Video conversion failed");
          toast.error(err.message || "Conversion error", {
            id: "convert-toast",
          });
        } finally {
          setIsConverting(false);
        }
        return;
      }

      // ——— IMAGE via canvas ———
      if (tab === "image") {
        const sourceExt = file.name.split(".").pop()?.toLowerCase();
        if (sourceExt === format) {
          setError("Source and target formats are identical.");
          return;
        }
        setIsConverting(true);
        toast.loading("Converting image…", { id: "convert-toast" });
        try {
          const blob = await convertImageOnCanvas(file, format as ImageFormat);
          if (outputUrl) URL.revokeObjectURL(outputUrl);
          const url = URL.createObjectURL(blob);
          setOutputUrl(url);
          setOutputName(file.name.replace(/\.[^.]+$/, `.${format}`));
          toast.success("Image converted ✔", { id: "convert-toast" });
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Unknown error";
          setError(msg);
          toast.error(`Conversion failed: ${msg}`, { id: "convert-toast" });
        } finally {
          setIsConverting(false);
        }
        return;
      }
    },
    [file, format, tab, outputUrl]
  );

  // revoke old URL on unmount
  useEffect(
    () => () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    },
    [outputUrl]
  );

  const formats = formatMap[tab];

  return (
    <div className="flex min-h-screen items-center justify-center p-4 dark:bg-gray-900">
      <Card className="w-full max-w-lg dark:bg-gray-800 dark:text-gray-100">
        <Tabs value={tab} onValueChange={(v) => setTab(v as ConversionType)}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="image">
              <ImageIcon className="mr-2 h-4 w-4" /> Image
            </TabsTrigger>
            <TabsTrigger value="video">
              <VideoIcon className="mr-2 h-4 w-4" /> Video
            </TabsTrigger>
            <TabsTrigger value="audio">
              <Music className="mr-2 h-4 w-4" /> Audio
            </TabsTrigger>
          </TabsList>

          {/* IMAGE */}
          <TabsContent value="image">
            <form onSubmit={convert}>
              <CardHeader>
                <CardTitle>Image Converter</CardTitle>
                <CardDescription>
                  Convert PNG, JPG, WEBP, GIF, BMP, TIFF &amp; AVIF in-browser.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Label htmlFor="img-file">Upload image</Label>
                <Input
                  id="img-file"
                  type="file"
                  accept={acceptMap.image}
                  onChange={onFileChange}
                  disabled={isConverting}
                />
                <Label htmlFor="img-format">Convert to</Label>
                <Select
                  value={format}
                  onValueChange={onFormatChange}
                  disabled={isConverting}
                >
                  <SelectTrigger id="img-format">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    {formats.map((f) => (
                      <SelectItem key={f} value={f}>
                        {f.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                {error && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                )}
                <Button
                  type="submit"
                  disabled={!file || !format || isConverting}
                  className="w-full"
                >
                  {isConverting && (
                    <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Convert Image
                </Button>
                {outputUrl && (
                  <>
                    {format === "gif" && (
                      <p className="flex items-center text-xs text-yellow-600 dark:text-yellow-400">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Animated GIFs become a single static frame.
                      </p>
                    )}
                    <Button variant="outline" asChild className="w-full">
                      <a href={outputUrl} download={outputName ?? "image"}>
                        <DownloadIcon className="mr-2 h-4 w-4" />
                        Download
                      </a>
                    </Button>
                    <Label>Preview</Label>
                    <img
                      src={outputUrl}
                      alt="preview"
                      className="mt-1 w-full rounded border dark:border-gray-600"
                    />
                  </>
                )}
              </CardFooter>
            </form>
          </TabsContent>

          {/* VIDEO */}
          <TabsContent value="video">
            <form onSubmit={convert}>
              <CardHeader>
                <CardTitle>Video Converter</CardTitle>
                <CardDescription>
                  Server‐powered FFmpeg conversion for common video formats.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Label htmlFor="vid-file">Upload video</Label>
                <Input
                  id="vid-file"
                  type="file"
                  accept={acceptMap.video}
                  onChange={onFileChange}
                  disabled={!isFFmpegReady || isConverting}
                />
                <Label htmlFor="vid-format">Convert to</Label>
                <Select
                  value={format}
                  onValueChange={onFormatChange}
                  disabled={!isFFmpegReady || isConverting}
                >
                  <SelectTrigger id="vid-format">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    {formats.map((f) => (
                      <SelectItem key={f} value={f}>
                        {f.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isConverting && (
                  <div className="space-y-1">
                    <Label>Converting… {progress}%</Label>
                    <Progress value={progress} />
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                {error && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                )}
                <Button
                  type="submit"
                  disabled={
                    !file ||
                    !format ||
                    !isFFmpegReady ||
                    isConverting ||
                    isFFmpegLoading
                  }
                  className="w-full"
                >
                  {isConverting && (
                    <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Convert Video
                </Button>
                {outputUrl && (
                  <>
                    <Button
                      variant="outline"
                      asChild
                      className="w-full animate-pulse"
                    >
                      <a href={outputUrl} download={outputName ?? "video"}>
                        <DownloadIcon className="mr-2 h-4 w-4" />
                        Download
                      </a>
                    </Button>
                    <Label>Preview</Label>
                    <video
                      controls
                      src={outputUrl}
                      className="mt-1 w-full rounded border dark:border-gray-600"
                    />
                  </>
                )}
              </CardFooter>
            </form>
          </TabsContent>

          {/* AUDIO */}
          <TabsContent value="audio">
            <form onSubmit={convert}>
              <CardHeader>
                <CardTitle>Audio Converter</CardTitle>
                <CardDescription>
                  Server‐powered FFmpeg conversion for common audio formats.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Label htmlFor="aud-file">Upload audio</Label>
                <Input
                  id="aud-file"
                  type="file"
                  accept={acceptMap.audio}
                  onChange={onFileChange}
                  disabled={isConverting}
                />
                <Label htmlFor="aud-format">Convert to</Label>
                <Select
                  value={format}
                  onValueChange={onFormatChange}
                  disabled={isConverting}
                >
                  <SelectTrigger id="aud-format">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    {formats.map((f) => (
                      <SelectItem key={f} value={f}>
                        {f.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isConverting && (
                  <div className="space-y-1">
                    <Label>Converting… {progress}%</Label>
                    <Progress value={progress} />
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                {error && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                )}
                <Button
                  type="submit"
                  disabled={!file || !format || isConverting}
                  className="w-full"
                >
                  {isConverting && (
                    <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Convert Audio
                </Button>
                {outputUrl && (
                  <>
                    <Button variant="outline" asChild className="w-full">
                      <a href={outputUrl} download={outputName ?? "audio"}>
                        <DownloadIcon className="mr-2 h-4 w-4" />
                        Download
                      </a>
                    </Button>
                    <Label>Preview</Label>
                    <audio controls src={outputUrl} className="mt-1 w-full" />
                  </>
                )}
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
