"use client"

import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { WeatherData, OutfitRecommendation } from "@/lib/types"
import OutfitCard from "./outfit-card"
import { saveOutfitToLocalStorage } from "@/lib/local-storage-utils"
import { useState } from "react"
import { CheckCircle } from "lucide-react"

interface WeatherDisplayProps {
  weather: WeatherData
  outfit: OutfitRecommendation
}

export default function WeatherDisplay({ weather, outfit }: WeatherDisplayProps) {
  const [saved, setSaved] = useState(false)

  const handleSaveOutfit = (outfitToSave: OutfitRecommendation) => {
    saveOutfitToLocalStorage(outfitToSave)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000) // Reset saved state after 2 seconds
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full max-w-4xl">
      <Card className="md:col-span-1 lg:col-span-1 backdrop-blur-sm bg-card/80">
        <CardHeader>
          <CardTitle className="text-3xl">{weather.location.name}</CardTitle>
          <CardDescription>
            {weather.location.region}, {weather.location.country}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <Image
            src={`https:${weather.current.condition.icon}`}
            alt={weather.current.condition.text}
            width={80}
            height={80}
            className="w-20 h-20"
          />
          <div className="text-5xl font-bold">{weather.current.temp_c}°C</div>
          <p className="text-lg text-muted-foreground">{weather.current.condition.text}</p>
          <div className="grid grid-cols-2 gap-2 text-sm w-full">
            <div className="flex items-center justify-between">
              <span>Humidity:</span>
              <span className="font-medium">{weather.current.humidity}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Wind:</span>
              <span className="font-medium">{weather.current.wind_kph} kph</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Precipitation:</span>
              <span className="font-medium">{weather.current.precip_mm} mm</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="md:col-span-1 lg:col-span-2 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-semibold mb-4 backdrop-blur-sm bg-background/80 px-4 py-2 rounded-lg">
          Your WeatherWear Recommendation:
        </h2>
        <OutfitCard outfit={outfit} onSave={handleSaveOutfit} />
        {saved && (
          <div className="mt-4 flex items-center text-green-600 font-medium">
            <CheckCircle className="w-5 h-5 mr-2" /> Outfit Saved!
          </div>
        )}
      </div>
    </div>
  )
}
