"use client";

import React, { useState } from "react";
import { Input } from "@/src/app/components/ui/input";
import { Button } from "@/src/app/components/ui/button";
import { Label } from "@/src/app/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

export default function SiteCopier() {
  const [pageUrl, setPageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCopy = async () => {
    if (!pageUrl.trim()) {
      setError("Enter a valid URL");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/clone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: pageUrl.trim() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.details || res.statusText);
      }
      const blob = await res.blob();
      const dlUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = dlUrl;
      a.download = "site-copy.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(dlUrl);
      toast.success("Download started!");
      setPageUrl("");
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to clone site");
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="site-url">Website URL</Label>
        <Input
          id="site-url"
          type="url"
          placeholder="https://example.com"
          value={pageUrl}
          onChange={(e) => {
            setPageUrl(e.target.value);
            setError(null);
          }}
          disabled={loading}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
      <Button
        onClick={handleCopy}
        disabled={loading || !pageUrl.trim()}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Cloning…
          </>
        ) : (
          "Clone Website"
        )}
      </Button>
    </div>
  );
}
