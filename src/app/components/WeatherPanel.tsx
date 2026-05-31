import { useState, useEffect, useRef } from "react";
import { Cloud, Thermometer, Wind, Droplets, Eye, Gauge, RefreshCw, MapPin, Search, X } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { fetchCurrentWeather, fetchForecast, type WeatherData, type ForecastPoint } from "../services/weather";

// fontes usadas no projeto
const FONT_MONO = "JetBrains Mono, monospace";
const FONT_DISPLAY = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif";

// cidades padrao que aparecem no seletor
const cities = [
  { name: "São Paulo", lat: -23.55, lng: -46.63 },
  { name: "Rio de Janeiro", lat: -22.9, lng: -43.17 },
  { name: "Belo Horizonte", lat: -19.92, lng: -43.94 },
  { name: "Curitiba", lat: -25.43, lng: -49.27 },
  { name: "Porto Alegre", lat: -30.03, lng: -51.22 },
];

// gera dados falsos de clima caso a API nao responda
function mockClima(city: string) {
  const seed = city.charCodeAt(0);
  return {
    temp: 18 + (seed % 15),
    feels_like: 16 + (seed % 12),
    humidity: 60 + (seed % 35),
    wind_speed: 5 + (seed % 20),
    visibility: 5 + (seed % 10),
    pressure: 1005 + (seed % 20),
    condition: ["Tempestade", "Chuva Forte", "Nublado", "Parcialmente Nublado", "Limpo"][seed % 5],
    rain_1h: seed % 5 > 2 ? (seed % 30) + 5 : 0,
    uv: seed % 8,
  };
}

// gera dados falsos de previsao (24 horas)
function mockPrevisao() {
  return Array.from({ length: 24 }, (_, i) => ({
    hour: `${String(i).padStart(2, "0")}:00`,
    rain: Math.max(0, Math.sin(i * 0.3) * 30 + Math.random() * 20 + 10),
    temp: 20 + Math.sin(i * 0.25) * 8 + Math.random() * 3,
    risk: Math.max(0, Math.sin(i * 0.3) * 50 + Math.random() * 30 + 20),
  }));
}

// tooltip customizado pro grafico
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded p-2 text-xs" style={{ fontFamily: FONT_MONO }}>
      <p className="text-muted-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {typeof p.value === "number" ? p.value.toFixed(1) : p.value}</p>
      ))}
    </div>
  );
};

export function WeatherPanel() {
  // estados do componente
  const [availableCities, setAvailableCities] = useState(cities);
  const [selectedCity, setSelectedCity] = useState(cities[0]);
  const [weather, setWeather] = useState(mockClima(cities[0].name));
  const [forecast, setForecast] = useState(mockPrevisao());
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [activeChart, setActiveChart] = useState<"rain" | "temp" | "risk">("rain");

  // estados da pesquisa de cidade
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ name: string; lat: number; lng: number; state?: string }[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchedCity, setSearchedCity] = useState<{ name: string; lat: number; lng: number } | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // busca cidades pelo nome usando a API de geocoding do openweather
  const searchCity = async (query: string) => {
    if (query.length < 2) { setSearchResults([]); return; }
    try {
      const key = import.meta.env.VITE_OPENWEATHER_API_KEY;
      if (!key) return;
      const res = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)},BR&limit=5&appid=${key}`);
      if (!res.ok) return;
      const data = await res.json();
      setSearchResults(data.map((d: any) => ({ name: d.name, lat: d.lat, lng: d.lon, state: d.state })));
    } catch {}
  };

  // chamado a cada letra digitada, espera 400ms antes de buscar
  const handleSearchInput = (value: string) => {
    setSearchQuery(value);
    setHighlightedIndex(-1);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => searchCity(value), 400);
  };

  // navegacao por teclado nos resultados da pesquisa
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, searchResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && searchResults[highlightedIndex]) {
        selectSearchResult(searchResults[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      setShowSearch(false);
      setSearchResults([]);
    }
  };

  // quando o usuario seleciona uma cidade da pesquisa
  const selectSearchResult = (result: { name: string; lat: number; lng: number }) => {
    setSearchedCity(result);
    setSelectedCity(result);
    setShowSearch(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  // remove a cidade pesquisada e volta pra primeira da lista
  const removeSearchedCity = () => {
    setSearchedCity(null);
    setSelectedCity(availableCities[0]);
  };

  // tenta pegar a localizacao do usuario quando o componente monta
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let cityName = "Minha Localização";

        // usa geocoding reverso pra descobrir o nome da cidade do usuario
        try {
          const key = import.meta.env.VITE_OPENWEATHER_API_KEY;
          if (key) {
            const res = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${key}`);
            if (res.ok) {
              const data = await res.json();
              if (data[0]?.name) cityName = data[0].name;
            }
          }
        } catch {}

        // adiciona a cidade do usuario como primeira opcao
        const userCity = { name: cityName, lat: latitude, lng: longitude };
        setAvailableCities([userCity, ...cities]);
        setSelectedCity(userCity);
      },
      () => {} // se o usuario negar a permissao, nao faz nada
    );
  }, []);

  // busca os dados de clima e previsao da API (ou usa mock se falhar)
  const carregarDados = async (city: typeof cities[0]) => {
    setLoading(true);
    const [realWeather, realForecast] = await Promise.all([
      fetchCurrentWeather(city.lat, city.lng),
      fetchForecast(city.lat, city.lng),
    ]);
    if (realWeather) setWeather(realWeather);
    else setWeather(mockClima(city.name));
    if (realForecast) setForecast(realForecast);
    else setForecast(mockPrevisao());
    setLastUpdate(new Date());
    setLoading(false);
  };

  // atualiza os dados manualmente
  const refresh = () => carregarDados(selectedCity);

  // carrega os dados toda vez que muda a cidade selecionada
  useEffect(() => {
    carregarDados(selectedCity);
  }, [selectedCity]);

  // atualiza automaticamente a cada 60 segundos
  useEffect(() => {
    const interval = setInterval(refresh, 60000);
    return () => clearInterval(interval);
  }, [selectedCity]);

  // configuracao dos graficos (cor e label de cada tipo)
  const chartConfig = {
    rain: { color: "#00d4ff", label: "Chuva (mm/h)", key: "rain" },
    temp: { color: "#ff9900", label: "Temperatura (°C)", key: "temp" },
    risk: { color: "#ff3d57", label: "Risco (%)", key: "risk" },
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cloud size={16} className="text-primary" />
          <h3 className="text-foreground" style={{ fontFamily: FONT_DISPLAY }}>DADOS CLIMÁTICOS</h3>
          <span className="text-xs text-muted-foreground" style={{ fontFamily: FONT_MONO }}>
            OpenWeather API
          </span>
        </div>
        <button onClick={refresh} aria-label="Atualizar dados climáticos" className="text-muted-foreground hover:text-primary focus-visible:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:rounded transition-colors">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* campo de pesquisa */}
      <div className="relative">
        <div className={`flex items-center gap-2 px-3 py-1.5 bg-secondary border rounded text-xs transition-colors duration-200 cursor-text ${showSearch ? "border-primary shadow-sm shadow-primary/20" : "border-border"}`}
          style={{ fontFamily: FONT_MONO, height: "30px" }}
          onClick={() => setShowSearch(true)}
        >
          <Search size={12} className="text-muted-foreground shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Buscar cidade..."
            aria-label="Buscar cidade"
            aria-autocomplete="list"
            aria-expanded={searchResults.length > 0 && showSearch}
            autoFocus={showSearch}
            onFocus={() => setShowSearch(true)}
            onBlur={() => { setTimeout(() => { setShowSearch(false); setSearchResults([]); setHighlightedIndex(-1); }, 200); }}
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none min-w-0"
            style={{ fontFamily: FONT_MONO, fontSize: "inherit" }}
          />
        </div>
        {searchResults.length > 0 && showSearch && (
          <div role="listbox" aria-label="Resultados da busca" className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded shadow-lg z-50 overflow-hidden">
            {searchResults.map((result, i) => (
              <button
                key={`${result.name}-${i}`}
                role="option"
                aria-selected={i === highlightedIndex}
                onClick={() => selectSearchResult(result)}
                className={`w-full px-3 py-2 text-xs text-left text-foreground transition-colors flex items-center gap-2 ${
                  i === highlightedIndex ? "bg-primary/20 text-primary" : "hover:bg-primary/10 focus-visible:bg-primary/10"
                } focus-visible:outline-none`}
                style={{ fontFamily: FONT_MONO }}
              >
                <MapPin size={10} className="text-muted-foreground" />
                {result.name}{result.state ? `, ${result.state}` : ""}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* seletor de cidade */}
      <div className="flex gap-1 flex-wrap items-center">
        {availableCities.map((city) => (
          <button
            key={city.name}
            onClick={() => setSelectedCity(city)}
            className={`px-2 py-1 text-xs transition-all rounded-sm flex items-center gap-1 ${
              selectedCity.name === city.name
                ? "bg-primary/20 text-primary border border-primary/40"
                : "bg-secondary text-muted-foreground hover:text-foreground border border-transparent"
            }`}
            style={{ fontFamily: FONT_MONO }}
          >
            {!cities.find(c => c.name === city.name) && <MapPin size={10} />}
            {!cities.find(c => c.name === city.name) ? "Você" : city.name}
          </button>
        ))}
        {searchedCity && (
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setSelectedCity(searchedCity)}
              className={`px-2 py-1 text-xs transition-all rounded-sm flex items-center gap-1 ${
                selectedCity.name === searchedCity.name
                  ? "bg-primary/20 text-primary border border-primary/40"
                  : "bg-secondary text-muted-foreground hover:text-foreground border border-transparent"
              }`}
              style={{ fontFamily: FONT_MONO }}
            >
              <Search size={10} />
              {searchedCity.name}
            </button>
            <button onClick={removeSearchedCity} aria-label="Remover cidade pesquisada" className="text-muted-foreground hover:text-destructive focus-visible:text-destructive focus-visible:outline-none transition-colors">
              <X size={10} />
            </button>
          </div>
        )}
      </div>

      <div className="bg-secondary/30 border border-border rounded p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">
              {selectedCity.name}
            </p>
            <p className="text-3xl text-foreground mt-1" style={{ fontFamily: FONT_DISPLAY }}>
              {weather.temp}°C
            </p>
            <p className="text-sm text-muted-foreground">{weather.condition}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Sensação</p>
            <p className="text-lg text-foreground" style={{ fontFamily: FONT_MONO }}>{weather.feels_like}°C</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Droplets, label: "Umidade", value: `${weather.humidity}%`, color: "#00d4ff" },
            { icon: Wind, label: "Vento", value: `${weather.wind_speed} km/h`, color: "#7c3aed" },
            { icon: Gauge, label: "Pressão", value: `${weather.pressure} hPa`, color: "#00ff88" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-card/50 rounded p-2 text-center">
              <Icon size={12} style={{ color }} className="mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-xs text-foreground" style={{ fontFamily: FONT_MONO }}>{value}</p>
            </div>
          ))}
        </div>

        {weather.rain_1h > 0 && (
          <div className="mt-3 flex items-center gap-2 bg-primary/10 border border-primary/20 rounded p-2">
            <Droplets size={12} className="text-primary" />
            <p className="text-xs text-primary" style={{ fontFamily: FONT_MONO }}>
              Precipitação: {weather.rain_1h} mm/h na última hora
            </p>
          </div>
        )}
      </div>

      {/* gráfico de previsão */}
      <div className="flex-1 min-h-0">
        <div className="flex items-center gap-2 mb-3">
          {Object.entries(chartConfig).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setActiveChart(key as any)}
              className={`px-2 py-0.5 text-xs rounded-sm transition-all`}
              style={{
                fontFamily: FONT_MONO,
                background: activeChart === key ? cfg.color + "22" : "transparent",
                color: activeChart === key ? cfg.color : "#5a7a9a",
                border: `1px solid ${activeChart === key ? cfg.color + "44" : "transparent"}`,
              }}
            >
              {cfg.label.split(" ")[0]}
            </button>
          ))}
          {activeChart === "risk" && (
            <span className="px-1.5 py-0.5 rounded text-destructive bg-destructive/10 border border-destructive/20" style={{ fontFamily: FONT_MONO, fontSize: "0.5rem" }}>
              SIMULAÇÃO
            </span>
          )}
          <span className="ml-auto text-xs text-muted-foreground" style={{ fontFamily: FONT_MONO }}>
            {lastUpdate.toLocaleTimeString("pt-BR")}
          </span>
        </div>

        <ResponsiveContainer width="100%" height={120}>
          <AreaChart data={forecast} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartConfig[activeChart].color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={chartConfig[activeChart].color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="hour" tick={{ fill: "#5a7a9a", fontSize: 9, fontFamily: "JetBrains Mono" }} interval={3} />
            <YAxis tick={{ fill: "#5a7a9a", fontSize: 9, fontFamily: "JetBrains Mono" }} />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey={chartConfig[activeChart].key}
              stroke={chartConfig[activeChart].color}
              strokeWidth={1.5}
              fill="url(#chartGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
