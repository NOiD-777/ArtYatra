import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const AUTH_MODE = (import.meta.env.VITE_AUTH_MODE || "token").toLowerCase() as "token" | "cookie";

type AuthContextType = {
  token: string | null;
  userId: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (phone: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "auth_token";
const API_BASE = import.meta.env.VITE_AUTH_API_BASE ?? "https://api.corpus.swecha.org/api/v1";

function toBearer(value: string): string {
  if (!value) return "";
  const v = String(value).trim().replace(/^"+|"+$/g, "");
  return /^Bearer\s+/i.test(v) ? v : `Bearer ${v}`;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || null;
    } catch {
      return null;
    }
  });
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && !token) setToken(saved);
    } catch {}
    setLoading(false);
  }, []);

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
        ...(AUTH_MODE === "cookie" ? { credentials: "include" as const } : {}),
        body: JSON.stringify({ phone, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = (data && (data.detail || data.message)) ?? `Login failed (${res.status})`;
        return { ok: false, error: String(msg) };
      }

      let rawToken = "";
      if (AUTH_MODE === "token") {
        rawToken =
          data?.token ??
          data?.access_token ??
          data?.jwt ??
          data?.id_token ??
          "";
        setToken(toBearer(rawToken));

        // Fetch user info after login
        try {
          const meRes = await fetch(`${API_BASE}/auth/me`, {
            method: "GET",
            headers: { Authorization: toBearer(rawToken), accept: "application/json" },
          });
          const meData = await meRes.json().catch(() => ({}));
          if (meRes.ok && meData?.user_id) {
            setUserId(meData.user_id);
          }
        } catch {}
      } else {
        setToken("cookie");
      }

      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message || "Network error" };
    }
  };

  const logout = () => {
    setToken(null);
    setUserId(null);
  };

  const value = useMemo(
    () => ({ token, userId, isAuthenticated: !!token, loading, login, logout }),
    [token, userId, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};