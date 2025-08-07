"use client";

import { useState } from "react";
import { Button } from "@/src/app/components/ui/button";
import { Copy, Check } from "lucide-react";
import { cn } from "@/src/app/lib/utils";

interface CopyButtonProps {
  text: string;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  children?: React.ReactNode;
  onCopy?: () => void;
  successMessage?: string;
}

export function CopyButton({
  text,
  className,
  variant = "outline",
  size = "sm",
  children,
  onCopy,
  successMessage = "Copied!"
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopy?.();
      
      // Reset after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  return (
    <Button
      onClick={handleCopy}
      variant={variant}
      size={size}
      className={cn(
        "transition-all duration-200 hover:scale-105 active:scale-95",
        copied && "bg-green-500 hover:bg-green-600 text-white",
        className
      )}
      disabled={copied}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 mr-2 animate-pulse" />
          {successMessage}
        </>
      ) : (
        <>
          <Copy className="h-4 w-4 mr-2" />
          {children || "Copy"}
        </>
      )}
    </Button>
  );
}
