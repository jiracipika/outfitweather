"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Droplets, LocateFixed, MapPin, RefreshCw, Thermometer, Wind, X } from "lucide-react";
import SearchBar from "@/components/search-bar";
import OutfitStudio from "@/components/outfit-studio";
import ForecastStrip from "@/components/forecast-strip";
import { ForecastIcon, SAMPLE_LABELS, WEATHER_ICONS } from "@/components/forecast-icons";
import { useWardrobePreferences } from "@/components/wardrobe-preferences";
import { asHourlyWeather, formatHour, formatTemperature, type TemperatureUnit } from "@/lib/forecast";
import { getOutfitRecommendation } from "@/lib/weather-utils";
import { getCustomOutfitRules } from "@/lib/local-storage-utils";
import { DEMO_SCENE_KEYS, buildDemoWeather, getWeatherScene, type SceneKey } from "@/lib/weather-scene";
import type { WeatherData, CustomOutfitRule, ForecastHour } from "@/lib/types";

type RecentPlace = { name: string; query: string };

function placeName({ name, region, country }: WeatherData["location"]) {
  return [...new Set([name, region, country].filter(Boolean))].join(", ");
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="page-frame page-loading" role="status">Loading the forecast…</div>}>
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
  const [lastRequest, setLastRequest] = useState<{ city: string; fromLocation: boolean } | null>(null);
  const [recent, setRecent] = useState<RecentPlace | null>(null);
  const [selectedHour, setSelectedHour] = useState<ForecastHour | null>(null);
  const [rules, setRules] = useState<CustomOutfitRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unit, setUnit] = useState<TemperatureUnit>("C");
  const { forHer, toggleForHer } = useWardrobePreferences();
  const request = useRef<AbortController | null>(null);
  const locationRequest = useRef(0);
  const current = useMemo(() => (preview ? buildDemoWeather(preview) : weather), [preview, weather]);
  const outfitWeather = useMemo(
    () => current && selectedHour ? asHourlyWeather(current, selectedHour) : current,
    [current, selectedHour],
  );
  const recommendation = useMemo(
    () => outfitWeather ? getOutfitRecommendation(outfitWeather, rules) : null,
    [outfitWeather, rules],
  );
  const busy = loading || locating;

  const fetchWeather = useCallback(async (city: string, fromLocation = false) => {
    locationRequest.current++;
    const coordinates = /^-?\d+(?:\.\d+)?,\s*-?\d+(?:\.\d+)?$/.test(city);
    setLocating(false);
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`, { signal: controller.signal });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Couldn’t load the forecast. Try again.");
      if (controller.signal.aborted) return;
      setWeather(result);
      setPreview(null);
      setSelectedHour(null);
      setLastRequest({ city, fromLocation });
      const nextRecent = { name: placeName(result.location), query: fromLocation || coordinates ? result.location.name : city };
      setRecent(nextRecent);
      try {
        localStorage.setItem("ow:last-city", result.location.name);
        localStorage.setItem("ow:last-place", JSON.stringify(nextRecent));
      } catch {
        // Keep the recent location for this session.
      }
    } catch (cause) {
      if (!controller.signal.aborted) {
        setError(cause instanceof Error ? cause.message : "Couldn’t load the forecast. Try again.");
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    setRules(getCustomOutfitRules());
    try {
      const lastCity = localStorage.getItem("ow:last-city");
      const saved = JSON.parse(localStorage.getItem("ow:last-place") ?? "null");
      const lastPlace = typeof saved?.query === "string" && typeof saved?.name === "string"
        ? { name: saved.name, query: saved.query }
        : lastCity ? { name: lastCity, query: lastCity } : null;
      setRecent(lastPlace);
      setUnit(localStorage.getItem("ow:temperature-unit") === "F" ? "F" : "C");
      if (demo && DEMO_SCENE_KEYS.includes(demo)) {
        setPreview(demo);
        setSelectedHour(null);
        setLoading(false);
        setLocating(false);
        setError(null);
      } else if (lastPlace) {
        void fetchWeather(lastPlace.query);
      }
    } catch {
      // Storage is optional. Sample forecasts remain available.
    }
    return () => {
      request.current?.abort();
      locationRequest.current++;
    };
  }, [demo, fetchWeather]);

  const useLocation = () => {
    if (!navigator.geolocation) {
      setError("Location isn’t supported here. Search for your city instead.");
      return;
    }
    const id = ++locationRequest.current;
    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (id === locationRequest.current) void fetchWeather(`${coords.latitude},${coords.longitude}`, true);
      },
      () => {
        if (id === locationRequest.current) {
          setLocating(false);
          setError("Couldn’t find your location. Search for your city instead.");
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
    setSelectedHour(null);
    setPreview(key);
  };

  const changeUnit = (next: TemperatureUnit) => {
    setUnit(next);
    try {
      localStorage.setItem("ow:temperature-unit", next);
    } catch {
      // Keep the unit for this session.
    }
  };
  const temp = (value: number) => formatTemperature(value, unit);
  const scene = getWeatherScene(current);
  const today = current?.forecast?.forecastday[0]?.day;
  const timeLabel = selectedHour
    ? `${selectedHour.time.slice(0, 10) !== current?.location.localtime?.slice(0, 10) && current?.location.localtime ? "Tomorrow, " : ""}${formatHour(selectedHour.time)}`
    : "Now";

  return (
    <div className="page-frame planner-page">
      <header className="planner-header">
        <div>
          <h1>Dress for the <em>day.</em></h1>
          <p>Weather and outfit ideas for wherever you’re headed.</p>
        </div>
        <div className="location-controls">
          <div className="location-actions">
            <SearchBar onSearch={fetchWeather} isLoading={busy} />
            <button type="button" className="locate-button" onClick={useLocation} disabled={busy} aria-label="Use my location" title="Use my location">
              <LocateFixed size={20} />
            </button>
          </div>
          <div className="location-secondary">
            {locating && <span role="status">Finding your location…</span>}
            {!locating && preview && recent && (
              <button type="button" onClick={() => void fetchWeather(recent.query)} disabled={busy}>
                <MapPin size={14} /> {recent.name}
              </button>
            )}
          </div>
        </div>
      </header>
      {error && (
        <div role="alert" className="planner-error">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} aria-label="Dismiss forecast error"><X size={18} /></button>
        </div>
      )}
      {current && outfitWeather && recommendation && (
        <div className="planner-grid">
          <div className="weather-column">
            <section className="weather-hero" data-sky={scene.key} aria-label="Current weather" aria-busy={busy}>
              <div className="weather-hero-top">
                <span className="weather-source"><span />{preview ? "Sample weather" : "Live weather"}</span>
                <div className="segmented weather-unit" role="group" aria-label="Temperature unit">
                  {(["C", "F"] as const).map((value) => (
                    <button type="button" key={value} aria-pressed={unit === value} onClick={() => changeUnit(value)}>°{value}</button>
                  ))}
                </div>
              </div>
              <div className="weather-hero-body">
                <div className="weather-place">
                  <MapPin size={16} aria-hidden="true" />
                  <span>{preview ? "Forecast preview" : placeName(current.location)}</span>
                  {!preview && lastRequest && (
                    <button type="button" onClick={() => void fetchWeather(lastRequest.city, lastRequest.fromLocation)} disabled={busy} aria-label="Refresh weather">
                      <RefreshCw size={15} aria-hidden="true" />
                    </button>
                  )}
                </div>
                <div className="weather-temperature">{temp(current.current.temp_c)}<span>°</span></div>
                <div className="weather-condition">
                  <ForecastIcon weather={current} size={22} />
                  <span>{current.current.condition.text}</span>
                </div>
                {today && <p className="weather-range">High {temp(today.maxtemp_c)}° · Low {temp(today.mintemp_c)}°</p>}
              </div>
              <dl className="weather-metrics">
                <div><dt><Thermometer size={16} /> Feels like</dt><dd>{temp(current.current.feelslike_c ?? current.current.temp_c)}°</dd></div>
                <div><dt><Wind size={16} /> Wind</dt><dd>{Math.round(current.current.wind_kph)} <small>km/h</small></dd></div>
                <div><dt><Droplets size={16} /> Humidity</dt><dd>{current.current.humidity}%</dd></div>
              </dl>
            </section>
            <ForecastStrip weather={current} unit={unit} selectedHour={selectedHour} onSelect={setSelectedHour} />
          </div>
          <OutfitStudio
            weather={outfitWeather}
            base={recommendation}
            forHer={forHer}
            onToggleCollection={toggleForHer}
            timeLabel={timeLabel}
            unit={unit}
            isRefreshing={busy}
          />
        </div>
      )}
      <section className="sample-section" aria-labelledby="samples-title">
        <header>
          <div>
            <h2 id="samples-title">Try a different forecast</h2>
            <p>See how your outfit changes in different weather.</p>
          </div>
          {preview && weather && (
            <button type="button" className="text-button" onClick={() => { setPreview(null); setSelectedHour(null); }}>
              Back to live forecast <ArrowRight size={16} />
            </button>
          )}
        </header>
        <div className="sample-choices" role="group" aria-label="Sample weather conditions">
          {DEMO_SCENE_KEYS.map((key) => {
            const Icon = WEATHER_ICONS[key];
            return (
              <button type="button" key={key} aria-pressed={preview === key} onClick={() => chooseSky(key)}>
                <Icon size={18} strokeWidth={1.7} aria-hidden="true" /> {SAMPLE_LABELS[key]}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
