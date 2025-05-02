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

// @ts-ignore: use the browser build entrypoint
import Vibrant from "node-vibrant/browser";

export default function ColorPage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [pickedColor, setPickedColor] = useState<string>("#FFFFFF");
  const [palette, setPalette] = useState<string[]>([]);

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

  // Extract a palette using Vibrant
  const extractPalette = async () => {
    if (!imageSrc) return;
    try {
      const raw: Record<string, any> =
        await Vibrant.from(imageSrc).getPalette();
      const colors = Object.values(raw)
        .filter((sw): sw is any => sw != null)
        .map((sw) => sw.getHex());
      setPalette(colors);
    } catch (err) {
      console.error("Palette extraction failed:", err);
    }
  };

  // Generate a random palette of 5 colors
  const generateRandomPalette = () => {
    setPalette(Array.from({ length: 5 }, randomHex));
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
                <span>{pickedColor}</span>
              </div>
            )}
          </section>

          {/* Palette controls */}
          <section className="space-y-4">
            <div className="flex space-x-4">
              <Button onClick={extractPalette} disabled={!imageSrc}>
                Extract Palette
              </Button>
              <Button onClick={generateRandomPalette}>Random Palette</Button>
            </div>

            {/* Display palette swatches */}
            {palette.length > 0 && (
              <div className="flex space-x-2">
                {palette.map((color) => (
                  <div key={color} className="text-center">
                    <div
                      className="w-12 h-12 border dark:border-gray-600"
                      style={{ backgroundColor: color }}
                    />
                    <div className="mt-1 text-xs">{color}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </CardContent>

        <CardFooter>
          <p className="text-sm text-muted-foreground">
            Click on the image to pick a color; use the buttons to extract or
            generate palettes.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
