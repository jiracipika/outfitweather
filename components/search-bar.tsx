"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SearchIcon } from "lucide-react"

interface SearchBarProps {
  onSearch: (city: string) => void
  isLoading: boolean
}

export default function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [city, setCity] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (city.trim()) {
      onSearch(city.trim())
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-md items-center space-x-2 transition-all duration-300 ease-in-out"
    >
      <Input
        type="text"
        placeholder="Enter city name..."
        value={city}
        onChange={(e) => setCity(e.target.value)}
        className="flex-1 focus-visible:ring-primary"
        disabled={isLoading}
      />
      <Button type="submit" disabled={isLoading} className="hover:scale-105 transition-transform">
        <SearchIcon className="w-4 h-4 mr-2" />
        {isLoading ? "Searching..." : "Search"}
      </Button>
    </form>
  )
}
