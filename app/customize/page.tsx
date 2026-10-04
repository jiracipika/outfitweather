"use client"

import CustomizeLogic from "@/components/customize-logic"
import { useWardrobePreferences } from "@/components/wardrobe-preferences"

export default function CustomizePage() {
  const { forHer } = useWardrobePreferences()
  return (
    <div className={`flex flex-col items-center justify-center p-4 md:p-6 w-full ${forHer ? "her-preferences-page" : ""}`}>
      {forHer && <span className="her-eyebrow">YOUR WARDROBE / YOUR WAY</span>}
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-8">{forHer ? "The little details." : "Customize Outfit Logic"}</h1>
      <CustomizeLogic />
    </div>
  )
}
