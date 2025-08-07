"use client";

import React from "react";
import { useBetterAuth } from "@/src/contexts/BetterAuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Button } from "@/src/app/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/app/components/ui/avatar";
import { Badge } from "@/src/app/components/ui/badge";
import { Separator } from "@/src/app/components/ui/separator";
import { User, Mail, Calendar, Shield, Settings, LogOut } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user, session, signOut, loading } = useBetterAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) throw error;
      toast.success("Successfully signed out!");
      router.push("/");
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred during sign out.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push("/auth/login");
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user.name || user.email}!</p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <Separator />

        {/* User Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Your account details and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.image || undefined} alt="User Avatar" />
                <AvatarFallback className="text-lg">
                  {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="text-xl font-semibold">{user.name || "User"}</h3>
                <p className="text-muted-foreground">{user.email}</p>
                <div className="flex items-center gap-2">
                  <Badge variant={user.emailVerified ? "default" : "secondary"}>
                    {user.emailVerified ? "Verified" : "Unverified"}
                  </Badge>
                  <Badge variant="outline">Member</Badge>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  Email
                </div>
                <p className="font-medium">{user.email}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Member Since
                </div>
                <p className="font-medium">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Session Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Session Information
            </CardTitle>
            <CardDescription>
              Current session details and security information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Session ID</div>
                <p className="font-mono text-sm bg-muted p-2 rounded">
                  {session?.id || "N/A"}
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">User ID</div>
                <p className="font-mono text-sm bg-muted p-2 rounded">
                  {user.id}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common actions and settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20 flex-col gap-2">
                <User className="h-6 w-6" />
                <span>Edit Profile</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Shield className="h-6 w-6" />
                <span>Security</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Settings className="h-6 w-6" />
                <span>Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 