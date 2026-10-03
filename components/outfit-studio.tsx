"use client"

import { memo, useEffect, useMemo, useState } from "react"
import { Heart, RefreshCw, Shirt, Footprints, Glasses, Briefcase, Coffee, Moon, ArrowUpRight } from "lucide-react"
import type { WeatherData, OutfitRecommendation } from "@/lib/types"
import { buildStyledLook, type Occasion, type Silhouette, type OutfitPiece } from "@/lib/outfit-styling"
import { saveOutfitToLocalStorage } from "@/lib/local-storage-utils"

const occasions = [{ key: "casual", label: "Everyday", icon: Coffee }, { key: "work", label: "Work", icon: Briefcase }, { key: "evening", label: "Evening", icon: Moon }] as const
const PREF_KEY = "ow:style-preferences"

function OutfitStudio({ weather, base, forHer, demo }: { weather: WeatherData; base: OutfitRecommendation; forHer: boolean; demo: boolean }) {
  const [occasion, setOccasion] = useState<Occasion>("casual")
  const [silhouette, setSilhouette] = useState<Silhouette>("trousers")
  const [variation, setVariation] = useState(0)
  const [message, setMessage] = useState("")
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PREF_KEY) ?? "{}")
      if (["casual", "work", "evening"].includes(saved.occasion)) setOccasion(saved.occasion)
      if (["auto", "trousers", "dress"].includes(saved.silhouette)) setSilhouette(saved.silhouette)
    } catch { /* Storage is optional. */ }
  }, [])
  useEffect(() => { setMessage("") }, [forHer, occasion, silhouette, variation, weather])
  const look = useMemo(() => buildStyledLook(weather, forHer, occasion, silhouette, variation), [weather, forHer, occasion, silhouette, variation])
  const remember = (nextOccasion: Occasion, nextSilhouette: Silhouette) => {
    setOccasion(nextOccasion); setSilhouette(nextSilhouette)
    try { localStorage.setItem(PREF_KEY, JSON.stringify({ occasion: nextOccasion, silhouette: nextSilhouette })) } catch { /* Keep choices in this session. */ }
  }
  const save = () => {
    const result = saveOutfitToLocalStorage({
      ...base, id: crypto.randomUUID(), emoji: forHer ? "✨" : "👕",
      conditionSummary: look.title,
      description: look.pieces.map(piece => piece.label).join(" · ") + ". " + look.note + " Weather advice: " + base.description,
    })
    setMessage(result === "saved" ? "Your look is saved in Favorites." : result === "duplicate" ? "This look is already in Favorites." : "Couldn’t save this look. Browser storage may be unavailable.")
  }
  return <article className="atelier" aria-label="Build your weather-ready outfit">
    <header className="atelier-heading"><div><span className="atelier-label">{demo ? "SAMPLE WEATHER · STYLE PREVIEW" : "YOUR WEATHER · YOUR WARDROBE"}</span><h2 className="ow-display">{forHer ? "Her outfit, sorted." : "Your outfit, sorted."}</h2></div><span className="atelier-edition">01 / DAILY EDIT</span></header>
    <div className="atelier-occasions" role="group" aria-label="Choose an occasion">{occasions.map(({ key, label, icon: Icon }) => <button type="button" key={key} aria-pressed={occasion === key} onClick={() => remember(key, silhouette)} className={occasion === key ? "selected" : ""}><Icon size={15} />{label}</button>)}</div>
    {forHer && <div className="atelier-preference"><span>I’d like to wear</span><div role="group" aria-label="Clothing preference">{(["trousers", "dress"] as const).map(choice => <button type="button" key={choice} aria-pressed={silhouette === choice} onClick={() => remember(occasion, choice)} className={silhouette === choice ? "selected" : ""}>{choice === "dress" ? "A dress" : "Trousers"}</button>)}</div></div>}
    <div className="atelier-board" key={forHer + "-" + occasion + "-" + silhouette + "-" + variation}>
      <div className="atelier-art" aria-hidden="true"><span className="atelier-art-tag">THE LOOK</span><WardrobeArt dress={look.pieces.some(piece => piece.kind === "dress")} colors={look.palette} /><div className="atelier-swatches">{look.palette.map(color => <i key={color} style={{ background: color }} />)}</div><span className="atelier-art-caption">A little colour inspiration</span></div>
      <div className="atelier-pieces">{look.pieces.map((piece, index) => <div className="atelier-piece" key={piece.kind} style={{ animationDelay: index * 65 + "ms" }}><span className="atelier-piece-icon"><PieceIcon piece={piece} /></span><span><small>{piece.kind === "dress" ? "ONE PIECE" : piece.kind.toUpperCase()}</small><strong>{piece.label}</strong></span></div>)}</div>
    </div>
    <div className="atelier-caption"><h3 className="ow-display">{look.title}</h3><p>{look.note}</p><p className="atelier-weather-rule">{base.description}</p></div>
    <footer className="atelier-actions"><button type="button" className="atelier-shuffle" onClick={() => setVariation(value => (value + 1) % 3)}><RefreshCw size={15} />Try another look</button><button type="button" className="atelier-save" onClick={save}><Heart size={15} />Save this look<ArrowUpRight size={14} /></button></footer>
    <p role="status" className="atelier-status">{message}</p>
  </article>
}

function PieceIcon({ piece }: { piece: OutfitPiece }) {
  return piece.kind === "shoes" ? <Footprints size={18} /> : piece.kind === "accessory" ? <Glasses size={18} /> : <Shirt size={18} />
}

function WardrobeArt({ dress, colors }: { dress: boolean; colors: string[] }) {
  return <svg viewBox="0 0 240 290" className="atelier-garments">
    <ellipse cx="120" cy="268" rx="77" ry="10" fill="#23312b" opacity=".07" />
    <g className="atelier-garment-top" stroke="#384841" strokeWidth="1.5" strokeLinejoin="round">
      {dress ? <><path d="M97 36 Q120 51 143 36 L163 64 147 108 183 235 Q120 253 57 235 L93 108 77 64Z" fill={colors[0]} /><path d="M99 109H141M120 120V232" fill="none" opacity=".35" /></> : <><path d="M88 38 102 32 Q120 49 138 32 L152 38 188 76 163 96 146 77 146 149H94V77L77 96 52 76Z" fill={colors[0]} /><path d="M105 35 Q120 61 135 35M101 136H139" fill="none" opacity=".4" /><path d="M96 163H144L157 244 128 247 120 198 112 247 83 244Z" fill={colors[2]} /><path d="M120 166V195" opacity=".4" /></>}
    </g>
    <g className="atelier-garment-layer" stroke="#384841" strokeWidth="1.4"><path d="M51 104 64 116 71 162 58 166 54 138 49 188H16L13 138 8 166 -5 162 2 116 15 104 30 115Z" fill={colors[1]} transform="translate(23 22) rotate(-9 40 140)" /><path d="M51 107 38 137 30 115 26 188" fill="none" transform="translate(23 22) rotate(-9 40 140)" opacity=".4" /></g>
    <g className="atelier-garment-shoes" fill="#f5f0e7" stroke="#384841" strokeWidth="1.4"><path d="M151 250H175L192 260V271H148Z" /><path d="M180 239H201L218 249V260H177Z" /><path d="M156 258H171M185 247H198" /></g>
  </svg>
}

export default memo(OutfitStudio)
