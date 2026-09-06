"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import SearchBar from "@/components/search-bar"
import WeatherDisplay from "@/components/weather-display"
import { WeatherSkeleton } from "@/components/loading-skeleton"
import type { WeatherData, OutfitRecommendation } from "@/lib/types"
import { getOutfitRecommendation } from "@/lib/weather-utils"
import { getCustomOutfitRules } from "@/lib/local-storage-utils"
import { CloudOff, Search, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import WeatherScenery from "@/components/weather-scenery"
import {
  DEMO_SCENE_KEYS,
  buildDemoWeather,
  getWeatherScene,
  type SceneKey,
} from "@/lib/weather-scene"
import { useSearchParams } from "next/navigation"

const SHEEP_MOODS = [
  "Baa.",
  "The sheep approve of this forecast.",
  "One sheep looked up. Briefly.",
  "That sheep is now your favorite.",
  "Baa-utiful weather, honestly.",
  "The herd has acknowledged you.",
  "Sheep lore unlocked: they judge your outfit.",
]

export default function HomePage() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [outfitRecommendation, setOutfitRecommendation] = useState<OutfitRecommendation | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [demo, setDemo] = useState(false)
  const [demoSceneKey, setDemoSceneKey] = useState<SceneKey | null>(null)
  const [parallax, setParallax] = useState({ x: 0, y: 0 })
  const [sheepPetted, setSheepPetted] = useState(0)
  const [sheepMood, setSheepMood] = useState<string | null>(null)
  const { toast } = useToast()
  const searchParams = useSearchParams()

  // Demo mode: ?demo=rain or the demo tray when no API data is loaded.
  const demoSceneParam = searchParams.get("demo") as SceneKey | null
  const demoScene = useMemo<SceneKey | null>(() => {
    if (demoSceneParam && DEMO_SCENE_KEYS.includes(demoSceneParam)) return demoSceneParam
    return null
  }, [demoSceneParam])

  const sceneWeather = demoScene ? buildDemoWeather(demoScene) : demo && demoSceneKey ? buildDemoWeather(demoSceneKey) : weatherData
  const scene = getWeatherScene(sceneWeather)

  // Multi-axis pointer parallax (throttled to rAF by React batching).
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = (e.clientY / window.innerHeight) * 2 - 1
      setParallax({ x, y })
    }
    window.addEventListener("pointermove", onMove, { passive: true })
    return () => window.removeEventListener("pointermove", onMove)
  }, [])

  const fetchWeather = useCallback(
    async (city: string) => {
      setIsLoading(true)
      setError(null)
      setWeatherData(null)
      setOutfitRecommendation(null)
      setDemo(false)

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
    },
    [toast]
  )

  const showDemoScene = useCallback((key: SceneKey) => {
    const w = buildDemoWeather(key)
    setDemo(true)
    setWeatherData(null)
    setError(null)
    setDemoSceneKey(key)
    setOutfitRecommendation(getOutfitRecommendation(w))
  }, [])

  const petSheep = useCallback(() => {
    setSheepPetted((n) => n + 1)
    setSheepMood(SHEEP_MOODS[Math.floor(Math.random() * SHEEP_MOODS.length)])
  }, [])

  const isLightText = scene.textTheme === "light"
  const textMain = isLightText ? "text-white" : "text-slate-900"
  const textSoft = isLightText ? "text-white/75" : "text-slate-700"

  const sheepCount = sceneWeather ? sheepForWeather(sceneWeather) : 2

  return (
    <div
      className="relative flex min-h-[calc(100vh-4rem)] w-full flex-col items-center transition-[background] duration-700"
      style={{ background: scene.gradient }}
    >
      <WeatherScenery scene={scene.key} parallax={parallax} sheepCount={sheepCount} onSheepClick={petSheep} />

      <div className="relative z-10 flex w-full max-w-6xl flex-col items-center gap-8 p-4 md:p-8">
        <h1 className={`ow-display animate-fade-in mt-2 text-center text-5xl font-bold tracking-tight md:text-6xl ${textMain}`}>
          outfitweather
        </h1>
        <p className={`animate-fade-in text-center text-sm font-medium uppercase tracking-[0.22em] ${textSoft}`}>
          {scene.label} &middot; dress for it
        </p>

        <SearchBar onSearch={fetchWeather} isLoading={isLoading} />

        {isLoading && <WeatherSkeleton />}

        {error && (
          <div className={`animate-fade-in mt-8 flex flex-col items-center gap-4 ${textMain}`}>
            <CloudOff className="h-12 w-12" />
            <p className="text-lg font-medium">{error}</p>
            <p className={`text-sm ${textSoft}`}>Please check the city name or your internet connection.</p>
          </div>
        )}

        {sceneWeather && outfitRecommendation && !isLoading && !error && (
          <div className="animate-fade-in animate-scale-in w-full flex justify-center">
            <WeatherDisplay weather={sceneWeather} outfit={outfitRecommendation} demo={demo} />
          </div>
        )}

        {/* Demo scene tray — lets anyone tour every sky without an API key */}
        {!weatherData && !isLoading && (
          <div className="animate-fade-in mt-2 w-full max-w-3xl">
            <div
              className="flex flex-wrap items-center justify-center gap-2 rounded-3xl border border-white/25 bg-black/20 p-4 backdrop-blur-md"
            >
              <span className={`mr-1 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] ${textSoft}`}>
                <Sparkles className="h-3.5 w-3.5" />
                Try a sky
              </span>
              {DEMO_SCENE_KEYS.map((key) => {
                const w = buildDemoWeather(key)
                const s = getWeatherScene(w)
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => showDemoScene(key)}
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold backdrop-blur-sm transition-all hover:scale-105 ${
                      demoScene === key || (demo && demoSceneKey === key)
                        ? "border-white/70 bg-white/85 text-slate-900"
                        : "border-white/30 bg-white/12 text-white hover:bg-white/25"
                    }`}
                    style={{ textShadow: demoScene === key ? undefined : "0 1px 2px rgba(0,0,0,0.35)" }}
                    aria-label={`Preview ${s.label} scene`}
                  >
                    {SCENE_EMOJI[key]} {s.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Sheep quirk status */}
        {sheepPetted > 0 && (
          <div className="pointer-events-none fixed bottom-4 left-1/2 z-20 -translate-x-1/2">
            <div className="rounded-full border border-white/30 bg-black/45 px-4 py-2 text-xs font-medium text-white backdrop-blur-md animate-fade-in">
              🐑 {sheepMood} <span className="ml-2 text-white/60">(petted {sheepPetted})</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function sheepForWeather(w: WeatherData): number {
  const t = w.current.temp_c
  if (t <= -5) return 1
  if (t <= 2) return 2
  if (t >= 32) return 1 // even sheep avoid that
  if (w.current.wind_kph > 40) return 3 // some blew away
  return 4
}

const SCENE_EMOJI: Record<SceneKey, string> = {
  "clear-day": "☀️",
  "clear-night": "🌙",
  cloudy: "☁️",
  rain: "🌧️",
  snow: "❄️",
  fog: "🌫️",
  thunder: "⛈️",
  wind: "🍃",
  heat: "🔥",
}
