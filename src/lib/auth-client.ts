import { createClient } from "better-auth/client";

// Create the auth client
export const authClient = createClient({
  // Base URL for your API routes
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  
  // API routes configuration
  apiRoutes: {
    // Auth routes
    signIn: "/api/auth/signin",
    signUp: "/api/auth/signup",
    signOut: "/api/auth/signout",
    session: "/api/auth/session",
    refresh: "/api/auth/refresh",
    
    // Social auth routes
    social: "/api/auth/social",
    
    // Account management routes
    linkSocial: "/api/auth/link-social",
    unlinkAccount: "/api/auth/unlink-account",
    deleteUser: "/api/auth/delete-user",
    
    // Password management routes
    resetPassword: "/api/auth/reset-password",
    setPassword: "/api/auth/set-password",
    
    // Email verification routes
    verifyEmail: "/api/auth/verify-email",
    resendVerification: "/api/auth/resend-verification",
  },
  
  // Session configuration
  session: {
    // Session storage strategy
    storage: "localStorage", // or "sessionStorage" or "cookie"
    
    // Session refresh configuration
    refresh: {
      enabled: true,
      interval: 5 * 60 * 1000, // Refresh every 5 minutes
    },
  },
  
  // Callbacks for client-side events
  callbacks: {
    onSignIn: (user) => {
      console.log("User signed in:", user.email);
    },
    onSignOut: () => {
      console.log("User signed out");
    },
    onSessionUpdate: (session) => {
      console.log("Session updated:", session?.user?.email);
    },
  },
});
