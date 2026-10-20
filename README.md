# Outfit Weather

A cheerful daily outfit diary: find your forecast, build a weather-ready look, and save your favourites. Built with Next.js 15, React 19, TypeScript, Tailwind CSS, and Motion.

## The daily diary

- **Your forecast:** Search a city or use browser location for live conditions, the next 12 hours, and a three-day outlook from WeatherAPI. Celsius/Fahrenheit and your last city are remembered in this browser.
- **A little dress-up:** Everyday and For her collections, three occasions, four colour palettes, personal warmth preferences, and an outfit remixer. Illustrated garments follow the actual recommendation, including wet-weather and cold-weather protection.
- **Saved looks:** Keep illustrated outfits in a personal browser-local collection. Existing favourites and wardrobe preferences remain compatible.
- **Wardrobe notes:** Add personal clothing advice for temperature ranges, rain, snow, and wind. “Any” is a wildcard; the first matching note supplies the advice. Notes do not replace the illustrated outfit’s weather protection.
- **Sample skies:** Nine explicitly labelled sample forecasts work without an API key. The home page opens with a sunny sample; search or use location to switch to live weather.
- **A softer interface:** Cream, blush, and lavender stationery, a local SVG cloud mascot, responsive layouts, keyboard focus states, a skip link, and an animation toggle. System reduced-motion preferences are respected.

## Run locally

Use Node.js 22 or later and pnpm.

```sh
git clone https://github.com/jiracipika/outfitweather.git
cd outfitweather
pnpm install --frozen-lockfile
```

For live weather, create `.env.local`:

```dotenv
WEATHERAPI_API_KEY=your_weatherapi_key
```

The key stays on the server. Never commit `.env.local`. Without a key, the sample forecasts still work and live searches show a service-unavailable message.

```sh
pnpm dev
```

Open http://localhost:3000. To start directly with another sample, use a URL such as `/?demo=rain` or `/?demo=snow`.

## Validate

```sh
pnpm run check
pnpm run test:outfits
pnpm run build
```

CI runs type checking, the recommendation tests, and a production build on pull requests. Browser-local data does not sync across devices and is removed if site storage is cleared.

## Deployment

The existing [Vercel project](https://vercel.com/jiracipikas-projects/v0-weather-wear-app) and [v0 project](https://v0.dev/chat/projects/Z28FYxZ60sw) remain the deployment integrations. Set `WEATHERAPI_API_KEY` in the hosting environment for live weather. Geolocation requires HTTPS or localhost and the visitor’s permission.
