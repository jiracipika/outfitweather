"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { SceneKey } from "@/lib/weather-scene"

interface WeatherSceneryProps {
  scene: SceneKey
  /** Pointer position, -1..1 on both axes, for the multi-axis parallax. */
  parallax: { x: number; y: number }
  /** Number of sheep in the quirk herd. */
  sheepCount: number
  onSheepClick?: () => void
}

/**
 * Full-screen layered weather scenery.
 * Layer order (back → front): sky gradient (page-level) → stars/aurora →
 * celestial bodies → clouds/fog → canvas particles → lightning → sheep.
 * Canvas particles + aurora pause automatically when the tab is hidden.
 */
export default function WeatherScenery({ scene, parallax, sheepCount, onSheepClick }: WeatherSceneryProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [flash, setFlash] = useState(false)
  const reducedMotion = useReducedMotion()

  // Lightning scheduler for the thunder scene.
  useEffect(() => {
    if (scene !== "thunder" || reducedMotion) return
    let timer: ReturnType<typeof setTimeout>
    const schedule = () => {
      timer = setTimeout(() => {
        setFlash(true)
        setTimeout(() => setFlash(false), 140)
        // Occasional double-strike.
        setTimeout(() => {
          setFlash(true)
          setTimeout(() => setFlash(false), 110)
        }, 320)
        schedule()
      }, 2600 + Math.random() * 5200)
    }
    schedule()
    return () => clearTimeout(timer)
  }, [scene, reducedMotion])

  // Canvas particle system.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let raf = 0
    let running = true
    let particles: Particle[] = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)

    const spawn = (): Particle[] => {
      const w = canvas.width
      const h = canvas.height
      switch (scene) {
        case "rain":
          return range(160).map(() => ({
            kind: "rain",
            x: rand(w), y: rand(h),
            vx: 1.4 + Math.random(), vy: 11 + Math.random() * 6,
            len: 13 + Math.random() * 16, alpha: 0.25 + Math.random() * 0.4,
          }))
        case "thunder":
          return range(190).map(() => ({
            kind: "rain",
            x: rand(w), y: rand(h),
            vx: 2.6 + Math.random() * 1.4, vy: 14 + Math.random() * 7,
            len: 16 + Math.random() * 18, alpha: 0.3 + Math.random() * 0.4,
          }))
        case "snow":
          return range(130).map(() => ({
            kind: "snow",
            x: rand(w), y: rand(h),
            vx: (Math.random() - 0.5) * 0.7, vy: 0.7 + Math.random() * 1.4,
            r: 1.2 + Math.random() * 2.6, sway: Math.random() * Math.PI * 2,
            alpha: 0.5 + Math.random() * 0.5,
          }))
        case "wind":
          return range(44).map(() => ({
            kind: "leaf",
            x: rand(w), y: rand(h),
            vx: 4 + Math.random() * 5, vy: (Math.random() - 0.5) * 0.9,
            r: 2 + Math.random() * 2.4, rot: Math.random() * Math.PI * 2,
            hue: 88 + Math.random() * 44,
          }))
        case "heat":
          return range(46).map(() => ({
            kind: "ember",
            x: rand(w), y: canvas.height - rand(canvas.height * 0.4),
            vx: (Math.random() - 0.5) * 0.6, vy: -(0.5 + Math.random() * 1.2),
            r: 1 + Math.random() * 2.2, alpha: 0.25 + Math.random() * 0.5,
          }))
        default:
          return []
      }
    }
    particles = spawn()

    const px = parallax.x
    const py = parallax.y
    let lastP = { x: px, y: py }

    const tick = () => {
      if (!running) return
      // Track the latest parallax without re-creating the effect.
      lastP = parallaxRef.current
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const shiftX = reducedMotion ? 0 : lastP.x * 14
      const shiftY = reducedMotion ? 0 : lastP.y * 8

      for (const p of particles) {
        if (p.kind === "rain") {
          p.x += p.vx! + lastP.x * 1.2 * (reducedMotion ? 0 : 1)
          p.y += p.vy!
          if (p.y > canvas.height + 24) { p.y = -24; p.x = rand(canvas.width) }
          if (p.x > canvas.width + 24) p.x = -24
          ctx.strokeStyle = `rgba(210, 228, 245, ${p.alpha})`
          ctx.lineWidth = 1.4
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(p.x - p.vx! * 2.2, p.y - p.len!)
          ctx.stroke()
        } else if (p.kind === "snow") {
          p.sway! += 0.012
          p.x += p.vx! + Math.sin(p.sway!) * 0.5 + (reducedMotion ? 0 : lastP.x * 0.5)
          p.y += p.vy!
          if (p.y > canvas.height + 6) { p.y = -6; p.x = rand(canvas.width) }
          ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r!, 0, Math.PI * 2)
          ctx.fill()
        } else if (p.kind === "leaf") {
          p.rot! += 0.06
          p.x += p.vx!
          p.y += p.vy! + Math.sin(p.rot!) * 0.7
          if (p.x > canvas.width + 16) { p.x = -16; p.y = rand(canvas.height) }
          ctx.save()
          ctx.translate(p.x, p.y)
          ctx.rotate(p.rot!)
          ctx.fillStyle = `hsla(${p.hue}, 48%, 52%, 0.75)`
          ctx.fillRect(-p.r!, -p.r! * 0.5, p.r! * 2, p.r!)
          ctx.restore()
        } else if (p.kind === "ember") {
          p.y += p.vy!
          p.x += p.vx! + Math.sin(p.y * 0.02) * 0.4
          if (p.y < -10) { p.y = canvas.height + 10; p.x = rand(canvas.width) }
          ctx.fillStyle = `rgba(255, 176, 66, ${p.alpha})`
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r!, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      void shiftX
      void shiftY
      raf = requestAnimationFrame(tick)
    }

    const parallaxRef = { current: parallax }
    parallaxRef.current = parallax

    if (!reducedMotion || scene === "rain" || scene === "snow") {
      // Even with reduced motion, a very slow ambient drift is rendered
      // without wind response — scenes stay recognizable. Simplest safe
      // behaviour: draw a single static frame.
      if (reducedMotion) {
        tick()
        running = false
      } else {
        raf = requestAnimationFrame(tick)
      }
    }

    const onVisibility = () => {
      if (document.hidden) {
        running = false
        cancelAnimationFrame(raf)
      } else if (!reducedMotion) {
        running = true
        raf = requestAnimationFrame(tick)
      }
    }
    document.addEventListener("visibilitychange", onVisibility)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
      document.removeEventListener("visibilitychange", onVisibility)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, reducedMotion])

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* Stars for clear-night / thunder */}
      {(scene === "clear-night" || scene === "thunder") && <Stars parallax={parallax} reduced={reducedMotion} />}

      {/* Aurora shimmer on clear nights */}
      {scene === "clear-night" && !reducedMotion && <Aurora />}

      {/* Sun / moon */}
      {(scene === "clear-day" || scene === "heat") && (
        <div
          className="absolute rounded-full"
          style={{
            top: "9%",
            right: "12%",
            width: 130,
            height: 130,
            background: scene === "heat"
              ? "radial-gradient(circle, #fff7d6 0%, #ffd66e 55%, rgba(255, 170, 40, 0.25) 100%)"
              : "radial-gradient(circle, #fffef2 0%, #ffdf7e 55%, rgba(255, 205, 90, 0.22) 100%)",
            boxShadow: "0 0 90px 34px rgba(255, 220, 130, 0.35)",
            transform: reducedMotion ? undefined : `translate(${parallax.x * -16}px, ${parallax.y * -10}px)`,
          }}
        />
      )}
      {scene === "clear-night" && (
        <div
          className="absolute rounded-full"
          style={{
            top: "11%",
            right: "14%",
            width: 96,
            height: 96,
            background: "radial-gradient(circle at 38% 36%, #fdfdf6 0%, #d9deea 58%, #9aa5bd 100%)",
            boxShadow: "0 0 70px 26px rgba(220, 228, 250, 0.25)",
            transform: reducedMotion ? undefined : `translate(${parallax.x * -14}px, ${parallax.y * -9}px)`,
          }}
        />
      )}

      {/* Drifting clouds */}
      {(scene === "cloudy" || scene === "rain" || scene === "thunder" || scene === "snow" || scene === "wind") && (
        <CloudLayers scene={scene} parallax={parallax} reduced={reducedMotion} />
      )}

      {/* Fog banks */}
      {scene === "fog" && <FogBanks parallax={parallax} reduced={reducedMotion} />}

      {/* Particles */}
      {["rain", "thunder", "snow", "wind", "heat"].includes(scene) && (
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      )}

      {/* Lightning flash */}
      {scene === "thunder" && (
        <div
          className="absolute inset-0 transition-opacity duration-100"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,240,0.55) 0%, rgba(190,205,255,0.25) 60%, transparent 100%)",
            opacity: flash ? 1 : 0,
          }}
        />
      )}

      {/* The sheep — front layer, clickable, pointer-events on this subtree only */}
      {!reducedMotion && (
        <div className="absolute inset-x-0 bottom-0">
          <SheepHerd count={sheepCount} parallax={parallax} onSheepClick={onSheepClick} />
        </div>
      )}
    </div>
  )
}

/* ------------------------------- particles ------------------------------- */

type Particle = {
  kind: "rain" | "snow" | "leaf" | "ember"
  x: number
  y: number
  vx?: number
  vy?: number
  len?: number
  r?: number
  alpha?: number
  sway?: number
  rot?: number
  hue?: number
}

/* --------------------------------- stars --------------------------------- */

function Stars({ parallax, reduced }: { parallax: { x: number; y: number }; reduced: boolean }) {
  const stars = useMemo(
    () =>
      range(90).map((i) => ({
        id: i,
        top: Math.random() * 62,
        left: Math.random() * 100,
        size: 1 + Math.random() * 2.1,
        depth: 0.4 + Math.random(),
        tw: 2.4 + Math.random() * 3.6,
        delay: Math.random() * 4,
      })),
    []
  )
  return (
    <div className="absolute inset-0">
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            opacity: 0.5 + s.depth * 0.4,
            transform: reduced ? undefined : `translate(${parallax.x * 10 * s.depth}px, ${parallax.y * 6 * s.depth}px)`,
            animation: reduced ? undefined : `ow-twinkle ${s.tw}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

/* --------------------------------- aurora -------------------------------- */

function Aurora() {
  return (
    <div
      className="absolute inset-x-0 top-0 h-[46%] opacity-60"
      style={{
        background:
          "linear-gradient(104deg, transparent 12%, rgba(70,225,170,0.24) 30%, rgba(90,160,255,0.18) 48%, rgba(190,120,255,0.2) 66%, transparent 86%)",
        filter: "blur(34px)",
        animation: "ow-aurora 16s ease-in-out infinite alternate",
      }}
    />
  )
}

/* --------------------------------- clouds -------------------------------- */

function CloudLayers({
  scene,
  parallax,
  reduced,
}: {
  scene: SceneKey
  parallax: { x: number; y: number }
  reduced: boolean
}) {
  const dark = scene === "rain" || scene === "thunder"
  const layers = [
    { top: "4%", scale: 1.5, dur: 64, depth: 1.15, op: dark ? 0.9 : 0.75 },
    { top: "14%", scale: 1.05, dur: 82, depth: 0.8, op: dark ? 0.8 : 0.6, reverse: true },
    { top: "24%", scale: 0.72, dur: 104, depth: 0.5, op: dark ? 0.65 : 0.45 },
  ]
  return (
    <div className="absolute inset-0">
      {layers.map((l, i) => (
        <div
          key={i}
          className="absolute left-0 w-[200%]"
          style={{
            top: l.top,
            animation: reduced ? undefined : `ow-drift ${l.dur}s linear infinite${l.reverse ? " reverse" : ""}`,
            transform: reduced ? `translateX(-25%)` : undefined,
          }}
        >
          <div
            style={{
              transform: `scale(${l.scale}) translate(${reduced ? 0 : parallax.x * 8 * l.depth}px, ${reduced ? 0 : parallax.y * 5 * l.depth}px)`,
            }}
          >
            <CloudBlob opacity={l.op} dark={dark} />
          </div>
        </div>
      ))}
    </div>
  )
}

function CloudBlob({ opacity, dark }: { opacity: number; dark: boolean }) {
  // A cloud built from overlapping rounded lobes — fully opaque fill.
  const fill = dark ? "#2c3a4d" : scene_neutral(dark)
  return (
    <svg width="620" height="190" viewBox="0 0 620 190" style={{ opacity }} aria-hidden="true">
      <g fill={fill}>
        <ellipse cx="150" cy="120" rx="150" ry="62" />
        <ellipse cx="300" cy="86" rx="170" ry="78" />
        <ellipse cx="462" cy="122" rx="148" ry="58" />
        <ellipse cx="230" cy="66" rx="92" ry="52" />
      </g>
    </svg>
  )
}

function scene_neutral(dark: boolean) {
  return dark ? "#3a4a5e" : "#f4f7fa"
}

/* ---------------------------------- fog ---------------------------------- */

function FogBanks({ parallax, reduced }: { parallax: { x: number; y: number }; reduced: boolean }) {
  const banks = [
    { top: "26%", dur: 38, op: 0.5, depth: 1.2 },
    { top: "48%", dur: 52, op: 0.42, depth: 0.8, reverse: true },
    { top: "68%", dur: 68, op: 0.36, depth: 0.5 },
  ]
  return (
    <div className="absolute inset-0">
      {banks.map((b, i) => (
        <div
          key={i}
          className="absolute left-0 h-40 w-[220%]"
          style={{
            top: b.top,
            opacity: b.op,
            filter: "blur(30px)",
            background: "linear-gradient(90deg, transparent, #e6ebee 18%, #f6f8f9 50%, #e6ebee 82%, transparent)",
            animation: reduced ? undefined : `ow-drift ${b.dur}s linear infinite${b.reverse ? " reverse" : ""}`,
            transform: reduced ? undefined : `translateX(${parallax.x * 10 * b.depth}px)`,
          }}
        />
      ))}
    </div>
  )
}

/* ------------------------------ sheep quirk ------------------------------ */

function SheepHerd({
  count,
  parallax,
  onSheepClick,
}: {
  count: number
  parallax: { x: number; y: number }
  onSheepClick?: () => void
}) {
  const sheep = useMemo(
    () =>
      range(Math.max(count, 1)).map((i) => ({
        id: i,
        left: 4 + ((i * 97) % 88) + Math.random() * 4,
        size: 30 + Math.random() * 22,
        dur: 46 + Math.random() * 40,
        delay: -Math.random() * 60,
        depth: 0.5 + Math.random() * 0.7,
        flip: Math.random() > 0.5,
      })),
    [count]
  )
  const [clicked, setClicked] = useState<number | null>(null)

  return (
    <>
      {sheep.map((s) => (
        <button
          key={s.id}
          type="button"
          aria-label="A sheep. Yes, you can pet it."
          onClick={() => {
            setClicked(s.id)
            onSheepClick?.()
            setTimeout(() => setClicked(null), 1500)
          }}
          className="sheep pointer-events-auto absolute bottom-1 cursor-pointer border-0 bg-transparent p-0"
          style={{
            left: `${s.left}%`,
            width: s.size,
            transform: reduced_motion(s, parallax),
            animation: `ow-graze ${s.dur}s linear ${s.delay}s infinite`,
          }}
        >
          <span
            className="block transition-transform duration-150"
            style={{ transform: clicked === s.id ? "scale(1.35) rotate(-8deg)" : undefined }}
          >
            <SheepSVG jumped={clicked === s.id} flip={s.flip} />
          </span>
        </button>
      ))}
    </>
  )
}

function reduced_motion(s: { depth: number }, parallax: { x: number; y: number }) {
  return `translate(${parallax.x * 6 * s.depth}px, ${parallax.y * 3 * s.depth}px)`
}

function SheepSVG({ jumped, flip }: { jumped: boolean; flip: boolean }) {
  return (
    <svg viewBox="0 0 64 44" width="100%" aria-hidden="true" style={{ display: "block", transform: flip ? "scaleX(-1)" : undefined }}>
      {/* legs */}
      <rect x="18" y="32" width="4" height="11" rx="2" fill="#3d3327" />
      <rect x="40" y="32" width="4" height="11" rx="2" fill="#3d3327" />
      {jumped && (
        <>
          <rect x="26" y="34" width="4" height="8" rx="2" fill="#2c241b" />
          <rect x="34" y="34" width="4" height="8" rx="2" fill="#2c241b" />
        </>
      )}
      {/* body */}
      <ellipse cx="31" cy="24" rx="21" ry="14" fill="#f2f0ea" />
      {/* wool bumps */}
      <circle cx="20" cy="18" r="8" fill="#f8f6f1" />
      <circle cx="31" cy="14" r="9" fill="#f8f6f1" />
      <circle cx="42" cy="19" r="8" fill="#f8f6f1" />
      {/* head */}
      <ellipse cx="52" cy="21" rx="8.5" ry="7" fill="#2e2620" />
      {/* ear */}
      <ellipse cx="49" cy="14" rx="3.4" ry="2.2" fill="#241d17" transform="rotate(-24 49 14)" />
      {/* eye */}
      <circle cx="55" cy="19.4" r="1.3" fill="#ffffff" />
    </svg>
  )
}

/* -------------------------------- utilities ------------------------------- */

function rand(n: number) {
  return Math.random() * n
}

function range(n: number) {
  return Array.from({ length: n }, (_, i) => i)
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])
  return reduced
}
