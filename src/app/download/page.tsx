"use client";

import React, { useState, useRef } from "react";
import { Input } from "@/src/app/components/ui/input";
import { Button } from "@/src/app/components/ui/button";
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
  Loader2,
  ClipboardCopy,
  Download as DownloadIcon,
  Video as VideoIcon,
  Image as ImageIcon,
  Youtube as YoutubeIcon,
} from "lucide-react";
import { toast } from "react-hot-toast";
import BatchImageDownloader from "@/src/app/components/BatchImageDownloader";
import BulkMediaDownloader from "@/src/app/components/BulkMediaDownloader";
import SiteCopier from "@/src/app/components/SiteCopier";

/** Simple utility so we don't re-implement URL regexes */
const isValidUrl = (value: string) => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

/** Extracts the 11-char video ID from various YouTube URL forms */
function extractVideoId(urlOrId: string): string | null {
  let m = urlOrId.match(/[?&]v=([^&#]+)/);
  if (m) return m[1];
  m = urlOrId.match(/youtu\.be\/([^?&#]+)/);
  if (m) return m[1];
  m = urlOrId.match(/\/embed\/([^?&#]+)/);
  if (m) return m[1];
  return /^[A-Za-z0-9_-]{11}$/.test(urlOrId) ? urlOrId : null;
}

const thumbVariants = [
  "default",
  "mqdefault",
  "hqdefault",
  "sddefault",
  "maxresdefault",
] as const;
type ThumbVariant = (typeof thumbVariants)[number];

export default function DownloadPage() {
  // ── Video Download state ──────────────────────────────────────────────
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadInfo, setDownloadInfo] = useState<{
    url: string;
    filename: string;
  } | null>(null);
  const linkButtonRef = useRef<HTMLButtonElement>(null);

  const handleVideoDownload = async () => {
    if (!isValidUrl(url)) {
      setError("Please enter a valid URL.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setDownloadInfo(null);
    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.details || res.statusText);
      }
      const data = await res.json();
      if (!data.downloadUrl || !data.filename)
        throw new Error("Response did not include a download URL.");
      setDownloadInfo({ url: data.downloadUrl, filename: data.filename });
      toast.success("Video link ready!");
      setUrl("");
    } catch (e: any) {
      console.error(e);
      const message = e.message ?? "Something went wrong.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ── YouTube Thumbnails state ─────────────────────────────────────────
  const [ytInput, setYtInput] = useState("");
  const [ytId, setYtId] = useState<string | null>(null);
  const [ytError, setYtError] = useState<string | null>(null);

  const handleYoutubeGenerate = () => {
    setYtError(null);
    const id = extractVideoId(ytInput.trim());
    if (!id) {
      setYtError("Invalid YouTube URL or ID.");
      setYtId(null);
    } else {
      setYtId(id);
    }
  };

  const handleYoutubeDownload = (thumbUrl: string, filename: string) => {
    // proxy through our image-proxy to avoid CORS
    const proxy = `/api/download/image-proxy?url=${encodeURIComponent(
      thumbUrl
    )}`;
    const a = document.createElement("a");
    a.href = proxy;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 animate-fade-in">
      <div className="container mx-auto flex justify-center">
        <Tabs defaultValue="video" className="w-full max-w-2xl">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="video">
              <VideoIcon className="mr-2 h-4 w-4" /> Video
            </TabsTrigger>
            <TabsTrigger value="batch-image">
              <ImageIcon className="mr-2 h-4 w-4" /> Batch Image
            </TabsTrigger>
            <TabsTrigger value="youtube">
              <YoutubeIcon className="mr-2 h-4 w-4" /> YouTube
            </TabsTrigger>
            <TabsTrigger value="bulk">
              <DownloadIcon className="mr-2 h-4 w-4" /> Bulk Media
            </TabsTrigger>
            <TabsTrigger value="clone">
              <ImageIcon className="mr-2 h-4 w-4" /> Site Copier
            </TabsTrigger>
          </TabsList>

          {/* ── VIDEO TAB ─────────────────────────────────────────────────── */}
          <TabsContent value="video">
            <Card className="w-full card-enhanced">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleVideoDownload();
                }}
              >
                <CardHeader>
                  <CardTitle>Download Video</CardTitle>
                  <CardDescription>
                    Paste the video URL and we'll fetch the direct link.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="video-url">Video URL</Label>
                    <Input
                      id="video-url"
                      type="url"
                      autoFocus
                      placeholder="https://example.com/video"
                      value={url}
                      onChange={(e) => {
                        setUrl(e.target.value);
                        setError(null);
                        setDownloadInfo(null);
                      }}
                      disabled={isLoading}
                      className={
                        error ? "ring-2 ring-red-500 focus:ring-red-500" : ""
                      }
                    />
                    <p
                      role="alert"
                      aria-live="polite"
                      className="text-sm text-red-500 h-5"
                    >
                      {error}
                    </p>
                  </div>
                  {downloadInfo && (
                    <div className="space-y-2 pt-2">
                      <Label>Your video link:</Label>
                      <div className="flex items-center gap-2">
                        <a
                          href={downloadInfo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline break-all"
                          download={downloadInfo.filename}
                        >
                          {downloadInfo.filename}
                        </a>
                        <Button
                          ref={linkButtonRef}
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            navigator.clipboard.writeText(downloadInfo.url);
                            toast.success("Copied!", {
                              position: "bottom-center",
                            });
                          }}
                          aria-label="Copy link"
                        >
                          <ClipboardCopy size={16} />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">
                        Click the filename to download.
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full btn-enhanced hover-lift"
                    disabled={isLoading || !url}
                    type="submit"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing…
                      </>
                    ) : (
                      "Get Video Link"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          {/* ── BATCH IMAGE TAB ───────────────────────────────────────────── */}
          <TabsContent value="batch-image">
            <Card className="w-full card-enhanced">
              <CardHeader>
                <CardTitle>Batch Image Download</CardTitle>
                <CardDescription>
                  Enter image names (one per line) and download them as a zip.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BatchImageDownloader />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── YOUTUBE THUMBNAILS TAB ────────────────────────────────────── */}
          <TabsContent value="youtube">
            <Card className="w-full card-enhanced">
              <CardHeader>
                <CardTitle>YouTube Thumbnails</CardTitle>
                <CardDescription>
                  Paste a YouTube URL or ID to generate all thumbnail sizes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="yt-input">YouTube URL or Video ID</Label>
                  <Input
                    id="yt-input"
                    type="text"
                    placeholder="https://youtu.be/ABC123xyz"
                    value={ytInput}
                    onChange={(e) => {
                      setYtInput(e.target.value);
                      setYtError(null);
                      setYtId(null);
                    }}
                    disabled={false}
                  />
                  <p className="text-sm text-red-500 h-5">{ytError}</p>
                </div>
                <Button
                  onClick={handleYoutubeGenerate}
                  disabled={!ytInput.trim()}
                  className="btn-enhanced hover-lift"
                >
                  Generate
                </Button>

                {ytId && (
                  <div className="space-y-4 pt-4">
                    {thumbVariants.map((v) => {
                      const thumbUrl = `https://img.youtube.com/vi/${ytId}/${v}.jpg`;
                      return (
                        <div
                          key={v}
                          className="flex items-center space-x-4 border-b pb-4 dark:border-gray-700"
                        >
                          <img
                            src={thumbUrl}
                            alt={`${v} thumbnail`}
                            className="w-32 h-auto border dark:border-gray-600"
                          />
                          <div className="flex-1">
                            <p className="font-medium">{v.toUpperCase()}</p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleYoutubeDownload(
                                  thumbUrl,
                                  `${ytId}_${v}.jpg`
                                )
                              }
                              className="mt-1 hover-lift"
                            >
                              <DownloadIcon className="mr-1 h-4 w-4" />
                              Download
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  Downloads are proxied through `/api/download/image-proxy`.
                </p>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* ── BULK MEDIA TAB ─────────────────────────────────────────────── */}
          <TabsContent value="bulk">
            <Card className="w-full card-enhanced">
              <CardHeader>
                <CardTitle>Bulk Media Downloader</CardTitle>
                <CardDescription>
                  Download multiple media files at once.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BulkMediaDownloader />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── SITE COPIER TAB ─────────────────────────────────────────────── */}
          <TabsContent value="clone">
            <Card className="w-full card-enhanced">
              <CardHeader>
                <CardTitle>Website Copier</CardTitle>
                <CardDescription>
                  Fetch a page's HTML, images, scripts & styles into a ZIP.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SiteCopier />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
