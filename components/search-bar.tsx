"use client"

import { useState, type FormEvent } from "react"
import { ArrowRight, Search } from "lucide-react"

interface SearchBarProps {
  onSearch: (city: string) => void
  isLoading: boolean
}

export default function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [city, setCity] = useState("")
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (city.trim()) onSearch(city.trim())
  }
  return (
    <form onSubmit={handleSubmit} role="search" className="ow-search flex min-w-0 flex-1 items-center gap-2">
      <Search size={19} className="shrink-0 text-white/70" aria-hidden="true" />
      <label className="sr-only" htmlFor="city-search">City name</label>
      <input id="city-search" type="search" autoComplete="address-level2" placeholder="Search a city…" value={city} onChange={(e) => setCity(e.target.value)} disabled={isLoading} maxLength={100} className="min-w-0 flex-1 bg-transparent text-white placeholder:text-white/65 focus:outline-none" />
      <button type="submit" disabled={isLoading || !city.trim()} className="ow-search-submit" aria-label="Get weather forecast"><ArrowRight size={19} /></button>
    </form>
  )
}
