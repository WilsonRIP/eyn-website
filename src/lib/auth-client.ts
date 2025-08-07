import React from 'react';

// Simple auth client that works with Better Auth API routes
const baseURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const authClient = {
  // Session hook that fetches session data
  useSession: () => {
    const [data, setData] = React.useState(null);
    const [isPending, setIsPending] = React.useState(true);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
      fetch(`${baseURL}/api/auth/session`)
        .then(res => res.json())
        .then(data => {
          setData(data);
          setIsPending(false);
        })
        .catch(err => {
          setError(err);
          setIsPending(false);
        });
    }, []);

    return { data, isPending, error, refetch: () => {} };
  },

  // Auth methods
  signUp: {
    email: async (params: any) => {
      const res = await fetch(`${baseURL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      return res.json();
    },
  },

  signIn: {
    email: async (params: any) => {
      const res = await fetch(`${baseURL}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      return res.json();
    },
    social: async (params: any) => {
      const res = await fetch(`${baseURL}/api/auth/social`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      return res.json();
    },
  },

  signOut: async () => {
    const res = await fetch(`${baseURL}/api/auth/signout`, {
      method: 'POST',
    });
    return res.json();
  },

  resetPassword: async (params: any) => {
    const res = await fetch(`${baseURL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.json();
  },

  linkSocial: async (params: any) => {
    const res = await fetch(`${baseURL}/api/auth/link-social`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.json();
  },

  unlinkAccount: async (params: any) => {
    const res = await fetch(`${baseURL}/api/auth/unlink-account`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.json();
  },

  deleteUser: async (params?: any) => {
    const res = await fetch(`${baseURL}/api/auth/delete-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.json();
  },
};
