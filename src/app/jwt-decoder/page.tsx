"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Button } from "@/src/app/components/ui/button";
import { Textarea } from "@/src/app/components/ui/textarea";
import { Alert, AlertDescription } from "@/src/app/components/ui/alert";
import { Badge } from "@/src/app/components/ui/badge";
import { Copy, RotateCcw, CheckCircle, XCircle, AlertTriangle, Shield, Clock, User } from "lucide-react";

interface JWTPayload {
  [key: string]: any;
}

interface DecodedJWT {
  header: JWTPayload;
  payload: JWTPayload;
  signature: string;
  isValid: boolean;
  error?: string;
}

export default function JWTDecoderPage() {
  const [inputJWT, setInputJWT] = useState("");
  const [decodedJWT, setDecodedJWT] = useState<DecodedJWT | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const decodeJWT = () => {
    if (!inputJWT.trim()) {
      setErrorMessage("Please enter a JWT token to decode");
      setIsValid(false);
      return;
    }

    try {
      const parts = inputJWT.split('.');
      
      if (parts.length !== 3) {
        throw new Error("Invalid JWT format. JWT should have 3 parts separated by dots.");
      }

      const [headerB64, payloadB64, signature] = parts;
      
      // Decode header
      const header = JSON.parse(atob(headerB64.replace(/-/g, '+').replace(/_/g, '/')));
      
      // Decode payload
      const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
      
      // Check if token is expired
      const now = Math.floor(Date.now() / 1000);
      const isExpired = payload.exp && payload.exp < now;
      
      const result: DecodedJWT = {
        header,
        payload,
        signature,
        isValid: !isExpired
      };

      if (isExpired) {
        result.error = "Token has expired";
      }

      setDecodedJWT(result);
      setIsValid(true);
      setErrorMessage("");
    } catch (error) {
      setIsValid(false);
      setErrorMessage(error instanceof Error ? error.message : "Invalid JWT token");
      setDecodedJWT(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const clearAll = () => {
    setInputJWT("");
    setDecodedJWT(null);
    setIsValid(null);
    setErrorMessage("");
  };

  const loadSampleJWT = () => {
    const sample = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MzU2ODgwMDB9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
    setInputJWT(sample);
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const renderPayloadValue = (key: string, value: any): JSX.Element => {
    if (key === 'iat' || key === 'exp' || key === 'nbf') {
      return (
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{value}</span>
          <span className="text-xs text-muted-foreground">({formatDate(value)})</span>
        </div>
      );
    }
    
    if (typeof value === 'object') {
      return <pre className="text-xs bg-muted p-2 rounded">{JSON.stringify(value, null, 2)}</pre>;
    }
    
    return <span>{String(value)}</span>;
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 animate-slide-in-left">JWT Decoder</h1>
          <p className="text-muted-foreground text-lg animate-slide-in-right">
            Decode and validate JSON Web Tokens (JWT) to inspect their contents
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <span>Input JWT Token</span>
                {isValid === true && <CheckCircle className="h-5 w-5 text-green-500" />}
                {isValid === false && <XCircle className="h-5 w-5 text-red-500" />}
              </CardTitle>
              <CardDescription>
                Paste your JWT token here to decode and inspect its contents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste your JWT token here..."
                value={inputJWT}
                onChange={(e) => setInputJWT(e.target.value)}
                className="min-h-[200px] font-mono text-sm input-enhanced"
              />
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={decodeJWT} 
                  className="btn-enhanced hover-lift"
                  disabled={!inputJWT.trim()}
                >
                  Decode JWT
                </Button>
                <Button 
                  onClick={loadSampleJWT} 
                  variant="outline" 
                  className="hover-lift"
                >
                  Load Sample
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

              {errorMessage && (
                <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800 dark:text-red-200">
                    {errorMessage}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <span>Decoded JWT</span>
                {decodedJWT && (
                  <Badge variant={decodedJWT.isValid ? "default" : "destructive"}>
                    {decodedJWT.isValid ? "Valid" : "Expired"}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Decoded header, payload, and signature information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {decodedJWT ? (
                <>
                  {/* Header Section */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Header
                    </h3>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="space-y-2">
                        {Object.entries(decodedJWT.header).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-start">
                            <span className="font-mono text-sm font-medium">{key}:</span>
                            <span className="font-mono text-sm">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button
                      onClick={() => copyToClipboard(JSON.stringify(decodedJWT.header, null, 2))}
                      variant="outline"
                      size="sm"
                      className="hover-lift"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Header
                    </Button>
                  </div>

                  {/* Payload Section */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Payload
                    </h3>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="space-y-3">
                        {Object.entries(decodedJWT.payload).map(([key, value]) => (
                          <div key={key} className="border-b border-border/50 pb-2 last:border-b-0">
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-mono text-sm font-medium">{key}:</span>
                            </div>
                            <div className="ml-4">
                              {renderPayloadValue(key, value)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button
                      onClick={() => copyToClipboard(JSON.stringify(decodedJWT.payload, null, 2))}
                      variant="outline"
                      size="sm"
                      className="hover-lift"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Payload
                    </Button>
                  </div>

                  {/* Signature Section */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Signature
                    </h3>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <code className="text-xs break-all">{decodedJWT.signature}</code>
                    </div>
                    <Button
                      onClick={() => copyToClipboard(decodedJWT.signature)}
                      variant="outline"
                      size="sm"
                      className="hover-lift"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Signature
                    </Button>
                  </div>

                  {decodedJWT.error && (
                    <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                        {decodedJWT.error}
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Decoded JWT information will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle>JWT Information</CardTitle>
            <CardDescription>
              Learn about JWT tokens and their structure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold">Header</h3>
                <p className="text-sm text-muted-foreground">
                  Contains metadata about the token, including the algorithm used for signing.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Payload</h3>
                <p className="text-sm text-muted-foreground">
                  Contains the actual data (claims) stored in the token, such as user information and permissions.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Signature</h3>
                <p className="text-sm text-muted-foreground">
                  Used to verify that the token hasn't been tampered with and was created by a trusted source.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 