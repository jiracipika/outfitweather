# Outfit Weather

Plan what to wear with a local forecast and an illustrated outfit planner. Built with Next.js 15, React 19, TypeScript, Tailwind CSS, and Motion.

## How it works

- **Today:** Search by city or use your location. See current conditions, the next 12 hours, and up to three days of forecasts from WeatherAPI. Choose an hour to plan a look for that time. The app restores your last location and temperature unit.
- **Outfit planner:** Choose Everyday or For her, set the occasion, adjust warmth, and pick a colour palette. For her also offers a silhouette preference. Remix the outfit to see other pieces suited to the conditions.
- **Lookbook:** Save illustrated outfits and download or restore a JSON backup of your looks and wardrobe notes. Data stays in this browser until you export it.
- **Wardrobe:** Add personal advice for temperature ranges, rain, snow, and wind. The first matching note appears under “Why this outfit?”
- **Sample forecasts:** Try nine labelled samples with hourly and daily forecasts. Samples work without an API key and can be opened directly using `?demo=rain` or another sample name.

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

CI checks types, forecast and outfit logic, backup compatibility, and the production build.

## Deployment

The existing [Vercel project](https://vercel.com/jiracipikas-projects/v0-weather-wear-app) and [v0 project](https://v0.dev/chat/projects/Z28FYxZ60sw) remain the deployment integrations. Set `WEATHERAPI_API_KEY` in the hosting environment for live weather. Geolocation requires HTTPS or localhost and the visitor’s permission.
