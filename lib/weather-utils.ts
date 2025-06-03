import type { WeatherData, OutfitRecommendation, CustomOutfitRule } from "./types"

// Default outfit rules
const defaultOutfitRules = [
  {
    minTemp: Number.NEGATIVE_INFINITY,
    maxTemp: 0,
    emoji: "🥶",
    description: "Bundle up! It's freezing cold.",
    conditionSummary: "Freezing",
  },
  {
    minTemp: 0,
    maxTemp: 5,
    emoji: "🧥",
    description: "Wear a heavy coat, hat, and gloves.",
    conditionSummary: "Very Cold",
  },
  { minTemp: 5, maxTemp: 10, emoji: "🧣", description: "A warm jacket and scarf will do.", conditionSummary: "Cold" },
  { minTemp: 10, maxTemp: 15, emoji: "🍂", description: "Light jacket or sweater needed.", conditionSummary: "Cool" },
  {
    minTemp: 15,
    maxTemp: 20,
    emoji: "👕",
    description: "Long-sleeve shirt or light sweater.",
    conditionSummary: "Mild",
  },
  { minTemp: 20, maxTemp: 25, emoji: "🌞", description: "Light tee and jeans/shorts.", conditionSummary: "Warm" },
  {
    minTemp: 25,
    maxTemp: 30,
    emoji: "☀️",
    description: "Shorts and a t-shirt. Stay hydrated!",
    conditionSummary: "Hot",
  },
  {
    minTemp: 30,
    maxTemp: Number.POSITIVE_INFINITY,
    emoji: "🥵",
    description: "Minimal clothing, seek shade!",
    conditionSummary: "Very Hot",
  },
]

export function getOutfitRecommendation(
  weather: WeatherData,
  customRules: CustomOutfitRule[] = [],
): OutfitRecommendation {
  const temp = weather.current.temp_c
  const isRaining = weather.current.precip_mm > 0 && weather.current.condition.text.toLowerCase().includes("rain")
  const isSnowing = weather.current.precip_mm > 0 && weather.current.condition.text.toLowerCase().includes("snow")
  const isWindy = weather.current.wind_kph > 20 // Define "windy" as > 20 kph

  const baseRecommendation =
    defaultOutfitRules.find((rule) => temp >= rule.minTemp && temp < rule.maxTemp) ||
    defaultOutfitRules[defaultOutfitRules.length - 1] // Fallback to hottest

  let emoji = baseRecommendation.emoji
  let description = baseRecommendation.description
  let conditionSummary = baseRecommendation.conditionSummary

  // Apply custom rules first
  const applicableCustomRule = customRules.find((rule) => {
    const tempMatch =
      (rule.minTemp === undefined || temp >= rule.minTemp) && (rule.maxTemp === undefined || temp < rule.maxTemp)
    const rainMatch = rule.isRaining === undefined || rule.isRaining === isRaining
    const snowMatch = rule.isSnowing === undefined || rule.isSnowing === isSnowing
    const windyMatch = rule.isWindy === undefined || rule.isWindy === isWindy
    return tempMatch && rainMatch && snowMatch && windyMatch
  })

  if (applicableCustomRule) {
    emoji = applicableCustomRule.emoji
    description = applicableCustomRule.description
    conditionSummary = applicableCustomRule.name // Use custom rule name as summary
  } else {
    // Apply default weather conditions if no custom rule overrides
    if (isRaining) {
      emoji = "☔"
      description = `${description} Don't forget your umbrella!`
      conditionSummary = "Rainy"
    } else if (isSnowing) {
      emoji = "🌨️"
      description = `${description} Expect snow!`
      conditionSummary = "Snowy"
    }

    if (isWindy) {
      emoji = `${emoji}💨` // Add wind emoji
      description = `${description} It's quite windy!`
      conditionSummary = `${conditionSummary} and Windy`
    }
  }

  return {
    id: crypto.randomUUID(), // Generate a unique ID for each recommendation
    emoji,
    description,
    conditionSummary,
    temperature: temp,
    location: weather.location.name,
  }
}

export function getWeatherBackgroundColor(weather: WeatherData | null): string {
  if (!weather) return "bg-background" // Default background from theme

  const conditionCode = weather.current.condition.code
  const isDay = weather.current.is_day === 1

  // Clear/Sunny
  if (conditionCode === 1000) {
    return isDay ? "bg-weather-clear-light dark:bg-weather-clear-dark" : "bg-weather-clear-dark"
  }
  // Cloudy/Overcast
  if ([1003, 1006, 1009].includes(conditionCode)) {
    return "bg-weather-cloudy-light dark:bg-weather-cloudy-dark"
  }
  // Rain/Drizzle
  if (
    [1063, 1072, 1150, 1153, 1180, 1183, 1186, 1189, 1192, 1195, 1198, 1201, 1240, 1243, 1246].includes(conditionCode)
  ) {
    return "bg-weather-rain-light dark:bg-weather-rain-dark"
  }
  // Snow/Sleet
  if (
    [1066, 1069, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225, 1237, 1255, 1258, 1261, 1264].includes(conditionCode)
  ) {
    return "bg-weather-snow-light dark:bg-weather-snow-dark"
  }
  // Fog/Mist
  if ([1030, 1135, 1147].includes(conditionCode)) {
    return "bg-weather-fog-light dark:bg-weather-fog-dark"
  }

  // Default if no specific match, or for extreme temps
  if (weather.current.temp_c < 5) {
    return "bg-weather-cold-light dark:bg-weather-cold-dark"
  }
  if (weather.current.temp_c > 25) {
    return "bg-weather-hot-light dark:bg-weather-hot-dark"
  }

  return "bg-background" // Fallback to theme background
}
