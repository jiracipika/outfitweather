"use client";

import { useState } from "react";
import { ArrowDown, CloudRain, Snowflake } from "lucide-react";
import type { ForecastHour, WeatherData } from "@/lib/types";
import { asHourlyWeather, forecastHourKey, formatHour, formatTemperature, type TemperatureUnit } from "@/lib/forecast";
import { getUpcomingHours } from "@/lib/outfit-styling";
import { ForecastIcon } from "./forecast-icons";

const weekday = new Intl.DateTimeFormat("en-CA", { weekday: "short", timeZone: "UTC" });

export default function ForecastStrip({
  weather,
  unit,
  selectedHour,
  onSelect,
}: {
  weather: WeatherData;
  unit: TemperatureUnit;
  selectedHour: ForecastHour | null;
  onSelect: (hour: ForecastHour | null) => void;
}) {
  const [view, setView] = useState<"hours" | "days">("hours");
  const days = weather.forecast?.forecastday ?? [];
  if (!days.length) return null;
  const hours = getUpcomingHours(weather, false).slice(0, 12);
  const showTemp = (value: number) => `${formatTemperature(value, unit)}°`;
  const selectHour = (hour: ForecastHour | null) => {
    onSelect(hour);
    if (window.matchMedia("(max-width: 900px)").matches) {
      const heading = document.getElementById("outfit-title");
      heading?.focus({ preventScroll: true });
      heading?.scrollIntoView({ block: "start" });
    }
  };

  return (
    <section className="forecast-card" aria-labelledby="forecast-title">
      <header className="forecast-header">
        <h2 id="forecast-title">Forecast</h2>
        <div className="segmented" role="group" aria-label="Forecast view">
          <button type="button" aria-pressed={view === "hours"} onClick={() => setView("hours")}>Hourly</button>
          <button type="button" aria-pressed={view === "days"} onClick={() => setView("days")}>{days.length} {days.length === 1 ? "day" : "days"}</button>
        </div>
      </header>
      {view === "hours" ? (
        <>
          <p className="forecast-hint">{hours.length ? "Pick an hour to plan your outfit." : "No more hourly forecasts are available."}</p>
          <div className="hour-strip" role="group" aria-label="Plan for an hour" data-swipe-ignore>
            <button type="button" aria-pressed={!selectedHour} onClick={() => selectHour(null)}>
              <span>Now</span>
              <ForecastIcon weather={weather} />
              <strong>{showTemp(weather.current.temp_c)}</strong>
            </button>
            {hours.map((hour) => {
              const key = forecastHourKey(hour);
              const nextDay = hour.time.slice(0, 10) !== (weather.location.localtime ?? days[0].date).slice(0, 10);
              const time = formatHour(hour.time);
              const rain = hour.chance_of_rain ?? 0;
              const snow = hour.chance_of_snow ?? 0;
              const chance = Math.max(rain, snow);
              const PrecipIcon = snow > rain ? Snowflake : CloudRain;
              return (
                <button
                  type="button"
                  key={key}
                  aria-label={`${nextDay ? "Tomorrow, " : ""}${time}, ${showTemp(hour.temp_c)}${unit}, ${hour.condition.text}${chance > 0 ? `, ${chance}% chance of ${snow > rain ? "snow" : "rain"}` : ""}`}
                  aria-pressed={selectedHour !== null && forecastHourKey(selectedHour) === key}
                  onClick={() => selectHour(hour)}
                >
                  <span>{time}{nextDay && <small>Tomorrow</small>}</span>
                  <ForecastIcon weather={asHourlyWeather(weather, hour)} />
                  <strong>{showTemp(hour.temp_c)}</strong>
                  {chance > 0 && <small className="forecast-precip"><PrecipIcon size={11} /> {chance}%</small>}
                </button>
              );
            })}
          </div>
          <a className="forecast-mobile-link" href="#outfit-title">View outfit <ArrowDown size={14} /></a>
        </>
      ) : (
        <ul className="forecast-days">
          {days.map(({ date, day }, index) => (
            <li key={date}>
              <strong>{index === 0 ? "Today" : index === 1 ? "Tomorrow" : weekday.format(new Date(date))}</strong>
              <ForecastIcon weather={{ ...weather, current: { ...weather.current, condition: day.condition, is_day: 1, temp_c: day.maxtemp_c, wind_kph: 0 } }} size={21} />
              <span title={day.condition.text}>{day.condition.text}</span>
              <span aria-label={`Low ${showTemp(day.mintemp_c)}${unit}, high ${showTemp(day.maxtemp_c)}${unit}`}>
                {showTemp(day.mintemp_c)} <b>{showTemp(day.maxtemp_c)}</b>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
