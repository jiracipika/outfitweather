"use client"

import { useEffect, useState } from "react"
import type { OutfitRecommendation } from "@/lib/types"
import { getSavedOutfits, removeOutfitFromLocalStorage } from "@/lib/local-storage-utils"
import OutfitCard from "./outfit-card"
import { Frown } from "lucide-react"

export default function FavoriteOutfits() {
  const [favorites, setFavorites] = useState<OutfitRecommendation[]>([])

  useEffect(() => {
    setFavorites(getSavedOutfits())
  }, [])

  const handleRemoveOutfit = (id: string) => {
    removeOutfitFromLocalStorage(id)
    setFavorites(getSavedOutfits()) // Refresh the list
  }

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground animate-fade-in">
        <Frown className="w-16 h-16 mb-4" />
        <p className="text-xl">No favorite outfits saved yet.</p>
        <p className="text-sm">Search for a city and save your favorite recommendations!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl animate-fade-in">
      {favorites.map((outfit) => (
        <OutfitCard key={outfit.id} outfit={outfit} onRemove={handleRemoveOutfit} isSaved={true} />
      ))}
    </div>
  )
}
