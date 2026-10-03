import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getOutfitRecommendation } from '../lib/weather-utils.ts';

const weather = (over = {}) => ({
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
  const bands = [
    [-5, 'Freezing'],
    [2, 'Very Cold'],
    [7, 'Cold'],
    [12, 'Cool'],
    [17, 'Mild'],
    [22, 'Warm'],
    [27, 'Hot'],
    [33, 'Very Hot'],
  ];
  for (const [temp, summary] of bands) it(temp + '°C reads as ' + summary, () => {
    const r = getOutfitRecommendation(weather({ temp_c: temp }));
    assert.equal(r.conditionSummary, summary);
  });

  it('band boundaries use >= min and < max (0°C is Very Cold, not Freezing)', () => {
    assert.equal(getOutfitRecommendation(weather({ temp_c: 0 })).conditionSummary, 'Very Cold');
    assert.equal(getOutfitRecommendation(weather({ temp_c: -0.5 })).conditionSummary, 'Freezing');
  });
});

describe('getOutfitRecommendation — precipitation (drizzle IS rain)', () => {
  it('drizzle triggers umbrella advice (regression: WeatherAPI drizzle texts lack "rain")', () => {
    const r = getOutfitRecommendation(
      weather({ temp_c: 18, precip_mm: 0.4, condition: { text: 'Light drizzle', icon: '', code: 1150 } }),
    );
    assert.ok((r.description).includes('umbrella'));
    assert.equal(r.conditionSummary, 'Rainy');
  });

  it('explicit rain does too (waterproof-layer advice)', () => {
    const r = getOutfitRecommendation(weather({ temp_c: 12, precip_mm: 2, condition: { text: 'Moderate rain' } }));
    assert.equal(r.emoji, '☔');
    assert.ok((r.description).includes('waterproof layer'));
  });

  it('snow overrides rain wording, advising grippy footwear', () => {
    const r = getOutfitRecommendation(weather({ temp_c: -3, precip_mm: 1.5, condition: { text: 'Moderate snow' } }));
    assert.ok((r.description).includes('grip for the snow'));
    assert.equal(r.conditionSummary, 'Snowy');
  });

  it('no precipitation: no umbrella talk', () => {
    const r = getOutfitRecommendation(weather({ temp_c: 12, condition: { text: 'Overcast' } }));
    assert.ok(!(r.description).includes('umbrella'));
  });
});

describe('getOutfitRecommendation — wind', () => {
  it('over 20 kph stacks the wind suffix on the summary and emoji', () => {
    const r = getOutfitRecommendation(weather({ temp_c: 18, wind_kph: 30 }));
    assert.equal(r.conditionSummary, 'Mild and Windy');
    assert.ok((r.emoji).includes('💨'));
  });

  it('at or under 20 kph there is no wind suffix', () => {
    assert.equal(getOutfitRecommendation(weather({ wind_kph: 20 })).conditionSummary, 'Mild');
    assert.equal(getOutfitRecommendation(weather({ wind_kph: 19.9 })).conditionSummary, 'Mild');
  });

  it('rain + wind compose: umbrella advice AND windy summary', () => {
    const r = getOutfitRecommendation(weather({ temp_c: 12, precip_mm: 2, wind_kph: 28, condition: { text: 'Rain' } }));
    assert.equal(r.conditionSummary, 'Rainy and Windy');
    assert.ok((r.description).includes('umbrella'));
  });
});

describe('getOutfitRecommendation — custom rules', () => {
  it('a matching custom rule overrides the default band entirely', () => {
    const r = getOutfitRecommendation(weather({ temp_c: 22 }), [
      { id: 'r1', name: 'Laundry day', minTemp: 15, maxTemp: 30, emoji: '🧺', description: 'Wear the laundry pile.' },
    ]);
    assert.equal(r.emoji, '🧺');
    assert.equal(r.conditionSummary, 'Laundry day');
  });

  it('condition fields are wildcards when undefined; set fields must match', () => {
    const rain = weather({ temp_c: 22, precip_mm: 2, condition: { text: 'Rain' } });
    // isRaining: true matches the rainy weather -> rule applies.
    const matched = getOutfitRecommendation(rain, [
      { id: 'r2', name: 'Rain dance', isRaining: true, emoji: '🕺', description: 'Dance in it.' },
    ]);
    assert.equal(matched.conditionSummary, 'Rain dance');
    // isRaining: false must NOT apply while raining -> default rainy advice.
    const unmatched = getOutfitRecommendation(rain, [
      { id: 'r3', name: 'Sun hat', isRaining: false, emoji: '👒', description: 'Sun hat time.' },
    ]);
    assert.equal(unmatched.conditionSummary, 'Rainy');
  });
});
