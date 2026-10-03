import type { WeatherData } from "./types"

export type Occasion = "casual" | "work" | "evening"
export type Silhouette = "auto" | "trousers" | "dress"
export type OutfitPiece = { kind: "top" | "bottom" | "dress" | "layer" | "shoes" | "accessory"; label: string }
export type StyledLook = { title: string; pieces: OutfitPiece[]; note: string; palette: string[] }

export function buildStyledLook(weather: WeatherData, forHer: boolean, occasion: Occasion, silhouette: Silhouette, variation = 0): StyledLook {
  const temp = weather.current.feelslike_c ?? weather.current.temp_c
  const condition = weather.current.condition.text.toLowerCase()
  const snow = /snow|sleet|blizzard|ice/.test(condition)
  const local = weather.location.localtime
  const nextHours = (weather.forecast?.forecastday.flatMap(day => day.hour) ?? [])
    .filter(hour => !local || hour.time >= local).slice(0, 8)
  const wet = weather.current.precip_mm > 0 || /rain|drizzle|shower|snow|sleet/.test(condition)
    || nextHours.some(hour => Math.max(hour.chance_of_rain ?? 0, hour.chance_of_snow ?? 0) >= 45)
  const windy = weather.current.wind_kph >= 30
  const polished = occasion !== "casual"
  const pick = (options: string[]) => options[((variation % options.length) + options.length) % options.length]
  const pieces: OutfitPiece[] = []
  const useDress = forHer && silhouette === "dress" && temp >= 10 && !windy && !snow

  if (useDress) {
    pieces.push({ kind: "dress", label: temp >= 25 ? pick(["Linen midi dress", "Cotton shirt dress", "Relaxed cotton midi"]) : pick(["Long-sleeve midi dress", "Jersey midi dress", "Soft knit midi dress"]) })
  } else {
    const top = temp <= 8
      ? pick(["Thermal base + wool knit", "Thermal base + chunky knit", "Long-sleeve base + warm sweater"])
      : temp < 18
      ? (forHer ? pick(["Ribbed long-sleeve knit", "Soft crew-neck sweater", "Fine-knit cardigan"]) : pick(["Long-sleeve tee", "Crew-neck sweater", "Cotton overshirt"]))
      : temp >= 25
      ? (forHer ? pick(["Linen blouse", "Cotton sleeveless blouse", "Relaxed linen shirt"]) : pick(["Linen shirt", "Breathable cotton tee", "Light cotton shirt"]))
      : (forHer ? (polished ? pick(["Soft button-up blouse", "Draped blouse", "Fine-knit top"]) : pick(["Ribbed cotton top", "Relaxed blouse", "Soft cotton tee"])) : pick(["Cotton tee", "Oxford shirt", "Lightweight polo"]))
    pieces.push({ kind: "top", label: top })
    const bottom = temp <= 5 ? "Lined trousers + thermal leggings"
      : temp >= 25 ? (polished ? "Light linen trousers" : forHer ? "Wide-leg linen trousers" : "Lightweight shorts")
      : forHer ? (polished ? pick(["Tailored wide-leg trousers", "Straight tailored trousers", "Ankle-length trousers"]) : pick(["Wide-leg jeans", "Straight-leg jeans", "Relaxed cotton trousers"]))
      : polished ? "Tailored trousers" : pick(["Straight-leg jeans", "Cotton chinos", "Relaxed trousers"])
    pieces.push({ kind: "bottom", label: bottom })
  }
  if (temp <= 5) pieces.push({ kind: "layer", label: wet ? "Insulated waterproof coat" : "Insulated winter coat" })
  else if (wet) pieces.push({ kind: "layer", label: temp < 12 ? "Warm waterproof jacket" : "Light rain shell" })
  else if (windy) pieces.push({ kind: "layer", label: "Wind-resistant jacket" })
  else if (temp < 16) pieces.push({ kind: "layer", label: forHer && polished ? "Warm structured coat" : "Warm jacket" })
  else if (temp < 22) pieces.push({ kind: "layer", label: polished ? "Light blazer" : "Light cardigan" })

  pieces.push({ kind: "shoes", label: snow || temp <= 0 ? "Insulated boots with grip" : wet ? "Water-resistant ankle boots" : temp <= 10 ? "Closed ankle boots" : polished ? "Comfortable loafers" : "Everyday sneakers" })
  pieces.push({ kind: "accessory", label: temp <= 5 ? "Scarf, beanie + gloves" : wet ? "Compact umbrella" : (weather.current.uv ?? 0) >= 3 ? "Sunglasses + sun protection" : occasion === "evening" ? "Small crossbody bag" : "Everyday tote" })

  const dressFallback = forHer && silhouette === "dress" && !useDress
  const note = dressFallback ? "Trousers keep this look practical in the cold, snow, or stronger wind. Your dress preference stays saved."
    : wet ? "A weatherproof layer and practical shoes cover rain or snow now or in the next few hours."
    : windy ? "A secure outer layer handles the wind. Keep loose accessories tucked in."
    : temp <= 5 ? "Build warmth in layers; keep the thermal base under your chosen outfit."
    : temp >= 25 ? "Light, breathable fabrics keep the look comfortable in the heat."
    : "Easy layers let you adjust when the temperature changes."
  return {
    title: forHer ? ({ casual: "Her everyday edit", work: "Her polished edit", evening: "Her evening edit" }[occasion])
      : ({ casual: "Everyday essentials", work: "A polished day", evening: "An evening out" }[occasion]),
    pieces, note,
    palette: polished ? ["#e4d9c9", "#3d4147", "#a87965"] : variation % 2 ? ["#b4c4b3", "#f0e4cd", "#646f84"] : ["#edc5b8", "#ded4c2", "#6d7d91"],
  }
}
