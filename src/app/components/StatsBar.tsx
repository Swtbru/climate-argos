import { useEffect, useState } from "react";
import { Satellite } from "lucide-react";

const FONT_MONO = "JetBrains Mono, monospace";
const FONT_DISPLAY = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif";

export function StatsBar() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const clock = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);

  return (
    <header className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/50" style={{ backdropFilter: "blur(10px)" }}>
      <div className="flex items-center gap-3 shrink-0">
        <img src="/assets/logo.png" alt="ClimateArgos" className="w-12 h-12 rounded-full object-cover" />
        <div className="space-y-1">
          <h1 className="text-foreground leading-none" style={{ fontFamily: FONT_DISPLAY, fontSize: "1.1rem" }}>
            ClimateArgos
          </h1>
          <p className="text-muted-foreground leading-none" style={{ fontSize: "0.6rem", fontFamily: FONT_MONO, letterSpacing: "0.1em" }}>
            SISTEMA DE MONITORAMENTO CLIMÁTICO
          </p>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-primary" style={{ fontFamily: FONT_MONO, fontSize: "1.1rem" }}>
          {time.toLocaleTimeString("pt-BR")}
        </p>
        <p className="text-muted-foreground" style={{ fontFamily: FONT_MONO, fontSize: "0.6rem" }}>
          {time.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()} · UTC-3
        </p>
      </div>
    </header>
  );
}
