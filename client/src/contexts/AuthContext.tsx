import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type AuthContextType = {
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean; // ← NEW: guard waits until hydration completes
  login: (phone: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "auth_token";
const API_BASE = import.meta.env.VITE_AUTH_API_BASE ?? "https://api.corpus.swecha.org/api/v1";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Hydrate token from localStorage once on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setToken(saved);
    } catch {
      // ignore storage errors
    } finally {
      setLoading(false);
    }
  }, []);

  // Persist token whenever it changes
  useEffect(() => {
    try {
      if (token) localStorage.setItem(STORAGE_KEY, token);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore storage errors
    }
  }, [token]);

  const login = async (phone: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
        // If your backend sets httpOnly cookies instead of returning a token,
        // uncomment the next line AND set a dummy truthy token below.
        // credentials: "include",
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = (data && (data.detail || data.message)) ?? `Login failed (${res.status})`;
        return { ok: false, error: String(msg) };
      }

      // If API returns a token:
      const maybeToken = data?.token || data?.access_token || data?.jwt || JSON.stringify(data);
      setToken(String(maybeToken));

      // If API only sets cookies and does NOT return a token, use a placeholder:
      // setToken("cookie"); // uncomment if using httpOnly cookie auth

      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message || "Network error" };
    }
  };

  const logout = () => setToken(null);

  const value = useMemo(
    () => ({ token, isAuthenticated: !!token, loading, login, logout }),
    [token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};