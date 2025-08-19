import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Palette, Search } from "lucide-react"; // merged: include Search here
import FileUpload from "@/components/file-upload";
import ArtStyleCard from "@/components/art-style-card";
import LoadingSpinner from "@/components/loading-spinner";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import type { ArtStyle } from "@shared/schema";



export default function Home() {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    // Optionally redirect to login after logout
    window.location.href = "/login";
  }
  
  const [, setLocation] = useLocation();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);

  const { data: artStyles = [], isLoading: artStylesLoading } = useQuery<ArtStyle[]>({
    queryKey: ["/api/artstyles"],
  });

  const handleImageUpload = (imageData: string) => {
    setUploadedImage(imageData);
  };

  const handleClassify = async () => {
    if (!uploadedImage) return;

    setIsClassifying(true);

    try {
      // Convert base64 to file for upload
      const base64Data = uploadedImage.split(",")[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const file = new File([byteArray], "artwork.jpg", { type: "image/jpeg" });

      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/classify", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Classification failed");
      }

      const result = await response.json();

      // Navigate to map with classification result
      sessionStorage.setItem("classificationResult", JSON.stringify(result));
      sessionStorage.setItem("uploadedImage", uploadedImage);
      setLocation("/map");
    } catch (error) {
      console.error("Classification error:", error);
      alert("Failed to classify artwork. Please try again.");
    } finally {
      setIsClassifying(false);
    }
  };

  const resetUpload = () => {
    setUploadedImage(null);
  };

  if (isClassifying) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <LoadingSpinner
          text="Analyzing your artwork..."
          subtitle="Our AI is identifying the art style and cultural origins"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Navigation */}
      <nav className="bg-white shadow-lg sticky top-0 z-50" data-testid="navigation">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-display font-bold text-gray-800">
                <Palette className="inline-block text-orange-500 mr-2" size={28} />
                ArtYatra
              </h1>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <a href="#home" className="text-gray-700 hover:text-orange-500 transition-colors duration-300">
                Home
              </a>
              <Button onClick={handleLogout} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg shadow">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="gradient-bg text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="fade-in">
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">
              Discover India's Rich
              <span className="text-white block">Artistic Heritage</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Upload artwork images and explore their origins through AI-powered classification and interactive mapping
            </p>
          </div>
        </div>
      </section>

      {/* Upload Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-800 mb-4">
                Start Your Art Journey
              </h2>
              <p className="text-gray-600 text-lg">
                Upload an image of Indian artwork to discover its style and cultural origins
              </p>
            </div>

            <Card className="bg-cream shadow-lg">
              <CardContent className="p-8">
                {!uploadedImage ? (
                  <FileUpload onImageUpload={handleImageUpload} />
                ) : (
                  <div className="text-center" data-testid="image-preview">
                    <img
                      src={uploadedImage}
                      alt="Uploaded artwork preview"
                      className="max-w-md mx-auto rounded-lg shadow-lg mb-6"
                      data-testid="preview-image"
                    />
                    <div className="flex justify-center space-x-4">
                      <Button
                        onClick={handleClassify}
                        className="bg-orange-500 text-white hover:bg-orange-600"
                        data-testid="button-classify"
                      >
                        <Upload className="mr-2" size={16} />
                        Classify Artwork
                      </Button>
                      <Button onClick={resetUpload} variant="secondary" data-testid="button-reset">
                        Upload Different Image
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upload to Database Card */}
            <Card className="hover:shadow-lg transition cursor-pointer mt-6" onClick={() => setLocation("/upload-db")}>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Upload className="w-12 h-12 mb-4 text-primary" />
                <h3 className="text-lg font-semibold">Upload to Database</h3>
                <p className="text-sm text-muted-foreground text-center">Contribute your art to Swecha Corpus</p>
              </CardContent>
            </Card>

            {/* Search Card (added back, no duplicate imports) */}
            <Card className="hover:shadow-lg transition cursor-pointer mt-6" onClick={() => setLocation("/search")}>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Search className="w-12 h-12 mb-4 text-primary" />
                <h3 className="text-lg font-semibold">Explorer</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Find by category or location (AP & Telangana)
                </p>
              </CardContent>
            </Card>

            {/* Art Styles Gallery Preview */}
            <div className="mt-16">
              <h3 className="text-2xl font-display font-bold text-gray-800 mb-8 text-center">Supported Art Styles</h3>

              {artStylesLoading ? (
                <div className="flex justify-center">
                  <LoadingSpinner text="Loading art styles..." />
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-8" data-testid="art-styles-grid">
                  {artStyles.slice(0, 3).map((artStyle) => (
                    <ArtStyleCard key={artStyle.id} artStyle={artStyle} showFullDetails={false} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="text-xl font-display font-bold mb-4 text-orange-500">ArtYatra</h3>
            <p className="text-gray-600 mb-8">
              Discovering and preserving India's rich artistic heritage through technology
            </p>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-600">
            <p>&copy; 2025 ArtYatra. Preserving cultural heritage through innovation.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}