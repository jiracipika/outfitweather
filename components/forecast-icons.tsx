import { Cloud, CloudLightning, CloudRain, CloudSun, Haze, Moon, Snowflake, Sun, ThermometerSun, Wind } from "lucide-react";
import { getWeatherScene, type SceneKey } from "@/lib/weather-scene";
import type { WeatherData } from "@/lib/types";

export const WEATHER_ICONS = {
  "clear-day": Sun,
  "clear-night": Moon,
  cloudy: Cloud,
  rain: CloudRain,
  thunder: CloudLightning,
  snow: Snowflake,
  fog: Haze,
  wind: Wind,
  heat: ThermometerSun,
};

export function ForecastIcon({ weather, size = 24 }: { weather: WeatherData; size?: number }) {
  const scene = getWeatherScene(weather).key;
  const Icon = weather.current.condition.code === 1003 && weather.current.is_day === 1
    ? CloudSun
    : WEATHER_ICONS[scene];
  return <Icon size={size} strokeWidth={1.65} aria-hidden="true" />;
}

export const SAMPLE_LABELS: Record<SceneKey, string> = {
  "clear-day": "Sunny",
  "clear-night": "Clear night",
  cloudy: "Cloudy",
  rain: "Rain",
  thunder: "Storm",
  snow: "Snow",
  fog: "Fog",
  wind: "Windy",
  heat: "Hot",
};
