// Re-export client-side functions
export * from './supabase-client'

// Re-export server-side functions (these will only work in server components)
export { createServerSupabaseClient, createMiddlewareSupabaseClient } from './supabase-server' 