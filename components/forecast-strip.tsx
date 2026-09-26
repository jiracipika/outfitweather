"use client"

import { useState } from "react"
import { CloudRain, CalendarDays, Clock3 } from "lucide-react"
import type { WeatherData } from "@/lib/types"

type ForecastDay = NonNullable<WeatherData["forecast"]>["forecastday"][number]

export default function ForecastStrip({ weather, unit }: { weather: WeatherData; unit: "C" | "F" }) {
  const [tab, setTab] = useState<"hours" | "days">("hours")
  const days = weather.forecast?.forecastday ?? []
  if (!days.length) return null

  const localHour = weather.location.localtime ? new Date(weather.location.localtime.replace(" ", "T")).getHours() : 0
  const hours = days.flatMap((day) => day.hour).filter((hour) => {
    const day = hour.time.slice(0, 10)
    return day > days[0].date || Number(hour.time.slice(11, 13)) >= localHour
  }).slice(0, 12)
  const showTemp = (c: number) => `${Math.round(unit === "C" ? c : c * 9 / 5 + 32)}°`

  return (
    <section className="ow-forecast" aria-label="Upcoming weather">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><div className="ow-eyebrow">PLAN AHEAD</div><h2 className="ow-display mt-2 text-2xl sm:text-3xl">What’s coming next</h2></div>
        <div className="ow-forecast-tabs" role="tablist" aria-label="Forecast view">
          <button type="button" role="tab" aria-selected={tab === "hours"} onClick={() => setTab("hours")} className={tab === "hours" ? "active" : ""}><Clock3 size={15} /> Next hours</button>
          <button type="button" role="tab" aria-selected={tab === "days"} onClick={() => setTab("days")} className={tab === "days" ? "active" : ""}><CalendarDays size={15} /> 3 days</button>
        </div>
      </div>
      {tab === "hours" ? (
        <div role="tabpanel" className="ow-hours mt-5 flex gap-2 overflow-x-auto pb-2">
          {hours.map((hour, i) => <div className="ow-hour" key={hour.time}>
            <span className="text-xs text-white/70">{i === 0 ? "Now" : new Date(hour.time.replace(" ", "T")).toLocaleTimeString("en", { hour: "numeric" })}</span>
            <img src={`https:${hour.condition.icon}`} width={42} height={42} alt={hour.condition.text} title={hour.condition.text} />
            <strong>{showTemp(hour.temp_c)}</strong>
            <span className="flex items-center gap-1 text-xs text-sky-200"><CloudRain size={12} />{Math.max(hour.chance_of_rain ?? 0, hour.chance_of_snow ?? 0)}%</span>
          </div>)}
        </div>
      ) : (
        <div role="tabpanel" className="mt-5 grid gap-2 sm:grid-cols-3">
          {days.map((day: ForecastDay, index) => <div className="ow-day" key={day.date}>
            <span className="ow-eyebrow">{index === 0 ? "TODAY" : new Date(`${day.date}T12:00:00`).toLocaleDateString("en", { weekday: "long" }).toUpperCase()}</span>
            <div className="mt-3 flex items-center gap-2"><img src={`https:${day.day.condition.icon}`} width={48} height={48} alt="" /><strong className="text-lg">{showTemp(day.day.maxtemp_c)} <span className="text-white/60">/ {showTemp(day.day.mintemp_c)}</span></strong></div>
            <p className="mt-1 text-sm text-white/80">{day.day.condition.text}</p>
            <p className="mt-3 flex items-center gap-1 text-xs text-sky-200"><CloudRain size={13} />{Math.max(day.day.daily_chance_of_rain ?? 0, day.day.daily_chance_of_snow ?? 0)}% chance of precipitation</p>
          </div>)}
        </div>
      )}
    </section>
  )
}
