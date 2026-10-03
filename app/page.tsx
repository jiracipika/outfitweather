"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { CloudOff, LocateFixed, Sparkles, Sun, Moon, Cloud, CloudRain, CloudLightning, Snowflake, Haze, Wind, ThermometerSun } from "lucide-react"
import SearchBar from "@/components/search-bar"
import WeatherDisplay from "@/components/weather-display"
import OutfitStudio from "@/components/outfit-studio"
import WardrobeArt from "@/components/wardrobe-art"
import { buildStyledLook } from "@/lib/outfit-styling"
import { useWardrobePreferences } from "@/components/wardrobe-preferences"
import WeatherScenery from "@/components/weather-scenery"
import ForecastStrip from "@/components/forecast-strip"
import { WeatherSkeleton } from "@/components/loading-skeleton"
import type { WeatherData, OutfitRecommendation, CustomOutfitRule } from "@/lib/types"
import { getOutfitRecommendation } from "@/lib/weather-utils"
import { getCustomOutfitRules } from "@/lib/local-storage-utils"
import { DEMO_SCENE_KEYS, buildDemoWeather, getWeatherScene, type SceneKey } from "@/lib/weather-scene"

const SCENE_ICONS = {
  "clear-day": Sun, "clear-night": Moon, cloudy: Cloud, rain: CloudRain,
  thunder: CloudLightning, snow: Snowflake, fog: Haze, wind: Wind, heat: ThermometerSun,
}
const SHEEP_MOODS = ["Baa!", "The sheep approve of this forecast.", "One sheep looked up. Briefly.", "Sheep lore unlocked: they judge your outfit."]
const SCENE_CUE: Record<SceneKey, string> = {
  "clear-day": "Bright sun, easy layers", "clear-night": "Cooler after dark", cloudy: "Soft light, mild layers",
  rain: "Wet streets, stay covered", thunder: "Storm timing matters", snow: "Warmth from head to toe",
  fog: "Low visibility, lighter layers", wind: "Secure your outer layer", heat: "Keep fabrics light",
}

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
  const { motion, forHer } = useWardrobePreferences()
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
    if (!motion || window.matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse)").matches) { setParallax({ x: 0, y: 0 }); return }
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
    return () => { window.removeEventListener("pointermove", onMove); cancelAnimationFrame(pointerFrame.current); pointerFrame.current = 0 }
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
    <div className="ow-page ow-atelier-page relative min-h-[calc(100vh-4rem)] w-full overflow-hidden" data-for-her={forHer ? "true" : "false"} data-motion={motion ? "on" : "off"} style={{ background: scene.gradient }}>
      <WeatherScenery scene={scene.key} motion={motion} parallax={parallax} sheepCount={sceneWeather ? sheepForWeather(sceneWeather) : 3} onSheepClick={petSheep} />
      <div className="ow-vignette pointer-events-none fixed inset-0 z-[1]" />
      <div className="ow-shell relative z-10 mx-auto flex w-full max-w-7xl flex-col px-5 pb-28 pt-8 sm:px-8 md:pt-14">
        <div className="ow-topbar mb-10 flex items-center justify-between gap-4">
          <div className="ow-page-status">
            <span className={weatherData && !preview ? "ow-live-dot" : "ow-demo-dot"} />
            <span>{preview ? "SCENE PREVIEW" : weatherData ? "LIVE WEATHER" : "YOUR DAILY WEATHER BRIEF"}</span>
            {sceneWeather && <span className="ow-page-status-location">{sceneWeather.location.name}</span>}
          </div>
          <a className="atelier-sky-link" href="#sky-gallery">Explore the skies <span aria-hidden="true">↘</span></a>
        </div>

        <section className="ow-dashboard grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div className="max-w-2xl">
            <div className="ow-kicker mb-6 inline-flex items-center gap-2"><Sparkles size={14} /> THE DAILY WARDROBE EDIT</div>
            <h1 className="ow-display ow-hero-title">{forHer ? "Her forecast." : "A forecast."}<br /><em>A whole look.</em><span className="atelier-hero-star" aria-hidden="true">✳</span></h1>
            <p className="ow-intro mt-6 max-w-lg">A little weather wisdom. A look that feels like you. Pick your city, choose your plans, and leave the outfit to us.</p>
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
              <OutfitStudio weather={sceneWeather} base={recommendation} forHer={forHer} demo={Boolean(preview)} unit={unit} onUnitChange={setUnit} isRefreshing={loading} onRefresh={!preview && currentQuery ? () => void fetchWeather(currentQuery) : undefined} />
            ) : (
              <div className="atelier-empty">
                <span className="atelier-label">YOUR OUTFIT STARTS HERE</span>
                <div className="atelier-empty-art" aria-hidden="true"><span>✦</span><WardrobeArt look={buildStyledLook(buildDemoWeather("clear-day"), forHer, "casual", forHer ? "dress" : "trousers")} /><i>01 / THE DAILY EDIT</i></div>
                <h2 className="ow-display">{forHer ? "Made for her kind of day." : "Good weather. Better layers."}</h2>
                <p>Find your forecast to build a complete look. Or take the wardrobe for a spin with sample weather.</p>
                <button type="button" onClick={() => choosePreview("clear-day")} className="atelier-save">Try a sunny-day look <span aria-hidden="true">↗</span></button>
              </div>
            )}
          </div>
        </section>

        {sceneWeather && recommendation && <details className="atelier-weather-details"><summary>Behind the look <span>{sceneWeather.location.name} · {sceneWeather.current.condition.text}</span><b aria-hidden="true">+</b></summary><WeatherDisplay weather={sceneWeather} outfit={recommendation} demo={Boolean(preview)} unit={unit} onUnitChange={setUnit} isRefreshing={loading} onRefresh={!preview && currentQuery ? () => void fetchWeather(currentQuery) : undefined} /></details>}
        {sceneWeather && <div className="mt-12"><ForecastStrip weather={sceneWeather} unit={unit} /></div>}

        <section id="sky-gallery" className="ow-gallery ow-scene-section mt-14" aria-label="Weather scene previews">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div><div className="ow-eyebrow mb-2">INTERACTIVE SKY GALLERY</div><h2 className="ow-display text-2xl sm:text-3xl">Try a different forecast</h2></div>
            {preview && weatherData && <button type="button" className="ow-return" onClick={() => setPreview(null)}>↩ Back to live weather</button>}
          </div>
          <div className="ow-scene-grid">
            {DEMO_SCENE_KEYS.map((key) => {
              const active = preview === key
              const Icon = SCENE_ICONS[key]
              return <button key={key} type="button" onClick={() => choosePreview(key)} aria-pressed={active} className={`ow-scene-chip ${active ? "is-active" : ""}`}>
                <span aria-hidden="true" className="ow-scene-emoji"><Icon size={23} strokeWidth={1.5} /></span>
                <span className="ow-scene-copy"><strong>{getWeatherScene(buildDemoWeather(key)).label}</strong><small>{SCENE_CUE[key]}</small></span>
                <span aria-hidden="true" className="ow-scene-arrow">↗</span>
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
