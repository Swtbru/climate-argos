const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5";

export interface WeatherData {
  temp: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  visibility: number;
  pressure: number;
  condition: string;
  rain_1h: number;
  uv: number;
}

export interface ForecastPoint {
  hour: string;
  rain: number;
  temp: number;
  risk: number;
}

export async function fetchCurrentWeather(lat: number, lng: number): Promise<WeatherData | null> {
  if (!API_KEY) return null;
  try {
    const res = await fetch(
      `${BASE_URL}/weather?lat=${lat}&lon=${lng}&appid=${API_KEY}&units=metric&lang=pt_br`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      temp: Math.round(data.main.temp),
      feels_like: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      wind_speed: Math.round(data.wind.speed * 3.6),
      visibility: Math.round((data.visibility || 10000) / 1000),
      pressure: data.main.pressure,
      condition: data.weather[0]?.description || "Indefinido",
      rain_1h: data.rain?.["1h"] || 0,
      uv: 0,
    };
  } catch {
    return null;
  }
}

export async function fetchForecast(lat: number, lng: number): Promise<ForecastPoint[] | null> {
  if (!API_KEY) return null;
  try {
    const res = await fetch(
      `${BASE_URL}/forecast?lat=${lat}&lon=${lng}&appid=${API_KEY}&units=metric&lang=pt_br`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.list.slice(0, 8).map((item: any) => {
      const date = new Date(item.dt * 1000);
      return {
        hour: `${String(date.getHours()).padStart(2, "0")}:00`,
        rain: item.rain?.["3h"] || 0,
        temp: Math.round(item.main.temp),
        risk: Math.min(100, Math.round((item.rain?.["3h"] || 0) * 3 + (item.wind?.speed || 0) * 2)),
      };
    });
  } catch {
    return null;
  }
}
