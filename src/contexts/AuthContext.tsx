"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, auth } from '@/src/lib/supabase-client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signUpWithPhone: (phone: string, password: string) => Promise<{ data: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signInWithOAuth: (provider: 'google' | 'github' | 'discord' | 'facebook' | 'gitlab' | 'bitbucket') => Promise<{ data: any; error: any }>;
  signInWithMagicLink: (email: string, options?: { shouldCreateUser?: boolean; emailRedirectTo?: string }) => Promise<{ data: any; error: any }>;
  signInWithOtp: (email: string, options?: { shouldCreateUser?: boolean }) => Promise<{ data: any; error: any }>;
  signInWithSmsOtp: (phone: string, options?: { shouldCreateUser?: boolean }) => Promise<{ data: any; error: any }>;
  verifyOtp: (email: string, token: string, type?: 'email') => Promise<{ data: any; error: any }>;
  verifySmsOtp: (phone: string, token: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ data: any; error: any }>;
  resendConfirmationEmail: (email: string) => Promise<{ data: any; error: any }>;
  updateUser: (updates: { email?: string; password?: string; data?: any }) => Promise<{ data: any; error: any }>;
  updatePassword: (password: string) => Promise<{ data: any; error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { session } = await auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    session,
    loading,
    signUp: auth.signUp,
    signUpWithPhone: auth.signUpWithPhone,
    signIn: auth.signIn,
    signInWithOAuth: auth.signInWithOAuth,
    signInWithMagicLink: auth.signInWithMagicLink,
    signInWithOtp: auth.signInWithOtp,
    signInWithSmsOtp: auth.signInWithSmsOtp,
    verifyOtp: auth.verifyOtp,
    verifySmsOtp: auth.verifySmsOtp,
    signOut: auth.signOut,
    resetPassword: auth.resetPassword,
    resendConfirmationEmail: auth.resendConfirmationEmail,
    updateUser: auth.updateUser,
    updatePassword: auth.updatePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 