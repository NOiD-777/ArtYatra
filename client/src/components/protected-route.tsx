import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

export default function Protected({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [loading, isAuthenticated, setLocation]);

  // During hydration, render a neutral screen to avoid flicker/loops
  if (loading) {
    return <div className="min-h-screen bg-cream" />;
  }

  if (!isAuthenticated) return null;
  return <>{children}</>;
}