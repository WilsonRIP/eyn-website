import { createClient as createServerClient } from '@/src/lib/utils/supabase/server'
import { createClient as createMiddlewareClient } from '@/src/lib/utils/supabase/middleware'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

// Server client for server-side operations
export const createServerSupabaseClient = async () => {
  const cookieStore = cookies()
  return createServerClient(cookieStore)
}

// Middleware client for middleware operations
export const createMiddlewareSupabaseClient = (request: NextRequest) => {
  return createMiddlewareClient(request)
} 