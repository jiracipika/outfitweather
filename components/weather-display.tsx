"use client"

import Image from "next/image"
import { useState } from "react"
import type { WeatherData, OutfitRecommendation } from "@/lib/types"
import OutfitCard from "./outfit-card"
import { saveOutfitToLocalStorage } from "@/lib/local-storage-utils"
import { CheckCircle, FlaskConical } from "lucide-react"

interface WeatherDisplayProps {
  weather: WeatherData
  outfit: OutfitRecommendation
  /** Demo-mode data (no real API call) — surfaced honestly in the UI. */
  demo?: boolean
}

export default function WeatherDisplay({ weather, outfit, demo = false }: WeatherDisplayProps) {
  const [saveState, setSaveState] = useState<"idle" | "saved" | "duplicate">("idle")

  const handleSaveOutfit = (outfitToSave: OutfitRecommendation) => {
    // saveOutfitToLocalStorage returns false when this outfit is already in
    // the favorites list — previously the UI still claimed "Outfit Saved!".
    const wasStored = saveOutfitToLocalStorage(outfitToSave)
    setSaveState(wasStored ? "saved" : "duplicate")
    setTimeout(() => setSaveState("idle"), 2400)
  }

  return (
    <div className="grid w-full max-w-4xl gap-6 md:grid-cols-2 lg:grid-cols-3">
      {demo && (
        <div className="md:col-span-2 lg:col-span-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-black/30 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
            <FlaskConical className="h-3.5 w-3.5" />
            Demo scene — sample data, not a live forecast
          </div>
        </div>
      )}

      <Card className="ow-glass md:col-span-1 lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-3xl">{weather.location.name}</CardTitle>
          <CardDescription className="ow-glass-soft">
            {weather.location.region}, {weather.location.country}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <Image
            src={`https:${weather.current.condition.icon}`}
            alt={weather.current.condition.text}
            width={80}
            height={80}
            className="h-20 w-20"
          />
          <div className="ow-display text-5xl font-bold">{weather.current.temp_c}°C</div>
          <p className="text-lg text-muted-foreground">{weather.current.condition.text}</p>
          <div className="grid w-full grid-cols-2 gap-2 text-sm">
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

      <div className="flex flex-col items-center justify-center md:col-span-1 lg:col-span-2">
        <h2 className="ow-glass mb-4 rounded-lg px-4 py-2 text-2xl font-semibold">Your WeatherWear Recommendation:</h2>
        <OutfitCard outfit={outfit} onSave={handleSaveOutfit} />
        {saveState !== "idle" && (
          <div
            role="status"
            className={
              saveState === "saved"
                ? "mt-4 flex items-center font-medium text-emerald-300 drop-shadow"
                : "mt-4 flex items-center font-medium text-white/70 drop-shadow"
            }
          >
            {saveState === "saved" ? (
              <>
                <CheckCircle className="mr-2 h-5 w-5" /> Outfit Saved!
              </>
            ) : (
              <>Already in your favorites — see the Favorites page.</>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`rounded-3xl ${className}`}>{children}</div>
}

function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col space-y-1.5 p-6">{children}</div>
}

function CardTitle({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <h3 className={`font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
}

function CardDescription({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <p className={`text-sm ${className}`}>{children}</p>
}

function CardContent({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`p-6 pt-0 ${className}`}>{children}</div>
}
