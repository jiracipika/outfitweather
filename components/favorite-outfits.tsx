"use client"

import { useEffect, useState } from "react"
import type { OutfitRecommendation } from "@/lib/types"
import { getSavedOutfits, removeOutfitFromLocalStorage } from "@/lib/local-storage-utils"
import OutfitCard from "./outfit-card"
import { Heart } from "lucide-react"
import Link from "next/link"

export default function FavoriteOutfits() {
  const [favorites, setFavorites] = useState<OutfitRecommendation[]>([])

  useEffect(() => {
    setFavorites(getSavedOutfits())
  }, [])

  const handleRemoveOutfit = (id: string) => {
    if (removeOutfitFromLocalStorage(id)) {
      setFavorites((current) => current.filter((outfit) => outfit.id !== id))
    }
  }

  if (favorites.length === 0) {
    return (
      <div className="atelier-favorites-empty">
        <Heart size={40} strokeWidth={1} />
        <h2 className="ow-display">Your next favourite is out there.</h2>
        <p>Save a look from your forecast and find it here.</p>
        <Link href="/" className="ow-return">Find my outfit ↗</Link>
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
