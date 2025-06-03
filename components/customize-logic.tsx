"use client"

import { useState, useEffect } from "react"
import type { CustomOutfitRule } from "@/lib/types"
import { getCustomOutfitRules, saveCustomOutfitRules } from "@/lib/local-storage-utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { PlusCircle, Save, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function CustomizeLogic() {
  const [rules, setRules] = useState<CustomOutfitRule[]>([])
  const { toast } = useToast()

  useEffect(() => {
    setRules(getCustomOutfitRules())
  }, [])

  const addRule = () => {
    setRules([
      ...rules,
      {
        id: crypto.randomUUID(),
        name: "",
        emoji: "",
        description: "",
      },
    ])
  }

  const updateRule = (id: string, field: keyof CustomOutfitRule, value: any) => {
    setRules(rules.map((rule) => (rule.id === id ? { ...rule, [field]: value } : rule)))
  }

  const removeRule = (id: string) => {
    setRules(rules.filter((rule) => rule.id !== id))
  }

  const handleSave = () => {
    saveCustomOutfitRules(rules)
    toast({
      title: "Custom rules saved!",
      description: "Your outfit recommendations will now use your custom logic.",
    })
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Customize Outfit Logic</CardTitle>
        <CardDescription>Define your preferred outfits for different weather conditions.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {rules.length === 0 && (
          <p className="text-center text-gray-500">No custom rules yet. Click "Add New Rule" to get started!</p>
        )}
        {rules.map((rule) => (
          <div key={rule.id} className="border p-4 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4 relative">
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={() => removeRule(rule.id)}
              aria-label="Remove rule"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <div className="grid gap-2">
              <Label htmlFor={`rule-name-${rule.id}`}>Rule Name</Label>
              <Input
                id={`rule-name-${rule.id}`}
                value={rule.name}
                onChange={(e) => updateRule(rule.id, "name", e.target.value)}
                placeholder="e.g., 'Very Cold & Windy'"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`rule-emoji-${rule.id}`}>Emoji</Label>
              <Input
                id={`rule-emoji-${rule.id}`}
                value={rule.emoji}
                onChange={(e) => updateRule(rule.id, "emoji", e.target.value)}
                placeholder="e.g., 🥶"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`rule-min-temp-${rule.id}`}>Min Temperature (°C)</Label>
              <Input
                id={`rule-min-temp-${rule.id}`}
                type="number"
                value={rule.minTemp ?? ""}
                onChange={(e) =>
                  updateRule(rule.id, "minTemp", e.target.value === "" ? undefined : Number.parseFloat(e.target.value))
                }
                placeholder="e.g., 0"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`rule-max-temp-${rule.id}`}>Max Temperature (°C)</Label>
              <Input
                id={`rule-max-temp-${rule.id}`}
                type="number"
                value={rule.maxTemp ?? ""}
                onChange={(e) =>
                  updateRule(rule.id, "maxTemp", e.target.value === "" ? undefined : Number.parseFloat(e.target.value))
                }
                placeholder="e.g., 10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`rule-raining-${rule.id}`}
                checked={rule.isRaining ?? false}
                onCheckedChange={(checked) => updateRule(rule.id, "isRaining", checked)}
              />
              <Label htmlFor={`rule-raining-${rule.id}`}>Is Raining?</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`rule-snowing-${rule.id}`}
                checked={rule.isSnowing ?? false}
                onCheckedChange={(checked) => updateRule(rule.id, "isSnowing", checked)}
              />
              <Label htmlFor={`rule-snowing-${rule.id}`}>Is Snowing?</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`rule-windy-${rule.id}`}
                checked={rule.isWindy ?? false}
                onCheckedChange={(checked) => updateRule(rule.id, "isWindy", checked)}
              />
              <Label htmlFor={`rule-windy-${rule.id}`}>Is Windy? (wind &gt; 20 kph)</Label>
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor={`rule-description-${rule.id}`}>Outfit Description</Label>
              <Textarea
                id={`rule-description-${rule.id}`}
                value={rule.description}
                onChange={(e) => updateRule(rule.id, "description", e.target.value)}
                placeholder="e.g., 'Wear your warmest parka and waterproof boots!'"
              />
            </div>
          </div>
        ))}
        <div className="flex justify-between gap-2">
          <Button variant="outline" onClick={addRule}>
            <PlusCircle className="h-4 w-4 mr-2" /> Add New Rule
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" /> Save Custom Rules
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
