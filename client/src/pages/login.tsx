import { FormEvent, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Lock } from "lucide-react";

const LOGOUT_REASON_KEY = "logout_reason";

export default function Login() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [phone, setPhone] = useState(""); // 10-digit input only (we prepend +91)
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Show “session timed out / signed out” message when redirected here
  useEffect(() => {
    try {
      const reason = sessionStorage.getItem(LOGOUT_REASON_KEY);
      if (reason) {
        setError(reason);
        sessionStorage.removeItem(LOGOUT_REASON_KEY);
      }
    } catch {}
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Always send +91 prefix
    const fullPhone = `+91${phone}`;
    const res = await login(fullPhone, password);

    setLoading(false);
    if (res.ok) {
      // short delay to allow context to propagate
      setTimeout(() => setLocation("/"), 0);
    } else {
      setError(res.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white p-4">
      <Card className="w-full max-w-md shadow-xl border border-orange-100">
        <CardContent className="pt-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Welcome to ArtYatra</h1>
            <p className="text-sm text-gray-600 mt-1">Please sign in to continue</p>
          </div>

          {error && (
            <div className="mb-4 rounded border border-orange-300 bg-orange-50 px-3 py-2 text-sm text-orange-800">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Phone</label>
              <div className="mt-1 flex">
                {/* Fixed +91 box */}
                <div className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-100 text-gray-700">
                  +91
                </div>

                {/* User input box */}
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    // Allow only numbers and max 10 digits
                    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setPhone(val);
                  }}
                  placeholder="XXXXXXXXXX"
                  className="rounded-l-none flex-1"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1 relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </span>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="text-xs text-gray-500 mt-4">
            By signing in, you agree to our Terms & Privacy Policy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
