"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Button } from "@/src/app/components/ui/button";
import { Input } from "@/src/app/components/ui/input";
import { Label } from "@/src/app/components/ui/label";
import { Mail, ArrowLeft, RefreshCw, CheckCircle, Link as LinkIcon } from "lucide-react";
import { toast } from "react-hot-toast";
import { auth } from "@/src/lib/supabase-client";

export default function MagicLinkPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [shouldCreateUser, setShouldCreateUser] = useState(true);

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await auth.signInWithMagicLink(email, {
        shouldCreateUser: shouldCreateUser,
        emailRedirectTo: `${window.location.origin}/auth/callback`
      });
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Magic link sent! Check your email.");
        setEmailSent(true);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto">
            <LinkIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Sign in with Magic Link</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a secure link to sign in instantly.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {emailSent && (
            <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="text-sm text-green-700 dark:text-green-300">
                Magic link sent! Check your email and click the link to sign in.
              </span>
            </div>
          )}

          <form onSubmit={handleSendMagicLink} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="shouldCreateUser"
                checked={shouldCreateUser}
                onChange={(e) => setShouldCreateUser(e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="shouldCreateUser" className="text-sm">
                Create account if it doesn't exist
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full btn-enhanced hover-lift"
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Sending Magic Link...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Magic Link
                </>
              )}
            </Button>
          </form>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Don't have an account?
            </p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center text-sm text-primary hover:underline"
            >
              Create an account
            </Link>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Link href="/auth/login">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to sign in
              </Button>
            </Link>
            <Link href="/auth/otp">
              <Button variant="outline" className="w-full">
                Use OTP instead
              </Button>
            </Link>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              🔗 How Magic Links work
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Enter your email address</li>
              <li>• Click the link in your email</li>
              <li>• You're automatically signed in</li>
              <li>• No password required!</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 