import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search, MapPin } from "lucide-react";
import { useLocation } from "wouter";

// React 18 + react-leaflet v4
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { LatLngExpression, LatLngBoundsExpression } from "leaflet";

// ----- Red marker icon -----
const RedIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  iconRetinaUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = RedIcon;

// -------- Map bounds limited to AP + Telangana (coarse bounding box) --------
const MAX_BOUNDS: LatLngBoundsExpression = [
  [12.5, 76.5], // SW (lat, lng)
  [20.8, 85.5], // NE
];

const DEFAULT_CENTER: LatLngExpression = [17.4, 78.5];
const DEFAULT_ZOOM = 7;

// ✅ Static categories (must match keys in CATEGORY_INFO below)
const CATEGORIES = [
  // 🎨 Painting & Scroll Arts
  "Cheriyal Scroll Paintings (Telangana)",
  "Nirmal Paintings (Telangana)",
  "Kalamkari (Andhra, Machilipatnam & Srikalahasti)",
  "Lepakshi Wall Paintings (Andhra)",
  "Deccani Miniature Painting",

  // 🧵 Textiles & Weaving
  "Pochampally Ikat (Telangana)",

  // 🪵 Crafts & Woodwork
  "Nirmal Toys (Telangana)",
  "Kondapalli Toys (Andhra)",

  // 🪨 Sculpture & Stone Arts
  "Banjara Embroidery (Both States)",
  "Andhra Stone Carving (Andhra)",
  "Bidriware (Telangana)",

  // 🎭 Folk & Tribal Arts
  "Oggu Katha (Telangana)",
  "Tholu Bommalata (Andhra & Telangana)",
];

type CategoryInfo = {
  originName: string;
  lat: number;
  lng: number;
  description: string;
  funFacts: string[];
};

// 🔒 Static “database” of origins + info (approximate coordinates; refine anytime)
const CATEGORY_INFO: Record<string, CategoryInfo> = {
  // 🎨 Painting & Scroll Arts
  "Cheriyal Scroll Paintings (Telangana)": {
    originName: "Cheriyal, Telangana",
    lat: 18.994,
    lng: 78.89,
    description:
      "Narrative Nakashi scrolls illustrating epics and caste-based tales, traditionally used by storytellers.",
    funFacts: [
      "Traditionally painted on khadi scrolls with natural pigments.",
      "Commissioned for itinerant bards to narrate village-to-village.",
      "Bold outlines, flat fills, and expressive eyes stand out.",
    ],
  },
  "Nirmal Paintings (Telangana)": {
    originName: "Nirmal, Telangana",
    lat: 19.095,
    lng: 78.344,
    description:
      "Mythological and nature themes on wood panels using bright hues and a distinct golden backdrop.",
    funFacts: [
      "Shares lineage with Nirmal toys—similar painting tradition.",
      "Patronized historically by local courts and nobility.",
      "Natural pigments and gold tones are characteristic.",
    ],
  },
  "Kalamkari (Andhra, Machilipatnam & Srikalahasti)": {
    originName: "Srikalahasti & Machilipatnam, Andhra Pradesh",
    lat: 13.752,
    lng: 79.703,
    description:
      "Hand-painted or block-printed textiles narrating epics; Srikalahasti is freehand pen-work, Machilipatnam uses blocks.",
    funFacts: [
      "‘Kalam’ means pen; bamboo/cotton nibs are used.",
      "Natural mordants yield indigo, madder red, and black.",
      "Temple hangings depict Ramayana/Mahabharata scenes.",
    ],
  },
  "Lepakshi Wall Paintings (Andhra)": {
    originName: "Lepakshi, Andhra Pradesh",
    lat: 13.804,
    lng: 77.609,
    description:
      "Vijayanagara-era murals adorning temple ceilings and walls, famed for dynamism and color.",
    funFacts: [
      "The Veerabhadra Temple houses famous murals.",
      "Themes include Shiva-Parvati and Kiratarjuneeyam.",
      "Mineral colors on lime plasters were used.",
    ],
  },
  "Deccani Miniature Painting": {
    originName: "Hyderabad Courts (Deccan)",
    lat: 17.385,
    lng: 78.486,
    description:
      "Persian-influenced miniatures with opulent palettes and lyrical compositions.",
    funFacts: [
      "Flourished under the Qutb Shahi dynasty.",
      "Lavish textiles and garden scenes are common.",
      "Distinct from Mughal miniatures in palette.",
    ],
  },

  // 🧵 Textiles & Weaving
  "Pochampally Ikat (Telangana)": {
    originName: "Bhoodan Pochampally, Telangana",
    lat: 17.283,
    lng: 78.894,
    description:
      "Double-ikat weaving with intricate geometric motifs and vibrant contrasts.",
    funFacts: [
      "Yarns are resist-dyed before weaving.",
      "Holds a Geographical Indication (GI) tag.",
      "Many households still use traditional looms.",
    ],
  },

  // 🪵 Crafts & Woodwork
  "Nirmal Toys (Telangana)": {
    originName: "Nirmal, Telangana",
    lat: 19.095,
    lng: 78.344,
    description:
      "Handcrafted wooden toys painted in bright colors; shares aesthetics with Nirmal painting.",
    funFacts: [
      "Uses locally sourced softwood.",
      "Themes range from animals to deities.",
      "Natural dyes and lacquer finishes.",
    ],
  },
  "Kondapalli Toys (Andhra)": {
    originName: "Kondapalli, Andhra Pradesh",
    lat: 16.62,
    lng: 80.534,
    description:
      "Hand-carved softwood figurines and sets; bright storytelling dioramas.",
    funFacts: [
      "Made from ‘Tella Poniki’ softwood.",
      "Village tableaux and mythic sets are classics.",
      "Lightweight and collectible.",
    ],
  },

  // 🪨 Sculpture & Stone Arts
  "Banjara Embroidery (Both States)": {
    originName: "Banjara/Lambadi Settlements (Deccan)",
    lat: 16.75,
    lng: 78.05,
    description:
      "Mirror-work and bold embroidery by the Banjara (Lambadi) community, with vibrant geometric motifs.",
    funFacts: [
      "Heavy use of mirrors, shells, and coins.",
      "Traditional attire features dense stitches.",
      "Found across Deccan trade routes.",
    ],
  },
  "Andhra Stone Carving (Andhra)": {
    originName: "Tirupati Region, Andhra Pradesh",
    lat: 13.628,
    lng: 79.419,
    description:
      "Temple sculpture traditions—pillars, icons, and reliefs with high craftsmanship.",
    funFacts: [
      "Granite and schist are commonly worked.",
      "Workshops cater to temples across the South.",
      "Motifs follow Agama/Shilpa Shastra.",
    ],
  },
  "Bidriware (Telangana)": {
    originName: "Hyderabad Market Tradition",
    lat: 17.385,
    lng: 78.486,
    description:
      "Blackened metalware with silver inlay; Deccan courts popularized its patronage and trade.",
    funFacts: [
      "Alloy is darkened using special soil treatments.",
      "Floral and geometric inlay patterns are signatures.",
      "Closely tied to Deccan sultanate aesthetics.",
    ],
  },

  // 🎭 Folk & Tribal Arts
  "Oggu Katha (Telangana)": {
    originName: "Siddipet Region, Telangana",
    lat: 18.104,
    lng: 78.846,
    description:
      "Ballad performance devoted to Mallanna and other deities—music and narration combined.",
    funFacts: [
      "Troupes carry traditional instruments.",
      "Often tied to ritual and festivals.",
      "Highly dramatic costumes and delivery.",
    ],
  },
  "Tholu Bommalata (Andhra & Telangana)": {
    originName: "Nimmalakunta (Anantapur), Andhra Pradesh",
    lat: 14.556,
    lng: 77.72,
    description:
      "Shadow-puppet theatre using painted translucent leather to narrate epics.",
    funFacts: [
      "Articulated puppets colored with natural dyes.",
      "All-night performances during festivals.",
      "Narration, music, and light interplay create drama.",
    ],
  },
};

// --- Utilities ---
function withinBounds(lat: number, lng: number): boolean {
  const [[minLat, minLng], [maxLat, maxLng]] = MAX_BOUNDS as [number[], number[]];
  return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
}

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** ---------------- Wikipedia helpers (with smart fallbacks) ---------------- */

// Remove trailing parenthetical like " (Telangana)" ONLY for Wikipedia searches
function wikiQueryFromCategory(cat: string): string {
  return cat.replace(/\s*\([^)]*\)\s*$/, "").trim();
}

/** If a category needs better search terms, list them here (most-specific first). */
const WIKI_QUERY_OVERRIDES: Record<string, string[]> = {
  "Banjara Embroidery (Both States)": [
    "Banjara embroidery",
    "Lambadi embroidery",
    "Lambani embroidery",
    "Banjara costume",
  ],
  // Add more tricky ones later if needed:
  // "Lambadi Dance (Both States)": ["Lambadi dance", "Lambani dance", "Banjara dance"],
};

// Build the candidate list: overrides (if any) + stripped category as fallback.
function getWikiCandidates(cat: string): string[] {
  const base = wikiQueryFromCategory(cat);
  const overrides = WIKI_QUERY_OVERRIDES[cat] ?? [];
  // de-duplicate while preserving order
  return Array.from(new Set<string>([...overrides, base]));
}

// parse thumbnails from "query.pages"
function extractThumbsFromPages(pagesObj: any, limit: number): string[] {
  const pages = pagesObj ? Object.values<any>(pagesObj) : [];
  return pages
    .map((p: any) => p?.thumbnail?.source as string | undefined)
    .filter(Boolean)
    .slice(0, limit) as string[];
}

// 1) primary: generator=search
async function fetchWikipediaThumbsPrimary(topic: string, limit = 5): Promise<string[]> {
  const url =
    `https://en.wikipedia.org/w/api.php` +
    `?origin=*` +
    `&action=query&format=json` +
    `&prop=pageimages` +
    `&generator=search` +
    `&gsrsearch=${encodeURIComponent(topic)}` +
    `&gsrlimit=${limit}` +
    `&pilimit=${limit}` +
    `&pithumbsize=400`;
  const res = await fetch(url);
  const data = await res.json();
  return extractThumbsFromPages(data?.query?.pages, limit);
}

// 2) fallback: list=search to get titles, then query pageimages by titles
async function fetchWikipediaThumbsFallback(topic: string, limit = 5): Promise<string[]> {
  const searchUrl =
    `https://en.wikipedia.org/w/api.php` +
    `?origin=*` +
    `&action=query&format=json` +
    `&list=search` +
    `&srsearch=${encodeURIComponent(topic)}` +
    `&srlimit=${limit}`;
  const res = await fetch(searchUrl);
  const data = await res.json();
  const titles: string[] = (data?.query?.search || [])
    .map((s: any) => s?.title)
    .filter(Boolean)
    .slice(0, limit);

  if (titles.length === 0) return [];

  const titlesParam = titles.map((t) => encodeURIComponent(t)).join("|");
  const pagesUrl =
    `https://en.wikipedia.org/w/api.php` +
    `?origin=*` +
    `&action=query&format=json` +
    `&prop=pageimages` +
    `&titles=${titlesParam}` +
    `&pithumbsize=400`;
  const res2 = await fetch(pagesUrl);
  const data2 = await res2.json();
  return extractThumbsFromPages(data2?.query?.pages, limit);
}

/** Try one topic; primary then fallback search. */
async function fetchWikipediaThumbnails(topic: string, limit = 5): Promise<string[]> {
  try {
    const primary = await fetchWikipediaThumbsPrimary(topic, limit);
    if (primary.length > 0) return primary;
    const fallback = await fetchWikipediaThumbsFallback(topic, limit);
    return fallback;
  } catch (e) {
    console.error("Wikipedia fetch error:", e);
    return [];
  }
}

/** Try a list of candidate topics; return the first set of images found. */
async function fetchWikipediaThumbnailsForCandidates(candidates: string[], limit = 5): Promise<string[]> {
  for (const t of candidates) {
    const imgs = await fetchWikipediaThumbnails(t, limit);
    if (imgs.length > 0) return imgs;
  }
  return [];
}

/** Lead image helper for candidates (single best thumbnail). */
async function fetchWikipediaLeadImageForCandidates(candidates: string[]): Promise<string> {
  for (const t of candidates) {
    const imgs = await fetchWikipediaThumbnails(t, 1);
    if (imgs.length > 0) return imgs[0];
  }
  const fallbackText = wikiQueryFromCategory(candidates[0] || "Image");
  return `https://placehold.co/800x480/png?text=${encodeURIComponent(fallbackText)}`;
}

// Map click helper (used in Map tab)
function ClickToSetMarker({
  onPick,
  onOutOfBounds,
}: {
  onPick: (pos: { lat: number; lng: number }) => void;
  onOutOfBounds: () => void;
}) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      if (withinBounds(lat, lng)) onPick({ lat, lng });
      else onOutOfBounds();
    },
  });
  return null;
}

export default function SearchPage() {
  const [loc, setLocation] = useLocation();

  // tab: "text" | "map"
  const [mode, setMode] = useState<"text" | "map">("text");

  // TEXT search state
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedInfo, setSelectedInfo] = useState<CategoryInfo | null>(null);
  const [loadingText, setLoadingText] = useState(false);
  const [thumbs, setThumbs] = useState<string[]>([]); // top-5 thumbnails

  // MAP search state
  const [markerPos, setMarkerPos] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(100);
  const [geoMatches, setGeoMatches] = useState<
    { key: string; info: CategoryInfo; distKm: number; imageUrl: string }[]
  >([]);
  const [loadingGeo, setLoadingGeo] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  // Handle deep-link `?category=...` on initial load
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get("category");
      if (cat && CATEGORY_INFO[cat]) {
        setMode("text");
        setSelectedCategory(cat);
        setSelectedInfo(CATEGORY_INFO[cat]);
        // Preload images for deep-linked category (Wikipedia, with candidates)
        fetchWikipediaThumbnailsForCandidates(getWikiCandidates(cat), 5).then(setThumbs);
      }
    } catch {}
  }, []);

  // Geolocate (optional) for Map tab
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        if (withinBounds(lat, lng)) setMarkerPos({ lat, lng });
      },
      () => {},
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  // --- TEXT: search by category only (static) ---
  const onSubmitText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;
    setLoadingText(true);
    try {
      const info = CATEGORY_INFO[selectedCategory];
      setSelectedInfo(info ?? null);

      // Fetch top 5 thumbnails (Wikipedia, try overrides first)
      const images = await fetchWikipediaThumbnailsForCandidates(getWikiCandidates(selectedCategory), 5);
      setThumbs(images);

      // keep URL shareable
      setLocation(`/search?category=${encodeURIComponent(selectedCategory)}`);
    } finally {
      setLoadingText(false);
    }
  };

  // --- MAP: filter all categories by distance to marker + radius ---
  const onSubmitGeo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!markerPos) {
      setHint("Pick a point inside Andhra Pradesh or Telangana.");
      return;
    }
    if (!withinBounds(markerPos.lat, markerPos.lng)) {
      setHint("Please choose a point within AP or Telangana.");
      return;
    }

    setLoadingGeo(true);
    setHint(null);
    try {
      const entries = Object.entries(CATEGORY_INFO);
      const center = { lat: markerPos.lat, lng: markerPos.lng };
      const matchesRaw = entries
        .map(([key, info]) => {
          const distKm = haversineKm(center, { lat: info.lat, lng: info.lng });
          return { key, info, distKm };
        })
        .filter((r) => r.distKm <= Math.max(1, Math.min(100, radiusKm)));

      // fetch one representative image per category (Wikipedia, with candidates)
      const withImages = await Promise.all(
        matchesRaw.map(async (m) => {
          const imageUrl = await fetchWikipediaLeadImageForCandidates(getWikiCandidates(m.key));
          return { ...m, imageUrl };
        })
      );

      withImages.sort((a, b) => a.distKm - b.distKm);
      setGeoMatches(withImages);
    } finally {
      setLoadingGeo(false);
    }
  };

  const goBack = () => setLocation("/");

  return (
    <div className="min-h-screen bg-cream">
      {/* Top bar */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button onClick={goBack} className="inline-flex items-center text-gray-700 hover:text-gray-900">
            <ArrowLeft className="mr-2" size={18} />
            Back
          </button>
          <h1 className="text-lg font-semibold">Search</h1>
          <div />
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Tabs */}
        <div className="flex gap-2">
          <Button
            variant={mode === "text" ? "default" : "secondary"}
            onClick={() => setMode("text")}
            className={mode === "text" ? "bg-orange-500 hover:bg-orange-600" : ""}
          >
            <Search className="mr-2" size={16} /> Categories
          </Button>
          <Button
            variant={mode === "map" ? "default" : "secondary"}
            onClick={() => setMode("map")}
            className={mode === "map" ? "bg-orange-500 hover:bg-orange-600" : ""}
          >
            <MapPin className="mr-2" size={16} /> Location
          </Button>
        </div>

        {/* TEXT MODE (category dropdown → map + details + 5 Wikipedia thumbnails) */}
        {mode === "text" && (
          <Card>
            <CardContent className="p-6 space-y-5">
              <form onSubmit={onSubmitText} className="grid gap-3 md:grid-cols-[1fr_auto]">
                <select
                  className="border rounded-md px-3 py-2 text-sm"
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedInfo(null);
                    setThumbs([]);
                  }}
                >
                  <option value="" disabled>
                    Choose category
                  </option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <Button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600"
                  disabled={loadingText || !selectedCategory}
                >
                  {loadingText ? "Loading..." : "Search"}
                </Button>
              </form>

              {/* When a category is chosen & searched: map + description + fun facts + images */}
              {selectedInfo ? (
                <div className="space-y-5">
                  {/* Map to origin */}
                  <div className="h-[360px] w-full overflow-hidden rounded-xl border">
                    <MapContainer
                      center={[selectedInfo.lat, selectedInfo.lng]}
                      zoom={9}
                      style={{ height: "100%", width: "100%" }}
                      maxBounds={MAX_BOUNDS}
                      maxBoundsViscosity={1.0}
                      scrollWheelZoom
                      attributionControl={false}
                    >
                      <TileLayer
                        attribution="&copy; OpenStreetMap contributors"
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={[selectedInfo.lat, selectedInfo.lng]} />
                    </MapContainer>
                  </div>

                  {/* Details */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">{selectedCategory}</h3>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Origin:</span> {selectedInfo.originName}
                    </p>
                    <p className="text-sm">{selectedInfo.description}</p>
                  </div>

                  {/* Fun Facts */}
                  {selectedInfo.funFacts.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold">Fun Facts</h4>
                      <ul className="list-disc pl-6 text-sm space-y-1">
                        {selectedInfo.funFacts.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Wikipedia Images (Top 5) */}
                  <div className="space-y-2">
                    <h4 className="font-semibold">Images (Wikipedia)</h4>
                    {thumbs.length === 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="aspect-video bg-gray-100 border rounded-md animate-pulse" />
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {thumbs.map((src, i) => (
                          <img
                            key={i}
                            src={src}
                            alt={`${selectedCategory} ${i + 1}`}
                            className="w-full h-full object-cover rounded-md border"
                            loading="lazy"
                          />
                        ))}
                      </div>
                    )}
                    <p className="text-[10px] text-gray-500">
                      Thumbnails via Wikipedia (search terms tried: {getWikiCandidates(selectedCategory).join(", ")}).
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Pick a category and click Search to see its origin and images.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* MAP MODE (pin + radius → horizontal cards; clicking a card jumps to Text tab + loads that category) */}
        {mode === "map" && (
          <Card>
            <CardContent className="p-6 space-y-5">
              <form onSubmit={onSubmitGeo} className="grid gap-3 md:grid-cols-[1fr_auto]">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-700">Radius (km)</span>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={radiusKm}
                    onChange={(e) =>
                      setRadiusKm(Math.max(1, Math.min(100, Number(e.target.value || 1))))
                    }
                    className="border rounded-md px-3 py-2 text-sm max-w-[120px]"
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600"
                  disabled={loadingGeo || !markerPos}
                >
                  {loadingGeo ? "Searching..." : "Search in Area"}
                </Button>
              </form>

              {hint && (
                <p className="text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded p-2">
                  {hint}
                </p>
              )}

              {/* Map for picking center */}
              <div className="h-[420px] w-full overflow-hidden rounded-xl border">
                <MapContainer
                  center={DEFAULT_CENTER}
                  zoom={DEFAULT_ZOOM}
                  style={{ height: "100%", width: "100%" }}
                  maxBounds={MAX_BOUNDS}
                  maxBoundsViscosity={1.0}
                  scrollWheelZoom
                  attributionControl={false}
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <ClickToSetMarker
                    onPick={(pos) => {
                      setMarkerPos(pos);
                      setHint(null);
                    }}
                    onOutOfBounds={() => {
                      setHint("That point is outside Andhra Pradesh & Telangana. Please pick inside the boundary.");
                    }}
                  />

                  {markerPos && <Marker position={[markerPos.lat, markerPos.lng]} />}
                </MapContainer>
              </div>

              {/* Horizontal card rail of matches */}
              <div className="space-y-2">
                <h4 className="font-semibold">Matches within {Math.max(1, Math.min(100, radiusKm))} km</h4>

                {geoMatches.length === 0 && !loadingGeo && (
                  <p className="text-sm text-muted-foreground">No matches yet. Pick a point and search.</p>
                )}

                {geoMatches.length > 0 && (
                  <div className="overflow-x-auto">
                    <div className="flex gap-4 min-w-max py-1">
                      {geoMatches.map((m) => (
                        <button
                          key={m.key}
                          onClick={() => {
                            // Switch to Text tab, load category, and update URL for shareability
                            setSelectedCategory(m.key);
                            setSelectedInfo(m.info);
                            setThumbs([]); // will refetch for text view
                            setMode("text");
                            setLocation(`/search?category=${encodeURIComponent(m.key)}`);
                            // Trigger image fetch immediately with candidate terms
                            fetchWikipediaThumbnailsForCandidates(getWikiCandidates(m.key), 5).then(setThumbs);
                          }}
                          className="w-72 flex-shrink-0 border rounded-xl bg-white shadow-sm hover:shadow-md transition text-left"
                        >
                          <div className="h-40 w-full overflow-hidden rounded-t-xl bg-gray-100">
                            <img
                              src={m.imageUrl}
                              alt={m.key}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          </div>
                          <div className="p-3">
                            <div className="font-semibold text-sm">{m.key}</div>
                            <div className="text-xs text-gray-500 mb-1">
                              {m.info.originName} • {m.distKm.toFixed(1)} km away
                            </div>
                            <p className="text-xs text-gray-700 line-clamp-3">{m.info.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}