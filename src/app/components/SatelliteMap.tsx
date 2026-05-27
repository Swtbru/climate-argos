import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Droplets, Wind, Satellite } from "lucide-react";
import { getPrecipitationTileUrl } from "../services/satellite";

const FONT_MONO = "JetBrains Mono, monospace";
const FONT_DISPLAY = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif";

interface AlertZone {
  id: string;
  lat: number;
  lng: number;
  level: "critical" | "high" | "medium" | "low";
  type: "flood" | "landslide" | "storm" | "dam";
  location: string;
  rainfall: number;
  probability: number;
}

const alertZones: AlertZone[] = [
  { id: "1", lat: -23.55, lng: -46.63, level: "critical", type: "flood", location: "São Paulo - Marginal", rainfall: 142, probability: 89 },
  { id: "2", lat: -22.9, lng: -43.17, level: "high", type: "landslide", location: "Rio de Janeiro - Serra", rainfall: 98, probability: 76 },
  { id: "3", lat: -19.92, lng: -43.94, level: "high", type: "dam", location: "Belo Horizonte - Barragem", rainfall: 87, probability: 68 },
  { id: "4", lat: -25.43, lng: -49.27, level: "medium", type: "storm", location: "Curitiba - Norte", rainfall: 54, probability: 43 },
  { id: "5", lat: -27.59, lng: -48.55, level: "low", type: "flood", location: "Florianópolis - Costeira", rainfall: 32, probability: 19 },
  { id: "6", lat: -30.03, lng: -51.22, level: "medium", type: "landslide", location: "Porto Alegre - Zona Sul", rainfall: 61, probability: 51 },
  { id: "7", lat: -3.71, lng: -38.54, level: "low", type: "storm", location: "Fortaleza - Litoral", rainfall: 18, probability: 12 },
];

const levelColors: Record<string, string> = {
  critical: "#ff3d57",
  high: "#ff9900",
  medium: "#ffd700",
  low: "#00ff88",
};

const typeIcons: Record<string, string> = {
  flood: "🌊",
  landslide: "⛰️",
  storm: "⛈️",
  dam: "🏗️",
};

export function SatelliteMap({ onSelectZone }: { onSelectZone: (zone: AlertZone | null) => void }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [selectedZone, setSelectedZone] = useState<AlertZone | null>(null);
  const [mapLayer, setMapLayer] = useState<"satellite" | "terrain" | "dark">("dark");

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const initMap = async () => {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      const map = L.map(mapRef.current!, {
        center: [-15.77, -47.92],
        zoom: 5,
        zoomControl: false,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      const layers = {
        dark: L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
          { subdomains: "abcd", maxZoom: 19 }
        ),
        satellite: L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          { maxZoom: 19 }
        ),
        terrain: L.tileLayer(
          "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
          { maxZoom: 17 }
        ),
      };

      layers.dark.addTo(map);
      (map as any)._layers_custom = layers;

      const precipUrl = getPrecipitationTileUrl();
      if (precipUrl) {
        L.tileLayer(precipUrl, { opacity: 0.5, maxZoom: 19 }).addTo(map);
      }

      L.control.zoom({ position: "bottomright" }).addTo(map);

      alertZones.forEach((zone) => {
        const color = levelColors[zone.level];
        const size = zone.level === "critical" ? 20 : zone.level === "high" ? 16 : 12;

        const icon = L.divIcon({
          html: `
            <div style="
              width: ${size}px; height: ${size}px;
              border-radius: 50%;
              background: ${color};
              border: 2px solid ${color}88;
              box-shadow: 0 0 ${size * 2}px ${color}66, 0 0 ${size * 4}px ${color}33;
              animation: pulse-ring 2s ease-out infinite;
              cursor: pointer;
            "></div>
            <div style="
              position: absolute;
              top: ${-size / 2}px; left: ${-size / 2}px;
              width: ${size * 2}px; height: ${size * 2}px;
              border-radius: 50%;
              border: 1px solid ${color}44;
              animation: pulse-ring 2s ease-out infinite;
            "></div>
          `,
          className: "",
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });

        const marker = L.marker([zone.lat, zone.lng], { icon });
        marker.addTo(map);
        marker.on("click", () => {
          setSelectedZone(zone);
          onSelectZone(zone);
          map.setView([zone.lat, zone.lng], 8, { animate: true });
        });

        markersRef.current.push(marker);
      });

      map.on("click", (e: any) => {
        if (!(e.originalEvent.target as HTMLElement).closest(".leaflet-marker-icon")) {
          setSelectedZone(null);
          onSelectZone(null);
        }
      });
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const switchLayer = async (layer: "satellite" | "terrain" | "dark") => {
    if (!mapInstanceRef.current) return;
    const L = await import("leaflet");
    const map = mapInstanceRef.current;
    map.eachLayer((l: any) => {
      if (l instanceof L.TileLayer) map.removeLayer(l);
    });

    const tileUrls: Record<string, string> = {
      dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      terrain: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    };

    L.tileLayer(tileUrls[layer], { subdomains: "abcd", maxZoom: 19 }).addTo(map);
    setMapLayer(layer);
  };

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-border">
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 1; }
          70% { transform: scale(1.5); opacity: 0; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .leaflet-container { background: #03060f; }
        .leaflet-control-zoom a {
          background: #080e1e !important;
          color: #00d4ff !important;
          border-color: rgba(0,212,255,0.2) !important;
        }
        .leaflet-control-zoom a:hover {
          background: #0d1a2e !important;
        }
      `}</style>

      <div ref={mapRef} className="w-full h-full" />

      {/* botões de camada */}
      <div className="absolute top-3 left-3 flex gap-1 z-[1000]">
        {(["dark", "satellite", "terrain"] as const).map((l) => (
          <button
            key={l}
            onClick={() => switchLayer(l)}
            className={`px-3 py-1 text-xs uppercase tracking-widest transition-all ${
              mapLayer === l
                ? "bg-primary text-primary-foreground"
                : "bg-card/80 text-muted-foreground hover:text-foreground border border-border"
            }`}
            style={{ fontFamily: FONT_MONO, backdropFilter: "blur(8px)" }}
          >
            {l}
          </button>
        ))}
      </div>

      {/* indicador sentinel */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2 bg-card/80 border border-border px-3 py-1.5 rounded"
        style={{ backdropFilter: "blur(8px)" }}>
        <Satellite size={12} className="text-primary animate-pulse" />
        <span className="text-xs text-primary" style={{ fontFamily: FONT_MONO }}>SENTINEL-2 LIVE</span>
      </div>

      {/* legenda */}
      <div className="absolute bottom-8 left-3 z-[1000] bg-card/90 border border-border rounded p-3 space-y-1.5"
        style={{ backdropFilter: "blur(8px)" }}>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Nível de Risco</p>
        {Object.entries(levelColors).map(([level, color]) => (
          <div key={level} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
            <span className="text-xs text-foreground capitalize" style={{ fontFamily: FONT_MONO }}>{level}</span>
          </div>
        ))}
      </div>

      {/* popup da zona selecionada */}
      {selectedZone && (
        <div className="absolute bottom-8 right-3 z-[1000] bg-card/95 border rounded p-4 w-64 space-y-3"
          style={{ borderColor: levelColors[selectedZone.level], backdropFilter: "blur(12px)" }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">{typeIcons[selectedZone.type]} {selectedZone.type}</p>
              <p className="text-sm text-foreground mt-0.5" style={{ fontFamily: FONT_DISPLAY }}>{selectedZone.location}</p>
            </div>
            <span className="text-xs px-2 py-0.5 rounded" style={{ background: levelColors[selectedZone.level] + "22", color: levelColors[selectedZone.level], border: `1px solid ${levelColors[selectedZone.level]}44` }}>
              {selectedZone.level.toUpperCase()}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-secondary/50 rounded p-2">
              <div className="flex items-center gap-1 text-muted-foreground mb-1"><Droplets size={10} /><span className="text-xs">Chuva</span></div>
              <p className="text-sm text-primary" style={{ fontFamily: FONT_MONO }}>{selectedZone.rainfall} mm</p>
            </div>
            <div className="bg-secondary/50 rounded p-2">
              <div className="flex items-center gap-1 text-muted-foreground mb-1"><AlertTriangle size={10} /><span className="text-xs">Risco IA</span></div>
              <p className="text-sm" style={{ fontFamily: FONT_MONO, color: levelColors[selectedZone.level] }}>{selectedZone.probability}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
