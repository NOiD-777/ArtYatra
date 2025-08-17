import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { ArtStyle } from "@shared/schema";

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface IndiaMapProps {
  artStyles: ArtStyle[];
  highlightedArtStyle?: ArtStyle;
}

const getMarkerColor = (artStyleName: string, isHighlighted: boolean = false) => {
  if (isHighlighted) return '#F97316'; // Orange-500 for highlighted
  
  const colorMap: Record<string, string> = {
    'Warli Art': '#F97316',      // orange-500
    'Pochampally Ikat': '#EA580C', // orange-600
    'Thanjavur Painting': '#FB923C', // orange-400
    'Madhubani Painting': '#C2410C', // orange-700
    'Kalamkari': '#FDBA74',      // orange-300
    'Pattachitra': '#FED7AA',    // orange-200
    'Gond Art': '#9A3412',       // orange-800
    'Pichwai Painting': '#FEF3C7', // orange-100
  };
  
  return colorMap[artStyleName] || '#F97316';
};

const createCustomIcon = (color: string, isHighlighted: boolean = false) => {
  const size = isHighlighted ? 40 : 30;
  const shadowSize = isHighlighted ? 50 : 35;
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 14px;
        animation: ${isHighlighted ? 'bounce 2s infinite' : 'none'};
      ">
        🎨
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

export default function IndiaMap({ artStyles, highlightedArtStyle }: IndiaMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map
    mapRef.current = L.map(mapContainerRef.current).setView([20.5937, 78.9629], 5);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 10,
      minZoom: 4,
    }).addTo(mapRef.current);

    // Add CSS for bounce animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-10px); }
        60% { transform: translateY(-5px); }
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !artStyles.length) return;

    // Clear existing markers
    mapRef.current.eachLayer((layer: L.Layer) => {
      if (layer instanceof L.Marker) {
        mapRef.current!.removeLayer(layer);
      }
    });

    // Add markers for each art style
    artStyles.forEach((artStyle) => {
      if (!artStyle.originLocation || typeof artStyle.originLocation !== 'object') return;
      
      const location = artStyle.originLocation as { lat: number; lng: number };
      const isHighlighted = highlightedArtStyle?.id === artStyle.id;
      const color = getMarkerColor(artStyle.name, isHighlighted);
      const icon = createCustomIcon(color, isHighlighted);

      const marker = L.marker([location.lat, location.lng], { icon })
        .addTo(mapRef.current!)
        .bindPopup(`
          <div class="p-4 min-w-[250px]" data-testid="map-popup-${artStyle.id}">
            <h3 class="font-bold text-lg mb-2" style="color: #2D3748">${artStyle.name}</h3>
            <p class="text-sm text-gray-600 mb-2">${artStyle.state}, India</p>
            <p class="text-sm mb-3">${artStyle.description}</p>
            <div class="bg-gray-50 p-2 rounded">
              <h4 class="font-semibold text-sm mb-1">Fun Facts:</h4>
              <ul class="text-xs space-y-1">
                ${Array.isArray(artStyle.funFacts) 
                  ? artStyle.funFacts.map(fact => `<li>• ${fact}</li>`).join('')
                  : '<li>• Rich cultural heritage</li>'
                }
              </ul>
            </div>
          </div>
        `);

      // If this is the highlighted art style, open the popup and center the map
      if (isHighlighted) {
        setTimeout(() => {
          marker.openPopup();
          mapRef.current!.setView([location.lat, location.lng], 6);
        }, 500);
      }
    });
  }, [artStyles, highlightedArtStyle]);

  return (
    <div className="relative">
      <div 
        ref={mapContainerRef} 
        className="h-96 md:h-[500px] relative"
        data-testid="india-map"
      />
      
      {/* Map Legend */}
      <div className="p-6 bg-gray-50 border-t">
        <h4 className="font-semibold text-gray-800 mb-4">Art Style Legend</h4>
        <div className="grid md:grid-cols-3 gap-4">
          {artStyles.slice(0, 6).map((artStyle) => {
            const color = getMarkerColor(artStyle.name);
            const isHighlighted = highlightedArtStyle?.id === artStyle.id;
            
            return (
              <div 
                key={artStyle.id} 
                className={`flex items-center ${isHighlighted ? 'font-bold' : ''}`}
                data-testid={`legend-${artStyle.id}`}
              >
                <div 
                  className="w-4 h-4 rounded-full mr-3 border border-white shadow-sm"
                  style={{ backgroundColor: color }}
                />
                <span className="text-gray-700 text-sm">
                  {artStyle.name} - {artStyle.state}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
