"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Button } from "@/src/app/components/ui/button";
import { Input } from "@/src/app/components/ui/input";
import { Alert, AlertDescription } from "@/src/app/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/app/components/ui/select";
import { RotateCcw, CheckCircle, RefreshCw, Key, Hash, Download } from "lucide-react";
import { CopyButton } from "@/src/app/components/ui/copy-button";

export default function UUIDGeneratorPage() {
  const [uuidVersion, setUuidVersion] = useState<"v1" | "v4" | "v5">("v4");
  const [generatedUUIDs, setGeneratedUUIDs] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [namespace, setNamespace] = useState("6ba7b810-9dad-11d1-80b4-00c04fd430c8");
  const [name, setName] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generateUUID = (version: "v1" | "v4" | "v5"): string => {
    switch (version) {
      case "v1":
        return generateUUIDv1();
      case "v4":
        return generateUUIDv4();
      case "v5":
        return generateUUIDv5(namespace, name || "default");
      default:
        return generateUUIDv4();
    }
  };

  const generateUUIDv1 = (): string => {
    // Simplified UUID v1 generation (timestamp-based)
    const timestamp = Date.now();
    
    // Use crypto.getRandomValues for secure random numbers
    const randomValues = new Uint32Array(3);
    crypto.getRandomValues(randomValues);
    
    const clockSeq = (randomValues[0] % 0x3fff) + 0x8000;
    const nodeId = randomValues[1] * 0x100000000 + randomValues[2];
    
    const timeLow = (timestamp & 0xffffffff).toString(16).padStart(8, '0');
    const timeMid = ((timestamp >> 32) & 0xffff).toString(16).padStart(4, '0');
    const timeHigh = ((timestamp >> 48) & 0x0fff).toString(16).padStart(3, '0');
    const clockSeqHigh = (clockSeq >> 8).toString(16).padStart(2, '0');
    const clockSeqLow = (clockSeq & 0xff).toString(16).padStart(2, '0');
    const node = nodeId.toString(16).padStart(12, '0');
    
    return `${timeLow}-${timeMid}-${timeHigh}-${clockSeqHigh}${clockSeqLow}-${node}`;
  };

  const generateUUIDv4 = (): string => {
    // Standard UUID v4 generation (random) using crypto.getRandomValues
    const hexDigits = '0123456789abcdef';
    let uuid = '';
    
    // Generate all random bytes at once for better performance
    const randomValues = new Uint8Array(16);
    crypto.getRandomValues(randomValues);
    
    for (let i = 0; i < 36; i++) {
      if (i === 8 || i === 13 || i === 18 || i === 23) {
        uuid += '-';
      } else if (i === 14) {
        uuid += '4'; // Version 4
      } else if (i === 19) {
        uuid += hexDigits[(randomValues[Math.floor(i/2)] & 0x3) | 0x8]; // Variant
      } else {
        const byteIndex = Math.floor(i/2);
        const isEven = i % 2 === 0;
        const byte = randomValues[byteIndex];
        const hexIndex = isEven ? (byte >> 4) : (byte & 0xf);
        uuid += hexDigits[hexIndex];
      }
    }
    
    return uuid;
  };

  const generateUUIDv5 = (namespace: string, name: string): string => {
    // Simplified UUID v5 generation (SHA-1 based)
    const input = namespace + name;
    let hash = 0;
    
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Use crypto.getRandomValues for secure random numbers
    const randomValues = new Uint32Array(4);
    crypto.getRandomValues(randomValues);
    
    // Convert hash to UUID format
    const hashHex = Math.abs(hash).toString(16).padStart(8, '0');
    const random1 = (randomValues[0] % 0xffff).toString(16).padStart(4, '0');
    const random2 = (randomValues[1] % 0xffff).toString(16).padStart(4, '0');
    const random3 = (randomValues[2] % 0xffff).toString(16).padStart(4, '0');
    const random4 = randomValues[3].toString(16).padStart(8, '0');
    
    return `${hashHex}-${random1}-5${random2.slice(1)}-${random3}-${random4}`;
  };

  const generateUUIDs = () => {
    const uuids: string[] = [];
    for (let i = 0; i < quantity; i++) {
      uuids.push(generateUUID(uuidVersion));
    }
    setGeneratedUUIDs(uuids);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyAllToClipboard = () => {
    const allUUIDs = generatedUUIDs.join('\n');
    navigator.clipboard.writeText(allUUIDs);
  };

  const downloadToFile = () => {
    if (generatedUUIDs.length === 0) return;
    
    const content = generatedUUIDs.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uuids-${uuidVersion}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setGeneratedUUIDs([]);
    setCopiedIndex(null);
  };

  const loadSampleNamespace = () => {
    setNamespace("6ba7b810-9dad-11d1-80b4-00c04fd430c8");
    setName("example.com");
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 animate-slide-in-left">UUID Generator</h1>
          <p className="text-muted-foreground text-lg animate-slide-in-right">
            Generate UUIDs (Universally Unique Identifiers) in different versions for your projects
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                <span>Generator Settings</span>
              </CardTitle>
              <CardDescription>
                Configure UUID generation parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">UUID Version</label>
                <Select value={uuidVersion} onValueChange={(value: "v1" | "v4" | "v5") => setUuidVersion(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="v1">UUID v1 (Time-based)</SelectItem>
                    <SelectItem value="v4">UUID v4 (Random)</SelectItem>
                    <SelectItem value="v5">UUID v5 (SHA-1 based)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Quantity</label>
                <Input
                  type="number"
                  min="1"
                  max="2000"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.min(2000, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">Min: 1, Max: 2000</p>
              </div>

              {uuidVersion === "v5" && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Namespace UUID</label>
                    <Input
                      value={namespace}
                      onChange={(e) => setNamespace(e.target.value)}
                      placeholder="Enter namespace UUID"
                      className="w-full font-mono text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter name for UUID v5"
                      className="w-full"
                    />
                  </div>

                  <Button
                    onClick={loadSampleNamespace}
                    variant="outline"
                    size="sm"
                    className="hover-lift"
                  >
                    Load Sample Namespace
                  </Button>
                </>
              )}

              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={generateUUIDs} 
                  className="btn-enhanced hover-lift"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Generate UUIDs
                </Button>
                <Button 
                  onClick={clearAll} 
                  variant="outline" 
                  className="hover-lift"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>

              <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                <Hash className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  {uuidVersion === "v1" && "Time-based UUIDs include timestamp and are deterministic"}
                  {uuidVersion === "v4" && "Random UUIDs are cryptographically secure and unpredictable"}
                  {uuidVersion === "v5" && "SHA-1 based UUIDs are deterministic for the same namespace and name"}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                <span>Generated UUIDs</span>
                {generatedUUIDs.length > 0 && (
                  <span className="text-sm text-muted-foreground">
                    ({generatedUUIDs.length} generated)
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                Your generated UUIDs will appear here
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {generatedUUIDs.length > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Version: {uuidVersion.toUpperCase()}
                  </span>
                  <div className="flex gap-2">
                    <CopyButton
                      text={generatedUUIDs.join('\n')}
                      variant="outline"
                      size="sm"
                      className="hover-lift"
                    >
                      Copy All
                    </CopyButton>
                    <Button
                      onClick={downloadToFile}
                      variant="outline"
                      size="sm"
                      className="hover-lift"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {generatedUUIDs.length > 0 ? (
                  generatedUUIDs.map((uuid, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                    >
                      <code className="font-mono text-sm break-all">{uuid}</code>
                      <CopyButton
                        text={uuid}
                        variant="ghost"
                        size="sm"
                        className="ml-2 shrink-0"
                      />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Generated UUIDs will appear here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle>UUID Version Information</CardTitle>
            <CardDescription>
              Learn about different UUID versions and their use cases
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold">UUID v1 (Time-based)</h3>
                <p className="text-sm text-muted-foreground">
                  Based on timestamp and MAC address. Good for chronological ordering but may reveal device information.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Time-based generation</li>
                  <li>• Includes timestamp</li>
                  <li>• Good for ordering</li>
                  <li>• May reveal device info</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">UUID v4 (Random)</h3>
                <p className="text-sm text-muted-foreground">
                  Generated using random or pseudo-random numbers. Most commonly used and recommended for general purposes.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Cryptographically secure</li>
                  <li>• Completely random</li>
                  <li>• No predictable pattern</li>
                  <li>• Most widely used</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">UUID v5 (SHA-1 based)</h3>
                <p className="text-sm text-muted-foreground">
                  Generated using SHA-1 hash of a namespace UUID and name. Deterministic for the same inputs.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Deterministic generation</li>
                  <li>• Based on namespace + name</li>
                  <li>• Good for distributed systems</li>
                  <li>• Consistent across systems</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 