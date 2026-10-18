"use client"

import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from "react"
import { MotionConfig, motion, type HTMLMotionProps, type Transition } from "motion/react"
import { useWardrobePreferences } from "./wardrobe-preferences"

/**
 * Motion (motion.dev) primitives for OutfitWeather.
 *
 * Rules baked in here:
 * - The app's own Motion toggle (Sparkles button, `ow:motion` in localStorage) must
 *   also disable Motion animations — every primitive renders a plain element when it is off.
 * - `prefers-reduced-motion: reduce` is respected app-wide via <MotionGate> (MotionConfig
 *   reducedMotion="user"): transform/layout animations are skipped, gentle opacity fades stay.
 * - Only transform/opacity are animated; no layout-affecting properties.
 * - Springs: house entrance is a soft rise + fade; interactions get a quick press spring.
 */

/** House entrance spring: soft rise + fade (y 18px, spring bounce 0.3 / 0.6s). */
export const ENTRANCE_SPRING: Transition = { type: "spring", bounce: 0.3, duration: 0.6 }
/** Quick spring for hover lift / tap press. */
const PRESS_SPRING: Transition = { type: "spring", bounce: 0.4, duration: 0.35 }

/** Wrap the app tree once (in app/layout.tsx) so reduced-motion preference is honoured everywhere. */
export function MotionGate({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}

function useMotionEnabled() {
  const { motion: motionOn } = useWardrobePreferences()
  return motionOn
}

/**
 * Props we forward to both plain and motion elements. Motion reinterprets the
 * animation/drag event handlers, and `style` differs between branches, so they
 * stay out of the shared surface — consumers only pass classes, aria and handlers.
 */
type SharedElementProps = Omit<
  ComponentPropsWithoutRef<"div">,
  "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration" | "onDrag" | "onDragStart" | "onDragEnd" | "style"
>

type RevealProps = {
  /** Element to render, so wrappers never change the DOM tag a stylesheet expects. */
  as?: "div" | "article"
  /** Delay in seconds before the entrance starts. */
  delay?: number
  /** Rise distance in px (default 18). */
  y?: number
  className?: string
  children?: ReactNode
} & SharedElementProps

/**
 * Spring entrance for a subtree (the "results appeared" hero moment).
 * Plays on mount; give the element a `key` upstream to replay it when new results arrive.
 */
export function Reveal({ as = "div", delay = 0, y = 18, className, children, ...rest }: RevealProps) {
  const enabled = useMotionEnabled()
  if (!enabled) {
    const Tag = as
    return <Tag className={className} {...rest}>{children}</Tag>
  }
  const MotionTag = as === "article" ? motion.article : motion.div
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...ENTRANCE_SPRING, delay }}
      {...(rest as HTMLMotionProps<"div">)}
    >
      {children}
    </MotionTag>
  )
}

type StaggerProps = {
  as?: "div" | "span"
  /** Seconds between siblings (default 0.06). */
  stagger?: number
  /** Seconds before the first sibling starts. */
  delay?: number
  className?: string
  children?: ReactNode
} & SharedElementProps

type StaggerItemProps = {
  as?: "div" | "span"
  /** Rise distance in px (default 14). Keep small inside scroll containers. */
  rise?: number
  className?: string
  children?: ReactNode
} & SharedElementProps

const staggerGroupVariants = (stagger: number, delay: number) => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: delay } },
})

const staggerItemVariants = (rise: number) => ({
  hidden: { opacity: 0, y: rise },
  show: { opacity: 1, y: 0, transition: ENTRANCE_SPRING },
})

/** Container that staggers its <StaggerItem> children in with a soft spring cascade. */
export function StaggerGroup({ as = "div", stagger = 0.06, delay = 0, className, children, ...rest }: StaggerProps) {
  const enabled = useMotionEnabled()
  if (!enabled) {
    const Tag = as
    return <Tag className={className} {...rest}>{children}</Tag>
  }
  const MotionTag = as === "span" ? motion.span : motion.div
  return (
    <MotionTag
      className={className}
      variants={staggerGroupVariants(stagger, delay)}
      initial="hidden"
      animate="show"
      {...(rest as HTMLMotionProps<"div">)}
    >
      {children}
    </MotionTag>
  )
}

/** One item inside a <StaggerGroup>; use `as="span"` for chip rows styled via `span` selectors. */
export function StaggerItem({ as = "div", rise = 14, className, children, ...rest }: StaggerItemProps) {
  const enabled = useMotionEnabled()
  if (!enabled) {
    const Tag = as
    return <Tag className={className} {...rest}>{children}</Tag>
  }
  const MotionTag = as === "span" ? motion.span : motion.div
  return (
    <MotionTag className={className} variants={staggerItemVariants(rise)} {...(rest as HTMLMotionProps<"div">)}>
      {children}
    </MotionTag>
  )
}

type TapButtonProps = {
  /** Optional staggered entrance (seconds), for chip/button grids rendered on mount. */
  entranceDelay?: number
} & Omit<ComponentPropsWithoutRef<"button">, "style">

/**
 * Button with a hover lift + tap press spring. Renders a real <button> with the same
 * props either way; when Motion is off the CSS :hover/:active styles apply untouched.
 * Tags itself with data-motion-transform so CSS transitions keep off the transform axis.
 */
export const TapButton = forwardRef<HTMLButtonElement, TapButtonProps>(function TapButton(
  { entranceDelay, type = "button", className, children, ...rest },
  ref,
) {
  const enabled = useMotionEnabled()
  if (!enabled) {
    return <button ref={ref} type={type} className={className} {...rest}>{children}</button>
  }
  const entrance = entranceDelay === undefined
    ? {}
    : {
        initial: { opacity: 0, y: 14 },
        animate: { opacity: 1, y: 0 },
        transition: { ...ENTRANCE_SPRING, delay: entranceDelay },
      }
  return (
    <motion.button
      ref={ref}
      type={type}
      className={className}
      data-motion-transform=""
      whileHover={{ y: -2, transition: PRESS_SPRING }}
      whileTap={{ scale: 0.95, transition: PRESS_SPRING }}
      {...entrance}
      {...(rest as HTMLMotionProps<"button">)}
    >
      {children}
    </motion.button>
  )
})
