export interface WeatherData {
  location: {
    name: string
    region: string
    country: string
    localtime?: string
    localtime_epoch?: number
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
    feelslike_c?: number
    uv?: number
  }
  forecast?: {
    forecastday: Array<{
      date: string
      day: {
        maxtemp_c: number
        mintemp_c: number
        daily_chance_of_rain?: number
        daily_chance_of_snow?: number
        condition: { text: string; icon: string; code: number }
      }
      hour: ForecastHour[]
    }>
  }
}

export interface ForecastHour {
  time: string
  time_epoch?: number
  temp_c: number
  feelslike_c?: number
  wind_kph?: number
  humidity?: number
  is_day?: number
  precip_mm?: number
  uv?: number
  chance_of_rain?: number
  chance_of_snow?: number
  condition: WeatherData["current"]["condition"]
}

export interface OutfitRecommendation {
  id: string // Unique ID for saving to favorites
  emoji: string
  description: string
  conditionSummary: string // e.g., "Mild and Sunny", "Cold and Rainy"
  temperature: number
  location: string
  styledLook?: import("./outfit-styling").StyledLook
  forHer?: boolean
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
