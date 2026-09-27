import { describe, expect, it } from 'vitest';
import { getOutfitRecommendation } from '../lib/weather-utils';
import type { WeatherData } from '../lib/types';

const weather = (over: Partial<WeatherData['current']> = {}): WeatherData => ({
  location: { name: 'Toronto', region: 'Ontario', country: 'Canada' },
  current: {
    temp_c: 18,
    condition: { text: 'Partly cloudy', icon: '', code: 1003 },
    humidity: 50,
    wind_kph: 10,
    is_day: 1,
    precip_mm: 0,
    ...over,
  },
});

describe('getOutfitRecommendation — temperature bands', () => {
  const bands: [number, string][] = [
    [-5, 'Freezing'],
    [2, 'Very Cold'],
    [7, 'Cold'],
    [12, 'Cool'],
    [17, 'Mild'],
    [22, 'Warm'],
    [27, 'Hot'],
    [33, 'Very Hot'],
  ];
  it.each(bands)('%i°C reads as %s', (temp, summary) => {
    const r = getOutfitRecommendation(weather({ temp_c: temp }));
    expect(r.conditionSummary).toBe(summary);
  });

  it('band boundaries use >= min and < max (0°C is Very Cold, not Freezing)', () => {
    expect(getOutfitRecommendation(weather({ temp_c: 0 })).conditionSummary).toBe('Very Cold');
    expect(getOutfitRecommendation(weather({ temp_c: -0.5 })).conditionSummary).toBe('Freezing');
  });
});

describe('getOutfitRecommendation — precipitation (drizzle IS rain)', () => {
  it('drizzle triggers umbrella advice (regression: WeatherAPI drizzle texts lack "rain")', () => {
    const r = getOutfitRecommendation(
      weather({ temp_c: 18, precip_mm: 0.4, condition: { text: 'Light drizzle', icon: '', code: 1150 } }),
    );
    expect(r.description).toContain('umbrella');
    expect(r.conditionSummary).toBe('Rainy');
  });

  it('explicit rain does too (waterproof-layer advice)', () => {
    const r = getOutfitRecommendation(weather({ temp_c: 12, precip_mm: 2, condition: { text: 'Moderate rain' } }));
    expect(r.emoji).toBe('☔');
    expect(r.description).toContain('waterproof layer');
  });

  it('snow overrides rain wording, advising grippy footwear', () => {
    const r = getOutfitRecommendation(weather({ temp_c: -3, precip_mm: 1.5, condition: { text: 'Moderate snow' } }));
    expect(r.description).toContain('grip for the snow');
    expect(r.conditionSummary).toBe('Snowy');
  });

  it('no precipitation: no umbrella talk', () => {
    const r = getOutfitRecommendation(weather({ temp_c: 12, condition: { text: 'Overcast' } }));
    expect(r.description).not.toContain('umbrella');
  });
});

describe('getOutfitRecommendation — wind', () => {
  it('over 20 kph stacks the wind suffix on the summary and emoji', () => {
    const r = getOutfitRecommendation(weather({ temp_c: 18, wind_kph: 30 }));
    expect(r.conditionSummary).toBe('Mild and Windy');
    expect(r.emoji).toContain('💨');
  });

  it('at or under 20 kph there is no wind suffix', () => {
    expect(getOutfitRecommendation(weather({ wind_kph: 20 })).conditionSummary).toBe('Mild');
    expect(getOutfitRecommendation(weather({ wind_kph: 19.9 })).conditionSummary).toBe('Mild');
  });

  it('rain + wind compose: umbrella advice AND windy summary', () => {
    const r = getOutfitRecommendation(weather({ temp_c: 12, precip_mm: 2, wind_kph: 28, condition: { text: 'Rain' } }));
    expect(r.conditionSummary).toBe('Rainy and Windy');
    expect(r.description).toContain('umbrella');
  });
});

describe('getOutfitRecommendation — custom rules', () => {
  it('a matching custom rule overrides the default band entirely', () => {
    const r = getOutfitRecommendation(weather({ temp_c: 22 }), [
      { id: 'r1', name: 'Laundry day', minTemp: 15, maxTemp: 30, emoji: '🧺', description: 'Wear the laundry pile.' },
    ]);
    expect(r.emoji).toBe('🧺');
    expect(r.conditionSummary).toBe('Laundry day');
  });

  it('condition fields are wildcards when undefined; set fields must match', () => {
    const rain = weather({ temp_c: 22, precip_mm: 2, condition: { text: 'Rain' } });
    // isRaining: true matches the rainy weather -> rule applies.
    const matched = getOutfitRecommendation(rain, [
      { id: 'r2', name: 'Rain dance', isRaining: true, emoji: '🕺', description: 'Dance in it.' },
    ]);
    expect(matched.conditionSummary).toBe('Rain dance');
    // isRaining: false must NOT apply while raining -> default rainy advice.
    const unmatched = getOutfitRecommendation(rain, [
      { id: 'r3', name: 'Sun hat', isRaining: false, emoji: '👒', description: 'Sun hat time.' },
    ]);
    expect(unmatched.conditionSummary).toBe('Rainy');
  });
});
