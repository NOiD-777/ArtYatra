import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type AuthContextType = {
  token: string | null;
  isAuthenticated: boolean;
  login: (phone: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "auth_token";
const API_BASE = import.meta.env.VITE_AUTH_API_BASE ?? "https://api.corpus.swecha.org/api/v1";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (token) localStorage.setItem(STORAGE_KEY, token);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, [token]);

  const login = async (phone: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = (data && (data.detail || data.message)) ?? `Login failed (${res.status})`;
        return { ok: false, error: String(msg) };
      }
      const maybeToken = data?.token || data?.access_token || data?.jwt || JSON.stringify(data);
      setToken(String(maybeToken));
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message || "Network error" };
    }
  };

  const logout = () => setToken(null);

  const value = useMemo(() => ({ token, isAuthenticated: !!token, login, logout }), [token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};