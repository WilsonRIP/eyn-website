"use client";

import React, { useState } from "react";
import Image from "next/image"; // Import Next Image
import { Textarea } from "@/src/app/components/ui/textarea";
import { Button } from "@/src/app/components/ui/button";
import { Label } from "@/src/app/components/ui/label";
import { Loader2, Download, DownloadCloud } from "lucide-react";
import { toast } from "react-hot-toast";
import JSZip from "jszip";
import { saveAs } from "file-saver";

interface FoundImage {
  name: string;
  url: string;
}

export default function BatchImageDownloader() {
  const [imageNamesInput, setImageNamesInput] = useState<string>("");
  const [foundImages, setFoundImages] = useState<FoundImage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const handleSearch = async () => {
    setIsLoading(true);
    setError(null);
    setFoundImages([]);
    const names = imageNamesInput
      .split("\n")
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    if (names.length === 0) {
      setError("Please enter at least one image name.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/download/batch-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ names }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `HTTP error! status: ${res.status}`);
      }

      if (!data.images || data.images.length === 0) {
        toast.success("No images found for the given names.");
      } else {
        setFoundImages(data.images);
        toast.success(`Found ${data.images.length} potential image(s).`);
      }
    } catch (e: any) {
      console.error(e);
      const message = e.message || "Failed to search for images.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const sanitizeFilename = (name: string): string => {
    return name.replace(/[/\?%*:|"<>]/g, "-").substring(0, 100);
  };

  const handleSingleImageDownload = (image: FoundImage) => {
    const filename = `${sanitizeFilename(image.name)}.jpg`; // Default to jpg extension
    const proxyUrl = `/api/download/image-proxy?url=${encodeURIComponent(image.url)}&download=true&filename=${encodeURIComponent(filename)}`;

    // Create temporary link and click it
    const link = document.createElement("a");
    link.href = proxyUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Downloading ${image.name}`);
  };

  const handleDownloadZip = async () => {
    if (foundImages.length === 0) {
      toast.error("No images to download.");
      return;
    }

    setIsDownloading(true);
    toast.loading("Preparing zip file...", { id: "zip-download" });

    const zip = new JSZip();

    try {
      const imagePromises = foundImages.map(async (image) => {
        try {
          // Use our proxy endpoint instead of direct fetch to avoid CORS issues
          const proxyUrl = `/api/download/image-proxy?url=${encodeURIComponent(image.url)}`;
          const response = await fetch(proxyUrl);

          if (!response.ok) {
            console.warn(
              `Failed to fetch ${image.url}: ${response.statusText}`
            );
            return null;
          }

          const blob = await response.blob();
          const fileExtension = blob.type.split("/")[1] || "jpg";
          const filename = `${sanitizeFilename(image.name)}.${fileExtension}`;
          zip.file(filename, blob);
          return filename;
        } catch (fetchError) {
          console.warn(`Error fetching ${image.url}:`, fetchError);
          return null;
        }
      });

      const results = await Promise.all(imagePromises);
      const successfulDownloads = results.filter((r) => r !== null).length;

      if (successfulDownloads === 0) {
        toast.error("Failed to download any images.", { id: "zip-download" });
        setIsDownloading(false);
        return;
      }

      toast.loading(
        `Generating zip (${successfulDownloads}/${foundImages.length})...`,
        { id: "zip-download" }
      );

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "batch_images.zip");
      toast.success(
        `Downloaded ${successfulDownloads} image(s) as batch_images.zip!`,
        { id: "zip-download" }
      );
    } catch (error) {
      console.error("Error creating zip file:", error);
      toast.error("Failed to create zip file.", { id: "zip-download" });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="image-names">Image Names (one per line)</Label>
        <Textarea
          id="image-names"
          placeholder="Enter image names, e.g.\nSunset\nMountain Landscape\nAbstract Art"
          value={imageNamesInput}
          onChange={(e) => {
            setImageNamesInput(e.target.value);
            setError(null); // Clear error on input change
          }}
          rows={5}
          disabled={isLoading}
          className={error ? "ring-2 ring-red-500 focus:ring-red-500" : ""}
        />
        <p role="alert" aria-live="polite" className="text-sm text-red-500 h-5">
          {error}
        </p>
      </div>
      <Button
        onClick={handleSearch}
        disabled={isLoading || !imageNamesInput.trim()}
        className="w-full sm:w-auto"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Searching...
          </>
        ) : (
          "Search Images"
        )}
      </Button>

      {foundImages.length > 0 && (
        <div className="space-y-4 pt-4">
          <h3 className="text-lg font-semibold">Results</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {foundImages.map((image) => (
              <div
                key={image.url}
                className="relative aspect-w-2 aspect-h-3 border rounded-md overflow-hidden group"
              >
                <Image
                  src={`/api/download/image-proxy?url=${encodeURIComponent(image.url)}`}
                  alt={`Result for ${image.name}`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                  style={{ objectFit: "cover" }}
                  className="group-hover:opacity-75 transition-opacity duration-200"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                  {image.name}
                </div>
                <button
                  onClick={() => handleSingleImageDownload(image)}
                  className="absolute top-2 right-2 bg-white bg-opacity-75 hover:bg-opacity-100 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  title={`Download ${image.name}`}
                >
                  <DownloadCloud className="h-4 w-4 text-gray-700" />
                </button>
              </div>
            ))}
          </div>
          <Button
            onClick={handleDownloadZip}
            disabled={isLoading || isDownloading || foundImages.length === 0}
            className="w-full sm:w-auto"
          >
            {isDownloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download All as ZIP
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
