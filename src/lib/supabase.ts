import { createClient as createBrowserClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/src/lib/utils/supabase/server'
import { createClient as createMiddlewareClient } from '@/src/lib/utils/supabase/middleware'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

// Browser client for client-side operations
export const createBrowserSupabaseClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Server client for server-side operations
export const createServerSupabaseClient = async () => {
  const cookieStore = cookies()
  return createServerClient(cookieStore)
}

// Middleware client for middleware operations
export const createMiddlewareSupabaseClient = (request: NextRequest) => {
  return createMiddlewareClient(request)
}

// Legacy client for backward compatibility
export const supabase = createBrowserSupabaseClient()

// Auth helper functions
export const auth = {
  // Sign up with email and password
  signUp: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  // Sign in with OAuth provider
  signInWithOAuth: async (provider: 'google' | 'github' | 'discord') => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    return { data, error }
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current user
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // Get session
  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  // Reset password
  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })
    return { data, error }
  },

  // Update password
  updatePassword: async (password: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password: password
    })
    return { data, error }
  }
}

// User profile helper functions
export const profiles = {
  // Get user profile
  getProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  // Update user profile
  updateProfile: async (userId: string, updates: any) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
    return { data, error }
  },

  // Create user profile
  createProfile: async (profile: any) => {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profile)
    return { data, error }
  }
}

// Database helper functions
export const database = {
  // Generic query function
  query: async (table: string, options: any = {}) => {
    let query = supabase.from(table).select(options.select || '*')
    
    if (options.where) {
      Object.entries(options.where).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
    }
    
    if (options.orderBy) {
      query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending })
    }
    
    if (options.limit) {
      query = query.limit(options.limit)
    }
    
    const { data, error } = await query
    return { data, error }
  },

  // Insert data
  insert: async (table: string, data: any) => {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()
    return { data: result, error }
  },

  // Update data
  update: async (table: string, data: any, where: any) => {
    let query = supabase.from(table).update(data)
    
    Object.entries(where).forEach(([key, value]) => {
      query = query.eq(key, value)
    })
    
    const { data: result, error } = await query.select()
    return { data: result, error }
  },

  // Delete data
  delete: async (table: string, where: any) => {
    let query = supabase.from(table).delete()
    
    Object.entries(where).forEach(([key, value]) => {
      query = query.eq(key, value)
    })
    
    const { data, error } = await query
    return { data, error }
  }
} 