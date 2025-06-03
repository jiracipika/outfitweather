export interface WeatherData {
  location: {
    name: string
    region: string
    country: string
  }
  current: {
    temp_c: number
    condition: {
      text: string
      icon: string
      code: number
    }
    humidity: number
    wind_kph: number
    is_day: number // 1 for day, 0 for night
    precip_mm: number // Precipitation in millimeters
  }
}

export interface OutfitRecommendation {
  id: string // Unique ID for saving to favorites
  emoji: string
  description: string
  conditionSummary: string // e.g., "Mild and Sunny", "Cold and Rainy"
  temperature: number
  location: string
}

export interface CustomOutfitRule {
  id: string
  name: string
  minTemp?: number
  maxTemp?: number
  isRaining?: boolean
  isSnowing?: boolean
  isWindy?: boolean // e.g., wind_kph > 20
  emoji: string
  description: string
}
