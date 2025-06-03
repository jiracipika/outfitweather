"use client"

import { useEffect, useState } from "react"
import FavoriteOutfits from "@/components/favorite-outfits"
import { FavoritesSkeleton } from "@/components/loading-skeleton"

export default function FavoritesPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading for 500ms to show skeleton
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-6 w-full">
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 animate-fade-in">Your Favorite Outfits</h1>
      {isLoading ? <FavoritesSkeleton /> : <FavoriteOutfits />}
    </div>
  )
}
