import { betterAuth } from "better-auth";
import { SupabaseAdapter } from "better-auth/adapters/supabase";

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_PUBLIC_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://eyn-website-supabase-229e2b-147-79-78-227.traefik.me';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for Better Auth");
}

export const auth = betterAuth({
  // Database adapter
  adapter: SupabaseAdapter({
    url: supabaseUrl,
    secret: supabaseServiceKey,
  }),

  // Email and password authentication
  emailAndPassword: {
    enabled: true,
    autoSignIn: true, // Automatically sign in after registration
  },

  // Social providers
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },

  // Account linking
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "github"],
      allowDifferentEmails: false,
      updateUserInfoOnLink: true,
    },
  },

  // User management
  user: {
    deleteUser: {
      enabled: true,
      beforeDelete: async (user) => {
        // Add any cleanup logic here
        console.log(`Deleting user: ${user.email}`);
      },
      afterDelete: async (user) => {
        // Add any post-deletion logic here
        console.log(`User deleted: ${user.email}`);
      },
    },
  },

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
  },

  // Email configuration
  email: {
    from: process.env.EMAIL_FROM || "noreply@yourdomain.com",
    transport: {
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    },
  },

  // Callbacks
  callbacks: {
    // Called after a user is created
    afterSignUp: async (user) => {
      console.log(`New user signed up: ${user.email}`);
      return user;
    },

    // Called after a user signs in
    afterSignIn: async (user) => {
      console.log(`User signed in: ${user.email}`);
      return user;
    },

    // Called before a user is deleted
    beforeDelete: async (user) => {
      console.log(`About to delete user: ${user.email}`);
      return user;
    },
  },
});
