import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle } from "lucide-react";
import IndiaMap from "@/components/india-map";
import ArtStyleCard from "@/components/art-style-card";
import LoadingSpinner from "@/components/loading-spinner";
import { useQuery } from "@tanstack/react-query";
import type { ArtStyle } from "@shared/schema";

interface ClassificationResult {
  classification: {
    id: string;
    confidence: number;
    reasoning: string;
  };
  artStyle: ArtStyle;
}

export default function Map() {
  const [, setLocation] = useLocation();
  const [classificationResult, setClassificationResult] = useState<ClassificationResult | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const { data: artStyles = [], isLoading: artStylesLoading } = useQuery<ArtStyle[]>({
    queryKey: ["/api/artstyles"],
  });

  useEffect(() => {
    // Get classification result from session storage
    const storedResult = sessionStorage.getItem('classificationResult');
    const storedImage = sessionStorage.getItem('uploadedImage');
    
    if (storedResult) {
      setClassificationResult(JSON.parse(storedResult));
    }
    
    if (storedImage) {
      setUploadedImage(storedImage);
    }
    
    // If no result, redirect to home
    if (!storedResult) {
      setLocation('/');
    }
  }, [setLocation]);

  const handleBackToUpload = () => {
    // Clear session storage
    sessionStorage.removeItem('classificationResult');
    sessionStorage.removeItem('uploadedImage');
    setLocation('/');
  };

  if (artStylesLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <LoadingSpinner text="Loading map data..." />
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
                ArtYatra
              </h1>
            </div>
            <Button 
              onClick={handleBackToUpload}
              variant="outline"
              className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
              data-testid="button-back-home"
            >
              <ArrowLeft className="mr-2" size={16} />
              Back to Upload
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-800 mb-4">
            Art Heritage Map of India
          </h2>
          <p className="text-gray-600 text-lg">
            Explore the geographical origins of different Indian art styles
          </p>
        </div>

        {/* Classification Result Card */}
        {classificationResult && (
          <Card className="max-w-2xl mx-auto mb-8 bg-gradient-to-r from-saffron to-golden text-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center" data-testid="classification-result">
                <div className="flex-shrink-0">
                  <CheckCircle size={32} />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold" data-testid="text-art-style">
                    {classificationResult.artStyle.name}
                  </h3>
                  <p className="text-sm opacity-90" data-testid="text-confidence">
                    Confidence: {classificationResult.classification.confidence}%
                  </p>
                  <p className="mt-2" data-testid="text-description">
                    Your artwork has been classified as {classificationResult.artStyle.name} from {classificationResult.artStyle.state}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Map Container */}
        <Card className="bg-white shadow-lg overflow-hidden mb-12">
          <IndiaMap 
            artStyles={artStyles} 
            highlightedArtStyle={classificationResult?.artStyle}
          />
        </Card>

        {/* Art Style Details Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {artStyles.map((artStyle) => (
            <ArtStyleCard 
              key={artStyle.id} 
              artStyle={artStyle}
              isHighlighted={classificationResult?.artStyle.id === artStyle.id}
              showFullDetails={true}
            />
          ))}
        </div>

        {/* Back to Upload Button */}
        <div className="text-center mt-12">
          <Button 
            onClick={handleBackToUpload}
            className="bg-orange-500 text-white hover:bg-orange-600"
            data-testid="button-upload-another"
          >
            <ArrowLeft className="mr-2" size={16} />
            Upload Another Artwork
          </Button>
        </div>
      </div>
    </div>
  );
}
