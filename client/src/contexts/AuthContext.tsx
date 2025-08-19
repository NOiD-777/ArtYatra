import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

/**
 * Two supported auth modes:
 *  - TOKEN mode (default): API returns a token in JSON { token | access_token | jwt }.
 *  - COOKIE mode (optional): API sets an httpOnly cookie; client must use credentials: 'include'.
 *
 * Switch with VITE_AUTH_MODE = "cookie" | "token"
 */
const AUTH_MODE = (import.meta.env.VITE_AUTH_MODE || "token").toLowerCase() as "token" | "cookie";

type AuthContextType = {
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (phone: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "auth_token";
const API_BASE = import.meta.env.VITE_AUTH_API_BASE ?? "https://api.corpus.swecha.org/api/v1";

/** Normalize any string into a proper Authorization header value. */
function toBearer(value: string): string {
  if (!value) return "";
  const v = String(value).trim().replace(/^"+|"+$/g, "");
  return /^Bearer\s+/i.test(v) ? v : `Bearer ${v}`;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Hydrate synchronously to minimize flicker; we still gate on `loading`.
  const [token, setToken] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved || null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In case localStorage wasn’t readable at constructor time (rare environments)
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && !token) {
        setToken(saved);
      }
    } catch {}
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist token
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
        // Enable cookies when AUTH_MODE is cookie
        ...(AUTH_MODE === "cookie" ? { credentials: "include" as const } : {}),
        body: JSON.stringify({ phone, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // Some backends return { detail } or { message } on error
        const msg = (data && (data.detail || data.message)) ?? `Login failed (${res.status})`;
        return { ok: false, error: String(msg) };
      }

      if (AUTH_MODE === "token") {
        // Accept common token field names
        const raw =
          data?.token ??
          data?.access_token ??
          data?.jwt ??
          data?.id_token ??
          "";

        if (!raw || typeof raw !== "string") {
          // As a fallback, check Authorization header
          const authHeader = res.headers.get("authorization");
          if (authHeader) {
            setToken(authHeader);
          } else {
            // Last resort—store the entire payload (still truthy), but normalize later uses:
            setToken(toBearer(JSON.stringify(data)));
          }
        } else {
          setToken(toBearer(raw));
        }
      } else {
        // COOKIE mode: server set an httpOnly cookie.
        // Store a placeholder truthy token so the guard lets you through.
        setToken("cookie");
      }

      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message || "Network error" };
    }
  };

  const logout = () => setToken(null);

  const value = useMemo(
    () => ({
      token,
      isAuthenticated: !!token,
      loading,
      login,
      logout,
    }),
    [token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};