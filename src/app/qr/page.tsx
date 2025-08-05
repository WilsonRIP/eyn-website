// src/app/qr/page.tsx
"use client";

import React, { useState, useRef } from "react";
import QRCode from "react-qr-code";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/app/components/ui/accordion";
import { Slider } from "@/src/app/components/ui/slider";
import { Download as DownloadIcon, XCircle, Settings } from "lucide-react";

// --- NEW ---: Expanded types for more modes and customization
type Mode = "url" | "text" | "contact" | "wifi";
type Level = "L" | "M" | "Q" | "H";
type Encryption = "WPA" | "WEP" | "nopass";

const INITIAL_STATE = {
  mode: "url" as Mode,
  url: "",
  text: "",
  first: "",
  last: "",
  phone: "",
  email: "",
  ssid: "",
  password: "",
  encryption: "WPA" as Encryption,
  fgColor: "#000000",
  bgColor: "#ffffff",
  level: "L" as Level,
  size: 256,
};

export default function QRPage() {
  const [state, setState] = useState(INITIAL_STATE);

  // Helper to update state easily
  const updateState = (update: Partial<typeof INITIAL_STATE>) => {
    setState((prev) => ({ ...prev, ...update }));
  };
  
  const resetState = () => setState(INITIAL_STATE);

  // Compute the actual payload for the QR
  let payload = "";
  if (state.mode === "url") {
    payload = state.url.trim();
  } else if (state.mode === "text") {
    payload = state.text;
  } else if (state.mode === "wifi") {
    // --- NEW ---: WiFi payload format
    payload = `WIFI:S:${state.ssid};T:${state.encryption};P:${state.password};;`;
  } else {
    // vCard format
    payload = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `N:${state.last};${state.first}`,
      `FN:${state.first} ${state.last}`.trim(),
      state.phone ? `TEL:${state.phone}` : "",
      state.email ? `EMAIL:${state.email}` : "",
      "END:VCARD",
    ]
      .filter((line) => line)
      .join("\n");
  }

  const svgContainerRef = useRef<HTMLDivElement | null>(null);

  // --- REFINED ---: SVG Download Logic (no major change)
  const handleSvgDownload = () => {
    const svgEl = svgContainerRef.current?.querySelector("svg");
    if (!svgEl) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgEl);
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = "qrcode.svg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // --- NEW ---: PNG Download Logic
  const handlePngDownload = () => {
    const svgEl = svgContainerRef.current?.querySelector("svg");
    if (!svgEl) return;

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const canvas = document.createElement("canvas");
    // Get the size from the SVG element to maintain aspect ratio
    const svgSize = svgEl.getBoundingClientRect();
    canvas.width = svgSize.width;
    canvas.height = svgSize.height;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Draw the background color
      ctx.fillStyle = state.bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Draw the SVG QR code
      ctx.drawImage(img, 0, 0);
      
      const pngFile = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = pngFile;
      a.download = "qrcode.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-lg card-enhanced">
        <CardHeader>
          <CardTitle>QR Code Generator</CardTitle>
          <CardDescription>
            Generate and customize QR codes for URLs, text, contacts, and WiFi.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Mode</Label>
            <Select value={state.mode} onValueChange={(v) => updateState({ mode: v as Mode })}>
              <SelectTrigger>
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="url">URL</SelectItem>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="contact">Contact (vCard)</SelectItem>
                <SelectItem value="wifi">WiFi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {state.mode === "url" && (
            <div className="space-y-2 animate-fade-in-fast">
              <Label htmlFor="q-url">Enter URL</Label>
              <Input id="q-url" type="url" placeholder="https://example.com" value={state.url} onChange={(e) => updateState({ url: e.target.value })} />
            </div>
          )}

          {state.mode === "text" && (
            <div className="space-y-2 animate-fade-in-fast">
              <Label htmlFor="q-text">Enter Text</Label>
              <Input id="q-text" placeholder="Any text you want to encode..." value={state.text} onChange={(e) => updateState({ text: e.target.value })} />
            </div>
          )}

          {state.mode === "contact" && (
             <div className="space-y-3 animate-fade-in-fast">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                    <Label htmlFor="q-first">First Name</Label>
                    <Input id="q-first" placeholder="John" value={state.first} onChange={(e) => updateState({ first: e.target.value })}/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="q-last">Last Name</Label>
                    <Input id="q-last" placeholder="Appleseed" value={state.last} onChange={(e) => updateState({ last: e.target.value })}/>
                </div>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="q-phone">Phone</Label>
                  <Input id="q-phone" type="tel" placeholder="+1 (555) 123-4567" value={state.phone} onChange={(e) => updateState({ phone: e.target.value })}/>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="q-email">Email</Label>
                  <Input id="q-email" type="email" placeholder="john.appleseed@email.com" value={state.email} onChange={(e) => updateState({ email: e.target.value })}/>
              </div>
            </div>
          )}
          
          {/* --- NEW ---: WiFi Form */}
          {state.mode === "wifi" && (
            <div className="space-y-3 animate-fade-in-fast">
               <div className="space-y-2">
                  <Label htmlFor="q-ssid">Network Name (SSID)</Label>
                  <Input id="q-ssid" placeholder="My Home WiFi" value={state.ssid} onChange={(e) => updateState({ ssid: e.target.value })}/>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="q-password">Password</Label>
                  <Input id="q-password" type="password" placeholder="Network password" value={state.password} onChange={(e) => updateState({ password: e.target.value })}/>
              </div>
              <div className="space-y-2">
                  <Label>Encryption</Label>
                   <Select value={state.encryption} onValueChange={(v) => updateState({ encryption: v as Encryption })}>
                      <SelectTrigger><SelectValue/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WPA">WPA/WPA2</SelectItem>
                        <SelectItem value="WEP">WEP</SelectItem>
                        <SelectItem value="nopass">None (Open Network)</SelectItem>
                      </SelectContent>
                   </Select>
              </div>
            </div>
          )}
          
          {/* --- NEW ---: Customization Accordion */}
           <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" /> Customization Options
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Foreground Color</Label>
                        <Input type="color" value={state.fgColor} onChange={(e) => updateState({ fgColor: e.target.value })} className="p-1 h-10"/>
                    </div>
                    <div className="space-y-2">
                        <Label>Background Color</Label>
                        <Input type="color" value={state.bgColor} onChange={(e) => updateState({ bgColor: e.target.value })} className="p-1 h-10"/>
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label>Size: {state.size}px</Label>
                    <Slider value={[state.size]} onValueChange={(v) => updateState({size: v[0]})} min={64} max={1024} step={8}/>
                 </div>
                 <div className="space-y-2">
                    <Label>Error Correction</Label>
                     <Select value={state.level} onValueChange={(v) => updateState({ level: v as Level })}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="L">Low (L)</SelectItem>
                          <SelectItem value="M">Medium (M)</SelectItem>
                          <SelectItem value="Q">Quartile (Q)</SelectItem>
                          <SelectItem value="H">High (H)</SelectItem>
                        </SelectContent>
                     </Select>
                     <p className="text-xs text-muted-foreground pt-1">Higher levels can recover from more damage, but increase QR code density.</p>
                 </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

        </CardContent>

        <CardFooter className="flex flex-col items-center gap-4 pt-4">
          {!payload ? (
            <p className="text-sm text-muted-foreground p-8">Enter data to generate your QR Code</p>
          ) : (
            <>
              <div
                ref={svgContainerRef}
                className="p-4 rounded-lg"
                style={{ background: state.bgColor }} // Use state for live bg preview
              >
                <QRCode
                  value={payload}
                  size={state.size}
                  fgColor={state.fgColor}
                  bgColor={state.bgColor}
                  level={state.level}
                />
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <Button type="button" variant="outline" onClick={handleSvgDownload} className="btn-enhanced hover-lift">
                  <DownloadIcon className="mr-2 h-4 w-4" /> Download SVG
                </Button>
                <Button type="button" variant="outline" onClick={handlePngDownload} className="btn-enhanced hover-lift">
                  <DownloadIcon className="mr-2 h-4 w-4" /> Download PNG
                </Button>
                <Button type="button" variant="ghost" onClick={resetState} className="text-muted-foreground hover-lift">
                  <XCircle className="mr-2 h-4 w-4" /> Reset
                </Button>
              </div>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}