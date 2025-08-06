import { createClient as createBrowserClient } from '@supabase/supabase-js'

// Browser client for client-side operations
export const createBrowserSupabaseClient = () => {
  // Use the environment variables from your .env.local configuration
  const supabaseUrl = process.env.SUPABASE_PUBLIC_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://eyn-website-supabase-229e2b-147-79-78-227.traefik.me'
  const supabaseAnonKey = process.env.ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NTQ0NDQ0NzcsImV4cCI6MTg5MzQ1NjAwMCwiaXNzIjoiZG9rcGxveSJ9.-PVTs6MA84dSs7bFIp7DVZi9fJReX_XwV_Xh7J_pcT8'
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Legacy client for backward compatibility
export const supabase = createBrowserSupabaseClient()

// Auth helper functions - Following official Supabase documentation
export const auth = {
  // Sign up with email and password
  signUp: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  },

  // Sign up with phone and password
  signUpWithPhone: async (phone: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      phone,
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
  signInWithOAuth: async (provider: 'google' | 'github' | 'discord' | 'facebook' | 'gitlab' | 'bitbucket') => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    return { data, error }
  },

  // Sign in with Magic Link via Email (passwordless)
  signInWithMagicLink: async (email: string, options: { shouldCreateUser?: boolean; emailRedirectTo?: string } = {}) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        shouldCreateUser: options.shouldCreateUser ?? true,
        emailRedirectTo: options.emailRedirectTo ?? `${window.location.origin}/auth/callback`
      }
    })
    return { data, error }
  },

  // Sign in with OTP (passwordless) - Email
  signInWithOtp: async (email: string, options: { shouldCreateUser?: boolean } = {}) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        shouldCreateUser: options.shouldCreateUser ?? true
      }
    })
    return { data, error }
  },

  // Sign in with SMS OTP (passwordless) - Phone
  signInWithSmsOtp: async (phone: string, options: { shouldCreateUser?: boolean } = {}) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: phone,
      options: {
        shouldCreateUser: options.shouldCreateUser ?? true
      }
    })
    return { data, error }
  },

  // Verify Email OTP code
  verifyOtp: async (email: string, token: string, type: 'email' = 'email') => {
    const { data, error } = await supabase.auth.verifyOtp({
      email: email,
      token: token,
      type: type
    })
    return { data, error }
  },

  // Verify SMS OTP code
  verifySmsOtp: async (phone: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: phone,
      token: token,
      type: 'sms'
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

  // Reset password / forgot password
  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })
    return { data, error }
  },

  // Resend confirmation email
  resendConfirmationEmail: async (email: string) => {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })
    return { data, error }
  },

  // Update user (email, password, or data)
  updateUser: async (updates: { email?: string; password?: string; data?: any }) => {
    const { data, error } = await supabase.auth.updateUser(updates)
    return { data, error }
  },

  // Update password (legacy method)
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