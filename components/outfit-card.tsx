"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Trash2 } from "lucide-react"
import type { OutfitRecommendation } from "@/lib/types"

interface OutfitCardProps {
  outfit: OutfitRecommendation
  onSave?: (outfit: OutfitRecommendation) => void
  onRemove?: (id: string) => void
  isSaved?: boolean
}

export default function OutfitCard({ outfit, onSave, onRemove, isSaved = false }: OutfitCardProps) {
  return (
    <Card className="w-full max-w-sm hover:shadow-lg transition-shadow duration-300 ease-in-out backdrop-blur-sm bg-card/90">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          {outfit.emoji} {outfit.conditionSummary}
        </CardTitle>
        <CardDescription>
          {outfit.location} - {outfit.temperature}°C
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-lg">{outfit.description}</p>
        <div className="flex justify-end">
          {onSave && !isSaved && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSave(outfit)}
              className="hover:scale-105 transition-transform"
            >
              <Heart className="w-4 h-4 mr-2" /> Save
            </Button>
          )}
          {onRemove && isSaved && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onRemove(outfit.id)}
              className="hover:scale-105 transition-transform"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Remove
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
