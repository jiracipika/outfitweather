import type { ForecastHour, WeatherData } from "./types";

export type TemperatureUnit = "C" | "F";

export function formatTemperature(celsius: number, unit: TemperatureUnit) {
  return Math.round(unit === "C" ? celsius : (celsius * 9) / 5 + 32);
}

export function formatHour(time: string) {
  const hour = Number(time.split(" ")[1].split(":")[0]);
  return `${hour % 12 || 12} ${hour < 12 ? "AM" : "PM"}`;
}

export function forecastHourKey(hour: ForecastHour) {
  return hour.time_epoch?.toString() ?? hour.time;
}

export function asHourlyWeather(weather: WeatherData, hour: ForecastHour): WeatherData {
  return {
    ...weather,
    location: {
      ...weather.location,
      localtime: hour.time,
      localtime_epoch: hour.time_epoch,
    },
    current: {
      temp_c: hour.temp_c,
      feelslike_c: hour.feelslike_c,
      condition: hour.condition,
      is_day: hour.is_day ?? (hour.condition.icon.includes("/night/") ? 0 : 1),
      humidity: hour.humidity ?? weather.current.humidity,
      wind_kph: hour.wind_kph ?? weather.current.wind_kph,
      precip_mm: hour.precip_mm ?? 0,
      uv: hour.uv,
    },
  };
}
