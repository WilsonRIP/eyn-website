import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createClient = async (cookieStore: ReturnType<typeof cookies>) => {
  // Use the environment variables from your .env.local configuration
  const supabaseUrl = process.env.SUPABASE_PUBLIC_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://eyn-website-supabase-229e2b-147-79-78-227.traefik.me'
  const supabaseAnonKey = process.env.ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NTQ0NDQ0NzcsImV4cCI6MTg5MzQ1NjAwMCwiaXNzIjoiZG9rcGxveSJ9.-PVTs6MA84dSs7bFIp7DVZi9fJReX_XwV_Xh7J_pcT8'
  
  const resolvedCookieStore = await cookieStore
  
  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return resolvedCookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => resolvedCookieStore.set(name, value, options))
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
};