// src/app/components/BulkMediaDownloader.tsx
"use client";

import React, { useState } from "react";
import { Label } from "@/src/app/components/ui/label";
import { Textarea } from "@/src/app/components/ui/textarea";
import { Button } from "@/src/app/components/ui/button";
import { Loader2 as LoaderIcon } from "lucide-react";
import { toast } from "react-hot-toast";

export default function BulkMediaDownloader() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownloadAll = async () => {
    const urls = input
      .split("\n")
      .map((line) => line.trim())
      .filter((u) => u);
    if (urls.length === 0) {
      setError("Please paste one or more URLs (one per line).");
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/bulk-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaUrls: urls }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || res.statusText);
      }
      const blob = await res.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = "bulk-media.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
      toast.success("Your bulk‐media.zip is downloading!");
      setInput("");
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Bulk download failed.");
      toast.error(e.message || "Bulk download failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="media-urls">
          Enter direct media URLs (one per line)
        </Label>
        <Textarea
          id="media-urls"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="https://example.com/video.mp4  
https://example.com/image.jpg  
https://example.com/audio.mp3"
          rows={6}
          disabled={isLoading}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
      <Button
        onClick={handleDownloadAll}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
            Downloading…
          </>
        ) : (
          "Download All"
        )}
      </Button>
    </div>
  );
}
