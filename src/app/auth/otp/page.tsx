"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Button } from "@/src/app/components/ui/button";
import { Input } from "@/src/app/components/ui/input";
import { Label } from "@/src/app/components/ui/label";
import { Mail, ArrowLeft, RefreshCw, CheckCircle, Key, ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";
import { auth } from "@/src/lib/supabase-client";

export default function OtpPage() {
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [shouldCreateUser, setShouldCreateUser] = useState(true);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await auth.signInWithOtp(email, {
        shouldCreateUser: shouldCreateUser
      });
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("OTP code sent! Check your email.");
        setOtpSent(true);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) {
      toast.error("Please enter the OTP code");
      return;
    }

    setVerifying(true);

    try {
      const { data, error } = await auth.verifyOtp(email, otpCode, 'email');
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Successfully signed in!");
        // Redirect to dashboard or home page
        window.location.href = "/dashboard";
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);

    try {
      const { data, error } = await auth.signInWithOtp(email, {
        shouldCreateUser: shouldCreateUser
      });
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("New OTP code sent!");
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
            <Key className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Sign in with OTP</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a one-time code to sign in.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {!otpSent ? (
            // Step 1: Send OTP
            <form onSubmit={handleSendOtp} className="space-y-4">
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
                    Sending OTP...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send OTP Code
                  </>
                )}
              </Button>
            </form>
          ) : (
            // Step 2: Verify OTP
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center space-y-2">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto" />
                <p className="text-sm text-green-700 dark:text-green-300">
                  OTP code sent to <strong>{email}</strong>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  maxLength={6}
                  pattern="[0-9]{6}"
                  required
                  disabled={verifying}
                  className="text-center text-lg tracking-widest"
                />
                <p className="text-xs text-muted-foreground text-center">
                  Enter the 6-digit code from your email
                </p>
              </div>

              <Button
                type="submit"
                className="w-full btn-enhanced hover-lift"
                disabled={verifying || otpCode.length !== 6}
              >
                {verifying ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Verify & Sign In
                  </>
                )}
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResendOtp}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-3 w-3 mr-1" />
                      Resend Code
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

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
            <Link href="/auth/magic-link">
              <Button variant="outline" className="w-full">
                Use Magic Link instead
              </Button>
            </Link>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              🔐 How OTP works
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Enter your email address</li>
              <li>• Check your email for the 6-digit code</li>
              <li>• Enter the code to sign in</li>
              <li>• No password required!</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 