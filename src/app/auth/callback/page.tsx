"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase-client";
import { toast } from "react-hot-toast";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth callback error:", error);
          toast.error("Authentication failed");
          router.push("/auth/login");
          return;
        }

        if (data.session) {
          toast.success("Successfully authenticated!");
          router.push("/dashboard");
        } else {
          router.push("/auth/login");
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        toast.error("An unexpected error occurred");
        router.push("/auth/login");
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-lg font-medium">Completing authentication...</p>
        <p className="text-muted-foreground">Please wait while we redirect you.</p>
      </div>
    </div>
  );
} 