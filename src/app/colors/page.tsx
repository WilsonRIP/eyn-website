// src/app/colors/page.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
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
import { Copy, Check } from "lucide-react";

// Utility to convert RGB → HEX
function rgbToHex(r: number, g: number, b: number) {
  return (
    "#" +
    [r, g, b]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

// Random HEX generator
function randomHex() {
  const rand = () => Math.floor(Math.random() * 256);
  return rgbToHex(rand(), rand(), rand());
}

// We'll use a simpler approach without node-vibrant for now
export default function ColorPage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [pickedColor, setPickedColor] = useState<string>("#FFFFFF");
  const [palette, setPalette] = useState<string[]>([]);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Whenever imageSrc changes, draw it into the hidden canvas
  useEffect(() => {
    if (!imageSrc || !imgRef.current || !canvasRef.current) return;
    const img = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
    };
  }, [imageSrc]);

  // Handle file selection
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    setPickedColor("#FFFFFF");
    setPalette([]);
  };

  // Pick the pixel color under the click
  const handleImageClick = (e: React.MouseEvent) => {
    if (!imgRef.current || !canvasRef.current) return;
    const img = imgRef.current;
    const canvas = canvasRef.current;
    const rect = img.getBoundingClientRect();
    const x = Math.floor(
      ((e.clientX - rect.left) / rect.width) * img.naturalWidth
    );
    const y = Math.floor(
      ((e.clientY - rect.top) / rect.height) * img.naturalHeight
    );
    const ctx = canvas.getContext("2d")!;
    const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
    setPickedColor(rgbToHex(r, g, b));
  };

  // Extract a palette using a simplified approach
  // We'll sample colors from various points in the image
  const extractPalette = async () => {
    if (!imageSrc || !canvasRef.current) return;
    try {
      setIsExtracting(true);

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d")!;
      const width = canvas.width;
      const height = canvas.height;

      // Sample colors from different parts of the image
      const samplePoints = [
        { x: Math.floor(width * 0.25), y: Math.floor(height * 0.25) },
        { x: Math.floor(width * 0.75), y: Math.floor(height * 0.25) },
        { x: Math.floor(width * 0.5), y: Math.floor(height * 0.5) },
        { x: Math.floor(width * 0.25), y: Math.floor(height * 0.75) },
        { x: Math.floor(width * 0.75), y: Math.floor(height * 0.75) },
      ];

      const colors = samplePoints.map((point) => {
        const [r, g, b] = ctx.getImageData(point.x, point.y, 1, 1).data;
        return rgbToHex(r, g, b);
      });

      // Filter out duplicate colors
      const uniqueColors = [...new Set(colors)];
      setPalette(uniqueColors);
    } catch (err) {
      console.error("Palette extraction failed:", err);
    } finally {
      setIsExtracting(false);
    }
  };

  // Generate a random palette of 5 colors
  const generateRandomPalette = () => {
    setPalette(Array.from({ length: 5 }, randomHex));
  };

  // Copy color to clipboard
  const copyToClipboard = (color: string) => {
    navigator.clipboard.writeText(color).then(() => {
      setCopiedColor(color);
      // Reset copied status after 2 seconds
      setTimeout(() => {
        setCopiedColor(null);
      }, 2000);
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 dark:bg-gray-900">
      <Card className="w-full max-w-2xl dark:bg-gray-800 dark:text-gray-100">
        <CardHeader>
          <CardTitle>Color Picker &amp; Palette Generator</CardTitle>
          <CardDescription>
            Pick colors from an image or generate random/extracted palettes.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Image upload & picker */}
          <section className="space-y-4">
            <Label>Upload Image</Label>
            <Input type="file" accept="image/*" onChange={handleImageUpload} />
            {imageSrc && (
              <div className="relative inline-block border dark:border-gray-600">
                <img
                  src={imageSrc}
                  alt="Uploaded"
                  ref={imgRef}
                  onClick={handleImageClick}
                  className="max-w-full h-auto cursor-crosshair"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
            )}
            {imageSrc && (
              <div className="flex items-center space-x-2">
                <div
                  className="w-8 h-8 border dark:border-gray-600"
                  style={{ backgroundColor: pickedColor }}
                />
                <div className="flex items-center space-x-2">
                  <span>{pickedColor}</span>
                  <button
                    onClick={() => copyToClipboard(pickedColor)}
                    className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Copy color code"
                  >
                    {copiedColor === pickedColor ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Palette controls */}
          <section className="space-y-4">
            <div className="flex space-x-4">
              <Button
                onClick={extractPalette}
                disabled={!imageSrc || isExtracting}
              >
                {isExtracting ? "Extracting..." : "Extract Palette"}
              </Button>
              <Button onClick={generateRandomPalette}>Random Palette</Button>
            </div>

            {/* Display palette swatches */}
            {palette.length > 0 && (
              <div className="flex flex-wrap gap-4 mt-4">
                {palette.map((color, index) => (
                  <div key={`${color}-${index}`} className="text-center">
                    <div
                      className="w-12 h-12 border dark:border-gray-600"
                      style={{ backgroundColor: color }}
                    />
                    <div className="mt-1 flex items-center justify-center space-x-1">
                      <span className="text-xs">{color}</span>
                      <button
                        onClick={() => copyToClipboard(color)}
                        className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        aria-label="Copy color code"
                      >
                        {copiedColor === color ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </CardContent>

        <CardFooter>
          <p className="text-sm text-muted-foreground">
            Click on the image to pick a color; use the buttons to extract or
            generate palettes. Click the copy icon to copy a color code.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
