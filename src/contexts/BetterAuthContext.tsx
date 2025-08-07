"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authClient } from '@/src/lib/auth-client';
import type { Session, User } from 'better-auth/types';

interface BetterAuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name?: string) => Promise<{ data: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signInWithSocial: (provider: string, options?: any) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ data: any; error: any }>;
  linkSocial: (provider: string, options?: any) => Promise<{ data: any; error: any }>;
  unlinkAccount: (providerId: string) => Promise<{ data: any; error: any }>;
  deleteUser: (token?: string) => Promise<{ data: any; error: any }>;
  refetch: () => Promise<void>;
}

const BetterAuthContext = createContext<BetterAuthContextType | undefined>(undefined);

export function BetterAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Get session data using Better Auth's useSession hook
  const { data: sessionData, isPending, error, refetch } = authClient.useSession();

  useEffect(() => {
    if (!isPending) {
      setSession(sessionData || null);
      setUser(sessionData?.user || null);
      setLoading(false);
    }
  }, [sessionData, isPending]);

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const result = await authClient.signUp.email({
        email,
        password,
        name,
        callbackURL: "/dashboard",
      });
      
      if (result.error) {
        return { data: null, error: result.error };
      }
      
      return { data: result.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const result = await authClient.signIn.email({
        email,
        password,
        callbackURL: "/dashboard",
      });
      
      if (result.error) {
        return { data: null, error: result.error };
      }
      
      return { data: result.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signInWithSocial = async (provider: string, options: any = {}) => {
    try {
      const result = await authClient.signIn.social({
        provider,
        callbackURL: "/dashboard",
        ...options,
      });
      
      if (result.error) {
        return { data: null, error: result.error };
      }
      
      return { data: result.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const result = await authClient.signOut();
      return { error: result.error };
    } catch (error) {
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const result = await authClient.resetPassword({
        email,
        callbackURL: "/auth/reset-password",
      });
      
      if (result.error) {
        return { data: null, error: result.error };
      }
      
      return { data: result.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const linkSocial = async (provider: string, options: any = {}) => {
    try {
      const result = await authClient.linkSocial({
        provider,
        callbackURL: "/dashboard",
        ...options,
      });
      
      if (result.error) {
        return { data: null, error: result.error };
      }
      
      return { data: result.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const unlinkAccount = async (providerId: string) => {
    try {
      const result = await authClient.unlinkAccount({
        providerId,
      });
      
      if (result.error) {
        return { data: null, error: result.error };
      }
      
      return { data: result.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const deleteUser = async (token?: string) => {
    try {
      const result = await authClient.deleteUser(token ? { token } : undefined);
      
      if (result.error) {
        return { data: null, error: result.error };
      }
      
      return { data: result.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithSocial,
    signOut,
    resetPassword,
    linkSocial,
    unlinkAccount,
    deleteUser,
    refetch,
  };

  return (
    <BetterAuthContext.Provider value={value}>
      {children}
    </BetterAuthContext.Provider>
  );
}

export function useBetterAuth() {
  const context = useContext(BetterAuthContext);
  if (context === undefined) {
    throw new Error('useBetterAuth must be used within a BetterAuthProvider');
  }
  return context;
}
