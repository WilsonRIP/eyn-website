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
import { Download as DownloadIcon } from "lucide-react";

type Mode = "url" | "text" | "contact";

export default function QRPage() {
  const [mode, setMode] = useState<Mode>("url");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Compute the actual payload for the QR
  let payload = "";
  if (mode === "url") {
    payload = url.trim();
  } else if (mode === "text") {
    payload = text;
  } else {
    // vCard format
    payload = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `N:${last};${first}`,
      `FN:${first} ${last}`.trim(),
      phone ? `TEL:${phone}` : "",
      email ? `EMAIL:${email}` : "",
      "END:VCARD",
    ]
      .filter((line) => line)
      .join("\n");
  }

  const svgContainerRef = useRef<HTMLDivElement | null>(null);

  const handleDownload = () => {
    const container = svgContainerRef.current;
    if (!container) return;

    // find the actual <svg> element inside
    const svgEl = container.querySelector("svg");
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

  return (
    <div className="flex min-h-screen items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-md card-enhanced">
        <CardHeader>
          <CardTitle>QR Code Generator</CardTitle>
          <CardDescription>
            Quickly generate QR codes for URLs, text, or contact info.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Mode</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as Mode)}>
              <SelectTrigger>
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="url">URL</SelectItem>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="contact">Contact</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {mode === "url" && (
            <div className="space-y-2">
              <Label htmlFor="q-url">Enter URL</Label>
              <Input
                id="q-url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
          )}

          {mode === "text" && (
            <div className="space-y-2">
              <Label htmlFor="q-text">Enter Text</Label>
              <Input
                id="q-text"
                type="text"
                placeholder="Any text…"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
          )}

          {mode === "contact" && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="q-first">First Name</Label>
                  <Input
                    id="q-first"
                    value={first}
                    onChange={(e) => setFirst(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="q-last">Last Name</Label>
                  <Input
                    id="q-last"
                    value={last}
                    onChange={(e) => setLast(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="q-phone">Phone</Label>
                  <Input
                    id="q-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="q-email">Email</Label>
                  <Input
                    id="q-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          <CardFooter className="flex flex-col items-center">
            {!payload ? (
              <p className="text-sm text-muted-foreground">Enter input above</p>
            ) : (
              <>
                <div
                  ref={svgContainerRef}
                  className="bg-white p-4 rounded"
                  style={{ width: "auto", display: "inline-block" }}
                >
                  <QRCode value={payload} />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDownload}
                  className="mt-4 btn-enhanced hover-lift"
                >
                  <DownloadIcon className="mr-2 h-4 w-4" /> Download SVG
                </Button>
              </>
            )}
          </CardFooter>
        </CardContent>
      </Card>
    </div>
  );
}
