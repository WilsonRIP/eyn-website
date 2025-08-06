"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Button } from "@/src/app/components/ui/button";
import { Input } from "@/src/app/components/ui/input";
import { Textarea } from "@/src/app/components/ui/textarea";
import { Badge } from "@/src/app/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/app/components/ui/tabs";
import { Alert, AlertDescription } from "@/src/app/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/app/components/ui/select";
import { Webhook, Copy, RotateCcw, Eye, EyeOff, Download, AlertTriangle, CheckCircle, Clock, Zap, Send, Globe } from "lucide-react";
import { webhookPresets } from "@/src/app/data/webhook-presets";

interface WebhookRequest {
  id: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string;
  timestamp: Date;
  ip: string;
  userAgent: string;
}

interface TestResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  time: number;
  success: boolean;
}

export default function WebhookTesterPage() {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [requests, setRequests] = useState<WebhookRequest[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [showHeaders, setShowHeaders] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // Test webhook functionality
  const [testUrl, setTestUrl] = useState("");
  const [testMethod, setTestMethod] = useState("POST");
  const [testHeaders, setTestHeaders] = useState("{\n  \"Content-Type\": \"application/json\"\n}");
  const [testBody, setTestBody] = useState("{\n  \"event\": \"test\",\n  \"data\": {\n    \"message\": \"Hello from webhook tester!\"\n  }\n}");
  const [testResponse, setTestResponse] = useState<TestResponse | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testError, setTestError] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("");

  // Generate a unique webhook URL
  const generateWebhookUrl = () => {
    const uniqueId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const url = `${window.location.origin}/api/webhook/${uniqueId}`;
    setWebhookUrl(url);
    setIsActive(true);
    
    // Add a sample request for demonstration
    const sampleRequest: WebhookRequest = {
      id: Date.now().toString(),
      method: "POST",
      url: "/api/webhook/" + uniqueId,
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "WebhookTester/1.0",
        "X-Webhook-Signature": "sha256=abc123...",
      },
      body: JSON.stringify({
        event: "user.created",
        data: {
          id: "user_123",
          email: "user@example.com",
          name: "John Doe",
          created_at: new Date().toISOString()
        }
      }, null, 2),
      timestamp: new Date(),
      ip: "192.168.1.100",
      userAgent: "WebhookTester/1.0"
    };
    
    setRequests([sampleRequest]);
  };

  const copyWebhookUrl = () => {
    if (webhookUrl) {
      navigator.clipboard.writeText(webhookUrl);
    }
  };

  const clearRequests = () => {
    setRequests([]);
  };

  const downloadRequests = () => {
    if (requests.length === 0) return;
    
    const data = {
      webhookUrl,
      requests: requests.map(req => ({
        ...req,
        timestamp: req.timestamp.toISOString()
      }))
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `webhook-requests-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTimestamp = (date: Date): string => {
    return date.toLocaleString();
  };

  const getMethodColor = (method: string): string => {
    switch (method.toUpperCase()) {
      case 'GET': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'POST': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'PUT': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'DELETE': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'PATCH': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  // Test webhook functionality
  const sendTestWebhook = async () => {
    if (!testUrl.trim()) {
      setTestError("Please enter a webhook URL");
      return;
    }

    setIsTesting(true);
    setTestError("");
    setTestResponse(null);

    try {
      const startTime = Date.now();
      
      // Parse headers
      let headers: Record<string, string> = {};
      try {
        headers = JSON.parse(testHeaders);
      } catch (error) {
        setTestError("Invalid JSON in headers");
        setIsTesting(false);
        return;
      }

      // Prepare request options
      const requestOptions: RequestInit = {
        method: testMethod,
        headers: {
          ...headers,
          'User-Agent': 'WebhookTester/1.0'
        }
      };

      // Add body for non-GET requests
      if (testMethod !== 'GET' && testBody.trim()) {
        try {
          // Validate JSON and format it properly
          const parsedBody = JSON.parse(testBody);
          requestOptions.body = JSON.stringify(parsedBody);
        } catch (error) {
          setTestError("Invalid JSON in request body. Please check your JSON syntax.");
          setIsTesting(false);
          return;
        }
      }

      // Make the request
      const response = await fetch(testUrl, requestOptions);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Get response body
      let responseBody = '';
      try {
        responseBody = await response.text();
      } catch (error) {
        responseBody = 'Unable to read response body';
      }

      // Parse response headers
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      setTestResponse({
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        body: responseBody,
        time: responseTime,
        success: response.ok
      });

    } catch (error) {
      setTestError(error instanceof Error ? error.message : "Failed to send webhook");
    } finally {
      setIsTesting(false);
    }
  };

  const loadSampleTestData = () => {
    setTestUrl("https://httpbin.org/post");
    setTestMethod("POST");
    setTestHeaders("{\n  \"Content-Type\": \"application/json\",\n  \"X-Test-Header\": \"webhook-tester\"\n}");
    setTestBody("{\n  \"event\": \"user.created\",\n  \"data\": {\n    \"id\": \"user_123\",\n    \"email\": \"test@example.com\",\n    \"name\": \"Test User\",\n    \"timestamp\": \"" + new Date().toISOString() + "\"\n  }\n}");
    setTestError("");
    setTestResponse(null);
  };

  const clearTestData = () => {
    setTestUrl("");
    setTestMethod("POST");
    setTestHeaders("{\n  \"Content-Type\": \"application/json\"\n}");
    setTestBody("{\n  \"event\": \"test\",\n  \"data\": {\n    \"message\": \"Hello from webhook tester!\"\n  }\n}");
    setTestResponse(null);
    setTestError("");
    setSelectedPreset("");
  };

  const loadPreset = (presetKey: string) => {
    const preset = webhookPresets[presetKey as keyof typeof webhookPresets];
    if (preset) {
      setTestUrl(preset.url);
      setTestMethod(preset.method);
      setTestHeaders(preset.headers);
      setTestBody(preset.body);
      setSelectedPreset(presetKey);
      setTestResponse(null);
      setTestError("");
    }
  };

  const loadPresetExample = (presetKey: string, exampleIndex: number) => {
    const preset = webhookPresets[presetKey as keyof typeof webhookPresets];
    if (preset && preset.examples[exampleIndex]) {
      setTestBody(preset.examples[exampleIndex].body);
    }
  };

  const formatJson = () => {
    if (!testBody.trim()) return;
    
    try {
      const parsed = JSON.parse(testBody);
      setTestBody(JSON.stringify(parsed, null, 2));
      setTestError("");
    } catch (error) {
      setTestError("Invalid JSON format. Please check your syntax.");
    }
  };

  // Simulate incoming webhook requests
  useEffect(() => {
    if (!isActive || !autoRefresh) return;

    const interval = setInterval(() => {
      // Simulate occasional new requests
      if (Math.random() < 0.3) {
        const methods = ['GET', 'POST', 'PUT', 'DELETE'];
        const method = methods[Math.floor(Math.random() * methods.length)];
        
        const newRequest: WebhookRequest = {
          id: Date.now().toString(),
          method,
          url: webhookUrl.split('/').pop() || '',
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "SampleApp/1.0",
            "X-Request-ID": Math.random().toString(36).substring(2, 15),
          },
          body: JSON.stringify({
            event: "data.updated",
            timestamp: new Date().toISOString(),
            payload: {
              id: Math.floor(Math.random() * 1000),
              status: "success",
              message: "Data processed successfully"
            }
          }, null, 2),
          timestamp: new Date(),
          ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          userAgent: "SampleApp/1.0"
        };
        
        setRequests(prev => [newRequest, ...prev.slice(0, 19)]); // Keep last 20 requests
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [isActive, autoRefresh, webhookUrl]);

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 animate-slide-in-left">Webhook Tester</h1>
          <p className="text-muted-foreground text-lg animate-slide-in-right">
            Receive and inspect webhook payloads for API development
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Webhook Configuration */}
          <div className="lg:col-span-1">
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Webhook className="h-5 w-5" />
                  <span>Webhook URL</span>
                  {isActive && <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Active</Badge>}
                </CardTitle>
                <CardDescription>
                  Generate a unique webhook endpoint
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {webhookUrl ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="text-sm font-mono break-all">{webhookUrl}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={copyWebhookUrl}
                        variant="outline"
                        className="flex-1 hover-lift"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy URL
                      </Button>
                      <Button
                        onClick={generateWebhookUrl}
                        variant="outline"
                        className="hover-lift"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={generateWebhookUrl}
                    className="w-full btn-enhanced hover-lift"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Generate Webhook URL
                  </Button>
                )}

                <div className="space-y-3 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Auto Refresh</span>
                    <input
                      type="checkbox"
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                      className="rounded"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Show Headers</span>
                    <input
                      type="checkbox"
                      checked={showHeaders}
                      onChange={(e) => setShowHeaders(e.target.checked)}
                      className="rounded"
                    />
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <Button
                    onClick={clearRequests}
                    variant="outline"
                    className="w-full hover-lift"
                    disabled={requests.length === 0}
                  >
                    Clear Requests
                  </Button>
                  <Button
                    onClick={downloadRequests}
                    variant="outline"
                    className="w-full hover-lift"
                    disabled={requests.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Requests
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card className="card-enhanced mt-6">
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Requests</span>
                  <Badge variant="outline">{requests.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Last Request</span>
                  <span className="text-sm text-muted-foreground">
                    {requests.length > 0 ? formatTimestamp(requests[0].timestamp) : 'Never'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Status</span>
                  <Badge className={isActive ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"}>
                    {isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Request History */}
          <div className="lg:col-span-2">
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>Request History</span>
                  <Badge variant="secondary">{requests.length} requests</Badge>
                </CardTitle>
                <CardDescription>
                  Incoming webhook requests and their details
                </CardDescription>
              </CardHeader>
              <CardContent>
                {requests.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <Webhook className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No requests received yet</p>
                    <p className="text-sm">Generate a webhook URL to start receiving requests</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requests.map((request) => (
                      <div key={request.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge className={getMethodColor(request.method)}>
                              {request.method}
                            </Badge>
                            <span className="text-sm font-mono">{request.url}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{formatTimestamp(request.timestamp)}</span>
                            <span>•</span>
                            <span>{request.ip}</span>
                          </div>
                        </div>

                        <Tabs defaultValue="body" className="w-full">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="body">Body</TabsTrigger>
                            <TabsTrigger value="headers">Headers</TabsTrigger>
                          </TabsList>

                          <TabsContent value="body" className="mt-3">
                            <Textarea
                              value={request.body}
                              readOnly
                              className="min-h-[200px] font-mono text-sm bg-muted/50"
                            />
                          </TabsContent>

                          <TabsContent value="headers" className="mt-3">
                            <div className="bg-muted/50 rounded-lg p-3">
                              <div className="space-y-2">
                                {Object.entries(request.headers).map(([key, value]) => (
                                  <div key={key} className="flex justify-between text-sm">
                                    <span className="font-mono text-muted-foreground">{key}:</span>
                                    <span className="font-mono break-all">{value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>

                        <div className="mt-3 text-xs text-muted-foreground">
                          User-Agent: {request.userAgent}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Test Your Own Webhook Section */}
        <Card className="card-enhanced mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              <span>Test Your Own Webhook</span>
            </CardTitle>
            <CardDescription>
              Send test requests to your own webhook endpoints
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Test Configuration */}
              <div className="space-y-4">
                {/* Service Presets */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Popular Services</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(webhookPresets).map(([key, preset]) => (
                      <Button
                        key={key}
                        variant={selectedPreset === key ? "default" : "outline"}
                        size="sm"
                        onClick={() => loadPreset(key)}
                        className="justify-start text-xs h-8"
                      >
                        {preset.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Webhook URL</label>
                  <Input
                    placeholder="https://your-webhook-endpoint.com/webhook"
                    value={testUrl}
                    onChange={(e) => setTestUrl(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Method</label>
                    <Select value={testMethod} onValueChange={setTestMethod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
                        <SelectItem value="PATCH">PATCH</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Headers (JSON)</label>
                  <Textarea
                    placeholder="Enter headers as JSON..."
                    value={testHeaders}
                    onChange={(e) => setTestHeaders(e.target.value)}
                    className="min-h-[100px] font-mono text-sm"
                  />
                </div>

                {testMethod !== 'GET' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Request Body</label>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={formatJson}
                          className="text-xs h-6 px-2"
                        >
                          Format JSON
                        </Button>
                        {selectedPreset && webhookPresets[selectedPreset as keyof typeof webhookPresets] && (
                          <>
                            {webhookPresets[selectedPreset as keyof typeof webhookPresets].examples.map((example, index) => (
                              <Button
                                key={index}
                                variant="ghost"
                                size="sm"
                                onClick={() => loadPresetExample(selectedPreset, index)}
                                className="text-xs h-6 px-2"
                              >
                                {example.name}
                              </Button>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                    <Textarea
                      placeholder="Enter request body..."
                      value={testBody}
                      onChange={(e) => setTestBody(e.target.value)}
                      className="min-h-[150px] font-mono text-sm"
                    />
                    {testError && testError.includes("JSON") && (
                      <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 p-2 rounded border border-red-200 dark:border-red-800">
                        <div className="font-medium">JSON Error:</div>
                        <div>{testError}</div>
                        <div className="mt-1 text-xs">
                          💡 Tip: Use the "Format JSON" button to validate and format your JSON
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={sendTestWebhook}
                    className="btn-enhanced hover-lift flex-1"
                    disabled={!testUrl.trim() || isTesting}
                  >
                    {isTesting ? (
                      <>
                        <Zap className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Test Request
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={loadSampleTestData}
                    variant="outline"
                    className="hover-lift"
                  >
                    Load Sample
                  </Button>
                  <Button
                    onClick={clearTestData}
                    variant="outline"
                    className="hover-lift"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>

                {testError && (
                  <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800 dark:text-red-200">
                      {testError}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Test Response */}
              <div className="space-y-4">
                <h4 className="font-medium">Response</h4>
                {testResponse ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge className={testResponse.success ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"}>
                        {testResponse.status} {testResponse.statusText}
                      </Badge>
                      <Badge variant="outline">
                        {testResponse.time}ms
                      </Badge>
                    </div>

                    <Tabs defaultValue="body" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="body">Response Body</TabsTrigger>
                        <TabsTrigger value="headers">Response Headers</TabsTrigger>
                      </TabsList>

                      <TabsContent value="body" className="mt-3">
                        <Textarea
                          value={testResponse.body}
                          readOnly
                          className="min-h-[200px] font-mono text-sm bg-muted/50"
                        />
                      </TabsContent>

                      <TabsContent value="headers" className="mt-3">
                        <div className="bg-muted/50 rounded-lg p-3">
                          <div className="space-y-2">
                            {Object.entries(testResponse.headers).map(([key, value]) => (
                              <div key={key} className="flex justify-between text-sm">
                                <span className="font-mono text-muted-foreground">{key}:</span>
                                <span className="font-mono break-all">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Send className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Send a test request to see the response</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-enhanced mt-6">
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
            <CardDescription>
              Testing webhooks with your applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold">1. Generate Webhook URL</h3>
                <p className="text-sm text-muted-foreground">
                  Click "Generate Webhook URL" to create a unique endpoint that can receive HTTP requests.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">2. Send Test Requests</h3>
                <p className="text-sm text-muted-foreground">
                  Use the webhook URL in your applications or testing tools to send HTTP requests to this endpoint.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">3. Inspect Payloads</h3>
                <p className="text-sm text-muted-foreground">
                  View the incoming requests, headers, and body content to debug and verify your webhook integrations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-enhanced mt-6">
          <CardHeader>
            <CardTitle>Service Presets Guide</CardTitle>
            <CardDescription>
              How to use the popular service presets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Using Presets</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <span className="font-mono bg-muted px-1 rounded text-xs">1</span>
                    <span>Click on a service preset (Discord, Slack, etc.) to load the default configuration</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-mono bg-muted px-1 rounded text-xs">2</span>
                    <span>Replace the placeholder URL with your actual webhook endpoint</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-mono bg-muted px-1 rounded text-xs">3</span>
                    <span>Use the example buttons to try different payload formats</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-mono bg-muted px-1 rounded text-xs">4</span>
                    <span>Click "Send Test Request" to test your webhook</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold">Supported Services</h3>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  {Object.entries(webhookPresets).map(([key, preset]) => (
                    <div key={key} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <div>
                        <div className="font-medium">{preset.name}</div>
                        <div className="text-muted-foreground text-xs">{preset.description}</div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {preset.examples.length} examples
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 