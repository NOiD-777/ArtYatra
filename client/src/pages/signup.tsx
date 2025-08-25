import { FormEvent, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const API_BASE =
  import.meta.env.VITE_AUTH_API_BASE ?? "https://api.corpus.swecha.org/api/v1";

/** Helper to normalize Indian phone numbers to +91XXXXXXXXXX */
function normalizePhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  if (raw.startsWith("+")) return raw; // assume already in E.164
  return raw;
}

type Gender = "Male" | "Female" | "Other" | "";

export default function SignUp() {
  const [, setLocation] = useLocation();

  // form state
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState<Gender>("");
  const [dob, setDob] = useState(""); // yyyy-mm-dd
  const [place, setPlace] = useState("");
  const [password, setPassword] = useState("");
  const [consent, setConsent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [serverErr, setServerErr] = useState<string | null>(null);
  const [serverOk, setServerOk] = useState<string | null>(null);

  // simple client validation
  const clientError = useMemo(() => {
    if (!phone) return "Phone is required";
    if (!name.trim()) return "Name is required";
    if (!email.trim()) return "Email is required";
    if (!gender) return "Please select gender";
    if (!dob) return "Date of birth is required";
    if (!place.trim()) return "Place is required";
    if (!password) return "Password is required";
    if (!consent) return "You must provide consent";
    return null;
  }, [phone, name, email, gender, dob, place, password, consent]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerErr(null);
    setServerOk(null);
    if (clientError) {
      setServerErr(clientError);
      return;
    }

    setLoading(true);
    try {
      const body = {
        phone: normalizePhone(phone),
        name: name.trim(),
        email: email.trim(),
        gender,
        date_of_birth: dob, // "YYYY-MM-DD"
        place: place.trim(),
        password,
        role_ids: [2], // default user role
        has_given_consent: true,
      };

      const res = await fetch(`${API_BASE}/users/`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const text = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(text);
      } catch {
        /* ignore */
      }

      if (!res.ok) {
        const detail =
          (data && (data.detail || data.message)) ||
          text ||
          `Request failed (${res.status})`;
        setServerErr(String(detail));
        return;
      }

      setServerOk("Account created successfully. Redirecting to sign in…");
      // small delay so user can read it
      setTimeout(() => setLocation("/login"), 900);
    } catch (err: any) {
      setServerErr(err?.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white p-4">
      <Card className="w-full max-w-lg shadow-xl border border-orange-100">
        <CardContent className="pt-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Create your Swecha account</h1>
            <p className="text-sm text-gray-600 mt-1">Join ArtYatra</p>
          </div>

          {serverErr && (
            <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {serverErr}
            </div>
          )}
          {serverOk && (
            <div className="mb-4 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              {serverOk}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            {/* Phone (+91) */}
            <div>
              <Label className="text-sm">Phone</Label>
              <div className="mt-1 flex">
                <div className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-100 text-gray-700">
                  +91
                </div>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    // only 10 digits for India—feel free to relax this
                    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setPhone(val);
                  }}
                  placeholder="XXXXXXXXXX"
                  className="rounded-l-none flex-1"
                  required
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <Label className="text-sm">Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
              />
            </div>

            {/* Email */}
            <div>
              <Label className="text-sm">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            {/* Gender */}
            <div>
              <Label className="text-sm">Gender</Label>
              <select
                className="mt-1 block w-full border rounded-md px-3 py-2 text-sm"
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                required
              >
                <option value="" disabled>
                  Select…
                </option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            {/* DOB */}
            <div>
              <Label className="text-sm">Date of Birth</Label>
              <Input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                required
              />
            </div>

            {/* Place */}
            <div>
              <Label className="text-sm">Place</Label>
              <Input
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                placeholder="Hyderabad"
                required
              />
            </div>

            {/* Password */}
            <div>
              <Label className="text-sm">Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a strong password"
                required
              />
            </div>

            {/* Consent */}
            <div className="flex items-center space-x-2">
              <Checkbox id="consent" checked={consent} onCheckedChange={(v) => setConsent(Boolean(v))} />
              <Label htmlFor="consent" className="text-sm">
                I give consent to create and process my account.
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create account"}
            </Button>

            <div className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <a className="text-orange-600 hover:underline" href="/login">
                Sign in
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
