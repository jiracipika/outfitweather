"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

const Preferences = createContext({ forHer: false, motion: true, toggleForHer: () => {}, toggleMotion: () => {} })

export function WardrobePreferences({ children }: { children: ReactNode }) {
  const [forHer, setForHer] = useState(false)
  const [motion, setMotion] = useState(true)
  useEffect(() => {
    try {
      setForHer(localStorage.getItem("ow:for-her") === "true")
      setMotion(localStorage.getItem("ow:motion") !== "off")
    } catch { /* Browser storage is optional. */ }
  }, [])
  const toggleForHer = () => {
    const next = !forHer
    setForHer(next)
    try { localStorage.setItem("ow:for-her", String(next)) } catch { /* Keep in memory. */ }
  }
  const toggleMotion = () => {
    const next = !motion
    setMotion(next)
    try { localStorage.setItem("ow:motion", next ? "on" : "off") } catch { /* Keep in memory. */ }
  }
  return <Preferences.Provider value={{ forHer, motion, toggleForHer, toggleMotion }}>
    <div className="wardrobe-app" data-for-her={forHer} data-motion={motion ? "on" : "off"}>{children}</div>
  </Preferences.Provider>
}

export const useWardrobePreferences = () => useContext(Preferences)
