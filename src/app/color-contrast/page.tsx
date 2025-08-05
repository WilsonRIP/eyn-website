"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Button } from "@/src/app/components/ui/button";
import { Input } from "@/src/app/components/ui/input";
import { Label } from "@/src/app/components/ui/label";
import { Badge } from "@/src/app/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/app/components/ui/tabs";
import { Copy, Eye, Palette, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { toast } from "react-hot-toast";
import { Sketch } from '@uiw/react-color';

export default function ColorContrastCheckerPage() {
  const [foregroundColor, setForegroundColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [contrastRatio, setContrastRatio] = useState(0);
  const [wcagResults, setWcagResults] = useState({
    AA: { normal: false, large: false },
    AAA: { normal: false, large: false }
  });
  const [copyAnimation, setCopyAnimation] = useState<string | null>(null);
  const [showForegroundPicker, setShowForegroundPicker] = useState(false);
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);

  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // Calculate relative luminance
  const getLuminance = (r: number, g: number, b: number) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  // Calculate contrast ratio
  const calculateContrastRatio = (color1: string, color2: string) => {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return 0;
    
    const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
    
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  };

  // Check WCAG compliance
  const checkWCAGCompliance = (ratio: number) => {
    return {
      AA: {
        normal: ratio >= 4.5,
        large: ratio >= 3
      },
      AAA: {
        normal: ratio >= 7,
        large: ratio >= 4.5
      }
    };
  };

  // Generate accessible color suggestions
  const generateSuggestions = (currentColor: string, isForeground: boolean) => {
    const suggestions: string[] = [];
    const baseColor = hexToRgb(currentColor);
    if (!baseColor) return suggestions;

    // Generate lighter and darker variations
    for (let i = 1; i <= 5; i++) {
      const factor = i * 0.1;
      
      // Lighter version
      const lighter = {
        r: Math.min(255, Math.round(baseColor.r + (255 - baseColor.r) * factor)),
        g: Math.min(255, Math.round(baseColor.g + (255 - baseColor.g) * factor)),
        b: Math.min(255, Math.round(baseColor.b + (255 - baseColor.b) * factor))
      };
      
      // Darker version
      const darker = {
        r: Math.max(0, Math.round(baseColor.r * (1 - factor))),
        g: Math.max(0, Math.round(baseColor.g * (1 - factor))),
        b: Math.max(0, Math.round(baseColor.b * (1 - factor)))
      };
      
      const lighterHex = `#${lighter.r.toString(16).padStart(2, '0')}${lighter.g.toString(16).padStart(2, '0')}${lighter.b.toString(16).padStart(2, '0')}`;
      const darkerHex = `#${darker.r.toString(16).padStart(2, '0')}${darker.g.toString(16).padStart(2, '0')}${darker.b.toString(16).padStart(2, '0')}`;
      
      suggestions.push(lighterHex, darkerHex);
    }
    
    return suggestions.slice(0, 6); // Return top 6 suggestions
  };

  useEffect(() => {
    const ratio = calculateContrastRatio(foregroundColor, backgroundColor);
    setContrastRatio(ratio);
    setWcagResults(checkWCAGCompliance(ratio));
  }, [foregroundColor, backgroundColor]);

  const copyColor = (color: string) => {
    navigator.clipboard.writeText(color)
      .then(() => {
        toast.success("Color copied to clipboard!");
        setCopyAnimation(color);
        setTimeout(() => setCopyAnimation(null), 1000);
      })
      .catch(() => toast.error("Failed to copy color."));
  };

  const getContrastRating = (ratio: number) => {
    if (ratio >= 7) return { label: "Excellent", color: "bg-green-500", icon: <CheckCircle className="h-4 w-4" /> };
    if (ratio >= 4.5) return { label: "Good", color: "bg-blue-500", icon: <CheckCircle className="h-4 w-4" /> };
    if (ratio >= 3) return { label: "Fair", color: "bg-yellow-500", icon: <AlertTriangle className="h-4 w-4" /> };
    return { label: "Poor", color: "bg-red-500", icon: <XCircle className="h-4 w-4" /> };
  };

  const rating = getContrastRating(contrastRatio);

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Color Contrast Checker</h1>
          <p className="text-muted-foreground text-lg mt-2">
            Check color contrast ratios for accessibility compliance
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Color Input Section */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Color Selection
              </CardTitle>
              <CardDescription>
                Choose your foreground and background colors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Foreground Color</Label>
                  <div className="flex gap-2 mt-2">
                    <div className="relative">
                      <div
                        className="w-16 h-10 rounded border cursor-pointer hover:shadow-md transition-shadow"
                        style={{ backgroundColor: foregroundColor }}
                        onClick={() => setShowForegroundPicker(!showForegroundPicker)}
                      />
                      {showForegroundPicker && (
                        <div className="absolute top-12 left-0 z-50">
                          <Sketch
                            color={foregroundColor}
                            onChange={(color) => {
                              setForegroundColor(color.hex);
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <Input
                      type="text"
                      value={foregroundColor}
                      onChange={(e) => setForegroundColor(e.target.value)}
                      placeholder="#000000"
                      className="flex-1"
                    />
                    <Button
                      onClick={() => copyColor(foregroundColor)}
                      variant="outline"
                      size="sm"
                      className={`btn-enhanced hover-lift transition-all duration-300 ${
                        copyAnimation === foregroundColor ? 'scale-110 bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-700' : ''
                      }`}
                    >
                      <Copy className={`h-4 w-4 transition-all duration-300 ${
                        copyAnimation === foregroundColor ? 'text-green-600 dark:text-green-400' : ''
                      }`} />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Background Color</Label>
                  <div className="flex gap-2 mt-2">
                    <div className="relative">
                      <div
                        className="w-16 h-10 rounded border cursor-pointer hover:shadow-md transition-shadow"
                        style={{ backgroundColor: backgroundColor }}
                        onClick={() => setShowBackgroundPicker(!showBackgroundPicker)}
                      />
                      {showBackgroundPicker && (
                        <div className="absolute top-12 left-0 z-50">
                          <Sketch
                            color={backgroundColor}
                            onChange={(color) => {
                              setBackgroundColor(color.hex);
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <Input
                      type="text"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      placeholder="#FFFFFF"
                      className="flex-1"
                    />
                    <Button
                      onClick={() => copyColor(backgroundColor)}
                      variant="outline"
                      size="sm"
                      className={`btn-enhanced hover-lift transition-all duration-300 ${
                        copyAnimation === backgroundColor ? 'scale-110 bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-700' : ''
                      }`}
                    >
                      <Copy className={`h-4 w-4 transition-all duration-300 ${
                        copyAnimation === backgroundColor ? 'text-green-600 dark:text-green-400' : ''
                      }`} />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-2">
                <Label>Preview</Label>
                <div
                  className="p-4 rounded-lg border"
                  style={{ backgroundColor: backgroundColor }}
                >
                  <p style={{ color: foregroundColor }} className="text-lg font-medium">
                    Sample Text
                  </p>
                  <p style={{ color: foregroundColor }} className="text-sm">
                    This is how your text will appear with the selected colors.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Contrast Analysis
              </CardTitle>
              <CardDescription>
                WCAG 2.1 compliance results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Contrast Ratio */}
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold mb-2">
                  {contrastRatio.toFixed(2)}:1
                </div>
                <Badge className={`${rating.color} text-white`}>
                  <span className="flex items-center gap-1">
                    {rating.icon}
                    {rating.label}
                  </span>
                </Badge>
              </div>

              {/* WCAG Compliance */}
              <div className="space-y-4">
                <h3 className="font-semibold">WCAG 2.1 Compliance</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">AA Level (Normal Text)</div>
                      <div className="text-sm text-muted-foreground">Minimum 4.5:1</div>
                    </div>
                    <Badge variant={wcagResults.AA.normal ? "default" : "destructive"}>
                      {wcagResults.AA.normal ? "Pass" : "Fail"}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">AA Level (Large Text)</div>
                      <div className="text-sm text-muted-foreground">Minimum 3:1</div>
                    </div>
                    <Badge variant={wcagResults.AA.large ? "default" : "destructive"}>
                      {wcagResults.AA.large ? "Pass" : "Fail"}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">AAA Level (Normal Text)</div>
                      <div className="text-sm text-muted-foreground">Minimum 7:1</div>
                    </div>
                    <Badge variant={wcagResults.AAA.normal ? "default" : "destructive"}>
                      {wcagResults.AAA.normal ? "Pass" : "Fail"}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">AAA Level (Large Text)</div>
                      <div className="text-sm text-muted-foreground">Minimum 4.5:1</div>
                    </div>
                    <Badge variant={wcagResults.AAA.large ? "default" : "destructive"}>
                      {wcagResults.AAA.large ? "Pass" : "Fail"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Color Suggestions */}
        <Tabs defaultValue="foreground" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="foreground">Foreground Suggestions</TabsTrigger>
            <TabsTrigger value="background">Background Suggestions</TabsTrigger>
          </TabsList>

          <TabsContent value="foreground" className="space-y-4">
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle>Alternative Foreground Colors</CardTitle>
                <CardDescription>
                  Suggested colors that would work better with your background
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {generateSuggestions(backgroundColor, false).map((color, index) => {
                    const ratio = calculateContrastRatio(color, backgroundColor);
                    const suggestionRating = getContrastRating(ratio);
                    return (
                      <div
                        key={index}
                        className="text-center p-3 border rounded-lg cursor-pointer hover:shadow-md transition-all duration-300 group"
                        onClick={() => setForegroundColor(color)}
                      >
                        <div
                          className="w-full h-12 rounded mb-2 border relative"
                          style={{ backgroundColor: color }}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/80 hover:bg-white text-black"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyColor(color);
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-xs font-mono mb-1">{color}</div>
                        <Badge className={`${suggestionRating.color} text-white text-xs`}>
                          {ratio.toFixed(1)}:1
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="background" className="space-y-4">
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle>Alternative Background Colors</CardTitle>
                <CardDescription>
                  Suggested colors that would work better with your foreground
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {generateSuggestions(foregroundColor, true).map((color, index) => {
                    const ratio = calculateContrastRatio(foregroundColor, color);
                    const suggestionRating = getContrastRating(ratio);
                    return (
                      <div
                        key={index}
                        className="text-center p-3 border rounded-lg cursor-pointer hover:shadow-md transition-all duration-300 group"
                        onClick={() => setBackgroundColor(color)}
                      >
                        <div
                          className="w-full h-12 rounded mb-2 border relative"
                          style={{ backgroundColor: color }}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/80 hover:bg-white text-black"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyColor(color);
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-xs font-mono mb-1">{color}</div>
                        <Badge className={`${suggestionRating.color} text-white text-xs`}>
                          {ratio.toFixed(1)}:1
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle>WCAG Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <strong>AA Level:</strong> Minimum standard for most websites
                </div>
                <div>
                  <strong>AAA Level:</strong> Enhanced accessibility for sensitive content
                </div>
                <div>
                  <strong>Normal Text:</strong> Text smaller than 18pt or 14pt bold
                </div>
                <div>
                  <strong>Large Text:</strong> Text 18pt+ or 14pt+ bold
                </div>
                <div>
                  <strong>UI Components:</strong> Icons and graphics require 3:1 ratio
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle>Contrast Ratio Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span><strong>7:1+ (Excellent):</strong> AAA compliant, highly accessible</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span><strong>4.5:1+ (Good):</strong> AA compliant, good accessibility</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span><strong>3:1+ (Fair):</strong> AA large text compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span><strong>&lt;3:1 (Poor):</strong> Not accessible, needs improvement</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 