"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Button } from "@/src/app/components/ui/button";
import { Badge } from "@/src/app/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/app/components/ui/avatar";
import { Progress } from "@/src/app/components/ui/progress";
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
  Type,
  Activity,
  Clock,
  TrendingUp,
  Loader2
} from "lucide-react";
import { useAuth } from "@/src/contexts/AuthContext";
import { databaseService, UserProfile, UserActivity, ToolStatistics } from "@/src/lib/database-service";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recentActivity, setRecentActivity] = useState<UserActivity[]>([]);
  const [toolStats, setToolStats] = useState<ToolStatistics[]>([]);
  const [userStats, setUserStats] = useState({
    totalActivity: 0,
    totalDownloads: 0,
    totalFiles: 0,
    totalPasswords: 0,
    daysAsMember: 0
  });

  // Load user data on mount
  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load profile data
      const { data: profileData } = await databaseService.getProfile(user.id);
      setProfile(profileData);

      // Load recent activity
      const { data: activityData } = await databaseService.getUserActivity(user.id, 5);
      setRecentActivity(activityData || []);

      // Load tool statistics
      const { data: statsData } = await databaseService.getToolStatistics();
      setToolStats(statsData || []);

      // Calculate user stats
      const daysAsMember = Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24));
      
      // Get user's specific stats
      const userData = await databaseService.getUserData(user.id);
      setUserStats({
        totalActivity: userData.activity?.length || 0,
        totalDownloads: userData.downloadHistory?.length || 0,
        totalFiles: userData.fileUploads?.length || 0,
        totalPasswords: userData.passwordHistory?.length || 0,
        daysAsMember
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

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
    {
      name: "Password Generator",
      description: "Generate secure passwords and passphrases",
      icon: Key,
      url: "/password",
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20"
    },
    {
      name: "QR Code Generator",
      description: "Create QR codes for URLs, text, WiFi, and more",
      icon: QrCode,
      url: "/qr",
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20"
    },
    {
      name: "File Compressor",
      description: "Compress images, videos, and files",
      icon: FileDown,
      url: "/compress",
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20"
    },
    {
      name: "File Converter",
      description: "Convert files between different formats",
      icon: FileType,
      url: "/convert",
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20"
    },
    {
      name: "Bulk Downloader",
      description: "Download multiple files at once",
      icon: Download,
      url: "/download",
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/20"
    },
    {
      name: "Color Tools",
      description: "Color picker, contrast checker, and more",
      icon: Palette,
      url: "/colors",
      color: "text-pink-600",
      bgColor: "bg-pink-100 dark:bg-pink-900/20"
    },
    {
      name: "Text Tools",
      description: "Case converter, word counter, and more",
      icon: Type,
      url: "/text-case",
      color: "text-indigo-600",
      bgColor: "bg-indigo-100 dark:bg-indigo-900/20"
    },
    {
      name: "Hash Generator",
      description: "Generate MD5, SHA1, SHA256 hashes",
      icon: Hash,
      url: "/hash",
      color: "text-teal-600",
      bgColor: "bg-teal-100 dark:bg-teal-900/20"
    },
    {
      name: "Base64 Converter",
      description: "Encode and decode Base64 strings",
      icon: Code,
      url: "/base64",
      color: "text-cyan-600",
      bgColor: "bg-cyan-100 dark:bg-cyan-900/20"
    },
    {
      name: "URL Encoder",
      description: "Encode and decode URLs",
      icon: Eye,
      url: "/url-encode",
      color: "text-emerald-600",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/20"
    },
    {
      name: "JSON Formatter",
      description: "Format and validate JSON data",
      icon: FileText,
      url: "/json",
      color: "text-amber-600",
      bgColor: "bg-amber-100 dark:bg-amber-900/20"
    },
    {
      name: "Markdown Editor",
      description: "Edit and preview Markdown content",
      icon: FileText,
      url: "/markdown",
      color: "text-slate-600",
      bgColor: "bg-slate-100 dark:bg-slate-900/20"
    },
    {
      name: "Lorem Ipsum",
      description: "Generate placeholder text",
      icon: FileText,
      url: "/lorem-ipsum",
      color: "text-gray-600",
      bgColor: "bg-gray-100 dark:bg-gray-900/20"
    },
    {
      name: "Word Counter",
      description: "Count words, characters, and more",
      icon: Calculator,
      url: "/word-counter",
      color: "text-violet-600",
      bgColor: "bg-violet-100 dark:bg-violet-900/20"
    }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p>Loading dashboard...</p>
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
                <AvatarImage src={profile?.avatar_url || user.user_metadata?.avatar_url} />
                <AvatarFallback>
                  {profile?.display_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="font-medium">
                  {profile?.display_name || profile?.full_name || user.user_metadata?.full_name || user.email}
                </p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.totalActivity}</div>
              <p className="text-xs text-muted-foreground">
                Tool usage tracked
              </p>
            </CardContent>
          </Card>

          <Card className="card-enhanced">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Files Processed</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.totalFiles}</div>
              <p className="text-xs text-muted-foreground">
                Uploads and conversions
              </p>
            </CardContent>
          </Card>

          <Card className="card-enhanced">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Member Since</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.daysAsMember}</div>
              <p className="text-xs text-muted-foreground">
                days ago
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Your latest tool usage and activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Activity className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium capitalize">
                          {activity.activity_type.replace(/_/g, ' ')}
                        </p>
                        {activity.tool_name && (
                          <p className="text-sm text-muted-foreground">
                            Tool: {activity.tool_name}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Popular Tools */}
        {toolStats.length > 0 && (
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Popular Tools
              </CardTitle>
              <CardDescription>
                Most used tools by all users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {toolStats.slice(0, 6).map((stat) => {
                  const tool = tools.find(t => t.name.toLowerCase().includes(stat.tool_name.replace('-', ' ')));
                  const IconComponent = tool?.icon || Activity;
                  
                  return (
                    <div key={stat.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <div className={`p-2 rounded-full ${tool?.bgColor || 'bg-gray-100 dark:bg-gray-900/20'}`}>
                        <IconComponent className={`h-4 w-4 ${tool?.color || 'text-gray-600'}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{stat.tool_name.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                        <p className="text-xs text-muted-foreground">{stat.usage_count} uses</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Tools */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">All Tools</h2>
            <p className="text-muted-foreground">
              Access all available tools and utilities
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tools.map((tool) => {
              const IconComponent = tool.icon;
              const toolStat = toolStats.find(stat => 
                stat.tool_name === tool.name.toLowerCase().replace(/\s+/g, '-')
              );
              
              return (
                <Link key={tool.name} href={tool.url}>
                  <Card className="card-enhanced hover:scale-105 transition-transform duration-200 cursor-pointer group">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg ${tool.bgColor} group-hover:scale-110 transition-transform duration-200`}>
                          <IconComponent className={`h-6 w-6 ${tool.color}`} />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{tool.name}</CardTitle>
                          {toolStat && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {toolStat.usage_count} uses
                            </p>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground">
                        {tool.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
} 