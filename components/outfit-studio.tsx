"use client";

import { memo, useEffect, useMemo, useState } from "react";
import {
  Clock3,
  Info,
  Shirt,
  Heart,
  RefreshCw,
  Footprints,
  Glasses,
  Briefcase,
  Coffee,
  Moon,
  Umbrella,
  Layers,
} from "lucide-react";
import type { WeatherData, OutfitRecommendation } from "@/lib/types";
import {
  buildStyledLook,
  LOOK_PALETTES,
  type Occasion,
  type Silhouette,
  type Comfort,
  type Palette,
  type OutfitPiece,
} from "@/lib/outfit-styling";
import { formatTemperature, type TemperatureUnit } from "@/lib/forecast";
import { saveOutfitToLocalStorage } from "@/lib/local-storage-utils";
import WardrobeArt from "./wardrobe-art";
import { TapButton } from "./motion-primitives";

const occasions = [
  { key: "casual", label: "Everyday", icon: Coffee },
  { key: "work", label: "Work", icon: Briefcase },
  { key: "evening", label: "Evening", icon: Moon },
] as const;
const PREF_KEY = "ow:style-preferences";
type Preferences = {
  occasion: Occasion;
  silhouette: Silhouette;
  comfort: Comfort;
  palette: Palette;
};
const defaults: Preferences = {
  occasion: "casual",
  silhouette: "auto",
  comfort: "forecast",
  palette: "earth",
};
function readPreferences(forHer: boolean): Preferences {
  const wardrobeDefaults = forHer
    ? { ...defaults, palette: "cherry" as Palette }
    : defaults;
  try {
    const stored = JSON.parse(localStorage.getItem(PREF_KEY) ?? "{}");
    // Preserve the original preference format while giving each wardrobe its own choices.
    const saved = stored[forHer ? "her" : "everyday"] ?? stored;
    return {
      occasion: ["casual", "work", "evening"].includes(saved.occasion)
        ? saved.occasion
        : defaults.occasion,
      silhouette: ["auto", "trousers", "dress"].includes(saved.silhouette)
        ? saved.silhouette
        : defaults.silhouette,
      comfort: ["cold", "forecast", "warm"].includes(saved.comfort)
        ? saved.comfort
        : defaults.comfort,
      palette: Object.hasOwn(LOOK_PALETTES, saved.palette ?? "")
        ? saved.palette
        : wardrobeDefaults.palette,
    };
  } catch {
    return wardrobeDefaults;
  }
}

function OutfitStudio({
  weather,
  base,
  forHer,
  onToggleCollection,
  timeLabel,
  unit,
  isRefreshing,
}: {
  weather: WeatherData;
  base: OutfitRecommendation;
  forHer: boolean;
  onToggleCollection: () => void;
  timeLabel: string;
  unit: TemperatureUnit;
  isRefreshing: boolean;
}) {
  const [preferences, setPreferences] = useState(defaults);
  const { occasion, silhouette, comfort, palette } = preferences;
  const [variation, setVariation] = useState(0);
  const [active, setActive] = useState<OutfitPiece["kind"] | null>(null);
  const [hovered, setHovered] = useState<OutfitPiece["kind"] | null>(null);
  const [message, setMessage] = useState("");
  useEffect(() => {
    setPreferences(readPreferences(forHer));
    setVariation(0);
    setActive(null);
  }, [forHer]);
  useEffect(() => {
    setMessage("");
    setActive(null);
    setHovered(null);
  }, [forHer, preferences, variation, weather]);
  const look = useMemo(
    () =>
      buildStyledLook(weather, forHer, occasion, silhouette, variation, {
        comfort,
        palette,
      }),
    [weather, forHer, occasion, silhouette, variation, comfort, palette],
  );
  const remember = (change: Partial<Preferences>) => {
    const next = { ...preferences, ...change };
    setPreferences(next);
    try {
      const stored = JSON.parse(localStorage.getItem(PREF_KEY) ?? "{}");
      localStorage.setItem(
        PREF_KEY,
        JSON.stringify({ ...stored, [forHer ? "her" : "everyday"]: next }),
      );
    } catch {
      /* Keep choices in this session. */
    }
  };
  const save = () => {
    const result = saveOutfitToLocalStorage({
      ...base,
      id: crypto.randomUUID(),
      emoji: forHer ? "✨" : "👕",
      styledLook: look,
      forHer,
      conditionSummary: look.title,
      description:
        look.pieces.map((piece) => piece.label).join(" · ") +
        ". " +
        look.note +
        " Palette: " +
        LOOK_PALETTES[palette].name +
        ". Weather advice: " +
        base.description,
    });
    setMessage(
      result === "saved"
        ? "Saved to your lookbook."
        : result === "duplicate"
          ? "This look is already in your lookbook."
          : "Couldn’t save this look. Browser storage may be unavailable.",
    );
  };
  return (
    <article className="atelier" aria-labelledby="outfit-title" aria-busy={isRefreshing}>
      <header className="atelier-heading">
        <div>
          <h2 id="outfit-title" tabIndex={-1}>Your outfit</h2>
          <p className="outfit-time" aria-live="polite"><Clock3 size={15} /> {timeLabel} · {formatTemperature(weather.current.temp_c, unit)}°{unit} · {weather.current.condition.text}</p>
        </div>
        <div className="segmented wardrobe-switch" role="group" aria-label="Wardrobe collection">
          <button type="button" aria-pressed={!forHer} onClick={() => { if (forHer) onToggleCollection(); }}>Everyday</button>
          <button type="button" aria-pressed={forHer} onClick={() => { if (!forHer) onToggleCollection(); }}>For her</button>
        </div>
      </header>

      <div className="atelier-occasions" role="group" aria-label="Occasion">
        {occasions.map(({ key, label, icon: Icon }) => (
          <TapButton type="button" key={key} aria-pressed={occasion === key} onClick={() => remember({ occasion: key })}>
            <Icon size={16} aria-hidden="true" /> {key === "casual" ? "Casual" : label}
          </TapButton>
        ))}
      </div>

      <div className="atelier-board">
        <div className="atelier-art" data-collection={forHer ? "her" : "everyday"}>
          <WardrobeArt look={look} active={hovered ?? active} />
          <div className="atelier-swatches" role="group" aria-label="Colour palette">
            {(Object.keys(LOOK_PALETTES) as Palette[]).map((key) => (
              <button
                type="button"
                key={key}
                aria-label={LOOK_PALETTES[key].name}
                title={LOOK_PALETTES[key].name}
                aria-pressed={palette === key}
                onClick={() => remember({ palette: key })}
                style={{
                  background: `linear-gradient(120deg, ${LOOK_PALETTES[key].colors[0]} 33%, ${LOOK_PALETTES[key].colors[1]} 33% 66%, ${LOOK_PALETTES[key].colors[2]} 66%)`,
                }}
              />
            ))}
          </div>
          <span className="atelier-art-caption">{LOOK_PALETTES[palette].name}</span>
        </div>

        <div className="atelier-pieces">
          <h3>{look.title}</h3>
          <ul>
            {look.pieces.map((piece) => (
              <li key={piece.kind}>
                <button
                  type="button"
                  className="atelier-piece"
                  onMouseEnter={() => setHovered(piece.kind)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => setActive((value) => value === piece.kind ? null : piece.kind)}
                  aria-pressed={active === piece.kind}
                >
                  <span className="atelier-piece-icon"><PieceIcon piece={piece} /></span>
                  <span><small>{PIECE_NAMES[piece.kind]}</small><strong>{piece.label}</strong></span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="atelier-preferences">
        <label>
          Warmth
          <select value={comfort} onChange={(event) => remember({ comfort: event.target.value as Comfort })}>
            <option value="cold">Extra warmth</option>
            <option value="forecast">Standard</option>
            <option value="warm">Lighter layers</option>
          </select>
        </label>
        {forHer && (
          <label>
            Silhouette
            <select value={silhouette} onChange={(event) => remember({ silhouette: event.target.value as Silhouette })}>
              <option value="auto">Any silhouette</option>
              <option value="trousers">Trousers</option>
              <option value="dress">Dress</option>
            </select>
          </label>
        )}
      </div>

      <details className="atelier-advice">
        <summary><Info size={17} /> Why this outfit?</summary>
        <p>{look.note}</p>
        <p>{base.description}</p>
      </details>
      <footer className="atelier-actions">
        <TapButton type="button" className="button-secondary" onClick={() => setVariation((value) => (value + 1) % 6)}>
          <RefreshCw size={16} /> Remix
        </TapButton>
        <TapButton type="button" className="button-primary" onClick={save}>
          <Heart size={17} /> Save look
        </TapButton>
      </footer>
      <p role="status" className="atelier-status">{message}</p>
    </article>
  );
}

const PIECE_NAMES: Record<OutfitPiece["kind"], string> = {
  top: "Top",
  bottom: "Bottoms",
  dress: "Dress",
  layer: "Outer layer",
  shoes: "Footwear",
  accessory: "Accessories",
};

function PieceIcon({ piece }: { piece: OutfitPiece }) {
  const Icon = piece.kind === "layer" ? Layers
    : piece.kind === "shoes" ? Footprints
    : piece.kind === "accessory" ? (piece.label.includes("umbrella") ? Umbrella : Glasses)
    : Shirt;
  return <Icon size={17} strokeWidth={1.7} aria-hidden="true" />;
}

export default memo(OutfitStudio);
