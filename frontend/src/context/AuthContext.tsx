"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch, loadAccessTokenFromStorage, setAccessToken } from "@/lib/api";

type User = { id: string; email: string };

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  login(email: string, password: string): Promise<void>;
  register(email: string, password: string): Promise<void>;
  logout(): Promise<void>;
  refreshMe(): Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setLoading] = useState(true);

  async function refreshMe() {
    try {
      const me = await apiFetch<User>("/auth/me");
      setUser(me);
    } catch {
      setUser(null);
    }
  }

  async function login(email: string, password: string) {
    const data = await apiFetch<{ accessToken: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setAccessToken(data.accessToken);
    await refreshMe();
  }

  async function register(email: string, password: string) {
    const data = await apiFetch<{ accessToken: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setAccessToken(data.accessToken);
    await refreshMe();
  }

  async function logout() {
    try {
      await apiFetch<void>("/auth/logout", { method: "POST" });
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }

  useEffect(() => {
    (async () => {
      loadAccessTokenFromStorage();
      
      await refreshMe();
      setLoading(false);
    })();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isLoading, login, register, logout, refreshMe }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}