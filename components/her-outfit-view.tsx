"use client"

import { Heart, RefreshCw, Coffee, Briefcase, Moon, Shirt, Footprints, Glasses, MapPin, Wind, Thermometer, ArrowUpRight } from "lucide-react"
import type { WeatherData, OutfitRecommendation } from "@/lib/types"
import { LOOK_PALETTES, type StyledLook, type StylePreferences, type Palette, type OutfitPiece, type Comfort } from "@/lib/outfit-styling"
import WardrobeArt from "./wardrobe-art"
import { HerFlower } from "./her-sky"

interface HerOutfitProps {
  weather: WeatherData
  base: OutfitRecommendation
  demo: boolean
  unit: "C" | "F"
  onUnitChange: (unit: "C" | "F") => void
  isRefreshing: boolean
  onRefresh?: () => void
  look: StyledLook
  preferences: StylePreferences
  variation: number
  active: OutfitPiece["kind"] | null
  onHighlight: (kind: OutfitPiece["kind"] | null) => void
  onPreferenceChange: (change: Partial<StylePreferences>) => void
  onShuffle: () => void
  onSave: () => void
  message: string
}
const occasions = [{ key: "casual", label: "Everyday", icon: Coffee }, { key: "work", label: "Work", icon: Briefcase }, { key: "evening", label: "Evening", icon: Moon }] as const

export default function HerOutfitView({ weather, base, demo, unit, onUnitChange, isRefreshing, onRefresh, look, preferences, variation, active, onHighlight, onPreferenceChange, onShuffle, onSave, message }: HerOutfitProps) {
  const temp = (c: number) => Math.round(unit === "C" ? c : c * 9 / 5 + 32)
  return <article className="her-studio" aria-label="Build your weather-ready outfit" aria-busy={isRefreshing}>
    <header className="her-studio-heading"><div><span className="her-eyebrow">01 / THE OUTFIT EDIT</span><h2>Her outfit, sorted.</h2></div><div className="her-forecast-ticket atelier-weather-brief"><div><span className="her-eyebrow">{demo ? "SAMPLE FORECAST" : "LIVE FORECAST"}</span><span className="atelier-city"><MapPin size={12} />{weather.location.name}</span></div><div className="atelier-temperature"><strong>{temp(weather.current.temp_c)}°</strong><button type="button" onClick={() => onUnitChange(unit === "C" ? "F" : "C")} aria-label={`Switch to ${unit === "C" ? "Fahrenheit" : "Celsius"}`}>°{unit}</button>{onRefresh && <button type="button" disabled={isRefreshing} onClick={onRefresh} aria-label="Refresh weather"><RefreshCw size={15} className={isRefreshing ? "animate-spin" : ""} /></button>}</div></div></header>
    <div className="her-look-board">
      <div className="her-look-canvas">
        <div className="her-canvas-meta"><span>THE LITTLE LOOKBOOK</span><span>LOOK {String(variation + 1).padStart(2, "0")}</span></div>
        <span className="her-look-stamp"><Heart size={17} />made<br />for you</span>
        <div className="her-garment-frame" key={`${preferences.occasion}-${preferences.silhouette}-${variation}-${preferences.comfort}`}><WardrobeArt look={look} active={active} /></div>
        <HerFlower className="her-canvas-flower" />
        <div className="her-palette" role="group" aria-label="Choose a colour palette">{(Object.keys(LOOK_PALETTES) as Palette[]).map(key => <button type="button" key={key} aria-label={LOOK_PALETTES[key].name} aria-pressed={preferences.palette === key} onClick={() => onPreferenceChange({ palette: key })} style={{ background: `linear-gradient(120deg, ${LOOK_PALETTES[key].colors[0]} 33%, ${LOOK_PALETTES[key].colors[1]} 33% 66%, ${LOOK_PALETTES[key].colors[2]} 66%)` }} />)}</div>
        <p className="her-palette-label">{LOOK_PALETTES[preferences.palette].name}<span>Pick a palette that feels like you.</span></p>
        <div className="her-weather-ribbon"><span><Thermometer size={13} />Feels {temp(weather.current.feelslike_c ?? weather.current.temp_c)}°{unit}</span><span><Wind size={13} />{Math.round(weather.current.wind_kph)} km/h</span><span>{weather.current.condition.text}</span></div>
      </div>
      <div className="her-look-options">
        <div className="her-choice-section"><span className="her-control-label">What’s the plan?</span><div className="her-occasion-picker" role="group" aria-label="Choose an occasion">{occasions.map(({ key, label, icon: Icon }) => <button type="button" key={key} aria-pressed={preferences.occasion === key} onClick={() => onPreferenceChange({ occasion: key })}><Icon size={16} />{label}</button>)}</div></div>
        <div className="her-choice-section"><span className="her-control-label">I’d like to wear</span><div className="her-silhouette-picker" role="group" aria-label="Clothing preference">{(["auto", "trousers", "dress"] as const).map(choice => <button type="button" key={choice} aria-pressed={preferences.silhouette === choice} onClick={() => onPreferenceChange({ silhouette: choice })}>{choice === "dress" ? "A dress" : choice === "auto" ? "Surprise me" : "Trousers"}</button>)}</div></div>
        <div className="her-piece-heading"><span className="her-control-label">The pieces</span><span>Tap a piece to take a closer look</span></div>
        <div className="her-piece-list atelier-pieces" onMouseLeave={() => onHighlight(null)}>{look.pieces.map((piece, index) => {
          const Icon = piece.kind === "shoes" ? Footprints : piece.kind === "accessory" ? Glasses : Shirt
          return <button type="button" className="her-piece" key={piece.kind} aria-pressed={active === piece.kind} onMouseEnter={() => onHighlight(piece.kind)} onFocus={() => onHighlight(piece.kind)} onBlur={() => onHighlight(null)} onClick={() => onHighlight(active === piece.kind ? null : piece.kind)}><span className="her-piece-index">0{index + 1}</span><span className="her-piece-icon"><Icon size={18} /></span><span><small>{piece.kind === "dress" ? "ONE PIECE" : piece.kind.toUpperCase()}</small><strong>{piece.label}</strong></span><ArrowUpRight size={15} className="her-piece-arrow" /></button>
        })}</div>
        <div className="her-comfort"><label htmlFor="comfort">Make it feel like you</label><select id="comfort" value={preferences.comfort} onChange={event => onPreferenceChange({ comfort: event.target.value as Comfort })}><option value="cold">I run cold · Extra warmth</option><option value="forecast">Dress for the forecast</option><option value="warm">I run warm · Lighter fabrics</option></select></div>
        <div className="her-look-note"><h3>{look.title}</h3><p>{look.note}</p>{preferences.comfort !== "forecast" && <p className="her-personal-note">{preferences.comfort === "cold" ? "A little extra warmth, just for you." : "Lighter fabrics, with weather protection kept in."}</p>}<details><summary>Why these layers?</summary><p>{base.description}</p></details></div>
        <footer className="her-look-actions"><button type="button" className="her-button her-button-secondary" onClick={onShuffle}><RefreshCw size={16} />Try another look</button><button type="button" className="her-button" onClick={onSave}><Heart size={16} />Save this look</button></footer>
        <p role="status" className="her-save-status">{message}</p>
      </div>
    </div>
  </article>
}
