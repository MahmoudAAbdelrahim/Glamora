"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;

  role: "user" | "admin";

  profileImage?: {
    url: string;
    publicId: string;
  };

  address?: {
    governorate?: string;
    city?: string;
    area?: string;
    street?: string;
    building?: string;
    floor?: string;
    apartment?: string;
    postalCode?: string;
    notes?: string;
  };
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext =
  createContext<AuthContextType | null>(
    null
  );

export default function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<AuthUser | null>(null);

  const [loading, setLoading] =
    useState(true);

  async function refreshUser() {
    try {
      const response = await fetch(
        "/api/auth/me",
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      if (!response.ok) {
        setUser(null);
        return;
      }

      const data =
        await response.json();

      if (
        data?.success &&
        data?.user
      ) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }

  async function logout() {
    try {
      await fetch(
        "/api/auth/logout",
        {
          method: "POST",
          credentials: "include",
        }
      );
    } finally {
      setUser(null);
    }
  }

  useEffect(() => {
    let mounted = true;

    async function load() {
      await refreshUser();

      if (mounted) {
        setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}