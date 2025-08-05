"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Button } from "@/src/app/components/ui/button";
import { Badge } from "@/src/app/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/app/components/ui/avatar";
import { 
  User, 
  Settings, 
  LogOut, 
  Download, 
  FileType, 
  FileDown, 
  QrCode, 
  Palette,
  Code,
  Hash,
  FileText,
  Key,
  Calculator,
  Eye,
  Type
} from "lucide-react";
import { useAuth } from "@/src/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Successfully signed out");
        router.push("/");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    }
  };

  const tools = [
    { name: "Media Downloader", icon: Download, url: "/download", description: "Download videos, images, and audio" },
    { name: "File Converter", icon: FileType, url: "/convert", description: "Convert files between formats" },
    { name: "File Compressor", icon: FileDown, url: "/compress", description: "Reduce file sizes" },
    { name: "QR Code Generator", icon: QrCode, url: "/qr", description: "Create custom QR codes" },
    { name: "Color Palette Generator", icon: Palette, url: "/colors", description: "Generate color palettes" },
    { name: "JSON Formatter", icon: Code, url: "/json", description: "Format and validate JSON" },
    { name: "Base64 Encoder/Decoder", icon: Code, url: "/base64", description: "Encode and decode Base64" },
    { name: "Markdown Previewer", icon: FileText, url: "/markdown", description: "Real-time markdown editor" },
    { name: "URL Encoder/Decoder", icon: Code, url: "/url-encode", description: "Encode and decode URLs" },
    { name: "Password Generator", icon: Key, url: "/password", description: "Generate secure passwords" },
    { name: "Hash Generator", icon: Hash, url: "/hash", description: "Generate file hashes" },
    { name: "Word Counter", icon: Calculator, url: "/word-counter", description: "Analyze text statistics" },
    { name: "Text Case Converter", icon: Type, url: "/text-case", description: "Convert text cases" },
    { name: "Lorem Ipsum Generator", icon: FileText, url: "/lorem-ipsum", description: "Generate placeholder text" },
    { name: "Color Contrast Checker", icon: Eye, url: "/color-contrast", description: "Check color accessibility" },
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Please sign in to access the dashboard</h1>
          <Link href="/auth/login">
            <Button className="btn-enhanced hover-lift">Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground text-lg mt-2">
              Welcome back! Here are all your tools in one place.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback>
                  {user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="font-medium">{user.user_metadata?.full_name || user.email}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Link href="/profile">
                <Button variant="outline" size="sm" className="btn-enhanced hover-lift">
                  <Settings className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="btn-enhanced hover-lift"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="card-enhanced">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Account Status</CardTitle>
              <Badge variant="default">Active</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Verified</div>
              <p className="text-xs text-muted-foreground">
                Email verified on {new Date(user.email_confirmed_at || user.created_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>

          <Card className="card-enhanced">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Tools</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tools.length}</div>
              <p className="text-xs text-muted-foreground">
                All tools unlocked
              </p>
            </CardContent>
          </Card>

          <Card className="card-enhanced">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Member Since</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Date(user.created_at).toLocaleDateString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24))} days ago
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tools Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-6">All Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tools.map((tool) => (
              <Link key={tool.url} href={tool.url}>
                <Card className="card-enhanced hover:shadow-lg transition-all duration-200 cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <tool.icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{tool.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm">
                      {tool.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/download">
              <Button className="w-full btn-enhanced hover-lift" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Media
              </Button>
            </Link>
            <Link href="/convert">
              <Button className="w-full btn-enhanced hover-lift" variant="outline">
                <FileType className="h-4 w-4 mr-2" />
                Convert Files
              </Button>
            </Link>
            <Link href="/password">
              <Button className="w-full btn-enhanced hover-lift" variant="outline">
                <Key className="h-4 w-4 mr-2" />
                Generate Password
              </Button>
            </Link>
            <Link href="/colors">
              <Button className="w-full btn-enhanced hover-lift" variant="outline">
                <Palette className="h-4 w-4 mr-2" />
                Create Palette
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 