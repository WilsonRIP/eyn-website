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
import { Copy, Check, Palette } from "lucide-react";
import { Sketch } from '@uiw/react-color';

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
  const [showColorPicker, setShowColorPicker] = useState(false);

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
        { x: Math.floor(width * 0.25), y: Math.floor(height * 0.75) },
        { x: Math.floor(width * 0.75), y: Math.floor(height * 0.75) },
        { x: Math.floor(width * 0.5), y: Math.floor(height * 0.5) },
        { x: Math.floor(width * 0.1), y: Math.floor(height * 0.1) },
        { x: Math.floor(width * 0.9), y: Math.floor(height * 0.1) },
        { x: Math.floor(width * 0.1), y: Math.floor(height * 0.9) },
        { x: Math.floor(width * 0.9), y: Math.floor(height * 0.9) },
      ];

      const colors: string[] = [];
      for (const point of samplePoints) {
        const [r, g, b] = ctx.getImageData(point.x, point.y, 1, 1).data;
        colors.push(rgbToHex(r, g, b));
      }

      // Remove duplicates and limit to 8 colors
      const uniqueColors = [...new Set(colors)].slice(0, 8);
      setPalette(uniqueColors);
    } catch (error) {
      console.error("Error extracting palette:", error);
    } finally {
      setIsExtracting(false);
    }
  };

  const generateRandomPalette = () => {
    const colors = Array.from({ length: 8 }, () => randomHex());
    setPalette(colors);
  };

  const copyToClipboard = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Color Palette Generator</h1>
          <p className="text-muted-foreground text-lg mt-2">
            Generate beautiful color palettes from images or create random ones
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image Upload and Color Picker */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Color Selection
              </CardTitle>
              <CardDescription>
                Upload an image or use the color picker to extract colors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Manual Color Picker */}
              <div className="space-y-4">
                <Label>Manual Color Selection</Label>
                <div className="flex gap-2">
                  <div className="relative">
                    <div
                      className="w-16 h-10 rounded border cursor-pointer hover:shadow-md transition-shadow"
                      style={{ backgroundColor: pickedColor }}
                      onClick={() => setShowColorPicker(!showColorPicker)}
                    />
                    {showColorPicker && (
                      <div className="absolute top-12 left-0 z-50">
                        <Sketch
                          color={pickedColor}
                          onChange={(color) => {
                            setPickedColor(color.hex);
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <Input
                    type="text"
                    value={pickedColor}
                    onChange={(e) => setPickedColor(e.target.value)}
                    placeholder="#FFFFFF"
                    className="flex-1"
                  />
                  <Button
                    onClick={() => copyToClipboard(pickedColor)}
                    variant="outline"
                    size="sm"
                    className="btn-enhanced hover-lift"
                  >
                    {copiedColor === pickedColor ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-4">
                <Label>Upload Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="cursor-pointer"
                />
                {imageSrc && (
                  <div className="space-y-2">
                    <Label>Click on the image to pick colors</Label>
                    <div className="relative">
                      <img
                        ref={imgRef}
                        src={imageSrc}
                        alt="Uploaded image"
                        className="w-full h-64 object-cover rounded-lg cursor-crosshair border"
                        onClick={handleImageClick}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={extractPalette}
                        disabled={isExtracting}
                        className="btn-enhanced hover-lift"
                      >
                        {isExtracting ? "Extracting..." : "Extract Palette"}
                      </Button>
                      <Button
                        onClick={generateRandomPalette}
                        variant="outline"
                        className="btn-enhanced hover-lift"
                      >
                        Generate Random
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Current Color Display */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle>Current Color</CardTitle>
              <CardDescription>
                The color you've selected or picked
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className="w-full h-32 rounded-lg border"
                style={{ backgroundColor: pickedColor }}
              />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">HEX:</span>
                  <span className="text-sm font-mono">{pickedColor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">RGB:</span>
                  <span className="text-sm font-mono">
                    {(() => {
                      const hex = pickedColor.replace("#", "");
                      const r = parseInt(hex.substr(0, 2), 16);
                      const g = parseInt(hex.substr(2, 2), 16);
                      const b = parseInt(hex.substr(4, 2), 16);
                      return `${r}, ${g}, ${b}`;
                    })()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Generated Palette */}
        {palette.length > 0 && (
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle>Generated Palette</CardTitle>
              <CardDescription>
                Click on any color to copy it to your clipboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {palette.map((color, index) => (
                  <div
                    key={index}
                    className="text-center space-y-2 cursor-pointer group"
                    onClick={() => copyToClipboard(color)}
                  >
                    <div
                      className="w-full h-16 rounded-lg border hover:shadow-lg transition-all duration-200 group-hover:scale-105"
                      style={{ backgroundColor: color }}
                    />
                    <div className="text-xs font-mono">{color}</div>
                    {copiedColor === color && (
                      <div className="text-xs text-green-600 font-medium">
                        Copied!
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle>How to Use</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <strong>Manual Selection:</strong> Use the color picker to choose any color
                </div>
                <div>
                  <strong>Image Upload:</strong> Upload an image and click to pick colors
                </div>
                <div>
                  <strong>Extract Palette:</strong> Automatically extract colors from your image
                </div>
                <div>
                  <strong>Random Generation:</strong> Generate random color palettes
                </div>
                <div>
                  <strong>Copy Colors:</strong> Click on any color to copy its hex value
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle>Color Formats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <strong>HEX:</strong> #FF0000 (web standard)
                </div>
                <div>
                  <strong>RGB:</strong> 255, 0, 0 (red, green, blue values)
                </div>
                <div>
                  <strong>Usage:</strong> Perfect for web design, CSS, and graphics
                </div>
                <div>
                  <strong>Accessibility:</strong> Use with our contrast checker for better designs
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Hidden canvas for image processing */}
      <canvas
        ref={canvasRef}
        style={{ display: "none" }}
      />
    </div>
  );
}
