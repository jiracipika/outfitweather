"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Cloud,
  CloudLightning,
  CloudRain,
  Droplets,
  Haze,
  LocateFixed,
  MapPin,
  Moon,
  RefreshCw,
  Snowflake,
  Sun,
  Thermometer,
  Wind,
} from "lucide-react";
import SearchBar from "@/components/search-bar";
import OutfitStudio from "@/components/outfit-studio";
import WeatherMascot from "@/components/weather-mascot";
import ForecastStrip from "@/components/forecast-strip";
import { useWardrobePreferences } from "@/components/wardrobe-preferences";
import { getOutfitRecommendation } from "@/lib/weather-utils";
import { getCustomOutfitRules } from "@/lib/local-storage-utils";
import {
  DEMO_SCENE_KEYS,
  buildDemoWeather,
  getWeatherScene,
  type SceneKey,
} from "@/lib/weather-scene";
import type { WeatherData, CustomOutfitRule } from "@/lib/types";

const SKY_ICONS = {
  "clear-day": Sun,
  "clear-night": Moon,
  cloudy: Cloud,
  rain: CloudRain,
  thunder: CloudLightning,
  snow: Snowflake,
  fog: Haze,
  wind: Wind,
  heat: Thermometer,
};
const SKY_NAMES = {
  "clear-day": "Sunny",
  "clear-night": "Moonlit",
  cloudy: "Cloudy",
  rain: "Rainy",
  thunder: "Stormy",
  snow: "Snowy",
  fog: "Misty",
  wind: "Breezy",
  heat: "Toasty",
};
const SKY_NOTES: Record<SceneKey, string> = {
  "clear-day": "A little sunshine looks good on you.",
  "clear-night": "Moonlight calls for one more layer.",
  cloudy: "Cloudy skies, cosy possibilities.",
  rain: "A rainy day can still be a good outfit day.",
  thunder: "Stay cosy inside until the storm passes.",
  snow: "Bundle up. It’s a hot-chocolate kind of day.",
  fog: "Soft skies. Something warm. Off you go.",
  wind: "Hold onto your hat (and your favourite layers).",
  heat: "Light fabrics, a shady spot, and plenty of water.",
};

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="page-loading" role="status">
          Putting your day together…
        </div>
      }
    >
      <DailyOutfit />
    </Suspense>
  );
}

function DailyOutfit() {
  const params = useSearchParams();
  const demo = params.get("demo") as SceneKey | null;
  const [preview, setPreview] = useState<SceneKey | null>(
    demo && DEMO_SCENE_KEYS.includes(demo) ? demo : "clear-day",
  );
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [query, setQuery] = useState<string | null>(null);
  const [lastCity, setLastCity] = useState<string | null>(null);
  const [rules, setRules] = useState<CustomOutfitRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unit, setUnit] = useState<"C" | "F">("C");
  const { forHer, toggleForHer } = useWardrobePreferences();
  const request = useRef<AbortController | null>(null);
  const locationRequest = useRef(0);
  const current = useMemo(
    () => (preview ? buildDemoWeather(preview) : weather),
    [preview, weather],
  );
  const recommendation = useMemo(
    () => (current ? getOutfitRecommendation(current, rules) : null),
    [current, rules],
  );
  const scene = getWeatherScene(current);
  const busy = loading || locating;
  useEffect(() => {
    setRules(getCustomOutfitRules());
    try {
      setLastCity(localStorage.getItem("ow:last-city"));
      setUnit(localStorage.getItem("ow:temperature-unit") === "F" ? "F" : "C");
    } catch {
      /* Storage is optional. */
    }
    return () => {
      request.current?.abort();
      locationRequest.current++;
    };
  }, []);
  const changeUnit = (next: "C" | "F") => {
    setUnit(next);
    try {
      localStorage.setItem("ow:temperature-unit", next);
    } catch {
      /* Session only. */
    }
  };
  const fetchWeather = useCallback(async (city: string) => {
    locationRequest.current++;
    setLocating(false);
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/weather?city=${encodeURIComponent(city)}`,
        { signal: controller.signal },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.error || "The forecast couldn’t load. Please try again.",
        );
      if (controller.signal.aborted) return;
      setWeather(result);
      setPreview(null);
      setQuery(city);
      setLastCity(result.location.name);
      try {
        localStorage.setItem("ow:last-city", result.location.name);
      } catch {
        /* Session only. */
      }
    } catch (cause) {
      if (!controller.signal.aborted)
        setError(
          cause instanceof Error
            ? cause.message
            : "The forecast couldn’t load. Please try again.",
        );
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);
  const useLocation = () => {
    if (!navigator.geolocation) {
      setError("Location isn’t supported here. Try searching for your city.");
      return;
    }
    const id = ++locationRequest.current;
    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (id === locationRequest.current)
          void fetchWeather(`${coords.latitude},${coords.longitude}`);
      },
      () => {
        if (id === locationRequest.current) {
          setLocating(false);
          setError(
            "We couldn’t find your location. Search for your city above.",
          );
        }
      },
      { timeout: 10000, maximumAge: 300000 },
    );
  };
  const chooseSky = (key: SceneKey) => {
    request.current?.abort();
    locationRequest.current++;
    setLoading(false);
    setLocating(false);
    setError(null);
    setPreview(key);
  };
  const temperature = (value: number) =>
    Math.round(unit === "C" ? value : (value * 9) / 5 + 32);
  return (
    <div className="diary-page">
      <section className="diary-intro" aria-labelledby="daily-title">
        <div>
          <span className="eyebrow">
            <span className="tiny-flower">✳︎</span> A LITTLE FORECAST. A LITTLE
            OUTFIT JOY.
          </span>
          <h1 id="daily-title">
            Good day. <em>Great outfit.</em>
          </h1>
          <p>Whatever the sky has planned, let’s get you dressed for it.</p>
        </div>
        <div className="find-weather">
          <SearchBar onSearch={fetchWeather} isLoading={busy} />
          <div className="search-options">
            <button type="button" onClick={useLocation} disabled={busy}>
              <LocateFixed size={14} />
              {locating ? "Finding you…" : "Use my location"}
            </button>
            {lastCity && (
              <button
                type="button"
                onClick={() => void fetchWeather(lastCity)}
                disabled={busy}
              >
                <MapPin size={13} />
                {lastCity}
                <ArrowRight size={12} />
              </button>
            )}
          </div>
        </div>
      </section>
      {error && (
        <div role="alert" className="diary-error">
          <CloudRain size={18} />
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}
      <div className="daily-grid">
        <aside className="weather-column" aria-label="Your weather">
          <section
            className="weather-postcard"
            data-sky={scene.key}
            aria-busy={busy}
          >
            <header>
              <span className="eyebrow">
                {preview ? "A LITTLE PREVIEW" : "YOUR LOCAL FORECAST"}
              </span>
              <span
                className="unit-picker"
                role="group"
                aria-label="Temperature unit"
              >
                {(["C", "F"] as const).map((value) => (
                  <button
                    type="button"
                    key={value}
                    aria-pressed={unit === value}
                    onClick={() => changeUnit(value)}
                  >
                    °{value}
                  </button>
                ))}
              </span>
            </header>
            <div className="weather-place">
              <MapPin size={15} />
              {preview ? "A little daydream" : current?.location.name}
              {!preview && query && (
                <button
                  type="button"
                  onClick={() => void fetchWeather(query)}
                  disabled={busy}
                  aria-label="Refresh weather"
                >
                  <RefreshCw
                    size={14}
                    className={loading ? "animate-spin" : ""}
                  />
                </button>
              )}
            </div>
            <WeatherMascot scene={scene.key} />
            <div className="weather-temperature">
              {current ? temperature(current.current.temp_c) : "—"}
              <span>°{unit}</span>
            </div>
            <h2>{current?.current.condition.text}</h2>
            <p className="weather-thought">{SKY_NOTES[scene.key]}</p>
            <div className="weather-metrics">
              <div>
                <Thermometer size={17} />
                <span>Feels like</span>
                <strong>
                  {current
                    ? temperature(
                        current.current.feelslike_c ?? current.current.temp_c,
                      )
                    : "—"}
                  °
                </strong>
              </div>
              <div>
                <Wind size={17} />
                <span>Wind</span>
                <strong>
                  {current?.current.wind_kph}
                  <small> km/h</small>
                </strong>
              </div>
              <div>
                <Droplets size={17} />
                <span>Humidity</span>
                <strong>
                  {current?.current.humidity}
                  <small>%</small>
                </strong>
              </div>
            </div>
            <span className="postcard-stamp">
              {preview
                ? "SAMPLE WEATHER · JUST FOR INSPIRATION"
                : "LIVE WEATHER · WEATHERAPI"}
            </span>
          </section>
          <section className="wardrobe-note">
            <span className="note-pin" aria-hidden="true">
              ✳︎
            </span>
            <span className="eyebrow">A NOTE BEFORE YOU GO</span>
            <h3>Comfort is always in style.</h3>
            <p>{recommendation?.description}</p>
            <span className="note-signoff">
              a little reminder, just for you ♡
            </span>
          </section>
        </aside>
        <section className="outfit-column" aria-labelledby="outfit-title">
          <div className="section-heading">
            <div>
              <span className="eyebrow">01 / THE DAILY DRESS-UP</span>
              <h2 id="outfit-title">
                Your forecast, <em>styled.</em>
              </h2>
            </div>
            <div
              className="wardrobe-switch"
              role="group"
              aria-label="Wardrobe collection"
            >
              <button
                type="button"
                aria-pressed={!forHer}
                onClick={() => {
                  if (forHer) toggleForHer();
                }}
              >
                Everyday
              </button>
              <button
                type="button"
                aria-pressed={forHer}
                onClick={() => {
                  if (!forHer) toggleForHer();
                }}
              >
                For her ♡
              </button>
            </div>
          </div>
          {current && recommendation && (
            <OutfitStudio
              key={`${preview ?? "live"}-${current.location.name}`}
              weather={current}
              base={recommendation}
              forHer={forHer}
              demo={Boolean(preview)}
              unit={unit}
              onUnitChange={changeUnit}
              isRefreshing={busy}
            />
          )}
        </section>
      </div>
      {current && <ForecastStrip weather={current} unit={unit} />}
      <section className="sky-section" aria-labelledby="sky-title">
        <header>
          <div>
            <span className="eyebrow">02 / DRESS FOR A DIFFERENT DAY</span>
            <h2 id="sky-title">
              A sky for <em>every mood.</em>
            </h2>
          </div>
          {preview && weather && (
            <button
              type="button"
              className="text-button"
              onClick={() => setPreview(null)}
            >
              Back to my forecast <ArrowRight size={15} />
            </button>
          )}
        </header>
        <div className="sky-choices">
          {DEMO_SCENE_KEYS.map((key) => {
            const Icon = SKY_ICONS[key];
            return (
              <button
                type="button"
                key={key}
                data-sky={key}
                aria-pressed={preview === key}
                onClick={() => chooseSky(key)}
              >
                <Icon size={25} strokeWidth={1.5} />
                <span>{SKY_NAMES[key]}</span>
                <small>
                  {temperature(buildDemoWeather(key).current.temp_c)}°
                </small>
              </button>
            );
          })}
        </div>
        <p>Play with sample weather, or search your city for the real thing.</p>
      </section>
      <div className="how-it-works">
        <span>
          <b>01</b> Find your sky
        </span>
        <i>✳︎</i>
        <span>
          <b>02</b> Make it your own
        </span>
        <i>✳︎</i>
        <span>
          <b>03</b> Save a little inspiration
        </span>
      </div>
    </div>
  );
}
