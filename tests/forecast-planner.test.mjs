import assert from "node:assert/strict";
import test from "node:test";
import { asHourlyWeather } from "../lib/forecast.ts";
import { buildStyledLook, getUpcomingHours } from "../lib/outfit-styling.ts";
import { DEMO_SCENE_KEYS, buildDemoWeather } from "../lib/weather-scene.ts";

test("every sample has three forecast days and 12 selectable hours", () => {
  for (const scene of DEMO_SCENE_KEYS) {
    const weather = buildDemoWeather(scene);
    assert.equal(weather.forecast.forecastday.length, 3);
    const hours = getUpcomingHours(weather, false).slice(0, 12);
    assert.equal(hours.length, 12);
    assert.ok(hours[0].time > weather.location.localtime);
  }
});

test("hourly results exclude past or current hours using city-local time", () => {
  const weather = buildDemoWeather("clear-day");
  weather.location.localtime = "2026-06-08 9:30";
  assert.equal(getUpcomingHours(weather, false)[0].time, "2026-06-08 10:00");
  weather.location.localtime = "2026-06-08 23:15";
  assert.equal(getUpcomingHours(weather, false)[0].time, "2026-06-09 00:00");
});

test("epochs distinguish the repeated clock hour when daylight saving ends", () => {
  const weather = buildDemoWeather("clear-day");
  weather.location.localtime = "2026-11-01 01:30";
  weather.location.localtime_epoch = 150;
  weather.forecast.forecastday[0].hour = [
    { time: "2026-11-01 01:00", time_epoch: 100 },
    { time: "2026-11-01 01:00", time_epoch: 200 },
  ];
  assert.equal(getUpcomingHours(weather, false)[0].time_epoch, 200);
});

test("selecting an hour uses its own conditions and ignores earlier rain", () => {
  const weather = buildDemoWeather("rain");
  const dryHour = getUpcomingHours(weather, false).find((hour) => hour.chance_of_rain === 0);
  const laterWeather = asHourlyWeather(weather, dryHour);
  assert.equal(laterWeather.location.localtime, dryHour.time);
  assert.equal(laterWeather.current.precip_mm, 0);
  assert.equal(laterWeather.current.wind_kph, dryHour.wind_kph);
  assert.doesNotMatch(buildStyledLook(laterWeather, false, "work", "auto").note, /weatherproof/);
  assert.match(buildStyledLook(weather, false, "work", "auto").note, /weatherproof/);
});
