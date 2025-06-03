"use client"

import { useState } from "react"
import SearchBar from "@/components/search-bar"
import WeatherDisplay from "@/components/weather-display"
import { WeatherSkeleton } from "@/components/loading-skeleton"
import type { WeatherData, OutfitRecommendation } from "@/lib/types"
import { getOutfitRecommendation, getWeatherBackgroundColor } from "@/lib/weather-utils"
import { getCustomOutfitRules } from "@/lib/local-storage-utils"
import { CloudOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import WeatherAnimations from "@/components/weather-animations"

export default function HomePage() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [outfitRecommendation, setOutfitRecommendation] = useState<OutfitRecommendation | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchWeather = async (city: string) => {
    setIsLoading(true)
    setError(null)
    setWeatherData(null)
    setOutfitRecommendation(null)

    try {
      const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch weather data")
      }

      setWeatherData(data)
      const customRules = getCustomOutfitRules()
      const outfit = getOutfitRecommendation(data, customRules)
      setOutfitRecommendation(outfit)
      toast({
        title: "Weather fetched successfully!",
        description: `Showing weather for ${city}.`,
      })
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.")
      toast({
        title: "Error fetching weather",
        description: err.message || "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const backgroundColor = getWeatherBackgroundColor(weatherData)

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] w-full transition-colors duration-500 ${backgroundColor} text-foreground relative`}
    >
      <WeatherAnimations weather={weatherData} />
      <div className="flex flex-col items-center gap-8 p-4 md:p-8 w-full max-w-6xl relative z-10">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-foreground animate-fade-in">WeatherWear</h1>
        <SearchBar onSearch={fetchWeather} isLoading={isLoading} />

        {isLoading && <WeatherSkeleton />}

        {error && (
          <div className="flex flex-col items-center gap-4 mt-8 text-destructive animate-fade-in">
            <CloudOff className="h-12 w-12" />
            <p className="text-lg font-medium">{error}</p>
            <p className="text-sm text-muted-foreground">Please check the city name or your internet connection.</p>
          </div>
        )}

        {weatherData && outfitRecommendation && !isLoading && !error && (
          <div className="animate-fade-in animate-scale-in">
            <WeatherDisplay weather={weatherData} outfit={outfitRecommendation} />
          </div>
        )}
      </div>
    </div>
  )
}
