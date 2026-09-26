"use client"

import { useEffect, useState } from "react"
import { CloudRain, Droplets, Heart, Wind, Check, FlaskConical, Thermometer } from "lucide-react"
import type { WeatherData, OutfitRecommendation } from "@/lib/types"
import { saveOutfitToLocalStorage } from "@/lib/local-storage-utils"

interface WeatherDisplayProps {
  weather: WeatherData
  outfit: OutfitRecommendation
  demo?: boolean
  unit: "C" | "F"
  onUnitChange: (unit: "C" | "F") => void
}

export default function WeatherDisplay({ weather, outfit, demo = false, unit, onUnitChange }: WeatherDisplayProps) {
  const [saveState, setSaveState] = useState<"idle" | "saved" | "duplicate" | "error">("idle")
  useEffect(() => {
    if (saveState === "idle") return
    const timer = setTimeout(() => setSaveState("idle"), 3200)
    return () => clearTimeout(timer)
  }, [saveState])

  const save = () => setSaveState(saveOutfitToLocalStorage(outfit))
  const temperature = unit === "C" ? Math.round(weather.current.temp_c) : Math.round(weather.current.temp_c * 9 / 5 + 32)
  const wind = unit === "C" ? `${Math.round(weather.current.wind_kph)} km/h` : `${Math.round(weather.current.wind_kph / 1.609)} mph`

  return (
    <article className="ow-weather-card" aria-label={`${demo ? "Sample" : "Live"} weather for ${weather.location.name}`}>
      <div className="ow-card-top flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="ow-eyebrow flex items-center gap-2">{demo ? <FlaskConical size={14} /> : <span className="ow-live-dot" />}{demo ? "SAMPLE FORECAST" : "CURRENT CONDITIONS"}</div>
          <h2 className="ow-display mt-3 text-3xl sm:text-4xl">{weather.location.name}</h2>
          <p className="mt-1 text-sm text-white/70">{[weather.location.region, weather.location.country].filter(Boolean).join(", ")}</p>
        </div>
        <div className="ow-unit-toggle" role="group" aria-label="Temperature unit">
          <button type="button" aria-pressed={unit === "C"} onClick={() => onUnitChange("C")} className={unit === "C" ? "active" : ""}>°C</button>
          <button type="button" aria-pressed={unit === "F"} onClick={() => onUnitChange("F")} className={unit === "F" ? "active" : ""}>°F</button>
        </div>
      </div>

      <div className="ow-temperature-row flex items-center justify-between gap-4">
        <div><div className="ow-display ow-temperature">{temperature}<span>°</span></div><p className="mt-1 font-medium text-white/85">{weather.current.condition.text}</p></div>
        <img src={`https:${weather.current.condition.icon}`} alt="" width={96} height={96} className="ow-condition-icon" />
      </div>

      <div className="ow-metrics grid grid-cols-3 gap-2">
        <Metric icon={<Droplets size={16} />} label="Humidity" value={`${weather.current.humidity}%`} />
        <Metric icon={<Wind size={16} />} label="Wind" value={wind} />
        <Metric icon={<CloudRain size={16} />} label="Rainfall" value={`${weather.current.precip_mm} mm`} />
      </div>
      {(weather.current.feelslike_c !== undefined || weather.current.uv !== undefined) && <p className="mt-3 text-xs text-white/75">
        {weather.current.feelslike_c !== undefined && <>Feels like {unit === "C" ? Math.round(weather.current.feelslike_c) : Math.round(weather.current.feelslike_c * 9 / 5 + 32)}°{unit}</>}
        {weather.current.feelslike_c !== undefined && weather.current.uv !== undefined && <span className="mx-2">·</span>}
        {weather.current.uv !== undefined && <>UV index {weather.current.uv}</>}
      </p>}

      <div className="ow-outfit-panel">
        <div className="ow-eyebrow flex items-center gap-2"><Thermometer size={14} /> WHAT TO WEAR</div>
        <div className="mt-4 flex items-start gap-4"><div className="ow-outfit-emoji" aria-hidden="true">{outfit.emoji}</div><div><h3 className="ow-display text-2xl leading-tight">{outfit.conditionSummary}</h3><p className="mt-2 text-sm leading-relaxed text-white/85">{outfit.description}</p></div></div>
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/20 pt-4">
          <span className="text-xs text-white/65">{demo ? "Preview outfit idea" : "Made for today’s forecast"}</span>
          <button type="button" onClick={save} className="ow-save"><Heart size={16} /> Save outfit</button>
        </div>
        {saveState !== "idle" && <div role="status" className="mt-3 flex items-center gap-2 text-xs text-white"><Check size={14} />{saveState === "saved" ? "Added to your favorites" : saveState === "duplicate" ? "Already in your favorites" : "Could not save. Check browser storage settings."}</div>}
      </div>
      {demo && <p className="mt-4 text-center text-xs text-white/65">Sample conditions for this scene · search a city for live weather</p>}
    </article>
  )
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="ow-metric"><div className="flex items-center gap-1.5 text-white/65">{icon}<span>{label}</span></div><strong className="mt-2 block text-sm font-semibold text-white">{value}</strong></div>
}
