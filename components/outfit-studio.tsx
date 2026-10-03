"use client"

import { memo, useEffect, useMemo, useState } from "react"
import { Heart, RefreshCw, Shirt, Footprints, Glasses, Briefcase, Coffee, Moon, ArrowUpRight, MapPin, Wind, Thermometer } from "lucide-react"
import type { WeatherData, OutfitRecommendation } from "@/lib/types"
import { buildStyledLook, LOOK_PALETTES, type Occasion, type Silhouette, type Comfort, type Palette, type OutfitPiece } from "@/lib/outfit-styling"
import { saveOutfitToLocalStorage } from "@/lib/local-storage-utils"
import WardrobeArt from "./wardrobe-art"

const occasions = [{ key: "casual", label: "Everyday", icon: Coffee }, { key: "work", label: "Work", icon: Briefcase }, { key: "evening", label: "Evening", icon: Moon }] as const
const PREF_KEY = "ow:style-preferences"
type Preferences = { occasion: Occasion; silhouette: Silhouette; comfort: Comfort; palette: Palette }
const defaults: Preferences = { occasion: "casual", silhouette: "auto", comfort: "forecast", palette: "earth" }
function readPreferences(forHer: boolean): Preferences {
  try {
    const stored = JSON.parse(localStorage.getItem(PREF_KEY) ?? "{}")
    // Preserve the original preference format while giving each wardrobe its own choices.
    const saved = stored[forHer ? "her" : "everyday"] ?? stored
    return {
      occasion: ["casual", "work", "evening"].includes(saved.occasion) ? saved.occasion : defaults.occasion,
      silhouette: ["auto", "trousers", "dress"].includes(saved.silhouette) ? saved.silhouette : defaults.silhouette,
      comfort: ["cold", "forecast", "warm"].includes(saved.comfort) ? saved.comfort : defaults.comfort,
      palette: Object.hasOwn(LOOK_PALETTES, saved.palette ?? "") ? saved.palette : defaults.palette,
    }
  } catch { return defaults }
}

function OutfitStudio({ weather, base, forHer, demo, unit, onUnitChange, isRefreshing, onRefresh }: { weather: WeatherData; base: OutfitRecommendation; forHer: boolean; demo: boolean; unit: "C" | "F"; onUnitChange: (unit: "C" | "F") => void; isRefreshing: boolean; onRefresh?: () => void }) {
  const [preferences, setPreferences] = useState(defaults)
  const { occasion, silhouette, comfort, palette } = preferences
  const [variation, setVariation] = useState(0)
  const [active, setActive] = useState<OutfitPiece["kind"] | null>(null)
  const [message, setMessage] = useState("")
  useEffect(() => { setPreferences(readPreferences(forHer)); setVariation(0); setActive(null) }, [forHer])
  useEffect(() => { setMessage(""); setActive(null) }, [forHer, preferences, variation, weather])
  const look = useMemo(() => buildStyledLook(weather, forHer, occasion, silhouette, variation, { comfort, palette }), [weather, forHer, occasion, silhouette, variation, comfort, palette])
  const remember = (change: Partial<Preferences>) => {
    const next = { ...preferences, ...change }
    setPreferences(next)
    try {
      const stored = JSON.parse(localStorage.getItem(PREF_KEY) ?? "{}")
      localStorage.setItem(PREF_KEY, JSON.stringify({ ...stored, [forHer ? "her" : "everyday"]: next }))
    } catch { /* Keep choices in this session. */ }
  }
  const save = () => {
    const result = saveOutfitToLocalStorage({
      ...base, id: crypto.randomUUID(), emoji: forHer ? "✨" : "👕", styledLook: look, forHer,
      conditionSummary: look.title,
      description: look.pieces.map(piece => piece.label).join(" · ") + ". " + look.note + " Palette: " + LOOK_PALETTES[palette].name + ". Weather advice: " + base.description,
    })
    setMessage(result === "saved" ? "Your look is saved in Favorites." : result === "duplicate" ? "This look is already in Favorites." : "Couldn’t save this look. Browser storage may be unavailable.")
  }
  const showTemp = (c: number) => Math.round(unit === "C" ? c : c * 9 / 5 + 32)
  return <article className="atelier" aria-label="Build your weather-ready outfit" aria-busy={isRefreshing}>
    <div className="atelier-weather-brief"><div><span className="atelier-label">{demo ? "SAMPLE FORECAST" : "LIVE FORECAST"}</span><span className="atelier-city"><MapPin size={12} />{weather.location.name}</span></div><div className="atelier-temperature"><strong>{showTemp(weather.current.temp_c)}°</strong><button type="button" onClick={() => onUnitChange(unit === "C" ? "F" : "C")} aria-label={`Switch to ${unit === "C" ? "Fahrenheit" : "Celsius"}`}>°{unit}</button>{onRefresh && <button type="button" disabled={isRefreshing} onClick={onRefresh} aria-label="Refresh weather"><RefreshCw size={15} className={isRefreshing ? "animate-spin" : ""} /></button>}</div></div>
    <header className="atelier-heading"><div><span className="atelier-label">THE WEATHER-READY WARDROBE</span><h2 className="ow-display">{forHer ? "Her outfit, sorted." : "Your outfit, sorted."}</h2></div><span className="atelier-edition">01 / DAILY EDIT</span></header>
    <div className="atelier-conditions"><span><Thermometer size={12} />Feels {showTemp(weather.current.feelslike_c ?? weather.current.temp_c)}°{unit}</span><span><Wind size={12} />{Math.round(weather.current.wind_kph)} km/h</span><span>{weather.current.condition.text}</span></div>
    <div className="atelier-occasions" role="group" aria-label="Choose an occasion">{occasions.map(({ key, label, icon: Icon }) => <button type="button" key={key} aria-pressed={occasion === key} onClick={() => remember({ occasion: key })} className={occasion === key ? "selected" : ""}><Icon size={15} />{label}</button>)}</div>
    {forHer && <div className="atelier-preference"><span>I’d like to wear</span><div role="group" aria-label="Clothing preference">{(["auto", "trousers", "dress"] as const).map(choice => <button type="button" key={choice} aria-pressed={silhouette === choice} onClick={() => remember({ silhouette: choice })} className={silhouette === choice ? "selected" : ""}>{choice === "dress" ? "A dress" : choice === "auto" ? "Surprise me" : "Trousers"}</button>)}</div></div>}
    <div className="atelier-board" key={forHer + "-" + occasion + "-" + silhouette + "-" + variation + "-" + comfort}>
      <div className="atelier-art"><span className="atelier-art-tag">THE LOOK <i>NO. {String(variation + 1).padStart(2, "0")}</i></span><WardrobeArt look={look} active={active} /><div className="atelier-swatches" role="group" aria-label="Choose a colour palette">{(Object.keys(LOOK_PALETTES) as Palette[]).map(key => <button type="button" key={key} aria-label={LOOK_PALETTES[key].name} aria-pressed={palette === key} onClick={() => remember({ palette: key })} style={{ background: `linear-gradient(120deg, ${LOOK_PALETTES[key].colors[0]} 33%, ${LOOK_PALETTES[key].colors[1]} 33% 66%, ${LOOK_PALETTES[key].colors[2]} 66%)` }} />)}</div><span className="atelier-art-caption">{LOOK_PALETTES[palette].name} · Pick your palette</span></div>
      <div className="atelier-pieces" onMouseLeave={() => setActive(null)}>{look.pieces.map((piece, index) => <button type="button" className={`atelier-piece ${active === piece.kind ? "is-highlighted" : ""}`} key={piece.kind} onMouseEnter={() => setActive(piece.kind)} onFocus={() => setActive(piece.kind)} onBlur={() => setActive(null)} onClick={() => setActive(value => value === piece.kind ? null : piece.kind)} aria-pressed={active === piece.kind} style={{ animationDelay: index * 65 + "ms" }}><span className="atelier-piece-icon"><PieceIcon piece={piece} /></span><span><small>{piece.kind === "dress" ? "ONE PIECE" : piece.kind.toUpperCase()}</small><strong>{piece.label}</strong></span><span className="atelier-piece-number" aria-hidden="true">0{index + 1}</span></button>)}</div>
    </div>
    <div className="atelier-comfort"><label htmlFor="comfort">Make it feel like you</label><select id="comfort" value={comfort} onChange={e => remember({ comfort: e.target.value as Comfort })}><option value="cold">I run cold · Extra warmth</option><option value="forecast">Dress for the forecast</option><option value="warm">I run warm · Lighter fabrics</option></select></div>
    <div className="atelier-caption"><h3 className="ow-display">{look.title}</h3><p>{look.note}</p>{comfort !== "forecast" && <p className="atelier-comfort-note">{comfort === "cold" ? "A little extra warmth, just for you." : "Lighter fabrics, with weather protection kept in."}</p>}<details className="atelier-advice"><summary>Why these layers?</summary><p>{base.description}</p></details></div>
    <footer className="atelier-actions"><button type="button" className="atelier-shuffle" onClick={() => setVariation(value => (value + 1) % 6)}><RefreshCw size={15} />Try another look</button><button type="button" className="atelier-save" onClick={save}><Heart size={15} />Save this look<ArrowUpRight size={14} /></button></footer>
    <p role="status" className="atelier-status">{message}</p>
  </article>
}

function PieceIcon({ piece }: { piece: OutfitPiece }) {
  return piece.kind === "shoes" ? <Footprints size={18} /> : piece.kind === "accessory" ? <Glasses size={18} /> : <Shirt size={18} />
}

export default memo(OutfitStudio)
