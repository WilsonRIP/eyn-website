"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Button } from "@/src/app/components/ui/button";
import { Input } from "@/src/app/components/ui/input";
import { Textarea } from "@/src/app/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/app/components/ui/select";
import { Badge } from "@/src/app/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/app/components/ui/tabs";
import { Alert, AlertDescription } from "@/src/app/components/ui/alert";
import { Globe, Send, RotateCcw, Copy, Download, AlertTriangle, CheckCircle, Clock, Loader2 } from "lucide-react";

interface Header {
  key: string;
  value: string;
}

interface Param {
  key: string;
  value: string;
}

interface Response {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  time: number;
}

export default function HTTPRequestBuilderPage() {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState<Header[]>([{ key: "", value: "" }]);
  const [params, setParams] = useState<Param[]>([{ key: "", value: "" }]);
  const [body, setBody] = useState("");
  const [response, setResponse] = useState<Response | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [requestHistory, setRequestHistory] = useState<Array<{ url: string; method: string; timestamp: Date }>>([]);

  const httpMethods = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"];

  const addHeader = () => {
    setHeaders([...headers, { key: "", value: "" }]);
  };

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const addParam = () => {
    setParams([...params, { key: "", value: "" }]);
  };

  const removeParam = (index: number) => {
    setParams(params.filter((_, i) => i !== index));
  };

  const updateParam = (index: number, field: 'key' | 'value', value: string) => {
    const newParams = [...params];
    newParams[index][field] = value;
    setParams(newParams);
  };

  const sendRequest = async () => {
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    setIsLoading(true);
    setError("");
    setResponse(null);

    try {
      const startTime = Date.now();

      // Build URL with query parameters
      let requestUrl = url;
      const validParams = params.filter(p => p.key.trim() && p.value.trim());
      if (validParams.length > 0) {
        const queryString = validParams
          .map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
          .join('&');
        requestUrl += (url.includes('?') ? '&' : '?') + queryString;
      }

      // Build headers object
      const headersObj: Record<string, string> = {};
      headers
        .filter(h => h.key.trim() && h.value.trim())
        .forEach(h => {
          headersObj[h.key.trim()] = h.value.trim();
        });

      // Prepare request options
      const requestOptions: RequestInit = {
        method,
        headers: headersObj,
      };

      // Add body for non-GET requests
      if (method !== 'GET' && body.trim()) {
        requestOptions.body = body;
        if (!headersObj['Content-Type']) {
          headersObj['Content-Type'] = 'application/json';
        }
      }

      // Simulate API call (in a real app, you'd make the actual request)
      await new Promise(resolve => setTimeout(resolve, 1000));

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Mock response
      const mockResponse: Response = {
        status: 200,
        statusText: "OK",
        headers: {
          "content-type": "application/json",
          "server": "nginx/1.18.0",
          "date": new Date().toUTCString(),
        },
        body: JSON.stringify({
          success: true,
          message: "Request completed successfully",
          data: {
            url: requestUrl,
            method: method,
            headers: headersObj,
            timestamp: new Date().toISOString(),
          }
        }, null, 2),
        time: responseTime,
      };

      setResponse(mockResponse);

      // Add to history
      const historyItem = {
        url: requestUrl,
        method: method,
        timestamp: new Date(),
      };
      setRequestHistory(prev => [historyItem, ...prev.slice(0, 9)]);

    } catch (error) {
      setError("Failed to send request. Please check your URL and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(response.body);
    }
  };

  const downloadResponse = () => {
    if (response) {
      const blob = new Blob([response.body], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "response.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const clearAll = () => {
    setUrl("");
    setHeaders([{ key: "", value: "" }]);
    setParams([{ key: "", value: "" }]);
    setBody("");
    setResponse(null);
    setError("");
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "text-green-600";
    if (status >= 300 && status < 400) return "text-blue-600";
    if (status >= 400 && status < 500) return "text-yellow-600";
    if (status >= 500) return "text-red-600";
    return "text-gray-600";
  };

  const loadSampleRequest = () => {
    setUrl("https://jsonplaceholder.typicode.com/posts/1");
    setMethod("GET");
    setHeaders([
      { key: "Accept", value: "application/json" },
      { key: "User-Agent", value: "HTTP-Request-Builder/1.0" },
    ]);
    setParams([{ key: "", value: "" }]);
    setBody("");
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 animate-slide-in-left">HTTP Request Builder</h1>
          <p className="text-muted-foreground text-lg animate-slide-in-right">
            Craft and test GET/POST requests with custom headers and parameters
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Request Builder */}
          <div className="lg:col-span-2">
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  <span>Request Builder</span>
                </CardTitle>
                <CardDescription>
                  Configure your HTTP request
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Method and URL */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-1">
                    <label className="text-sm font-medium">Method</label>
                    <Select value={method} onValueChange={setMethod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {httpMethods.map(method => (
                          <SelectItem key={method} value={method}>
                            {method}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-3">
                    <label className="text-sm font-medium">URL</label>
                    <Input
                      placeholder="https://api.example.com/endpoint"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                    />
                  </div>
                </div>

                {/* Tabs for Headers, Params, Body */}
                <Tabs defaultValue="headers" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="headers">Headers</TabsTrigger>
                    <TabsTrigger value="params">Parameters</TabsTrigger>
                    <TabsTrigger value="body">Body</TabsTrigger>
                  </TabsList>

                  <TabsContent value="headers" className="space-y-4">
                    <div className="space-y-3">
                      {headers.map((header, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder="Header name"
                            value={header.key}
                            onChange={(e) => updateHeader(index, 'key', e.target.value)}
                            className="flex-1"
                          />
                          <Input
                            placeholder="Header value"
                            value={header.value}
                            onChange={(e) => updateHeader(index, 'value', e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            onClick={() => removeHeader(index)}
                            variant="outline"
                            size="icon"
                            className="hover-lift"
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                      <Button onClick={addHeader} variant="outline" className="w-full hover-lift">
                        Add Header
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="params" className="space-y-4">
                    <div className="space-y-3">
                      {params.map((param, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder="Parameter name"
                            value={param.key}
                            onChange={(e) => updateParam(index, 'key', e.target.value)}
                            className="flex-1"
                          />
                          <Input
                            placeholder="Parameter value"
                            value={param.value}
                            onChange={(e) => updateParam(index, 'value', e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            onClick={() => removeParam(index)}
                            variant="outline"
                            size="icon"
                            className="hover-lift"
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                      <Button onClick={addParam} variant="outline" className="w-full hover-lift">
                        Add Parameter
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="body" className="space-y-4">
                    <Textarea
                      placeholder="Request body (JSON, XML, etc.)"
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      className="min-h-[200px] font-mono text-sm"
                    />
                  </TabsContent>
                </Tabs>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={sendRequest}
                    className="btn-enhanced hover-lift"
                    disabled={isLoading || !url.trim()}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Request
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={loadSampleRequest}
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

                {error && (
                  <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800 dark:text-red-200">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Response */}
            {response && (
              <Card className="card-enhanced mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Response</span>
                    <Badge variant="outline" className={getStatusColor(response.status)}>
                      {response.status} {response.statusText}
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {response.time}ms
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Response Headers */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Response Headers</h4>
                    <div className="bg-muted/50 rounded-lg p-3 text-sm font-mono">
                      {Object.entries(response.headers).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground">{key}:</span>
                          <span>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Response Body */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Response Body</h4>
                      <div className="flex gap-2">
                        <Button
                          onClick={copyResponse}
                          variant="outline"
                          size="sm"
                          className="hover-lift"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                        <Button
                          onClick={downloadResponse}
                          variant="outline"
                          size="sm"
                          className="hover-lift"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                    <Textarea
                      value={response.body}
                      readOnly
                      className="min-h-[300px] font-mono text-sm bg-muted/50"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Request History */}
          <div className="lg:col-span-1">
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle>Request History</CardTitle>
                <CardDescription>
                  Recent requests you've made
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {requestHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No requests yet
                  </p>
                ) : (
                  requestHistory.map((item, index) => (
                    <div key={index} className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {item.method}
                            </Badge>
                            <span className="text-sm font-medium truncate">
                              {item.url}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {item.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="card-enhanced mt-6">
          <CardHeader>
            <CardTitle>Features</CardTitle>
            <CardDescription>
              What you can do with this HTTP request builder
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold">Multiple HTTP Methods</h3>
                <p className="text-sm text-muted-foreground">
                  Support for GET, POST, PUT, DELETE, PATCH, HEAD, and OPTIONS methods with custom headers and parameters.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Custom Headers & Parameters</h3>
                <p className="text-sm text-muted-foreground">
                  Add custom headers and query parameters to test different API configurations and authentication methods.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Response Inspection</h3>
                <p className="text-sm text-muted-foreground">
                  View response status, headers, body, and timing information to debug and optimize your API calls.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 