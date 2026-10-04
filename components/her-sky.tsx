import type { SceneKey } from "@/lib/weather-scene"

/** A little illustrated sky for the pastel lookbook. */
export default function HerSky({ scene, className = "" }: { scene: SceneKey; className?: string }) {
  const night = scene === "clear-night"
  const cloudy = !["clear-day", "clear-night", "heat"].includes(scene)
  const wet = scene === "rain" || scene === "thunder"
  return <svg className={`her-sky ${className}`} viewBox="0 0 180 120" aria-hidden="true">
    <circle cx="132" cy="45" r="31" fill={night ? "#d9cde9" : "#f6d89a"} className="her-sky-sun" />
    {night ? <circle cx="146" cy="34" r="25" fill="#f6eef7" /> : <g stroke="#c74051" strokeWidth="1.5" strokeLinecap="round"><path d="M132 4V9M132 81V87M91 45H96M168 45H174M103 16 107 20M157 70 161 74M103 74 107 70M157 20 161 16" /></g>}
    <g className="her-sky-cloud"><path d="M25 71C12 71 10 52 25 49C22 29 50 22 59 40C74 28 94 38 93 54C112 54 113 76 94 76H31" fill={cloudy ? "#eaddec" : "#fff9f2"} stroke="#c74051" strokeWidth="1.3" /><path d="M37 57C40 47 48 47 52 51" fill="none" stroke="#c74051" opacity=".3" /></g>
    {wet && <g className="her-sky-rain" fill="#c74051"><path d="M33 88 30 100Q36 105 38 99Z" /><path d="M57 89 54 101Q60 106 62 100Z" /><path d="M81 88 78 100Q84 105 86 99Z" /></g>}
    {scene === "thunder" && <path d="M69 79 56 94H64L58 109 78 90H68Z" fill="#c74051" />}
    {scene === "snow" && <g className="her-sky-snow" stroke="#c74051" strokeWidth="1.5"><path d="M40 86V104M31 95H49M34 89 46 101M34 101 46 89M77 86V98M71 92H83" /></g>}
    {(scene === "fog" || scene === "wind") && <g stroke="#c74051" strokeWidth="1.5" strokeLinecap="round" className="her-sky-cloud"><path d="M26 90H111M38 99H126M71 107H110" /></g>}
    <g fill="#c74051" opacity=".5"><circle cx="19" cy="21" r="2" /><circle cx="156" cy="96" r="2" /><path d="M116 93V101M112 97H120" stroke="#c74051" strokeWidth="1" /></g>
  </svg>
}

export function HerFlower({ className = "" }: { className?: string }) {
  return <svg className={`her-flower ${className}`} viewBox="0 0 100 100" aria-hidden="true"><g fill="currentColor">{[0, 60, 120, 180, 240, 300].map(angle => <ellipse key={angle} cx="50" cy="28" rx="14" ry="23" transform={`rotate(${angle} 50 50)`} />)}</g><circle cx="50" cy="50" r="13" fill="#fff3cf" /></svg>
}
