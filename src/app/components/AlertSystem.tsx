import { useState, useEffect } from "react";
import { AlertTriangle, Bell, BellOff, ChevronRight, Zap, Shield, Activity } from "lucide-react";
import { motion } from "motion/react";
import { fetchAlerts, type AlertData } from "../services/alerts";

const FONT_MONO = "JetBrains Mono, monospace";
const FONT_DISPLAY = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif";

interface Alert {
  id: string;
  timestamp: Date;
  level: "critical" | "high" | "medium" | "low";
  type: string;
  location: string;
  message: string;
  probability: number;
  source: string;
}

const levelColors: Record<string, string> = {
  critical: "#ff3d57",
  high: "#ff9900",
  medium: "#ffd700",
  low: "#00ff88",
};

const levelBg: Record<string, string> = {
  critical: "rgba(255,61,87,0.08)",
  high: "rgba(255,153,0,0.08)",
  medium: "rgba(255,215,0,0.08)",
  low: "rgba(0,255,136,0.08)",
};

const initialAlerts: Alert[] = [
  {
    id: "a1",
    timestamp: new Date(Date.now() - 120000),
    level: "critical",
    type: "ENCHENTE",
    location: "São Paulo — Marginal Tietê",
    message: "Nível do rio acima da cota de alerta. Risco de transbordamento em 2h.",
    probability: 89,
    source: "MODIS",
  },
  {
    id: "a2",
    timestamp: new Date(Date.now() - 480000),
    level: "high",
    type: "DESLIZAMENTO",
    location: "Rio de Janeiro — Serra da Carioca",
    message: "Solo saturado acima de 85%. Risco de deslizamento.",
    probability: 76,
    source: "Sentinel-2",
  },
  {
    id: "a3",
    timestamp: new Date(Date.now() - 900000),
    level: "high",
    type: "BARRAGEM",
    location: "BH — Barragem Cercadinho",
    message: "Nível d'água subiu 2.3m em 6h. Monitoramento reforçado.",
    probability: 68,
    source: "Sensor IoT",
  },
  {
    id: "a4",
    timestamp: new Date(Date.now() - 1800000),
    level: "medium",
    type: "TEMPESTADE",
    location: "Curitiba — Região Norte",
    message: "Célula convectiva se aproximando. Rajadas de até 85 km/h.",
    probability: 43,
    source: "Radar",
  },
  {
    id: "a5",
    timestamp: new Date(Date.now() - 3600000),
    level: "low",
    type: "CHUVA INTENSA",
    location: "Porto Alegre — Zona Sul",
    message: "61mm acumulados em 24h. Possíveis alagamentos.",
    probability: 21,
    source: "OpenWeather",
  },
];

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Agora";
  if (mins < 60) return `${mins}m atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  return `${Math.floor(hours / 24)}d atrás`;
}

export function AlertSystem() {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [muted, setMuted] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>("a1");

  useEffect(() => {
    async function loadAlerts() {
      const realAlerts = await fetchAlerts();
      if (realAlerts && realAlerts.length > 0) {
        setAlerts(realAlerts);
        setExpandedId(realAlerts[0].id);
      }
    }
    loadAlerts();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const types = ["ENCHENTE", "DESLIZAMENTO", "TEMPESTADE", "CHUVA INTENSA"];
      const levels = ["medium", "low"] as const;
      const locations = ["Salvador — BA", "Recife — PE", "Manaus — AM", "Goiânia — GO"];
      const rnd = Math.random();
      if (rnd > 0.7) {
        const newAlert: Alert = {
          id: `a${Date.now()}`,
          timestamp: new Date(),
          level: levels[Math.floor(Math.random() * levels.length)],
          type: types[Math.floor(Math.random() * types.length)],
          location: locations[Math.floor(Math.random() * locations.length)],
          message: "Evento climático detectado via satélite. Monitoramento ativo.",
          probability: Math.floor(Math.random() * 40) + 15,
          source: "Análise Preditiva",
        };
        setAlerts((prev) => [newAlert, ...prev].slice(0, 12));
      }
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const filtered = filter === "all" ? alerts : alerts.filter((a) => a.level === filter);

  const stats = {
    critical: alerts.filter((a) => a.level === "critical").length,
    high: alerts.filter((a) => a.level === "high").length,
    medium: alerts.filter((a) => a.level === "medium").length,
    low: alerts.filter((a) => a.level === "low").length,
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-destructive" />
          <h3 className="text-foreground" style={{ fontFamily: FONT_DISPLAY }}>CENTRAL DE ALERTAS</h3>
        </div>
        <button
          onClick={() => setMuted(!muted)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {muted ? <BellOff size={14} /> : <Bell size={14} className="text-primary" />}
        </button>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {Object.entries(stats).map(([level, count]) => (
          <button
            key={level}
            onClick={() => setFilter(filter === level ? "all" : level)}
            className="rounded p-2 text-center transition-all"
            style={{
              background: filter === level ? levelBg[level] : "rgba(13,26,46,0.5)",
              border: `1px solid ${filter === level ? levelColors[level] + "44" : "rgba(0,212,255,0.1)"}`,
            }}
          >
            <p className="text-xs" style={{ color: levelColors[level], fontFamily: FONT_MONO }}>{count}</p>
            <p className="text-xs text-muted-foreground capitalize">{level}</p>
          </button>
        ))}
      </div>

      {/* lista de alertas */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {filtered.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded border cursor-pointer transition-all"
            style={{
              background: expandedId === alert.id ? levelBg[alert.level] : "rgba(8,14,30,0.8)",
              borderColor: expandedId === alert.id ? levelColors[alert.level] + "44" : "rgba(0,212,255,0.1)",
            }}
            onClick={() => setExpandedId(expandedId === alert.id ? null : alert.id)}
          >
            <div className="flex items-start gap-2 p-3">
              <div className="mt-0.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: levelColors[alert.level], boxShadow: `0 0 6px ${levelColors[alert.level]}` }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono" style={{ color: levelColors[alert.level], fontFamily: FONT_MONO }}>
                    {alert.type}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0" style={{ fontFamily: FONT_MONO }}>
                    {timeAgo(alert.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-foreground mt-0.5 truncate">{alert.location}</p>
              </div>
              <ChevronRight
                size={12}
                className="text-muted-foreground mt-0.5 transition-transform"
                style={{ transform: expandedId === alert.id ? "rotate(90deg)" : "rotate(0deg)" }}
              />
            </div>

            {expandedId === alert.id && (
              <div className="px-3 pb-3 space-y-2">
                <p className="text-xs text-muted-foreground leading-relaxed">{alert.message}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Zap size={10} className="text-accent" />
                    <span className="text-xs text-muted-foreground" style={{ fontFamily: FONT_MONO }}>{alert.source}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield size={10} style={{ color: levelColors[alert.level] }} />
                    <span className="text-xs" style={{ color: levelColors[alert.level], fontFamily: FONT_MONO }}>
                      {alert.probability}% risco
                    </span>
                  </div>
                </div>
                {/* barra de risco */}
                <div className="h-1 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${alert.probability}%`,
                      background: `linear-gradient(90deg, ${levelColors[alert.level]}88, ${levelColors[alert.level]})`,
                    }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
