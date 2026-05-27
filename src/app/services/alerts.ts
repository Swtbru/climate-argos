export interface AlertData {
  id: string;
  timestamp: Date;
  level: "critical" | "high" | "medium" | "low";
  type: string;
  location: string;
  message: string;
  probability: number;
  source: string;
}

function mapSeverity(severidade: string): "critical" | "high" | "medium" | "low" {
  const s = severidade.toLowerCase();
  if (s.includes("grande perigo") || s.includes("extremo")) return "critical";
  if (s.includes("perigo")) return "high";
  if (s.includes("moderado") || s.includes("atenção")) return "medium";
  return "low";
}

function mapType(evento: string): string {
  const e = evento.toLowerCase();
  if (e.includes("chuva") || e.includes("precipitação")) return "CHUVA INTENSA";
  if (e.includes("tempestade") || e.includes("raio")) return "TEMPESTADE";
  if (e.includes("vento") || e.includes("vendaval")) return "VENDAVAL";
  if (e.includes("granizo")) return "GRANIZO";
  if (e.includes("seca")) return "SECA";
  if (e.includes("onda de calor")) return "ONDA DE CALOR";
  return evento.toUpperCase();
}

export async function fetchAlerts(): Promise<AlertData[] | null> {
  try {
    const res = await fetch("https://apiprevmet3.inmet.gov.br/avisos/ativos");
    if (!res.ok) return null;
    const json = await res.json();
    const avisos = json?.data || json || [];
    if (!Array.isArray(avisos) || avisos.length === 0) return null;

    return avisos.slice(0, 15).map((aviso: any, i: number) => {
      const level = mapSeverity(aviso.severidade || aviso.nivel || "");
      const prob = level === "critical" ? 90 : level === "high" ? 70 : level === "medium" ? 45 : 20;
      return {
        id: aviso.id?.toString() || `inmet-${i}`,
        timestamp: new Date(aviso.inicio || aviso.data_inicio || Date.now()),
        level,
        type: mapType(aviso.evento || aviso.descricao || "ALERTA"),
        location: aviso.municipio || aviso.area || aviso.estados || "Brasil",
        message: aviso.descricao || aviso.texto || "Alerta meteorológico emitido pelo INMET.",
        probability: prob + Math.floor(Math.random() * 10),
        source: "INMET",
      };
    });
  } catch {
    return null;
  }
}
