/** Decorative rose, ribbon, and pointed-window motifs for her pastel gothic edit. */
export function HerRose({ className = "" }: { className?: string }) {
  return <svg className={`her-rose ${className}`} viewBox="0 0 100 130" fill="none" aria-hidden="true">
    <path d="M50 65C47 83 57 100 49 124M51 96C39 87 28 90 23 82C23 98 38 106 51 101M52 110C64 95 70 101 79 89C80 106 64 118 50 117" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M50 70C37 76 26 66 26 55C14 45 20 31 29 27C30 15 43 10 51 17C64 9 76 18 76 28C89 36 87 51 77 57C76 72 60 77 50 70Z" fill="var(--her-pink)" stroke="currentColor" strokeWidth="1.5" />
    <path d="M50 63C35 67 28 53 32 42C28 28 44 23 52 28C61 20 74 33 70 43C79 56 64 69 50 63Z" fill="var(--her-blush)" stroke="currentColor" strokeWidth="1.3" />
    <path d="M42 48C35 36 54 29 61 39C72 45 57 60 47 55C37 54 42 39 53 41C62 42 57 52 49 48" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M28 28C30 39 37 44 42 48M76 29C69 35 67 39 61 39M27 55C33 53 37 54 47 55M77 57C69 54 63 54 58 52" stroke="currentColor" strokeWidth="1.1" />
  </svg>
}

export function HerBow({ className = "" }: { className?: string }) {
  return <svg className={`her-bow ${className}`} viewBox="0 0 120 90" fill="none" aria-hidden="true">
    <path d="M57 29C39 10 16 7 12 17C8 29 19 48 33 44L57 33M63 29C81 10 104 7 108 17C112 29 101 48 87 44L63 33" fill="var(--her-pink)" stroke="currentColor" strokeWidth="1.5" />
    <path d="M54 34C45 43 43 65 25 78L39 74L45 83C57 64 62 48 59 35M66 34C75 43 77 65 95 78L81 74L75 83C63 64 58 48 61 35" fill="var(--her-blush)" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M15 20C26 22 41 26 56 31M105 20C94 22 79 26 64 31" stroke="currentColor" strokeWidth="1" />
    <rect x="54" y="25" width="12" height="14" rx="4" fill="currentColor" />
  </svg>
}

export function HerTracery({ className = "" }: { className?: string }) {
  return <svg className={`her-tracery ${className}`} viewBox="0 0 480 580" fill="none" aria-hidden="true">
    <path d="M14 566V257C14 151 118 51 240 14C362 51 466 151 466 257V566H14Z" fill="var(--her-lavender)" stroke="currentColor" strokeWidth="1.4" />
    <path d="M26 553V258C26 160 126 62 240 27C354 62 454 160 454 258V553H26Z" stroke="currentColor" strokeWidth=".8" />
    <path d="M240 27V173M26 258C26 168 133 126 240 173C347 126 454 168 454 258M240 173C156 164 132 106 155 72M240 173C324 164 348 106 325 72" stroke="currentColor" strokeWidth="1" />
    <path d="M240 79C226 56 209 69 214 86C192 74 186 98 207 109C187 120 199 143 218 131C218 156 242 156 242 131C261 143 276 120 255 109C276 98 270 74 248 86C253 69 238 56 240 79Z" fill="var(--her-blush)" stroke="currentColor" strokeWidth="1" />
    <path d="M55 538V304C55 251 105 204 139 192M425 538V304C425 251 375 204 341 192" stroke="currentColor" strokeWidth=".7" />
    <path d="M55 468C66 448 75 448 85 468C75 488 66 488 55 468M425 468C414 448 405 448 395 468C405 488 414 488 425 468" stroke="currentColor" strokeWidth="1" />
  </svg>
}

export function HerDivider({ className = "" }: { className?: string }) {
  return <div className={`her-ornament-divider ${className}`} aria-hidden="true"><span /><svg viewBox="0 0 100 40" fill="none"><path d="M50 20C38 3 28 13 33 22C28 31 43 36 50 20C57 36 72 31 67 22C72 13 62 3 50 20Z" stroke="currentColor" strokeWidth="1.3" /><path d="M0 20H31M69 20H100M50 4V36" stroke="currentColor" strokeWidth=".8" /><path d="m50 0 3 4-3 4-3-4Z" fill="currentColor" /></svg><span /></div>
}
