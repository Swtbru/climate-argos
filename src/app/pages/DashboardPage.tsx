import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CloudRain, Satellite, Brain, Activity, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import { StatsBar } from "../components/StatsBar";
import { SatelliteMap } from "../components/SatelliteMap";
import { WeatherPanel } from "../components/WeatherPanel";
import { AlertSystem } from "../components/AlertSystem";
import { AIPrediction } from "../components/AIPrediction";
import { SatelliteImagery } from "../components/SatelliteImagery";

const FONT_MONO = "JetBrains Mono, monospace";
const FONT_DISPLAY = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif";

type Panel = "weather" | "alerts" | "satellite" | "ai";

const panelConfig = [
  { id: "weather" as Panel, label: "Clima", icon: CloudRain },
  { id: "alerts" as Panel, label: "Alertas", icon: Activity },
  { id: "satellite" as Panel, label: "Satélite", icon: Satellite },
  { id: "ai" as Panel, label: "IA", icon: Brain },
];

export default function DashboardPage() {
  const [activePanel, setActivePanel] = useState<Panel>("weather");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedZone, setSelectedZone] = useState<any>(null);
  const criticalCount = 2;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex items-center" style={{ position: "relative", zIndex: 10 }}>
        <Link
          to="/"
          className="flex items-center gap-1.5 px-3 py-2 text-muted-foreground hover:text-primary transition-colors shrink-0 border-r border-border bg-card/50 h-full"
          style={{ backdropFilter: "blur(10px)" }}
        >
          <ArrowLeft size={14} />
          <span className="text-xs" style={{ fontFamily: FONT_MONO }}>Voltar</span>
        </Link>
        <div className="flex-1">
          <StatsBar />
        </div>
      </div>

      {/* layout principal */}
      <div className="flex flex-1 min-h-0" style={{ position: "relative", zIndex: 5 }}>
        {/* sidebar */}
        <AnimatePresence initial={false}>
          {!sidebarCollapsed && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="flex flex-col border-r border-border bg-card/40 overflow-hidden shrink-0"
              style={{ backdropFilter: "blur(16px)" }}
            >
              {/* tabs dos painéis */}
              <div className="flex border-b border-border shrink-0">
                {panelConfig.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActivePanel(id)}
                    className="flex-1 flex flex-col items-center gap-1 py-3 transition-all relative hover:bg-primary/5"
                    style={{
                      background: activePanel === id ? "rgba(0,212,255,0.08)" : undefined,
                      borderBottom: activePanel === id ? "2px solid #00d4ff" : "2px solid transparent",
                    }}
                  >
                    <Icon size={14} className="transition-colors" style={{ color: activePanel === id ? "#00d4ff" : "#5a7a9a" }} />
                    <span className="transition-colors" style={{
                      fontFamily: FONT_MONO,
                      color: activePanel === id ? "#00d4ff" : "#5a7a9a",
                      fontSize: "0.6rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}>
                      {label}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activePanel}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="h-full"
                  >
                    {activePanel === "weather" && <WeatherPanel />}
                    {activePanel === "alerts" && <AlertSystem />}
                    {activePanel === "satellite" && <SatelliteImagery />}
                    {activePanel === "ai" && <AIPrediction />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* toggle sidebar */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute z-20 top-1/2 -translate-y-1/2 w-4 h-10 flex items-center justify-center bg-card border border-border rounded-r hover:bg-secondary transition-all"
          style={{
            left: sidebarCollapsed ? 0 : 320,
            transition: "left 0.25s ease",
          }}
        >
          {sidebarCollapsed
            ? <ChevronRight size={10} className="text-muted-foreground" />
            : <ChevronLeft size={10} className="text-muted-foreground" />}
        </button>

        <div className="flex-1 flex flex-col min-w-0 p-3 gap-3">
          <AnimatePresence>
            {selectedZone && (
              <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3 px-4 py-2 rounded border shrink-0"
                style={{
                  background: "rgba(255,61,87,0.07)",
                  borderColor: "rgba(255,61,87,0.3)",
                }}
              >
                <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" style={{ boxShadow: "0 0 8px #ff3d57" }} />
                <span className="text-sm text-foreground" style={{ fontFamily: FONT_DISPLAY }}>
                  ZONA SELECIONADA: {selectedZone.location.toUpperCase()}
                </span>
                <div className="ml-auto flex items-center gap-4">
                  <span className="text-xs text-destructive" style={{ fontFamily: FONT_MONO }}>
                    RISCO IA: {selectedZone.probability}%
                  </span>
                  <span className="text-xs" style={{ fontFamily: FONT_MONO, color: "#00d4ff" }}>
                    CHUVA: {selectedZone.rainfall} mm
                  </span>
                  <button
                    onClick={() => setSelectedZone(null)}
                    className="text-muted-foreground hover:text-foreground transition-colors text-xs w-5 h-5 flex items-center justify-center rounded border border-border"
                  >
                    ✕
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1 min-h-0">
            <SatelliteMap onSelectZone={setSelectedZone} />
          </div>

          {/* telemetria */}
          <div className="grid grid-cols-4 gap-2 shrink-0">
            {[
              { label: "Sentinel-2", sub: "Última passagem", value: "10:42 UTC", color: "#00d4ff" },
              { label: "GOES-16", sub: "Atualização", value: "Tempo real", color: "#00ff88" },
              { label: "Precipitação", sub: "Acumulado 72h", value: "187.4 mm", color: "#7c3aed" },
              { label: "Risco Global", sub: "Índice IA", value: "78%", color: "#ff3d57" },
            ].map(({ label, sub, value, color }) => (
              <div
                key={label}
                className="bg-card/50 border border-border rounded px-3 py-2 relative"
                style={{ backdropFilter: "blur(8px)" }}
              >
                <p className="text-xs text-muted-foreground" style={{ fontSize: "0.65rem" }}>{sub}</p>
                <p className="mt-0.5" style={{ color, fontFamily: FONT_DISPLAY, fontSize: "0.9rem" }}>{label}</p>
                <p style={{ color, fontFamily: FONT_MONO, fontSize: "0.7rem", opacity: 0.8 }}>{value}</p>
                <span className="absolute top-1 right-1 px-1 py-0.5 rounded" style={{ fontFamily: FONT_MONO, fontSize: "0.45rem", color, background: color + "15", border: `1px solid ${color}33` }}>
                  SIMULAÇÃO
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
