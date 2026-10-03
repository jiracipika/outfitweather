"use client"

import FavoriteOutfits from "@/components/favorite-outfits"
import Link from "next/link"

export default function FavoritesPage() {
  return (
    <div className="atelier-favorites-page">
      <div className="atelier-favorites-heading"><div><span className="ow-eyebrow">A WARDROBE WORTH KEEPING</span><h1 className="ow-display">The saved edit.</h1><p>Your favourite looks, ready for another day.</p></div><Link href="/" className="ow-return">Build another look ↗</Link></div>
      <FavoriteOutfits />
    </div>
  )
}
