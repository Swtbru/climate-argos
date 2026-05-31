import { useState, useEffect } from "react";
import { Satellite, Layers, Download, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { nasaLayers as nasaLayersService, type SatelliteLayer } from "../services/satellite";

const FONT_MONO = "JetBrains Mono, monospace";
const FONT_DISPLAY = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif";

const nasaLayers = nasaLayersService.map((l) => ({
  id: l.id,
  name: l.name,
  description: l.description,
  color: l.color,
  thumb: l.getUrl(),
}));

const satellites = [
  { name: "Sentinel-2", orbit: "10:30 UTC", status: "active", coverage: "Europa/Brasil" },
  { name: "MODIS Terra", orbit: "10:30 UTC", status: "active", coverage: "Global" },
  { name: "GOES-16", orbit: "Geoestacionário", status: "active", coverage: "Américas" },
  { name: "Sentinel-1", orbit: "06:00 UTC", status: "standby", coverage: "Global SAR" },
];

export function SatelliteImagery() {
  const [activeLayer, setActiveLayer] = useState(nasaLayers[2]);
  const [zoom, setZoom] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(110);
  const [scanLine, setScanLine] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setScanLine((prev) => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const layer = activeLayer;

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Satellite size={16} className="text-primary" />
          <h3 className="text-foreground" style={{ fontFamily: FONT_DISPLAY }}>IMAGENS DE SATÉLITE</h3>
          <span className="text-xs text-muted-foreground" style={{ fontFamily: FONT_MONO }}>NASA Earthdata</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" style={{ boxShadow: "0 0 6px #00d4ff" }} />
          <span className="text-xs text-primary" style={{ fontFamily: FONT_MONO }}>LIVE</span>
        </div>
      </div>

      {/* seletor de camadas */}
      <div className="grid grid-cols-2 gap-1.5" role="group" aria-label="Camadas de satélite">
        {nasaLayers.map((l) => (
          <button
            key={l.id}
            onClick={() => setActiveLayer(l)}
            aria-pressed={activeLayer.id === l.id}
            aria-label={`Camada ${l.name}`}
            className="flex items-center gap-2 p-2 rounded text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            style={{
              background: activeLayer.id === l.id ? l.color + "15" : "rgba(13,26,46,0.5)",
              border: `1px solid ${activeLayer.id === l.id ? l.color + "44" : "rgba(0,212,255,0.1)"}`,
            }}
          >
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: l.color }} />
            <span className="text-xs text-foreground truncate" style={{ fontFamily: FONT_MONO }}>
              {l.name.split("—")[0].trim()}
            </span>
          </button>
        ))}
      </div>

      {/* visualizador */}
      <div className="relative rounded overflow-hidden border border-border bg-black" style={{ aspectRatio: "16/9" }}>
        <img
          src={layer.thumb}
          alt={layer.name}
          className="w-full h-full object-cover"
          style={{
            filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(130%)`,
            transform: `scale(${zoom / 100})`,
            transition: "transform 0.3s ease",
          }}
        />

        {/* efeito de scan tipo radar */}
        <div
          className="absolute left-0 right-0 pointer-events-none"
          style={{
            top: `${scanLine}%`,
            height: "2px",
            background: `linear-gradient(90deg, transparent, ${layer.color}44, transparent)`,
          }}
        />

        {/* grid overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `
            linear-gradient(rgba(0,212,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
        }} />

        {[
          "top-1 left-1 border-t border-l",
          "top-1 right-1 border-t border-r",
          "bottom-1 left-1 border-b border-l",
          "bottom-1 right-1 border-b border-r",
        ].map((cls, i) => (
          <div key={i} className={`absolute w-4 h-4 ${cls}`} style={{ borderColor: layer.color }} />
        ))}

        <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 rounded px-2 py-1" style={{ backdropFilter: "blur(4px)" }}>
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: layer.color }} />
          <span className="text-xs" style={{ color: layer.color, fontFamily: FONT_MONO }}>{layer.name}</span>
        </div>

        <div className="absolute bottom-2 left-2 text-xs" style={{ fontFamily: FONT_MONO, color: "rgba(0,212,255,0.6)" }}>
          -15.7801° S, -47.9292° W
        </div>

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1">
          <button
            onClick={() => setZoom((z) => Math.min(200, z + 20))}
            aria-label="Aumentar zoom"
            className="w-6 h-6 bg-black/60 rounded flex items-center justify-center text-primary hover:bg-black/80 focus-visible:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition"
          >
            <ZoomIn size={12} />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(60, z - 20))}
            aria-label="Diminuir zoom"
            className="w-6 h-6 bg-black/60 rounded flex items-center justify-center text-primary hover:bg-black/80 focus-visible:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition"
          >
            <ZoomOut size={12} />
          </button>
          <button
            onClick={() => { setZoom(100); setBrightness(100); setContrast(110); }}
            aria-label="Resetar visualização"
            className="w-6 h-6 bg-black/60 rounded flex items-center justify-center text-muted-foreground hover:text-foreground focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition"
          >
            <RotateCcw size={12} />
          </button>
        </div>
      </div>

      {/* controles de brilho/contraste */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Brilho", value: brightness, setter: setBrightness, min: 50, max: 200 },
          { label: "Contraste", value: contrast, setter: setContrast, min: 50, max: 200 },
        ].map(({ label, value, setter, min, max }) => (
          <div key={label}>
            <div className="flex justify-between mb-1">
              <span className="text-xs text-muted-foreground">{label}</span>
              <span className="text-xs text-primary" style={{ fontFamily: FONT_MONO }}>{value}%</span>
            </div>
            <input
              type="range" min={min} max={max} value={value}
              onChange={(e) => setter(Number(e.target.value))}
              className="w-full h-1 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: "#00d4ff" }}
            />
          </div>
        ))}
      </div>

      {/* status dos satélites */}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2" style={{ fontFamily: FONT_MONO }}>Status dos Satélites</p>
        <div className="space-y-1.5">
          {satellites.map((sat) => (
            <div key={sat.name} className="flex items-center justify-between bg-secondary/30 rounded px-3 py-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: sat.status === "active" ? "#00ff88" : "#5a7a9a",
                    boxShadow: sat.status === "active" ? "0 0 4px #00ff88" : "none",
                  }}
                />
                <span className="text-xs text-foreground" style={{ fontFamily: FONT_MONO }}>{sat.name}</span>
              </div>
              <span className="text-xs text-muted-foreground" style={{ fontFamily: FONT_MONO }}>{sat.orbit}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
