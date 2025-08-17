import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, MapPin, Upload } from "lucide-react";

const DEFAULT_CATEGORY_ID = "4366cab1-031e-4b37-816b-311ee34461a9";
// set your Swecha user_id here or let the user type it via the field below
const DEFAULT_SWECHA_USER_ID = "56348033-3610-45ec-9a0b-342e2075091f";

export default function UploadToDatabase() {
  const [, setLocation] = useLocation();
  const { token } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState<number | "">("");
  const [longitude, setLongitude] = useState<number | "">("");

  const [userId, setUserId] = useState(
    localStorage.getItem("swecha_user_id") || DEFAULT_SWECHA_USER_ID || ""
  );

  const [fileObj, setFileObj] = useState<File | null>(null);
  const [uploadUuid, setUploadUuid] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [serverMsg, setServerMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // request geolocation on mount
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(Number(pos.coords.latitude.toFixed(6)));
        setLongitude(Number(pos.coords.longitude.toFixed(6)));
      },
      () => {},
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0] || null;
    setFileObj(f);
    if (f) setUploadUuid(crypto.randomUUID()); // generate a fresh UUID per file
  };

  const handleSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault();
    setError(null);
    setServerMsg(null);

    if (!title) return setError("Please enter a title.");
    if (latitude === "" || longitude === "") return setError("Location not available — please enter coordinates.");
    if (!userId) return setError("Swecha User ID is required.");
    if (!fileObj) return setError("Please choose an image file.");

    try {
      setLoading(true);
      localStorage.setItem("swecha_user_id", userId);

      const form = new FormData();
      form.set("title", title);
      form.set("description", description);
      form.set("latitude", String(latitude));
      form.set("longitude", String(longitude));
      form.set("user_id", userId);
      form.set("category_id", DEFAULT_CATEGORY_ID);
      form.set("release_rights", "creator");
      form.set("use_uid_filename", "false");
      form.set("media_type", "image");

      // single chunk flow
      form.set("total_chunks", "1");
      form.set("upload_uuid", uploadUuid);

      // attach file + filename (MUST match finalize)
      form.set("filename", fileObj.name);
      form.set("file", fileObj);

      const res = await fetch("/api/swecha/upload/simple", {
        method: "POST",
        headers: {
          accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: form,
      });

      const text = await res.text();
let data: any = null;
try { data = JSON.parse(text); } catch {}

if (res.ok && (data?.uid || data?.status === "uploaded")) {
  setServerMsg("✅ Uploaded successfully!");
  // optional: keep for later use
  if (data?.uid) sessionStorage.setItem("swecha_last_record_uid", data.uid);
  if (data?.file_url) sessionStorage.setItem("swecha_last_record_url", data.file_url);
} else {
  const detail = (data && (data.detail || data.message)) ? `: ${data.detail || data.message}` : "";
  setError(`❌ Upload failed (${res.status})${detail}`);
}
    } catch (err: any) {
      setError(err?.message || "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  const goHome = () => setLocation("/");

  return (
    <div className="min-h-screen bg-cream">
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button onClick={goHome} className="inline-flex items-center text-gray-700 hover:text-gray-900">
            <ArrowLeft className="mr-2" size={18} />
            Back
          </button>
          <h1 className="text-lg font-semibold">Upload to Database</h1>
          <div />
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Card className="max-w-3xl mx-auto">
          <CardContent className="p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-6">Submit to Swecha Corpus</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter a descriptive title" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                <textarea
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description of the artwork"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Latitude *</label>
                  <Input
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="e.g. 17.3850"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Longitude *</label>
                  <Input
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="e.g. 78.4867"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Swecha User ID *</label>
                <Input
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="56348033-3610-45ec-9a0b-342e2075091f"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image File *</label>
                  <Input type="file" accept="image/*" onChange={onFileChange} required />
                  <p className="text-xs text-gray-500 mt-1">
                    A unique <code>upload_uuid</code> will be generated automatically.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <Input value={DEFAULT_CATEGORY_ID} disabled />
                </div>
              </div>

              {uploadUuid && (
                <p className="text-xs text-gray-600">
                  <strong>Upload UUID:</strong> {uploadUuid}
                </p>
              )}

              <div className="flex items-center gap-3 text-sm text-gray-600">
                <MapPin size={16} />
                <span>We’ll use your current location if permitted; you can edit coordinates anytime.</span>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}
              {serverMsg && (
                <pre className="text-xs bg-gray-50 border rounded p-3 overflow-auto max-h-52">{serverMsg}</pre>
              )}

              <div className="pt-2">
                <Button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 inline-flex items-center"
                  disabled={loading}
                >
                  <Upload className="mr-2" size={16} />
                  {loading ? "Uploading..." : "Upload to Swecha"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}