import type { WeatherData } from "./types"

export type SceneKey =
  | "clear-day"
  | "clear-night"
  | "cloudy"
  | "rain"
  | "snow"
  | "fog"
  | "thunder"
  | "wind"
  | "heat"

export interface WeatherScene {
  key: SceneKey
  /** Fully opaque multi-stop gradient — the full-screen sky. */
  gradient: string
  /** Whether scene content should render light-on-dark or dark-on-light text. */
  textTheme: "light" | "dark"
  label: string
}

const SCENES: Record<SceneKey, WeatherScene> = {
  "clear-day": {
    key: "clear-day",
    gradient: "linear-gradient(180deg, #1e63b8 0%, #3f8fdc 38%, #8fd0f5 72%, #ffe3a8 100%)",
    textTheme: "light",
    label: "Clear day",
  },
  "clear-night": {
    key: "clear-night",
    gradient: "linear-gradient(180deg, #04070f 0%, #0b1530 45%, #1c2c58 80%, #31456f 100%)",
    textTheme: "light",
    label: "Clear night",
  },
  cloudy: {
    key: "cloudy",
    gradient: "linear-gradient(180deg, #45596b 0%, #6d8399 45%, #9db2c4 78%, #cfd9e2 100%)",
    textTheme: "light",
    label: "Cloudy",
  },
  rain: {
    key: "rain",
    gradient: "linear-gradient(180deg, #152a3d 0%, #274a68 45%, #456d92 78%, #6f97b5 100%)",
    textTheme: "light",
    label: "Rain",
  },
  snow: {
    key: "snow",
    gradient: "linear-gradient(180deg, #5d7f99 0%, #8fb0c7 45%, #c3d8e6 78%, #edf5fa 100%)",
    textTheme: "dark",
    label: "Snow",
  },
  fog: {
    key: "fog",
    gradient: "linear-gradient(180deg, #5c676d 0%, #848f95 45%, #adb6ba 78%, #d3d9dc 100%)",
    textTheme: "dark",
    label: "Fog",
  },
  thunder: {
    key: "thunder",
    gradient: "linear-gradient(180deg, #070b16 0%, #18213c 45%, #2d3a5e 78%, #4a5578 100%)",
    textTheme: "light",
    label: "Thunderstorm",
  },
  wind: {
    key: "wind",
    gradient: "linear-gradient(180deg, #35635a 0%, #57897a 45%, #86b09d 78%, #c2dccd 100%)",
    textTheme: "light",
    label: "Windy",
  },
  heat: {
    key: "heat",
    gradient: "linear-gradient(180deg, #c25e1d 0%, #e5942c 40%, #f7bd52 72%, #ffe9a8 100%)",
    textTheme: "light",
    label: "Scorching",
  },
}

export const DEMO_SCENE_KEYS: SceneKey[] = [
  "clear-day",
  "clear-night",
  "cloudy",
  "rain",
  "thunder",
  "snow",
  "fog",
  "wind",
  "heat",
]

const RAIN_CODES = [1063, 1072, 1150, 1153, 1180, 1183, 1186, 1189, 1192, 1195, 1198, 1201, 1240, 1243, 1246]
const SNOW_CODES = [1066, 1069, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225, 1237, 1255, 1258, 1261, 1264]
const FOG_CODES = [1030, 1135, 1147]
const THUNDER_CODES = [1087, 1273, 1276, 1279, 1282]
const CLOUD_CODES = [1003, 1006, 1009]

export function getWeatherScene(weather: WeatherData | null): WeatherScene {
  if (!weather) return SCENES["clear-night"]

  const code = weather.current.condition.code
  const text = weather.current.condition.text.toLowerCase()
  const isDay = weather.current.is_day === 1
  const temp = weather.current.temp_c
  const wind = weather.current.wind_kph

  const matches = (codes: number[]) => codes.includes(code) || _textHits(text, codes)

  if (matches(THUNDER_CODES)) return SCENES.thunder
  if (matches(RAIN_CODES)) return SCENES.rain
  if (matches(SNOW_CODES)) return SCENES.snow
  if (matches(FOG_CODES)) return SCENES.fog
  if (code === 1000 && !isDay) return SCENES["clear-night"]
  if (code === 1000) return temp > 30 ? SCENES.heat : SCENES["clear-day"]
  if (matches(CLOUD_CODES)) return SCENES.cloudy
  if (wind > 25) return SCENES.wind
  if (temp > 30) return SCENES.heat
  return isDay ? SCENES["clear-day"] : SCENES["clear-night"]
}

function _textHits(text: string, codes: number[]) {
  if (codes === RAIN_CODES) return text.includes("rain") || text.includes("drizzle")
  if (codes === SNOW_CODES) return text.includes("snow") || text.includes("sleet")
  if (codes === FOG_CODES) return text.includes("fog") || text.includes("mist")
  if (codes === THUNDER_CODES) return text.includes("thunder") || text.includes("storm")
  if (codes === CLOUD_CODES) return text.includes("cloud") || text.includes("overcast")
  return false
}

/**
 * Deterministic sample weather for demo mode (no API key configured).
 * Lets anyone — and any CI browser check — see every scene without a key.
 */
export function buildDemoWeather(scene: SceneKey): WeatherData {
  const base: WeatherData = {
    location: { name: "Demo Sky", region: "Pretendcloud", country: "Imaginaria" },
    current: {
      temp_c: 18,
      condition: { text: "Clear", icon: "//cdn.weatherapi.com/weather/64x64/day/113.png", code: 1000 },
      humidity: 55,
      wind_kph: 8,
      is_day: 1,
      precip_mm: 0,
    },
  }

  switch (scene) {
    case "clear-night":
      base.current.is_day = 0
      base.current.temp_c = 11
      base.current.condition.text = "Clear"
      break
    case "cloudy":
      base.current.condition = { text: "Overcast", icon: "//cdn.weatherapi.com/weather/64x64/day/122.png", code: 1009 }
      base.current.temp_c = 16
      break
    case "rain":
      base.current.condition = { text: "Moderate rain", icon: "//cdn.weatherapi.com/weather/64x64/day/302.png", code: 1186 }
      base.current.temp_c = 13
      base.current.precip_mm = 2.4
      base.current.humidity = 88
      break
    case "thunder":
      base.current.condition = { text: "Thunderstorm", icon: "//cdn.weatherapi.com/weather/64x64/day/389.png", code: 1087 }
      base.current.temp_c = 20
      base.current.precip_mm = 5.1
      base.current.wind_kph = 34
      break
    case "snow":
      base.current.condition = { text: "Moderate snow", icon: "//cdn.weatherapi.com/weather/64x64/day/329.png", code: 1216 }
      base.current.temp_c = -3
      base.current.precip_mm = 1.8
      break
    case "fog":
      base.current.condition = { text: "Fog", icon: "//cdn.weatherapi.com/weather/64x64/day/248.png", code: 1135 }
      base.current.temp_c = 9
      break
    case "wind":
      base.current.condition = { text: "Windy", icon: "//cdn.weatherapi.com/weather/64x64/day/116.png", code: 1004 }
      base.current.temp_c = 15
      base.current.wind_kph = 41
      break
    case "heat":
      base.current.condition = { text: "Sunny", icon: "//cdn.weatherapi.com/weather/64x64/day/113.png", code: 1000 }
      base.current.temp_c = 36
      break
    default:
      break
  }
  return base
}
