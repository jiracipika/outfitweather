"use client"

import { ArrowDown, ArrowUpRight, CloudOff, Heart, LocateFixed, Droplets, Wind, Thermometer } from "lucide-react"
import type { WeatherData, OutfitRecommendation } from "@/lib/types"
import { DEMO_SCENE_KEYS, buildDemoWeather, getWeatherScene, type SceneKey } from "@/lib/weather-scene"
import { buildStyledLook } from "@/lib/outfit-styling"
import SearchBar from "./search-bar"
import OutfitStudio from "./outfit-studio"
import ForecastStrip from "./forecast-strip"
import WardrobeArt from "./wardrobe-art"
import HerSky, { HerFlower } from "./her-sky"
import { HerBow, HerDivider, HerRose, HerTracery } from "./her-ornaments"

interface HerDashboardProps {
  weather: WeatherData | null
  recommendation: OutfitRecommendation | null
  preview: SceneKey | null
  hasLiveWeather: boolean
  loading: boolean
  error: string | null
  lastCity: string | null
  unit: "C" | "F"
  onUnitChange: (unit: "C" | "F") => void
  onSearch: (city: string) => void
  onLocation: () => void
  onPreview: (scene: SceneKey) => void
  onReturnToLive: () => void
  onRefresh?: () => void
}

export default function HerDashboard({ weather, recommendation, preview, hasLiveWeather, loading, error, lastCity, unit, onUnitChange, onSearch, onLocation, onPreview, onReturnToLive, onRefresh }: HerDashboardProps) {
  const scene = getWeatherScene(weather)
  return <div className="her-page">
    <section className="her-hero" aria-labelledby="her-title">
      <div className="her-hero-window" aria-hidden="true"><HerTracery /><HerRose /><span>THE SKY IS<br />ONLY THE BEGINNING</span></div>
      <div className="her-hero-note"><HerSky scene={weather ? scene.key : "clear-day"} /><span>{weather ? scene.label : "A little weather wisdom"}</span><i aria-hidden="true">✧</i></div>
      <HerFlower className="her-hero-flower" />
      <HerBow className="her-hero-bow" />
      <div className="her-hero-content"><span className="her-kicker"><Heart size={13} /> HER FORECAST / HER WARDROBE</span><h1 id="her-title">Her daily <span>ritual.</span></h1><p className="her-hero-poem">A little forecast. A lovely outfit.</p><HerDivider /><p>Soft colours, scarlet details, a look that feels like you.<br className="her-desktop-break" /> Find your weather. Make the day your own.</p>
        <div className="her-search-row"><SearchBar onSearch={onSearch} isLoading={loading} /><button type="button" disabled={loading} onClick={onLocation} className="her-location" aria-label="Use my location"><LocateFixed size={18} /><span>Use my location</span></button></div>
        {error && <div role="alert" className="her-error"><CloudOff size={17} />{error}</div>}
        {lastCity && !hasLiveWeather && <button className="her-last-city" type="button" disabled={loading} onClick={() => onSearch(lastCity)}>Back to {lastCity}<ArrowUpRight size={14} /></button>}
        <a className="her-hero-link" href="#her-wardrobe">Let’s put a look together <ArrowDown size={15} /></a>
      </div>
      <span className="her-hero-side-label" aria-hidden="true">PASTEL SKIES / A SCARLET HEART</span>
    </section>
    <div className="her-scarlet-ribbon" aria-hidden="true"><span>✧</span>SOFT SKIES<span>✧</span>SCARLET DETAILS<span>✧</span>YOUR DAILY RITUAL<span>✧</span></div>
    <div className="her-shell">
      <section id="her-wardrobe" className="her-wardrobe-section" aria-label="Her outfit lookbook">
        {loading && !weather ? <div className="her-loading" role="status"><HerFlower /><h2>Finding your forecast…</h2><p>Your next outfit is on its way.</p></div> : weather && recommendation ? <OutfitStudio weather={weather} base={recommendation} forHer demo={Boolean(preview)} unit={unit} onUnitChange={onUnitChange} isRefreshing={loading} onRefresh={onRefresh} /> : <HerEmptyLookbook onPreview={() => onPreview("clear-day")} />}
      </section>
      {weather && recommendation && <details className="her-weather-details"><summary><span><span className="her-eyebrow">THE WEATHER NOTES</span><strong>Behind the look</strong></span><span>{weather.location.name}<b aria-hidden="true">+</b></span></summary><div className="her-weather-content"><dl className="her-weather-stats"><div><Thermometer size={19} /><dt>Temperature</dt><dd>{Math.round(unit === "C" ? weather.current.temp_c : weather.current.temp_c * 9 / 5 + 32)}°{unit}</dd></div><div><Wind size={19} /><dt>Wind</dt><dd>{Math.round(weather.current.wind_kph)} km/h</dd></div><div><Droplets size={19} /><dt>Humidity</dt><dd>{weather.current.humidity}%</dd></div></dl><p>{recommendation.description}</p><small>{preview ? "Sample conditions. Search your city for live weather." : `Current conditions: ${weather.current.condition.text}.`}</small></div></details>}
      {weather && <div className="her-forecast-wrap"><ForecastStrip weather={weather} unit={unit} /></div>}
      <section className="her-skies" aria-label="Weather scene previews"><header><div><span className="her-eyebrow">02 / A CHANGE OF SCENERY</span><h2>A sky for every kind of day.</h2></div>{preview && hasLiveWeather && <button type="button" className="her-text-button" onClick={onReturnToLive}>Back to live weather <ArrowUpRight size={15} /></button>}</header><div className="her-sky-gallery">{DEMO_SCENE_KEYS.map(key => <button type="button" key={key} aria-pressed={preview === key} onClick={() => onPreview(key)} className="her-sky-card"><HerSky scene={key} /><span>{getWeatherScene(buildDemoWeather(key)).label}<ArrowUpRight size={16} /></span></button>)}</div><p>Sample skies, real outfit inspiration. Search a city for your live forecast.</p></section>
      <div className="her-how-it-works"><span><b>01</b>Find your forecast</span><HerFlower /><span><b>02</b>Make the look yours</span><HerFlower /><span><b>03</b>Save your favourite</span></div>
      <footer className="her-footer"><HerDivider /><HerBow /><p>A little weather. A little style. <em>All you.</em></p><span>HER DAILY RITUAL / OUTFITWEATHER</span></footer>
    </div>
  </div>
}

function HerEmptyLookbook({ onPreview }: { onPreview: () => void }) {
  const sample = buildDemoWeather("clear-day")
  return <div className="her-empty-lookbook"><div className="her-empty-copy"><span className="her-eyebrow">01 / YOUR LITTLE LOOKBOOK</span><h2>Your next<br /><em>good outfit.</em></h2><HerDivider /><p>Everyday errands, a day at work, an evening out. Start with your forecast and make the look yours.</p><button type="button" className="her-button" onClick={onPreview}>Try a sunny-day look <ArrowUpRight size={17} /></button><small>Sample weather · a little style preview</small></div><div className="her-lookbook-fan" aria-hidden="true">{(["work", "casual", "evening"] as const).map((occasion, index) => <div className="her-lookbook-card" key={occasion}><span>THE HER EDIT / 0{index + 1}</span><WardrobeArt look={buildStyledLook(sample, true, occasion, index === 1 ? "dress" : "trousers", index, { palette: index === 0 ? "soft" : index === 1 ? "cherry" : "earth" })} /><strong>{index === 0 ? "A polished day" : index === 1 ? "Everyday lovely" : "A little evening"}</strong></div>)}<HerRose className="her-fan-rose" /><HerFlower /></div></div>
}
