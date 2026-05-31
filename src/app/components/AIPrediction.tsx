import { useState, useEffect, useRef } from "react";
import { Brain, TrendingUp, Cpu, Zap, Activity } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

const FONT_MONO = "JetBrains Mono, monospace";
const FONT_DISPLAY = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif";

const riskFactors = [
  { factor: "Chuva Acum.", A: 87, fullMark: 100 },
  { factor: "Solo Sat.", A: 73, fullMark: 100 },
  { factor: "Declividade", A: 55, fullMark: 100 },
  { factor: "Veg. Suprim.", A: 68, fullMark: 100 },
  { factor: "Hist. Eventos", A: 82, fullMark: 100 },
  { factor: "Nível Rio", A: 91, fullMark: 100 },
];

const predictionHistory = Array.from({ length: 20 }, (_, i) => ({
  t: `T-${20 - i}h`,
  predicted: 40 + Math.sin(i * 0.5) * 20 + i * 2.5,
  actual: i < 15 ? 38 + Math.sin(i * 0.5) * 18 + i * 2.3 + Math.random() * 8 : null,
}));

function RedeNeuralViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    const layers = [3, 5, 5, 4, 2];
    const nodePositions: { x: number; y: number; layer: number; idx: number }[] = [];

    layers.forEach((count, layerIdx) => {
      for (let i = 0; i < count; i++) {
        nodePositions.push({
          x: (layerIdx + 0.5) * (W / layers.length),
          y: (i + 0.5) * (H / count),
          layer: layerIdx,
          idx: i,
        });
      }
    });

    let frame = 0;
    let animId: number;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // conexões entre camadas
      for (let l = 0; l < layers.length - 1; l++) {
        const fromNodes = nodePositions.filter((n) => n.layer === l);
        const toNodes = nodePositions.filter((n) => n.layer === l + 1);

        fromNodes.forEach((from) => {
          toNodes.forEach((to) => {
            const pulse = (Math.sin(frame * 0.05 + from.idx * 0.7 + l * 1.1) + 1) / 2;
            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.strokeStyle = `rgba(0, 212, 255, ${0.05 + pulse * 0.15})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();

            // Pulse dot
            if (Math.sin(frame * 0.04 + from.idx + l * 2) > 0.8) {
              const t = ((frame * 0.03 + from.idx * 0.5) % 1);
              const px = from.x + (to.x - from.x) * t;
              const py = from.y + (to.y - from.y) * t;
              ctx.beginPath();
              ctx.arc(px, py, 1.5, 0, Math.PI * 2);
              ctx.fillStyle = "#00d4ff";
              ctx.fill();
            }
          });
        });
      }

      // nós
      nodePositions.forEach((node) => {
        const pulse = (Math.sin(frame * 0.06 + node.idx * 0.8 + node.layer) + 1) / 2;
        const r = 4 + pulse * 2;

        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        const isOutput = node.layer === layers.length - 1;
        const color = isOutput ? "#7c3aed" : "#00d4ff";
        ctx.fillStyle = color + "33";
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });

      frame++;
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  return <canvas ref={canvasRef} width={200} height={120} className="w-full" style={{ height: 80 }} />;
}

export function AIPrediction() {
  const [riskScore, setRiskScore] = useState(78);
  const [processing, setProcessing] = useState(false);
  const [confidence, setConfidence] = useState(91.4);

  useEffect(() => {
    const interval = setInterval(() => {
      setRiskScore((prev) => Math.round(Math.min(99, Math.max(20, prev + (Math.random() - 0.48) * 3))));
      setConfidence((prev) => Math.min(99, Math.max(70, prev + (Math.random() - 0.5) * 1)));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const runPrediction = () => {
    setProcessing(true);
    setTimeout(() => {
      setRiskScore(Math.floor(Math.random() * 30) + 60);
      setConfidence(Math.random() * 15 + 82);
      setProcessing(false);
    }, 2000);
  };

  const riskLevel = riskScore >= 80 ? "CRÍTICO" : riskScore >= 60 ? "ALTO" : riskScore >= 40 ? "MÉDIO" : "BAIXO";
  const riskColor = riskScore >= 80 ? "#ff3d57" : riskScore >= 60 ? "#ff9900" : riskScore >= 40 ? "#ffd700" : "#00ff88";

  const ChartTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-card border border-border rounded p-2 text-xs" style={{ fontFamily: FONT_MONO }}>
        {payload.map((p: any) => p.value !== null && (
          <p key={p.name} style={{ color: p.color }}>{p.name}: {Number(p.value).toFixed(1)}%</p>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain size={16} className="text-accent" />
          <h3 className="text-foreground" style={{ fontFamily: FONT_DISPLAY }}>IA PREDITIVA</h3>
          <span className="px-1.5 py-0.5 rounded text-accent bg-accent/10 border border-accent/20" style={{ fontFamily: FONT_MONO, fontSize: "0.5rem" }}>
            SIMULAÇÃO
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span className="text-xs text-accent" style={{ fontFamily: FONT_MONO }}>ATIVO</span>
        </div>
      </div>

      {/* animação da rede neural */}
      <div className="bg-secondary/20 border border-border rounded p-2">
        <div className="flex items-center gap-2 mb-1">
          <Cpu size={10} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground" style={{ fontFamily: FONT_MONO }}>Rede Neural — Inferência em tempo real</span>
        </div>
        <RedeNeuralViz />
      </div>

      {/* score de risco */}
      <div className="bg-secondary/30 border rounded p-4 flex items-center gap-4" style={{ borderColor: riskColor + "33" }}>
        <div className="relative w-16 h-16">
          <svg viewBox="0 0 60 60" className="w-full h-full -rotate-90">
            <circle cx="30" cy="30" r="24" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
            <circle
              cx="30" cy="30" r="24" fill="none"
              stroke={riskColor} strokeWidth="4"
              strokeDasharray={`${(riskScore / 100) * 150.8} 150.8`}
              strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 6px ${riskColor})` }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm" style={{ color: riskColor, fontFamily: FONT_MONO }}>{riskScore}%</span>
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Índice de Risco Global</p>
          <p className="text-xl" style={{ color: riskColor, fontFamily: FONT_DISPLAY }}>{riskLevel}</p>
          <div className="flex items-center gap-1 mt-1">
            <Activity size={10} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground" style={{ fontFamily: FONT_MONO }}>
              Confiança: {confidence.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* radar chart */}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2" style={{ fontFamily: FONT_MONO }}>Fatores de Risco</p>
        <ResponsiveContainer width="100%" height={160}>
          <RadarChart data={riskFactors} margin={{ top: 0, right: 10, bottom: 0, left: 10 }}>
            <PolarGrid stroke="rgba(0,212,255,0.1)" />
            <PolarAngleAxis dataKey="factor" tick={{ fill: "#5a7a9a", fontSize: 9, fontFamily: "JetBrains Mono" }} />
            <Radar name="Risco" dataKey="A" stroke="#ff3d57" fill="#ff3d57" fillOpacity={0.15} strokeWidth={1.5} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* previsão vs real */}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2" style={{ fontFamily: FONT_MONO }}>Previsão vs Real (20h)</p>
        <ResponsiveContainer width="100%" height={80}>
          <LineChart data={predictionHistory} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
            <XAxis dataKey="t" tick={{ fill: "#5a7a9a", fontSize: 8, fontFamily: "JetBrains Mono" }} interval={4} />
            <YAxis tick={{ fill: "#5a7a9a", fontSize: 8, fontFamily: "JetBrains Mono" }} domain={[0, 100]} />
            <Tooltip content={<ChartTooltip />} />
            <Line type="monotone" dataKey="predicted" stroke="#7c3aed" strokeWidth={1.5} dot={false} name="Previsto" strokeDasharray="4 2" />
            <Line type="monotone" dataKey="actual" stroke="#00d4ff" strokeWidth={1.5} dot={false} name="Real" connectNulls={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <button
        onClick={runPrediction}
        disabled={processing}
        className="flex items-center justify-center gap-2 py-2 rounded border transition-all"
        style={{
          background: processing ? "rgba(124,58,237,0.1)" : "rgba(124,58,237,0.15)",
          borderColor: "rgba(124,58,237,0.4)",
          color: "#7c3aed",
        }}
      >
        {processing ? (
          <>
            <div className="w-3 h-3 border border-accent border-t-transparent rounded-full animate-spin" />
            <span style={{ fontFamily: FONT_DISPLAY }}>PROCESSANDO...</span>
          </>
        ) : (
          <>
            <Zap size={13} />
            <span style={{ fontFamily: FONT_DISPLAY }}>NOVA PREDIÇÃO</span>
          </>
        )}
      </button>
    </div>
  );
}
