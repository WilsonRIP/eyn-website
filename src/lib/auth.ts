import { betterAuth } from "better-auth";
import { Pool } from "pg";

// Database configuration for Better Auth
const databaseUrl = process.env.DATABASE_URL || 
  `postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD || 'your-password'}@supabasekong-yco4sw4w88cwwko8csgss8c4.147.79.78.227.sslip.io:5432/postgres`;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required for Better Auth");
}

export const auth = betterAuth({
  // Database connection using PostgreSQL
  database: new Pool({
    connectionString: databaseUrl,
  }),

  // Secret key for JWT signing
  secret: process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET || "your-secret-key",

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
