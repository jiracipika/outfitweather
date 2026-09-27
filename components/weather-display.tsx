"use client"

import { useEffect, useState } from "react"
import { CloudRain, Droplets, Heart, Wind, Check, FlaskConical, Thermometer, RefreshCw } from "lucide-react"
import type { WeatherData, OutfitRecommendation } from "@/lib/types"
import { saveOutfitToLocalStorage } from "@/lib/local-storage-utils"

interface WeatherDisplayProps {
  weather: WeatherData
  outfit: OutfitRecommendation
  demo?: boolean
  unit: "C" | "F"
  onUnitChange: (unit: "C" | "F") => void
  isRefreshing?: boolean
  onRefresh?: () => void
}

export default function WeatherDisplay({ weather, outfit, demo = false, unit, onUnitChange, isRefreshing = false, onRefresh }: WeatherDisplayProps) {
  const [saveState, setSaveState] = useState<"idle" | "saved" | "duplicate" | "error">("idle")
  useEffect(() => {
    if (saveState === "idle") return
    const timer = setTimeout(() => setSaveState("idle"), 3200)
    return () => clearTimeout(timer)
  }, [saveState])

  const save = () => setSaveState(saveOutfitToLocalStorage(outfit))
  const temperature = unit === "C" ? Math.round(weather.current.temp_c) : Math.round(weather.current.temp_c * 9 / 5 + 32)
  const wind = unit === "C" ? `${Math.round(weather.current.wind_kph)} km/h` : `${Math.round(weather.current.wind_kph / 1.609)} mph`
  const styleNotes = getStyleNotes(weather)

  return (
    <article className="ow-weather-card" aria-label={`${demo ? "Sample" : "Live"} weather for ${weather.location.name}`}>
      <div className="ow-card-top flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="ow-eyebrow flex items-center gap-2">{demo ? <FlaskConical size={14} /> : <span className="ow-live-dot" />}{demo ? "SAMPLE FORECAST" : "CURRENT CONDITIONS"}</div>
          <h2 className="ow-display mt-3 text-3xl sm:text-4xl">{weather.location.name}</h2>
          <p className="mt-1 text-sm text-white/70">{[weather.location.region, weather.location.country].filter(Boolean).join(", ")}</p>
          {weather.location.localtime && <p className="mt-2 text-xs tracking-wide text-white/60">LOCAL TIME · {new Date(weather.location.localtime.replace(" ", "T")).toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" })}</p>}
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && <button type="button" className="ow-refresh" onClick={onRefresh} disabled={isRefreshing} aria-label="Refresh forecast" title="Refresh forecast"><RefreshCw size={15} className={isRefreshing ? "animate-spin" : ""} /></button>}
          <div className="ow-unit-toggle" role="group" aria-label="Temperature unit">
            <button type="button" aria-pressed={unit === "C"} onClick={() => onUnitChange("C")} className={unit === "C" ? "active" : ""}>°C</button>
            <button type="button" aria-pressed={unit === "F"} onClick={() => onUnitChange("F")} className={unit === "F" ? "active" : ""}>°F</button>
          </div>
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
      {styleNotes.length > 0 && <div className="ow-style-notes" aria-label="Practical clothing tips">
        <div className="ow-style-notes-heading"><span>✦</span><div><strong>Before you go</strong><small>Small details for today’s conditions</small></div></div>
        <div className="ow-style-note-list">{styleNotes.map((note) => <span className="ow-style-note" key={note}>{note}</span>)}</div>
      </div>}
      {demo && <p className="mt-4 text-center text-xs text-white/65">Sample conditions for this scene · search a city for live weather</p>}
    </article>
  )
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="ow-metric"><div className="flex items-center gap-1.5 text-white/65">{icon}<span>{label}</span></div><strong className="mt-2 block text-sm font-semibold text-white">{value}</strong></div>
}


function getStyleNotes(weather: WeatherData): string[] {
  const notes: string[] = []
  const condition = weather.current.condition.text.toLowerCase()
  const localDateTime = weather.location.localtime?.replace(" ", "T")
  const localDate = localDateTime?.slice(0, 10)
  const localHour = localDateTime ? Number(localDateTime.slice(11, 13)) : -1
  const upcomingRain = weather.forecast?.forecastday
    .flatMap((day) => day.hour)
    .filter((hour) => {
      const hourDate = hour.time.slice(0, 10)
      const hourOfDay = Number(hour.time.slice(11, 13))
      return !localDate || hourDate > localDate || (hourDate === localDate && hourOfDay >= localHour)
    })
    .slice(0, 8)
    .some((hour) => (hour.chance_of_rain ?? 0) >= 45 || (hour.chance_of_snow ?? 0) >= 45)

  if (weather.current.precip_mm > 0 || /rain|drizzle|snow|sleet|shower/.test(condition)) {
    notes.push("Choose shoes that can handle wet ground")
  } else if (upcomingRain) {
    notes.push("Pack a light shell in case rain moves in")
  }
  if (weather.current.temp_c <= 5) notes.push("Add a warm mid-layer")
  else if (weather.current.wind_kph >= 30) notes.push("Secure a wind-resistant outer layer")
  if ((weather.current.uv ?? 0) >= 6) notes.push("Bring sunglasses for strong UV")
  else if (weather.current.humidity >= 75 && weather.current.temp_c >= 22) notes.push("Breathable fabrics may feel cooler")
  return notes.slice(0, 2)
}
