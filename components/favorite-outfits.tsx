"use client";

import { useEffect, useState } from "react";
import type { OutfitRecommendation } from "@/lib/types";
import {
  getSavedOutfits,
  removeOutfitFromLocalStorage,
} from "@/lib/local-storage-utils";
import OutfitCard from "./outfit-card";
import { Heart } from "lucide-react";
import Link from "next/link";

export default function FavoriteOutfits() {
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState<OutfitRecommendation[]>([]);

  useEffect(() => {
    setFavorites(getSavedOutfits());
  }, []);

  const handleRemoveOutfit = (id: string) => {
    setError("");
    if (removeOutfitFromLocalStorage(id)) {
      setFavorites((current) => current.filter((outfit) => outfit.id !== id));
    } else {
      setError(
        "This look couldn’t be removed. Check your browser storage and try again.",
      );
    }
  };

  if (favorites.length === 0) {
    return (
      <div className="atelier-favorites-empty">
        <Heart size={40} strokeWidth={1} />
        <h2 className="ow-display">Your next favourite is out there.</h2>
        <p>Save a look from your forecast and find it here.</p>
        <Link href="/" className="ow-return">
          Find my outfit ↗
        </Link>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <p role="alert" className="remove-error">
          {error}
        </p>
      )}
      <div className="saved-grid">
        {favorites.map((outfit) => (
          <OutfitCard
            key={outfit.id}
            outfit={outfit}
            onRemove={handleRemoveOutfit}
            isSaved={true}
          />
        ))}
      </div>
    </div>
  );
}
