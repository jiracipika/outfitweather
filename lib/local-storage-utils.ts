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

export type OutfitBackup = {
  app: "outfitweather"
  version: 1
  exportedAt: string
  favorites: OutfitRecommendation[]
  customRules: CustomOutfitRule[]
}

export type OutfitImportResult = {
  importedFavorites: number
  importedRules: number
  duplicateFavorites: number
  duplicateRules: number
  invalidEntries: number
  saved: boolean
}

export function exportOutfitBackup(): string | null {
  if (typeof window === "undefined") return null
  const backup: OutfitBackup = {
    app: "outfitweather",
    version: 1,
    exportedAt: new Date().toISOString(),
    favorites: getSavedOutfits(),
    customRules: getCustomOutfitRules(),
  }
  try {
    return JSON.stringify(backup, null, 2)
  } catch {
    return null
  }
}

function isBackupPayload(
  value: unknown,
): value is { favorites: unknown[]; customRules: unknown[] } {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false
  const record = value as Record<string, unknown>
  return Array.isArray(record.favorites) && Array.isArray(record.customRules)
}

// Merge-only restore: validates every entry, never overwrites what the
// browser already holds, and never throws on malformed files.
export function importOutfitBackup(raw: unknown): OutfitImportResult | null {
  let parsed: unknown = raw
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed)
    } catch {
      return null
    }
  }
  // A bare array is read as a favorites-only export.
  const payload = isBackupPayload(parsed)
    ? parsed
    : Array.isArray(parsed)
      ? { favorites: parsed, customRules: [] }
      : null
  if (!payload) return null

  const favorites = getSavedOutfits()
  const nextFavorites = [...favorites]
  const result: OutfitImportResult = {
    importedFavorites: 0,
    importedRules: 0,
    duplicateFavorites: 0,
    duplicateRules: 0,
    invalidEntries: 0,
    saved: true,
  }

  for (const entry of payload.favorites) {
    if (!isOutfit(entry)) {
      result.invalidEntries += 1
      continue
    }
    const exists = nextFavorites.some(
      (favorite) =>
        favorite.description === entry.description &&
        favorite.temperature === entry.temperature &&
        favorite.location === entry.location,
    )
    if (exists) {
      result.duplicateFavorites += 1
      continue
    }
    nextFavorites.push(entry)
    result.importedFavorites += 1
  }

  const rules = getCustomOutfitRules()
  const nextRules = [...rules]
  for (const entry of payload.customRules) {
    if (!isRule(entry)) {
      result.invalidEntries += 1
      continue
    }
    if (nextRules.some((rule) => rule.id === entry.id)) {
      result.duplicateRules += 1
      continue
    }
    nextRules.push(entry)
    result.importedRules += 1
  }

  if (
    result.importedFavorites > 0 &&
    !writeArray(FAVORITES_KEY, nextFavorites)
  ) {
    result.saved = false
  }
  if (result.importedRules > 0 && !writeArray(CUSTOM_RULES_KEY, nextRules)) {
    result.saved = false
  }
  return result
}
