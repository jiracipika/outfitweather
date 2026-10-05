import type { SceneKey } from "@/lib/weather-scene"

/** A little illustrated sky for the pastel lookbook. */
export default function HerSky({ scene, className = "" }: { scene: SceneKey; className?: string }) {
  const night = scene === "clear-night"
  const cloudy = !["clear-day", "clear-night", "heat"].includes(scene)
  const wet = scene === "rain" || scene === "thunder"
  return <svg className={`her-sky ${className}`} viewBox="0 0 180 120" aria-hidden="true">
    <circle cx="132" cy="45" r="31" fill={night ? "#c3acd8" : "#f5dda8"} className="her-sky-sun" />
    {night ? <circle cx="146" cy="34" r="25" fill="#f6eef7" /> : <g stroke="#92243e" strokeWidth="1.5" strokeLinecap="round"><path d="M132 4V9M132 81V87M91 45H96M168 45H174M103 16 107 20M157 70 161 74M103 74 107 70M157 20 161 16" /></g>}
    <g className="her-sky-cloud"><path d="M25 71C12 71 10 52 25 49C22 29 50 22 59 40C74 28 94 38 93 54C112 54 113 76 94 76H31" fill={cloudy ? "#d9c7ee" : "#fce8ee"} stroke="#92243e" strokeWidth="1.3" /><path d="M37 57C40 47 48 47 52 51" fill="none" stroke="#92243e" opacity=".3" /></g>
    {wet && <g className="her-sky-rain" fill="#92243e"><path d="M33 88 30 100Q36 105 38 99Z" /><path d="M57 89 54 101Q60 106 62 100Z" /><path d="M81 88 78 100Q84 105 86 99Z" /></g>}
    {scene === "thunder" && <path d="M69 79 56 94H64L58 109 78 90H68Z" fill="#92243e" />}
    {scene === "snow" && <g className="her-sky-snow" stroke="#92243e" strokeWidth="1.5"><path d="M40 86V104M31 95H49M34 89 46 101M34 101 46 89M77 86V98M71 92H83" /></g>}
    {(scene === "fog" || scene === "wind") && <g stroke="#92243e" strokeWidth="1.5" strokeLinecap="round" className="her-sky-cloud"><path d="M26 90H111M38 99H126M71 107H110" /></g>}
    <g fill="#92243e" opacity=".5"><circle cx="19" cy="21" r="2" /><circle cx="156" cy="96" r="2" /><path d="M116 93V101M112 97H120" stroke="#92243e" strokeWidth="1" /></g>
  </svg>
}

export function HerFlower({ className = "" }: { className?: string }) {
  return <svg className={`her-flower ${className}`} viewBox="0 0 100 100" fill="none" aria-hidden="true"><circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth=".8" /><g fill="var(--her-pink)" stroke="currentColor" strokeWidth="1.2">{[0, 90, 180, 270].map(angle => <path key={angle} d="M50 50C30 36 25 16 50 7C75 16 70 36 50 50Z" transform={`rotate(${angle} 50 50)`} />)}</g><path d="m50 35 15 15-15 15-15-15Z" fill="currentColor" /><circle cx="50" cy="50" r="5" fill="var(--her-butter)" /></svg>
}
