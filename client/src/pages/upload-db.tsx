import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Upload } from "lucide-react";

export default function UploadChunkOnly() {
  const [, setLocation] = useLocation();
  const { token } = useAuth(); // Swecha JWT

  const [fileObj, setFileObj] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadUuid, setUploadUuid] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [releaseRights, setReleaseRights] = useState("creator"); // default
  const [language, setLanguage] = useState("telugu"); // default

  // Revoke preview URL on unmount/change
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Attempt browser geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude.toString());
          setLongitude(pos.coords.longitude.toString());
        },
        () => {}
      );
    }
  }, []);

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setMessage(null);
    const f = e.target.files?.[0] || null;

    if (!f) {
      setFileObj(null);
      setPreviewUrl(null);
      setUploadUuid("");
      return;
    }

    if (!f.type || !f.type.startsWith("image/")) {
      setFileObj(null);
      setPreviewUrl(null);
      setUploadUuid("");
      return setMessage("❌ Only image files are allowed.");
    }

    if (f.size > 10 * 1024 * 1024) {
      setFileObj(null);
      setPreviewUrl(null);
      setUploadUuid("");
      return setMessage("❌ Image too large (max 10MB).");
    }

    setFileObj(f);
    setPreviewUrl(URL.createObjectURL(f));
    setUploadUuid(crypto.randomUUID());
  };

  const handleSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!fileObj) return setMessage("❌ Please select an image.");
    if (!token) return setMessage("❌ Missing Swecha token — please log in again.");
    if (!latitude || !longitude) return setMessage("❌ Latitude and Longitude are required.");
    if (!title || !description) return setMessage("❌ Title and Description are required.");
    if (releaseRights === "downloaded")
      return setMessage("❌ You cannot upload images that are downloaded.");

    try {
      setLoading(true);

      const uuid = uploadUuid || crypto.randomUUID();
      if (!uploadUuid) setUploadUuid(uuid);

      // --- Step 1: Upload Chunk ---
      const fd = new FormData();
      fd.append("chunk", fileObj, fileObj.name);
      fd.append("filename", fileObj.name);
      fd.append("chunk_index", "0");
      fd.append("total_chunks", "1");
      fd.append("upload_uuid", uuid);

      const resChunk = await fetch(
        "https://api.corpus.swecha.org/api/v1/records/upload/chunk",
        {
          method: "POST",
          headers: { accept: "application/json", Authorization: token! },
          body: fd,
        }
      );

      if (!resChunk.ok) return setMessage("❌ Chunk upload failed.");

      // --- Step 2: Finalize Upload ---
      const params = new URLSearchParams();
      params.append("total_chunks", "1");
      params.append("filename", fileObj.name);
      params.append("latitude", latitude);
      params.append("longitude", longitude);
      params.append("use_uid_filename", "false");
      params.append("release_rights", releaseRights);
      params.append("user_id", "56348033-3610-45ec-9a0b-342e2075091f"); // fixed
      params.append("media_type", "image");
      params.append("title", title);
      params.append("language", language);
      params.append("upload_uuid", uuid);
      params.append("description", description);
      params.append("category_id", "4366cab1-031e-4b37-816b-311ee34461a9");

      const resFinal = await fetch(
        "https://api.corpus.swecha.org/api/v1/records/upload",
        {
          method: "POST",
          headers: {
            accept: "application/json",
            Authorization: token!,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params.toString(),
        }
      );

      if (!resFinal.ok) return setMessage("❌ Final upload failed.");

      setMessage("✅ Upload successful!");
    } catch (err) {
      setMessage("❌ Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  const goHome = () => setLocation("/");

  return (
    <div className="min-h-screen bg-cream">
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={goHome}
            className="inline-flex items-center text-gray-700 hover:text-gray-900"
          >
            <ArrowLeft className="mr-2" size={18} />
            Back
          </button>
          <h1 className="text-lg font-semibold">Upload Image → Swecha (Chunk)</h1>
          <div />
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Card className="max-w-xl mx-auto">
          <CardContent className="p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-6">Select an Image</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image File *
                </label>
                <Input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={onFileChange}
                  required
                />
              </div>

              {previewUrl && (
                <div className="rounded-md overflow-hidden border">
                  <img
                    src={previewUrl}
                    alt="preview"
                    className="max-h-64 w-full object-contain bg-gray-50"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <Input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600">Latitude & Longitude *</p>
                <Input
                  type="text"
                  placeholder="Latitude"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  required
                />
                <Input
                  type="text"
                  placeholder="Longitude"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Release Rights *
                </label>
                <select
                  className="w-full border rounded p-2"
                  value={releaseRights}
                  onChange={(e) => setReleaseRights(e.target.value)}
                  required
                >
                  <option value="creator">Creator</option>
                  <option value="family_or_friend">Family or Friend</option>
                  <option value="downloaded">Downloaded</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language *
                </label>
                <select
                  className="w-full border rounded p-2"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  required
                >
                  <option value="assamese">Assamese</option>
                  <option value="bengali">Bengali</option>
                  <option value="bodo">Bodo</option>
                  <option value="dogri">Dogri</option>
                  <option value="gujarati">Gujarati</option>
                  <option value="hindi">Hindi</option>
                  <option value="kannada">Kannada</option>
                  <option value="kashmiri">Kashmiri</option>
                  <option value="konkani">Konkani</option>
                  <option value="maithili">Maithili</option>
                  <option value="malayalam">Malayalam</option>
                  <option value="marathi">Marathi</option>
                  <option value="meitei">Meitei</option>
                  <option value="nepali">Nepali</option>
                  <option value="odia">Odia</option>
                  <option value="punjabi">Punjabi</option>
                  <option value="sanskrit">Sanskrit</option>
                  <option value="santali">Santali</option>
                  <option value="sindhi">Sindhi</option>
                  <option value="tamil">Tamil</option>
                  <option value="telugu">Telugu</option>
                  <option value="urdu">Urdu</option>
                </select>
              </div>

              {uploadUuid && (
                <p className="text-xs text-gray-600">
                  <strong>Upload UUID:</strong> {uploadUuid}
                </p>
              )}

              {message && (
                <p
                  className={`text-sm ${
                    message.startsWith("✅") ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {message}
                </p>
              )}

              <div className="pt-2">
                <Button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 inline-flex items-center"
                  disabled={loading || !fileObj}
                >
                  <Upload className="mr-2" size={16} />
                  {loading ? "Uploading..." : "Upload Image"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}