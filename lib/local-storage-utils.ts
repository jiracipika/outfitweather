import type { OutfitRecommendation, CustomOutfitRule } from "./types"
import type { StyledLook } from "./outfit-styling"

const FAVORITES_KEY = "weatherWearFavorites"
const CUSTOM_RULES_KEY = "weatherWearCustomRules"

function readArray(key: string): unknown[] {
  if (typeof window === "undefined") return []

  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) ?? "[]")
    return Array.isArray(value) ? value : []
  } catch {
    // Corrupt or inaccessible browser storage should not break the page.
    return []
  }
}

function isOutfit(value: unknown): value is OutfitRecommendation {
  if (!value || typeof value !== "object") return false
  const outfit = value as Record<string, unknown>
  return (
    typeof outfit.id === "string" &&
    typeof outfit.emoji === "string" &&
    typeof outfit.description === "string" &&
    typeof outfit.conditionSummary === "string" &&
    typeof outfit.temperature === "number" &&
    Number.isFinite(outfit.temperature) &&
    typeof outfit.location === "string"
  )
}

function isRule(value: unknown): value is CustomOutfitRule {
  if (!value || typeof value !== "object") return false
  const rule = value as Record<string, unknown>
  const optionalNumber = (field: unknown) => field === undefined || (typeof field === "number" && Number.isFinite(field))
  const optionalBoolean = (field: unknown) => field === undefined || typeof field === "boolean"

  return (
    typeof rule.id === "string" &&
    typeof rule.name === "string" &&
    typeof rule.emoji === "string" &&
    typeof rule.description === "string" &&
    optionalNumber(rule.minTemp) &&
    optionalNumber(rule.maxTemp) &&
    optionalBoolean(rule.isRaining) &&
    optionalBoolean(rule.isSnowing) &&
    optionalBoolean(rule.isWindy)
  )
}

function writeArray(key: string, value: unknown[]): boolean {
  if (typeof window === "undefined") return false
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function getSavedOutfits(): OutfitRecommendation[] {
  return readArray(FAVORITES_KEY).filter(isOutfit).map(outfit => ({ ...outfit, styledLook: isStyledLook(outfit.styledLook) ? outfit.styledLook : undefined }))
}

function isStyledLook(value: unknown): value is StyledLook {
  if (!value || typeof value !== "object") return false
  const look = value as Record<string, unknown>
  return typeof look.title === "string" && typeof look.note === "string"
    && Array.isArray(look.palette) && look.palette.length === 3 && look.palette.every(color => typeof color === "string" && /^#[0-9a-f]{6}$/i.test(color))
    && Array.isArray(look.pieces) && look.pieces.length > 0 && look.pieces.length <= 6 && look.pieces.every(piece => piece && typeof piece.label === "string" && ["top", "bottom", "dress", "layer", "shoes", "accessory"].includes(piece.kind))
}

export function saveOutfitToLocalStorage(outfit: OutfitRecommendation): "saved" | "duplicate" | "error" {
  const favorites = getSavedOutfits()
  const exists = favorites.some(
    (favorite) =>
      favorite.description === outfit.description &&
      favorite.temperature === outfit.temperature &&
      favorite.location === outfit.location,
  )
  if (exists) return "duplicate"
  return writeArray(FAVORITES_KEY, [...favorites, outfit]) ? "saved" : "error"
}

export function removeOutfitFromLocalStorage(id: string): boolean {
  const favorites = getSavedOutfits()
  return writeArray(
    FAVORITES_KEY,
    favorites.filter((outfit) => outfit.id !== id),
  )
}

export function getCustomOutfitRules(): CustomOutfitRule[] {
  return readArray(CUSTOM_RULES_KEY).filter(isRule)
}

export function saveCustomOutfitRules(rules: CustomOutfitRule[]): boolean {
  return writeArray(CUSTOM_RULES_KEY, rules)
}
