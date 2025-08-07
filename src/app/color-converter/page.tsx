"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Button } from "@/src/app/components/ui/button";
import { Input } from "@/src/app/components/ui/input";
import { Label } from "@/src/app/components/ui/label";
import { Badge } from "@/src/app/components/ui/badge";
import { Alert, AlertDescription } from "@/src/app/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/app/components/ui/tabs";
import { Slider } from "@/src/app/components/ui/slider";
import { 
  Palette, 
  Copy, 
  RotateCcw, 
  EyeDropper, 
  RefreshCw, 
  CheckCircle,
  AlertTriangle,
  Info,
  Zap,
  Settings,
  Download,
  History
} from "lucide-react";
import { CopyButton } from "@/src/app/components/ui/copy-button";

interface ColorValues {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
}

interface ColorHistory {
  id: string;
  color: ColorValues;
  timestamp: Date;
  name?: string;
}

const initialColor: ColorValues = {
  hex: "#3b82f6",
  rgb: { r: 59, g: 130, b: 246 },
  hsl: { h: 217, s: 91, l: 60 }
};

export default function ColorConverterPage() {
  const [currentColor, setCurrentColor] = useState<ColorValues>(initialColor);
  const [activeTab, setActiveTab] = useState("hex");
  const [error, setError] = useState("");
  const [colorHistory, setColorHistory] = useState<ColorHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Sample colors for quick testing
  const sampleColors = [
    { name: "Blue", hex: "#3b82f6", rgb: { r: 59, g: 130, b: 246 }, hsl: { h: 217, s: 91, l: 60 } },
    { name: "Red", hex: "#ef4444", rgb: { r: 239, g: 68, b: 68 }, hsl: { h: 0, s: 84, l: 60 } },
    { name: "Green", hex: "#22c55e", rgb: { r: 34, g: 197, b: 94 }, hsl: { h: 142, s: 76, l: 45 } },
    { name: "Purple", hex: "#8b5cf6", rgb: { r: 139, g: 92, b: 246 }, hsl: { h: 262, s: 83, l: 66 } },
    { name: "Orange", hex: "#f97316", rgb: { r: 249, g: 115, b: 22 }, hsl: { h: 25, s: 95, l: 53 } },
    { name: "Pink", hex: "#ec4899", rgb: { r: 236, g: 72, b: 153 }, hsl: { h: 330, s: 81, l: 60 } },
  ];

  // Convert HEX to RGB
  const hexToRgb = useCallback((hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }, []);

  // Convert RGB to HEX
  const rgbToHex = useCallback((r: number, g: number, b: number): string => {
    const toHex = (n: number) => {
      const hex = Math.round(n).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }, []);

  // Convert RGB to HSL
  const rgbToHsl = useCallback((r: number, g: number, b: number): { h: number; s: number; l: number } => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }, []);

  // Convert HSL to RGB
  const hslToRgb = useCallback((h: number, s: number, l: number): { r: number; g: number; b: number } => {
    h /= 360;
    s /= 100;
    l /= 100;

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }, []);

  // Update color from HEX
  const updateFromHex = useCallback((hex: string) => {
    setError("");
    if (!hex.startsWith('#')) {
      hex = '#' + hex;
    }
    
    const rgb = hexToRgb(hex);
    if (!rgb) {
      setError("Invalid HEX color format");
      return;
    }

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    setCurrentColor({ hex, rgb, hsl });
  }, [hexToRgb, rgbToHsl]);

  // Update color from RGB
  const updateFromRgb = useCallback((r: number, g: number, b: number) => {
    setError("");
    if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
      setError("RGB values must be between 0 and 255");
      return;
    }

    const hex = rgbToHex(r, g, b);
    const hsl = rgbToHsl(r, g, b);
    setCurrentColor({ hex, rgb: { r, g, b }, hsl });
  }, [rgbToHex, rgbToHsl]);

  // Update color from HSL
  const updateFromHsl = useCallback((h: number, s: number, l: number) => {
    setError("");
    if (h < 0 || h > 360 || s < 0 || s > 100 || l < 0 || l > 100) {
      setError("HSL values must be between 0-360 (H), 0-100 (S, L)");
      return;
    }

    const rgb = hslToRgb(h, s, l);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    setCurrentColor({ hex, rgb, hsl: { h, s, l } });
  }, [hslToRgb, rgbToHex]);

  // Add to history
  const addToHistory = useCallback((color: ColorValues) => {
    const newHistoryItem: ColorHistory = {
      id: Date.now().toString(),
      color,
      timestamp: new Date()
    };
    setColorHistory(prev => [newHistoryItem, ...prev.slice(0, 9)]); // Keep last 10
  }, []);

  // Load sample color
  const loadSample = useCallback((sample: typeof sampleColors[0]) => {
    setCurrentColor(sample);
    setError("");
  }, []);

  // Clear all
  const clearAll = useCallback(() => {
    setCurrentColor(initialColor);
    setError("");
  }, []);

  // Generate random color
  const generateRandomColor = useCallback(() => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    updateFromRgb(r, g, b);
  }, [updateFromRgb]);

  // Download color palette
  const downloadPalette = useCallback(() => {
    const cssContent = `/* Color Palette */
:root {
  --color-primary: ${currentColor.hex};
  --color-rgb: ${currentColor.rgb.r}, ${currentColor.rgb.g}, ${currentColor.rgb.b};
  --color-hsl: ${currentColor.hsl.h}deg, ${currentColor.hsl.s}%, ${currentColor.hsl.l}%;
}

/* Usage Examples */
.primary-bg {
  background-color: var(--color-primary);
}

.rgb-bg {
  background-color: rgb(var(--color-rgb));
}

.hsl-bg {
  background-color: hsl(var(--color-hsl));
}`;

    const blob = new Blob([cssContent], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'color-palette.css';
    a.click();
    URL.revokeObjectURL(url);
  }, [currentColor]);

  // Add to history when color changes
  useEffect(() => {
    addToHistory(currentColor);
  }, [currentColor, addToHistory]);

  // Get contrast color (black or white)
  const contrastColor = useMemo(() => {
    const { r, g, b } = currentColor.rgb;
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  }, [currentColor.rgb]);

  // Get color name (approximate)
  const colorName = useMemo(() => {
    const { r, g, b } = currentColor.rgb;
    const { h, s, l } = currentColor.hsl;
    
    if (s < 10) {
      if (l < 20) return "Black";
      if (l > 80) return "White";
      return "Gray";
    }
    
    if (h < 30 || h >= 330) return "Red";
    if (h < 60) return "Orange";
    if (h < 90) return "Yellow";
    if (h < 150) return "Green";
    if (h < 210) return "Cyan";
    if (h < 270) return "Blue";
    if (h < 330) return "Purple";
    
    return "Unknown";
  }, [currentColor.rgb, currentColor.hsl]);

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 animate-slide-in-left">Color Converter</h1>
          <p className="text-muted-foreground text-lg animate-slide-in-right">
            Convert between HEX, RGB, and HSL color formats with real-time preview
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Color Preview */}
          <div className="lg:col-span-1">
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  <span>Color Preview</span>
                  <Badge variant="outline">{colorName}</Badge>
                </CardTitle>
                <CardDescription>
                  Live preview of your color
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div 
                  className="w-full h-32 rounded-lg border-2 border-muted shadow-lg"
                  style={{ backgroundColor: currentColor.hex }}
                >
                  <div className="h-full flex items-center justify-center">
                    <span 
                      className="text-lg font-bold px-3 py-1 rounded"
                      style={{ color: contrastColor, backgroundColor: 'rgba(0,0,0,0.1)' }}
                    >
                      {currentColor.hex}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-center">
                    <div className="font-semibold">HEX</div>
                    <CopyButton
                      text={currentColor.hex}
                      variant="ghost"
                      size="sm"
                      className="w-full"
                    >
                      {currentColor.hex}
                    </CopyButton>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">RGB</div>
                    <CopyButton
                      text={`rgb(${currentColor.rgb.r}, ${currentColor.rgb.g}, ${currentColor.rgb.b})`}
                      variant="ghost"
                      size="sm"
                      className="w-full"
                    >
                      {currentColor.rgb.r}, {currentColor.rgb.g}, {currentColor.rgb.b}
                    </CopyButton>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">HSL</div>
                    <CopyButton
                      text={`hsl(${currentColor.hsl.h}, ${currentColor.hsl.s}%, ${currentColor.hsl.l}%)`}
                      variant="ghost"
                      size="sm"
                      className="w-full"
                    >
                      {currentColor.hsl.h}°, {currentColor.hsl.s}%, {currentColor.hsl.l}%
                    </CopyButton>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={generateRandomColor}
                    variant="outline"
                    size="sm"
                    className="flex-1 hover-lift"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Random
                  </Button>
                  <Button
                    onClick={downloadPalette}
                    variant="outline"
                    size="sm"
                    className="hover-lift"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    CSS
                  </Button>
                  <Button
                    onClick={clearAll}
                    variant="outline"
                    size="sm"
                    className="hover-lift"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Converter */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  <span>Color Converter</span>
                </CardTitle>
                <CardDescription>
                  Input color in any format to convert between HEX, RGB, and HSL
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="hex">HEX</TabsTrigger>
                    <TabsTrigger value="rgb">RGB</TabsTrigger>
                    <TabsTrigger value="hsl">HSL</TabsTrigger>
                  </TabsList>

                  <TabsContent value="hex" className="space-y-4">
                    <div>
                      <Label htmlFor="hex-input">HEX Color</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          id="hex-input"
                          value={currentColor.hex}
                          onChange={(e) => updateFromHex(e.target.value)}
                          placeholder="#3b82f6"
                          className="flex-1"
                        />
                        <div 
                          className="w-12 h-10 rounded border"
                          style={{ backgroundColor: currentColor.hex }}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="rgb" className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Red (0-255)</Label>
                        <Slider
                          value={[currentColor.rgb.r]}
                          onValueChange={(value) => updateFromRgb(value[0], currentColor.rgb.g, currentColor.rgb.b)}
                          max={255}
                          min={0}
                          step={1}
                          className="mt-2"
                        />
                        <Input
                          value={currentColor.rgb.r}
                          onChange={(e) => updateFromRgb(parseInt(e.target.value) || 0, currentColor.rgb.g, currentColor.rgb.b)}
                          type="number"
                          min={0}
                          max={255}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>Green (0-255)</Label>
                        <Slider
                          value={[currentColor.rgb.g]}
                          onValueChange={(value) => updateFromRgb(currentColor.rgb.r, value[0], currentColor.rgb.b)}
                          max={255}
                          min={0}
                          step={1}
                          className="mt-2"
                        />
                        <Input
                          value={currentColor.rgb.g}
                          onChange={(e) => updateFromRgb(currentColor.rgb.r, parseInt(e.target.value) || 0, currentColor.rgb.b)}
                          type="number"
                          min={0}
                          max={255}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>Blue (0-255)</Label>
                        <Slider
                          value={[currentColor.rgb.b]}
                          onValueChange={(value) => updateFromRgb(currentColor.rgb.r, currentColor.rgb.g, value[0])}
                          max={255}
                          min={0}
                          step={1}
                          className="mt-2"
                        />
                        <Input
                          value={currentColor.rgb.b}
                          onChange={(e) => updateFromRgb(currentColor.rgb.r, currentColor.rgb.g, parseInt(e.target.value) || 0)}
                          type="number"
                          min={0}
                          max={255}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="hsl" className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Hue (0-360°)</Label>
                        <Slider
                          value={[currentColor.hsl.h]}
                          onValueChange={(value) => updateFromHsl(value[0], currentColor.hsl.s, currentColor.hsl.l)}
                          max={360}
                          min={0}
                          step={1}
                          className="mt-2"
                        />
                        <Input
                          value={currentColor.hsl.h}
                          onChange={(e) => updateFromHsl(parseInt(e.target.value) || 0, currentColor.hsl.s, currentColor.hsl.l)}
                          type="number"
                          min={0}
                          max={360}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>Saturation (0-100%)</Label>
                        <Slider
                          value={[currentColor.hsl.s]}
                          onValueChange={(value) => updateFromHsl(currentColor.hsl.h, value[0], currentColor.hsl.l)}
                          max={100}
                          min={0}
                          step={1}
                          className="mt-2"
                        />
                        <Input
                          value={currentColor.hsl.s}
                          onChange={(e) => updateFromHsl(currentColor.hsl.h, parseInt(e.target.value) || 0, currentColor.hsl.l)}
                          type="number"
                          min={0}
                          max={100}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>Lightness (0-100%)</Label>
                        <Slider
                          value={[currentColor.hsl.l]}
                          onValueChange={(value) => updateFromHsl(currentColor.hsl.h, currentColor.hsl.s, value[0])}
                          max={100}
                          min={0}
                          step={1}
                          className="mt-2"
                        />
                        <Input
                          value={currentColor.hsl.l}
                          onChange={(e) => updateFromHsl(currentColor.hsl.h, currentColor.hsl.s, parseInt(e.target.value) || 0)}
                          type="number"
                          min={0}
                          max={100}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                {error && (
                  <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950 mt-4">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800 dark:text-red-200">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Sample Colors */}
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <EyeDropper className="h-5 w-5" />
                  <span>Sample Colors</span>
                </CardTitle>
                <CardDescription>
                  Quick access to common colors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {sampleColors.map((sample, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={() => loadSample(sample)}
                      className="h-16 p-0 hover-lift"
                      style={{ backgroundColor: sample.hex }}
                    >
                      <span 
                        className="text-xs font-bold px-2 py-1 rounded"
                        style={{ 
                          color: (sample.rgb.r * 299 + sample.rgb.g * 587 + sample.rgb.b * 114) / 1000 > 128 ? '#000000' : '#ffffff',
                          backgroundColor: 'rgba(0,0,0,0.1)'
                        }}
                      >
                        {sample.name}
                      </span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Color History */}
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  <span>Recent Colors</span>
                  {colorHistory.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setColorHistory([])}
                    >
                      Clear
                    </Button>
                  )}
                </CardTitle>
                <CardDescription>
                  Your recently converted colors
                </CardDescription>
              </CardHeader>
              <CardContent>
                {colorHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No color history yet</p>
                    <p className="text-sm mt-2">
                      Convert colors to see them here
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {colorHistory.slice(0, 8).map((item) => (
                      <Button
                        key={item.id}
                        variant="outline"
                        onClick={() => setCurrentColor(item.color)}
                        className="h-12 p-0 hover-lift"
                        style={{ backgroundColor: item.color.hex }}
                      >
                        <span 
                          className="text-xs font-bold px-2 py-1 rounded"
                          style={{ 
                            color: (item.color.rgb.r * 299 + item.color.rgb.g * 587 + item.color.rgb.b * 114) / 1000 > 128 ? '#000000' : '#ffffff',
                            backgroundColor: 'rgba(0,0,0,0.1)'
                          }}
                        >
                          {item.color.hex}
                        </span>
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Info Card */}
        <Card className="card-enhanced mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Color Format Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold">HEX Colors</h3>
                <p className="text-sm text-muted-foreground">
                  Six-digit hexadecimal values starting with #. Each pair represents red, green, and blue values from 00 to FF.
                </p>
                <p className="text-sm text-muted-foreground">
                  Example: #3b82f6 represents a blue color
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">RGB Colors</h3>
                <p className="text-sm text-muted-foreground">
                  Red, Green, Blue values from 0 to 255. Each component controls the intensity of that color channel.
                </p>
                <p className="text-sm text-muted-foreground">
                  Example: rgb(59, 130, 246) creates the same blue color
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">HSL Colors</h3>
                <p className="text-sm text-muted-foreground">
                  Hue (0-360°), Saturation (0-100%), Lightness (0-100%). More intuitive for color adjustments.
                </p>
                <p className="text-sm text-muted-foreground">
                  Example: hsl(217, 91%, 60%) creates the same blue color
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
