import { Card, CardContent } from "@/components/ui/card";
import type { ArtStyle } from "@shared/schema";

interface ArtStyleCardProps {
  artStyle: ArtStyle;
  isHighlighted?: boolean;
  showFullDetails?: boolean;
}

// Sample image URLs for different art styles
const getArtStyleImage = (artStyleName: string): string => {
  const imageMap: Record<string, string> = {
    'Warli Art': 'https://artbellz.com/wp-content/uploads/2024/04/Indian-tribal-Art-Warli-Painting-of-people-dancing-Painting-home-decor-white.webp',
    'Pochampally Ikat': 'https://mapacademy.io/wp-content/uploads/2022/04/pochampally-ikat-10Thumbnail.jpg',
    'Thanjavur Painting': 'https://5.imimg.com/data5/SELLER/Default/2023/6/318788257/ZT/MC/AM/30597499/gaja-lakshmi-tanjore-painting.jpg',
    'Madhubani Painting': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4sVlLc1XrhZXvPk3haP-bMeL0eqlGsZuRbQ&s',
    'Kalamkari': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZEbHyRDj6i9GLO3ldR0kd1opqHAJOx7iCNw&s',
    'Pattachitra': 'https://hobbyindia.store/cdn/shop/products/C1195_1200x1200.jpg?v=1720769027'
    'Gond Art': 'https://www.memeraki.com/cdn/shop/files/Bonds-of-Beauty-Gond-Art-Expressions-by-Kailash-Pradhan-2_800x.png?v=1726338113',
    'Pichwai Painting': 'https://cdn.shopify.com/s/files/1/0259/9737/7594/files/11c_a355f480-8a4e-46db-98a9-e8d4fb1e09d6_300x@2x.jpg?v=1693132118',
  };
  
  return imageMap[artStyleName] || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400';
};

const getMarkerColor = (artStyleName: string) => {
  const colorMap: Record<string, string> = {
    'Warli Art': 'bg-orange-500',
    'Pochampally Ikat': 'bg-orange-600',
    'Thanjavur Painting': 'bg-orange-400',
    'Madhubani Painting': 'bg-orange-700',
    'Kalamkari': 'bg-orange-300',
    'Pattachitra': 'bg-blue-500',
    'Gond Art': 'bg-green-600',
    'Pichwai Painting': 'bg-orange-500',
  };
  
  return colorMap[artStyleName] || 'bg-orange-500';
};

export default function ArtStyleCard({ 
  artStyle, 
  isHighlighted = false, 
  showFullDetails = false 
}: ArtStyleCardProps) {
  const markerColorClass = getMarkerColor(artStyle.name);
  const imageUrl = artStyle.imageUrl || getArtStyleImage(artStyle.name);
  
  return (
    <Card 
      className={`card-hover bg-white shadow-lg overflow-hidden ${
        isHighlighted ? 'ring-2 ring-golden ring-offset-2' : ''
      }`}
      data-testid={`card-art-style-${artStyle.id}`}
    >
      <img 
        src={imageUrl} 
        alt={`${artStyle.name} example`}
        className="w-full h-48 object-cover"
        data-testid={`img-art-style-${artStyle.id}`}
      />
      
      <CardContent className="p-6">
        <div className="flex items-center mb-3">
          <div className={`w-3 h-3 ${markerColorClass} rounded-full mr-3`} />
          <h4 className="text-xl font-display font-bold text-gray-800" data-testid={`text-name-${artStyle.id}`}>
            {artStyle.name}
          </h4>
        </div>
        
        <p className="text-gray-600 text-sm mb-3" data-testid={`text-location-${artStyle.id}`}>
          {artStyle.state}, India
        </p>
        
        <p className="text-gray-700 mb-4" data-testid={`text-description-${artStyle.id}`}>
          {artStyle.description}
        </p>
        
        <div className="bg-cream p-4 rounded-lg">
          <h5 className="font-semibold text-gray-800 mb-2">Fun Facts:</h5>
          <ul className="text-sm text-gray-700 space-y-1" data-testid={`list-fun-facts-${artStyle.id}`}>
            {Array.isArray(artStyle.funFacts) ? (
              artStyle.funFacts.map((fact, index) => (
                <li key={index}>• {fact}</li>
              ))
            ) : (
              <li>• Rich cultural heritage and traditional significance</li>
            )}
          </ul>
        </div>
        
        {showFullDetails && artStyle.culturalSignificance && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h5 className="font-semibold text-gray-800 mb-2">Cultural Significance:</h5>
            <p className="text-sm text-gray-700" data-testid={`text-cultural-significance-${artStyle.id}`}>
              {artStyle.culturalSignificance}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
