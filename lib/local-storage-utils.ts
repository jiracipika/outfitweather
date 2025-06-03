import type { OutfitRecommendation, CustomOutfitRule } from "./types"

const FAVORITES_KEY = "weatherWearFavorites"
const CUSTOM_RULES_KEY = "weatherWearCustomRules"

export function getSavedOutfits(): OutfitRecommendation[] {
  if (typeof window === "undefined") return [] // Ensure running in browser
  const stored = localStorage.getItem(FAVORITES_KEY)
  return stored ? JSON.parse(stored) : []
}

export function saveOutfitToLocalStorage(outfit: OutfitRecommendation): void {
  if (typeof window === "undefined") return
  const favorites = getSavedOutfits()
  // Prevent duplicates based on a simple check (e.g., description and temperature)
  const exists = favorites.some(
    (fav) =>
      fav.description === outfit.description &&
      fav.temperature === outfit.temperature &&
      fav.location === outfit.location,
  )
  if (!exists) {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites, outfit]))
  }
}

export function removeOutfitFromLocalStorage(id: string): void {
  if (typeof window === "undefined") return
  const favorites = getSavedOutfits()
  const updatedFavorites = favorites.filter((outfit) => outfit.id !== id)
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites))
}

export function getCustomOutfitRules(): CustomOutfitRule[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(CUSTOM_RULES_KEY)
  return stored ? JSON.parse(stored) : []
}

export function saveCustomOutfitRules(rules: CustomOutfitRule[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(CUSTOM_RULES_KEY, JSON.stringify(rules))
}
