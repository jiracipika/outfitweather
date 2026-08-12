import { NextResponse } from "next/server"

const WEATHER_API_URL = "https://api.weatherapi.com/v1/current.json"
const REQUEST_TIMEOUT_MS = 8_000

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const city = searchParams.get("city")?.trim()

  if (!city) {
    return NextResponse.json({ error: "City parameter is required" }, { status: 400 })
  }

  // Keep requests bounded and reject control characters before sending user input upstream.
  if (city.length > 100 || /[\u0000-\u001F\u007F]/.test(city)) {
    return NextResponse.json({ error: "Enter a valid city name" }, { status: 400 })
  }

  const apiKey = process.env.WEATHERAPI_API_KEY
  if (!apiKey) {
    console.error("WEATHERAPI_API_KEY is not set")
    return NextResponse.json({ error: "Weather service is unavailable" }, { status: 503 })
  }

  const url = new URL(WEATHER_API_URL)
  url.search = new URLSearchParams({ key: apiKey, q: city, aqi: "no" }).toString()

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: "no-store",
    })

    if (!response.ok) {
      const errorData: unknown = await response.json().catch(() => null)
      const message =
        typeof errorData === "object" &&
        errorData !== null &&
        "error" in errorData &&
        typeof errorData.error === "object" &&
        errorData.error !== null &&
        "message" in errorData.error &&
        typeof errorData.error.message === "string"
          ? errorData.error.message
          : "Unable to fetch weather data"

      return NextResponse.json({ error: message }, { status: response.status })
    }

    return NextResponse.json(await response.json(), {
      headers: { "Cache-Control": "no-store" },
    })
  } catch (error) {
    console.error("Weather request failed", error instanceof Error ? error.name : "unknown error")
    const message = error instanceof DOMException && error.name === "TimeoutError" ? "Weather request timed out" : "Weather service is unavailable"
    return NextResponse.json({ error: message }, { status: 503 })
  }
}
