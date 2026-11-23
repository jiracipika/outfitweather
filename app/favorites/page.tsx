import FavoriteOutfits from "@/components/favorite-outfits";
import BackupCard from "@/components/backup-card";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function FavoritesPage() {
  return (
    <div className="page-frame collection-page">
      <header className="collection-heading">
        <div>
          <h1>Your <em>lookbook.</em></h1>
          <p>Outfits you’ve saved from past forecasts.</p>
        </div>
        <Link href="/" className="button-secondary">Plan another outfit <ArrowUpRight size={16} /></Link>
      </header>
      <FavoriteOutfits />
      <BackupCard />
    </div>
  );
}
