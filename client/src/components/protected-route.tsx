import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

export default function Protected({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  // Only decide after hydration completes
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [loading, isAuthenticated, setLocation]);

  // While hydrating, render a lightweight placeholder (avoids flicker/redirect loop)
  if (loading) {
    return <div className="min-h-screen bg-cream" />; // or your spinner component
  }

  if (!isAuthenticated) return null;
  return <>{children}</>;
}