import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

/**
 * Two supported auth modes:
 *  - TOKEN mode (default): API returns a token in JSON { token | access_token | jwt }.
 *  - COOKIE mode (optional): API sets an httpOnly cookie; client must use credentials: 'include'.
 *
 * Switch with VITE_AUTH_MODE = "cookie" | "token"
 */
const AUTH_MODE = (import.meta.env.VITE_AUTH_MODE || "token").toLowerCase() as
  | "token"
  | "cookie";

type AuthContextType = {
  token: string | null;
  userId: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (
    phone: string,
    password: string
  ) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "auth_token";
const API_BASE =
  import.meta.env.VITE_AUTH_API_BASE ?? "https://api.corpus.swecha.org/api/v1";

/** Normalize any string into a proper Authorization header value. */
function toBearer(value: string): string {
  if (!value) return "";
  const v = String(value).trim().replace(/^"+|"+$/g, "");
  return /^Bearer\s+/i.test(v) ? v : `Bearer ${v}`;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved || null;
    } catch {
      return null;
    }
  });

  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Hydrate localStorage
  useEffect(() => {
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

  // Fetch userId whenever token changes
  useEffect(() => {
    const fetchUserId = async () => {
      if (!token || token === "cookie") {
        setUserId(null);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: toBearer(token),
          },
        });
        if (res.ok) {
          const data = await res.json();
          // assuming backend returns { id: "uuid", ... }
          setUserId(data?.id ?? null);
        } else {
          setUserId(null);
        }
      } catch {
        setUserId(null);
      }
    };
    fetchUserId();
  }, [token]);

  const login = async (phone: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        ...(AUTH_MODE === "cookie"
          ? { credentials: "include" as const }
          : {}),
        body: JSON.stringify({ phone, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg =
          (data && (data.detail || data.message)) ??
          `Login failed (${res.status})`;
        return { ok: false, error: String(msg) };
      }

      if (AUTH_MODE === "token") {
        const raw =
          data?.token ?? data?.access_token ?? data?.jwt ?? data?.id_token ?? "";

        if (!raw || typeof raw !== "string") {
          const authHeader = res.headers.get("authorization");
          if (authHeader) {
            setToken(authHeader);
          } else {
            setToken(toBearer(JSON.stringify(data)));
          }
        } else {
          setToken(toBearer(raw));
        }
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
    () => ({
      token,
      userId,
      isAuthenticated: !!token,
      loading,
      login,
      logout,
    }),
    [token, userId, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};