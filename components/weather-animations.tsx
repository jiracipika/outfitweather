"use client"

import { useEffect, useState } from "react"
import type { WeatherData } from "@/lib/types"

interface WeatherAnimationsProps {
  weather: WeatherData | null
}

export default function WeatherAnimations({ weather }: WeatherAnimationsProps) {
  const [animationType, setAnimationType] = useState<string | null>(null)

  useEffect(() => {
    if (!weather) {
      setAnimationType(null)
      return
    }

    const conditionCode = weather.current.condition.code
    const conditionText = weather.current.condition.text.toLowerCase()
    const temp = weather.current.temp_c
    const windSpeed = weather.current.wind_kph

    // Determine animation type based on weather conditions
    if (
      conditionText.includes("rain") ||
      conditionText.includes("drizzle") ||
      [1063, 1072, 1150, 1153, 1180, 1183, 1186, 1189, 1192, 1195, 1198, 1201, 1240, 1243, 1246].includes(conditionCode)
    ) {
      setAnimationType("rain")
    } else if (
      conditionText.includes("snow") ||
      conditionText.includes("sleet") ||
      [1066, 1069, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225, 1237, 1255, 1258, 1261, 1264].includes(conditionCode)
    ) {
      setAnimationType("snow")
    } else if (
      conditionText.includes("fog") ||
      conditionText.includes("mist") ||
      [1030, 1135, 1147].includes(conditionCode)
    ) {
      setAnimationType("fog")
    } else if (
      conditionText.includes("thunder") ||
      conditionText.includes("storm") ||
      [1087, 1273, 1276, 1279, 1282].includes(conditionCode)
    ) {
      setAnimationType("thunder")
    } else if (windSpeed > 25) {
      setAnimationType("wind")
    } else if (temp > 30) {
      setAnimationType("heat")
    } else if (conditionCode === 1000 && weather.current.is_day === 1) {
      setAnimationType("sunny")
    } else if ([1003, 1006, 1009].includes(conditionCode)) {
      setAnimationType("clouds")
    } else {
      setAnimationType(null)
    }
  }, [weather])

  if (!animationType) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {animationType === "rain" && <RainAnimation />}
      {animationType === "snow" && <SnowAnimation />}
      {animationType === "fog" && <FogAnimation />}
      {animationType === "thunder" && <ThunderAnimation />}
      {animationType === "wind" && <WindAnimation />}
      {animationType === "heat" && <HeatAnimation />}
      {animationType === "sunny" && <SunnyAnimation />}
      {animationType === "clouds" && <CloudsAnimation />}
    </div>
  )
}

function RainAnimation() {
  return (
    <div className="rain-container">
      {[...Array(100)].map((_, i) => (
        <div
          key={i}
          className="raindrop"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${0.5 + Math.random() * 0.5}s`,
          }}
        />
      ))}
      <style jsx>{`
        .rain-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        .raindrop {
          position: absolute;
          top: -10px;
          width: 2px;
          height: 20px;
          background: linear-gradient(to bottom, rgba(174, 194, 224, 0.6), rgba(174, 194, 224, 0.3));
          border-radius: 0 0 2px 2px;
          animation: fall linear infinite;
        }
        @keyframes fall {
          0% {
            transform: translateY(-10px);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh);
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  )
}

function SnowAnimation() {
  return (
    <div className="snow-container">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="snowflake"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 2}s`,
            fontSize: `${0.8 + Math.random() * 0.4}rem`,
          }}
        >
          ❄
        </div>
      ))}
      <style jsx>{`
        .snow-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        .snowflake {
          position: absolute;
          top: -10px;
          color: rgba(255, 255, 255, 0.8);
          animation: snowfall linear infinite;
          user-select: none;
        }
        @keyframes snowfall {
          0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  )
}

function FogAnimation() {
  return (
    <div className="fog-container">
      <div className="fog-layer fog-1" />
      <div className="fog-layer fog-2" />
      <div className="fog-layer fog-3" />
      <style jsx>{`
        .fog-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        .fog-layer {
          position: absolute;
          width: 200%;
          height: 100%;
          background: linear-gradient(90deg, 
            transparent 0%, 
            rgba(200, 200, 200, 0.1) 25%, 
            rgba(200, 200, 200, 0.2) 50%, 
            rgba(200, 200, 200, 0.1) 75%, 
            transparent 100%
          );
          animation: drift linear infinite;
        }
        .fog-1 {
          animation-duration: 20s;
          top: 20%;
        }
        .fog-2 {
          animation-duration: 25s;
          top: 40%;
          animation-direction: reverse;
        }
        .fog-3 {
          animation-duration: 30s;
          top: 60%;
        }
        @keyframes drift {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(0%);
          }
        }
      `}</style>
    </div>
  )
}

function ThunderAnimation() {
  return (
    <div className="thunder-container">
      <div className="lightning" />
      <style jsx>{`
        .thunder-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        .lightning {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.1);
          animation: flash 3s infinite;
        }
        @keyframes flash {
          0%, 90%, 100% {
            opacity: 0;
          }
          5%, 10% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

function WindAnimation() {
  return (
    <div className="wind-container">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="wind-line"
          style={{
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${1 + Math.random() * 1}s`,
          }}
        />
      ))}
      <style jsx>{`
        .wind-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        .wind-line {
          position: absolute;
          left: -20px;
          width: 40px;
          height: 2px;
          background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.3), transparent);
          animation: blow linear infinite;
        }
        @keyframes blow {
          0% {
            transform: translateX(-20px);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateX(100vw);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

function HeatAnimation() {
  return (
    <div className="heat-container">
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="heat-wave"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}
      <style jsx>{`
        .heat-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        .heat-wave {
          position: absolute;
          bottom: 0;
          width: 4px;
          height: 100px;
          background: linear-gradient(to top, 
            rgba(255, 165, 0, 0.3) 0%, 
            rgba(255, 69, 0, 0.2) 50%, 
            transparent 100%
          );
          animation: shimmer 2s ease-in-out infinite;
          filter: blur(1px);
        }
        @keyframes shimmer {
          0%, 100% {
            transform: scaleY(1) scaleX(1);
            opacity: 0.3;
          }
          50% {
            transform: scaleY(1.2) scaleX(1.5);
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  )
}

function SunnyAnimation() {
  return (
    <div className="sunny-container">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="sun-ray"
          style={{
            transform: `rotate(${i * 45}deg)`,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
      <style jsx>{`
        .sunny-container {
          position: absolute;
          top: 10%;
          right: 10%;
          width: 100px;
          height: 100px;
        }
        .sun-ray {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 2px;
          height: 30px;
          background: linear-gradient(to top, transparent, rgba(255, 215, 0, 0.6));
          transform-origin: 0 0;
          animation: rotate 4s linear infinite;
        }
        @keyframes rotate {
          0% {
            transform: rotate(0deg) scaleY(1);
          }
          50% {
            transform: rotate(180deg) scaleY(1.2);
          }
          100% {
            transform: rotate(360deg) scaleY(1);
          }
        }
      `}</style>
    </div>
  )
}

function CloudsAnimation() {
  return (
    <div className="clouds-container">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="cloud"
          style={{
            top: `${10 + i * 15}%`,
            animationDelay: `${i * 2}s`,
            animationDuration: `${20 + i * 5}s`,
          }}
        >
          ☁️
        </div>
      ))}
      <style jsx>{`
        .clouds-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        .cloud {
          position: absolute;
          left: -100px;
          font-size: 2rem;
          opacity: 0.6;
          animation: float linear infinite;
          user-select: none;
        }
        @keyframes float {
          0% {
            transform: translateX(-100px);
          }
          100% {
            transform: translateX(calc(100vw + 100px));
          }
        }
      `}</style>
    </div>
  )
}
