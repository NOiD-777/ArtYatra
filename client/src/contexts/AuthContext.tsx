import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

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
  login: (phone: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "auth_token";
const SESSION_STARTED_AT_KEY = "auth_session_started_at";
const LOGOUT_REASON_KEY = "logout_reason";

const API_BASE =
  import.meta.env.VITE_AUTH_API_BASE ?? "https://api.corpus.swecha.org/api/v1";

// Defaults: 30 min idle, 8 hours max. Override in .env
const IDLE_TIMEOUT_MIN = Number(import.meta.env.VITE_IDLE_TIMEOUT_MIN ?? 30);
const MAX_SESSION_MIN = Number(import.meta.env.VITE_MAX_SESSION_MIN ?? 8 * 60);

/** Normalize any string into a proper Authorization header value. */
function toBearer(value: string): string {
  if (!value) return "";
  const v = String(value).trim().replace(/^"+|"+$/g, "");
  return /^Bearer\s+/i.test(v) ? v : `Bearer ${v}`;
}

// Centralized logout that can record a reason for the login page
function doLogout(
  setToken: (t: string | null) => void,
  setUserId: (u: string | null) => void,
  reason?: string
) {
  try {
    if (reason) sessionStorage.setItem(LOGOUT_REASON_KEY, reason);
    sessionStorage.removeItem(SESSION_STARTED_AT_KEY);
  } catch {}
  setToken(null);
  setUserId(null);
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  // --- Idle / Max session timers ---
  const idleTimerRef = useRef<number | null>(null);
  const maxTimerRef = useRef<number | null>(null);

  const clearTimers = () => {
    if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    if (maxTimerRef.current) window.clearTimeout(maxTimerRef.current);
    idleTimerRef.current = null;
    maxTimerRef.current = null;
  };

  const startIdleTimer = () => {
    if (!IDLE_TIMEOUT_MIN) return;
    if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    idleTimerRef.current = window.setTimeout(() => {
      doLogout(setToken, setUserId, "Your session expired due to inactivity. Please sign in again.");
      // Redirect happens via Protected route or any guard; message shows on login.
      window.location.href = "/login";
    }, IDLE_TIMEOUT_MIN * 60 * 1000);
  };

  const startMaxTimer = () => {
    if (!MAX_SESSION_MIN) return;
    if (maxTimerRef.current) window.clearTimeout(maxTimerRef.current);

    // If we have a session start timestamp, respect remaining time; else set it now
    let startedAt = 0;
    try {
      startedAt = Number(sessionStorage.getItem(SESSION_STARTED_AT_KEY) || 0);
      if (!startedAt) {
        startedAt = Date.now();
        sessionStorage.setItem(SESSION_STARTED_AT_KEY, String(startedAt));
      }
    } catch {}

    const elapsed = Date.now() - startedAt;
    const total = MAX_SESSION_MIN * 60 * 1000;
    const remaining = Math.max(0, total - elapsed);

    maxTimerRef.current = window.setTimeout(() => {
      doLogout(setToken, setUserId, "Your session has ended. Please sign in again.");
      window.location.href = "/login";
    }, remaining);
  };

  const attachActivityListeners = () => {
    const resetIdle = () => startIdleTimer();
    window.addEventListener("mousemove", resetIdle);
    window.addEventListener("keydown", resetIdle);
    window.addEventListener("touchstart", resetIdle);
    window.addEventListener("visibilitychange", () => {
      if (!document.hidden) startIdleTimer();
    });
    return () => {
      window.removeEventListener("mousemove", resetIdle);
      window.removeEventListener("keydown", resetIdle);
      window.removeEventListener("touchstart", resetIdle);
      window.removeEventListener("visibilitychange", () => {
        if (!document.hidden) startIdleTimer();
      });
    };
  };

  // Hydrate localStorage on first mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && !token) setToken(saved);
    } catch {}
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist token changes
  useEffect(() => {
    try {
      if (token) localStorage.setItem(STORAGE_KEY, token);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, [token]);

  // When token becomes truthy, start timers & activity listeners; otherwise clear them
  useEffect(() => {
    clearTimers();
    let detach: (() => void) | null = null;

    if (token) {
      // initialize session start if missing
      try {
        if (!sessionStorage.getItem(SESSION_STARTED_AT_KEY)) {
          sessionStorage.setItem(SESSION_STARTED_AT_KEY, String(Date.now()));
        }
      } catch {}
      startIdleTimer();
      startMaxTimer();
      detach = attachActivityListeners();
    } else {
      try {
        sessionStorage.removeItem(SESSION_STARTED_AT_KEY);
      } catch {}
    }

    return () => {
      clearTimers();
      if (detach) detach();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          headers: { accept: "application/json", Authorization: toBearer(token) },
        });
        if (res.ok) {
          const data = await res.json();
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
        headers: { accept: "application/json", "Content-Type": "application/json" },
        ...(AUTH_MODE === "cookie" ? { credentials: "include" as const } : {}),
        body: JSON.stringify({ phone, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = (data && (data.detail || data.message)) ?? `Login failed (${res.status})`;
        return { ok: false, error: String(msg) };
      }

      if (AUTH_MODE === "token") {
        const raw = data?.token ?? data?.access_token ?? data?.jwt ?? data?.id_token ?? "";
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

      // reset session start on successful login
      try {
        sessionStorage.setItem(SESSION_STARTED_AT_KEY, String(Date.now()));
      } catch {}

      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message || "Network error" };
    }
  };

  const logout = () => {
    doLogout(setToken, setUserId, "You have been signed out.");
    window.location.href = "/login";
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
