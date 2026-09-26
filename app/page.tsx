"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { CloudOff, Compass, LocateFixed, Sparkles, Volume2, VolumeX } from "lucide-react"
import SearchBar from "@/components/search-bar"
import WeatherDisplay from "@/components/weather-display"
import WeatherScenery from "@/components/weather-scenery"
import ForecastStrip from "@/components/forecast-strip"
import { WeatherSkeleton } from "@/components/loading-skeleton"
import type { WeatherData, OutfitRecommendation, CustomOutfitRule } from "@/lib/types"
import { getOutfitRecommendation } from "@/lib/weather-utils"
import { getCustomOutfitRules } from "@/lib/local-storage-utils"
import { DEMO_SCENE_KEYS, buildDemoWeather, getWeatherScene, type SceneKey } from "@/lib/weather-scene"

const SCENE_EMOJI: Record<SceneKey, string> = {
  "clear-day": "☀️", "clear-night": "🌙", cloudy: "☁️", rain: "🌧️",
  thunder: "⛈️", snow: "❄️", fog: "🌫️", wind: "🍃", heat: "🔥",
}
const SHEEP_MOODS = ["Baa!", "The sheep approve of this forecast.", "One sheep looked up. Briefly.", "Sheep lore unlocked: they judge your outfit."]

export default function HomePage() {
  const params = useSearchParams()
  const initialDemo = params.get("demo")
  const initialScene = initialDemo && DEMO_SCENE_KEYS.includes(initialDemo as SceneKey) ? initialDemo as SceneKey : null
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [lastCity, setLastCity] = useState<string | null>(null)
  const [currentQuery, setCurrentQuery] = useState<string | null>(null)
  const [customRules, setCustomRules] = useState<CustomOutfitRule[]>([])
  const [preview, setPreview] = useState<SceneKey | null>(initialScene)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [unit, setUnit] = useState<"C" | "F">("C")
  const [motion, setMotion] = useState(true)
  const [parallax, setParallax] = useState({ x: 0, y: 0 })
  const [sheepPetted, setSheepPetted] = useState(0)
  const [sheepMood, setSheepMood] = useState<string | null>(null)
  const requestRef = useRef<AbortController | null>(null)
  const pointerFrame = useRef<number>(0)

  const sceneWeather = useMemo(() => preview ? buildDemoWeather(preview) : weatherData, [preview, weatherData])
  const scene = getWeatherScene(sceneWeather)
  const recommendation: OutfitRecommendation | null = useMemo(() => {
    if (!sceneWeather) return null
    return getOutfitRecommendation(sceneWeather, customRules)
  }, [sceneWeather, customRules])

  useEffect(() => {
    if (!motion) { setParallax({ x: 0, y: 0 }); return }
    const onMove = (e: PointerEvent) => {
      if (pointerFrame.current) return
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = (e.clientY / window.innerHeight) * 2 - 1
      pointerFrame.current = requestAnimationFrame(() => {
        setParallax({ x, y })
        pointerFrame.current = 0
      })
    }
    window.addEventListener("pointermove", onMove, { passive: true })
    return () => { window.removeEventListener("pointermove", onMove); cancelAnimationFrame(pointerFrame.current) }
  }, [motion])

  useEffect(() => () => requestRef.current?.abort(), [])
  useEffect(() => {
    try { setLastCity(window.localStorage.getItem("ow:last-city")) } catch { /* private browsing */ }
    setCustomRules(getCustomOutfitRules())
  }, [])

  const fetchWeather = useCallback(async (query: string) => {
    requestRef.current?.abort()
    const controller = new AbortController()
    requestRef.current = controller
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/weather?city=${encodeURIComponent(query)}`, { signal: controller.signal })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Could not load the weather. Please try again.")
      if (controller.signal.aborted) return
      setWeatherData(data as WeatherData)
      setPreview(null)
      setCurrentQuery(query)
      if (!query.includes(",") || /[a-z]/i.test(query)) {
        try { window.localStorage.setItem("ow:last-city", data.location.name) } catch { /* private browsing */ }
        setLastCity(data.location.name)
      }
    } catch (e) {
      if (!controller.signal.aborted) setError(e instanceof Error ? e.message : "Could not load the weather. Please try again.")
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }, [])

  const useLocation = () => {
    if (!navigator.geolocation) { setError("Your browser does not support location. Search for a city instead."); return }
    setError(null)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => void fetchWeather(`${coords.latitude},${coords.longitude}`),
      () => setError("Location access was unavailable. Search for a city instead."),
      { timeout: 10000, maximumAge: 300000 },
    )
  }

  const choosePreview = (key: SceneKey) => {
    requestRef.current?.abort()
    setLoading(false)
    setError(null)
    setPreview(key)
  }

  const petSheep = () => {
    setSheepPetted((n) => n + 1)
    setSheepMood(SHEEP_MOODS[Math.floor(Math.random() * SHEEP_MOODS.length)])
  }

  return (
    <div className="ow-page relative min-h-[calc(100vh-4rem)] w-full overflow-hidden" style={{ background: scene.gradient }}>
      <WeatherScenery scene={scene.key} motion={motion} parallax={parallax} sheepCount={sceneWeather ? sheepForWeather(sceneWeather) : 3} onSheepClick={petSheep} />
      <div className="ow-vignette pointer-events-none fixed inset-0 z-[1]" />
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col px-5 pb-28 pt-8 sm:px-8 md:pt-14">
        <div className="mb-10 flex items-center justify-between gap-4">
          <div className="ow-eyebrow flex items-center gap-2"><span className="ow-live-dot" /> THE WEATHER, WEARABLE</div>
          <button type="button" onClick={() => setMotion((value) => !value)} className="ow-utility" aria-label={motion ? "Turn off pointer movement" : "Turn on pointer movement"} title="Toggle pointer movement">
            {motion ? <Volume2 size={16} /> : <VolumeX size={16} />} <span className="hidden sm:inline">Motion {motion ? "on" : "off"}</span>
          </button>
        </div>

        <section className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div className="max-w-2xl">
            <div className="ow-kicker mb-6 inline-flex items-center gap-2"><Sparkles size={14} /> A LITTLE FORECAST FOR YOUR FIT</div>
            <h1 className="ow-display ow-hero-title">Look outside.<br /><em>Dress better.</em></h1>
            <p className="ow-intro mt-6 max-w-lg">Real weather, a ready to wear recommendation, and a sky that changes with the forecast. Where are you headed?</p>
            <div className="mt-9 flex max-w-xl flex-col gap-3 sm:flex-row">
              <SearchBar onSearch={fetchWeather} isLoading={loading} />
              <button type="button" onClick={useLocation} disabled={loading} className="ow-location-button"><LocateFixed size={18} /> Use my location</button>
            </div>
            {error && <div role="alert" className="ow-error mt-4 flex items-start gap-2"><CloudOff size={18} className="mt-0.5 shrink-0" />{error}</div>}
            <p className="mt-4 text-xs text-white/65">Search any city, or allow location to see your local conditions.</p>
            {lastCity && !weatherData && <button type="button" onClick={() => void fetchWeather(lastCity)} className="ow-last-city mt-4">↗ See {lastCity} again</button>}
          </div>

          <div className="ow-feature relative">
            {loading && !sceneWeather ? <WeatherSkeleton /> : sceneWeather && recommendation ? (
              <WeatherDisplay key={`${preview ?? "live"}-${sceneWeather.location.name}-${scene.key}`} weather={sceneWeather} outfit={recommendation} demo={Boolean(preview)} unit={unit} onUnitChange={setUnit} isRefreshing={loading} onRefresh={currentQuery ? () => void fetchWeather(currentQuery) : undefined} />
            ) : (
              <div className="ow-empty-card">
                <div className="ow-empty-icon"><Compass size={34} strokeWidth={1.5} /></div>
                <span className="ow-eyebrow">YOUR FORECAST AWAITS</span>
                <h2 className="ow-display mt-3 text-4xl">A good day starts<br />with the right layers.</h2>
                <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/70">Find your city for live conditions, or pick a sky below to explore how the page responds.</p>
                <div className="ow-empty-orbit" aria-hidden="true">✦</div>
              </div>
            )}
          </div>
        </section>

        {weatherData && !preview && <div className="mt-12"><ForecastStrip weather={weatherData} unit={unit} /></div>}

        <section className="ow-scene-section mt-14" aria-label="Weather scene previews">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div><div className="ow-eyebrow mb-2">INTERACTIVE SKY GALLERY</div><h2 className="ow-display text-2xl sm:text-3xl">Try a different forecast</h2></div>
            {preview && weatherData && <button type="button" className="ow-return" onClick={() => setPreview(null)}>↩ Back to live weather</button>}
          </div>
          <div className="ow-scene-grid">
            {DEMO_SCENE_KEYS.map((key) => {
              const active = preview === key
              return <button key={key} type="button" onClick={() => choosePreview(key)} aria-pressed={active} className={`ow-scene-chip ${active ? "is-active" : ""}`}>
                <span aria-hidden="true" className="text-xl">{SCENE_EMOJI[key]}</span><span>{getWeatherScene(buildDemoWeather(key)).label}</span>
              </button>
            })}
          </div>
          <p className="mt-3 text-xs text-white/60">Scenes are sample weather. Search or use your location for live conditions.</p>
        </section>
      </div>
      {sheepPetted > 0 && <div role="status" className="ow-sheep-toast">🐑 {sheepMood} <span className="text-white/60">· {sheepPetted} pets</span></div>}
    </div>
  )
}

function sheepForWeather(w: WeatherData): number {
  if (w.current.temp_c <= -5 || w.current.temp_c >= 32) return 1
  if (w.current.wind_kph > 40) return 2
  return 4
}
