"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Button } from "@/src/app/components/ui/button";
import { Input } from "@/src/app/components/ui/input";
import { Label } from "@/src/app/components/ui/label";
import { Mail, ArrowLeft, RefreshCw, CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "@/src/contexts/AuthContext";

export default function VerifyEmailPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  const { resendConfirmationEmail } = useAuth();

  const handleResendConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setResendLoading(true);

    try {
      // Use the resendConfirmationEmail method
      const { data, error } = await resendConfirmationEmail(email);
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Confirmation email sent! Check your inbox.");
        setEmailSent(true);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setResendLoading(false);
    }
  };

  const handleCheckEmail = () => {
    // This would typically check if the user has confirmed their email
    // For now, we'll just show a message
    toast.info("Please check your email and click the confirmation link");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto">
            <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a confirmation email to your inbox. Please check and click the verification link.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {emailSent && (
            <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="text-sm text-green-700 dark:text-green-300">
                Confirmation email sent successfully!
              </span>
            </div>
          )}

          <div className="space-y-4">
            <Button
              onClick={handleCheckEmail}
              className="w-full btn-enhanced hover-lift"
              variant="outline"
            >
              <Mail className="h-4 w-4 mr-2" />
              Check Email Again
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Didn't receive the email?
                </span>
              </div>
            </div>

            <form onSubmit={handleResendConfirmation} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full btn-enhanced hover-lift"
                disabled={resendLoading}
              >
                {resendLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Resend Confirmation Email
                  </>
                )}
              </Button>
            </form>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Already confirmed your email?
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center text-sm text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to sign in
            </Link>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              📧 Email not showing up?
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Check your spam/junk folder</li>
              <li>• Make sure you entered the correct email</li>
              <li>• Wait a few minutes for delivery</li>
              <li>• Try resending the confirmation email</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 