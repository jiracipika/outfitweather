import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const city = searchParams.get("city")

  if (!city) {
    return NextResponse.json({ error: "City parameter is required" }, { status: 400 })
  }

  const apiKey = process.env.WEATHERAPI_API_KEY
  if (!apiKey) {
    console.error("WEATHERAPI_API_KEY is not set")
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
  }

  try {
    const response = await fetch(`http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=no`)

    if (!response.ok) {
      const errorData = await response.json()
      console.error("WeatherAPI error:", errorData)
      return NextResponse.json(
        { error: errorData.error.message || "Failed to fetch weather data" },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching weather:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
