"use client";

import FavoriteOutfits from "@/components/favorite-outfits";
import BackupCard from "@/components/backup-card";
import Link from "next/link";

export default function FavoritesPage() {
  return (
    <div className="collection-page">
      <div className="collection-heading">
        <div>
          <span className="ow-eyebrow">YOUR LITTLE OUTFIT ARCHIVE</span>
          <h1 className="ow-display">
            A few <em>favourite things.</em>
          </h1>
          <p>
            Good outfits deserve another day. All your saved inspiration, right
            here.
          </p>
        </div>
        <Link href="/" className="ow-return">
          Build another look ↗
        </Link>
      </div>
      <FavoriteOutfits />
      <BackupCard />
    </div>
  );
}
