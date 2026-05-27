const GIBS_BASE = "https://gibs.earthdata.nasa.gov/wmts/epsg4326/best";

export interface SatelliteLayer {
  id: string;
  name: string;
  description: string;
  color: string;
  getUrl: (date?: string) => string;
}

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

export const nasaLayers: SatelliteLayer[] = [
  {
    id: "truecolor",
    name: "MODIS — Cor Real",
    description: "Imagem de cor verdadeira do satélite Terra/MODIS",
    color: "#00ff88",
    getUrl: (date) =>
      `${GIBS_BASE}/MODIS_Terra_CorrectedReflectance_TrueColor/default/${date || getYesterday()}/250m/3/3/4.jpg`,
  },
  {
    id: "viirs",
    name: "VIIRS — Suomi NPP",
    description: "Reflectância corrigida VIIRS/Suomi NPP (região diferente)",
    color: "#7c3aed",
    getUrl: (date) =>
      `${GIBS_BASE}/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/${date || getYesterday()}/250m/3/2/5.jpg`,
  },
  {
    id: "clouds",
    name: "Nuvens — Temperatura",
    description: "Temperatura do topo das nuvens (MODIS Terra)",
    color: "#00d4ff",
    getUrl: (date) =>
      `${GIBS_BASE}/MODIS_Terra_Cloud_Top_Temp_Day/default/${date || getYesterday()}/2km/3/2/4.png`,
  },
];

export function getPrecipitationTileUrl(): string | null {
  const key = import.meta.env.VITE_OPENWEATHER_API_KEY;
  if (!key) return null;
  return `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${key}`;
}
