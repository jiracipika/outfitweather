"use client"

import Link from "next/link"
import { Sun, Heart, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "./mode-toggle"

export default function Navbar() {
  return (
    <header className="flex items-center justify-between h-16 px-4 border-b bg-background text-foreground shadow-sm md:px-6">
      <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-primary">
        <Sun className="w-6 h-6 text-yellow-500" />
        <span className="sr-only">WeatherWear</span>
        <span className="hidden md:inline">WeatherWear</span>
      </Link>
      <nav className="flex items-center gap-4 sm:gap-6">
        <Button variant="ghost" asChild className="text-foreground hover:bg-accent hover:text-accent-foreground">
          <Link href="/">
            <Sun className="w-5 h-5 mr-2" />
            Home
          </Link>
        </Button>
        <Button variant="ghost" asChild className="text-foreground hover:bg-accent hover:text-accent-foreground">
          <Link href="/favorites">
            <Heart className="w-5 h-5 mr-2" />
            Favorites
          </Link>
        </Button>
        <Button variant="ghost" asChild className="text-foreground hover:bg-accent hover:text-accent-foreground">
          <Link href="/customize">
            <Settings className="w-5 h-5 mr-2" />
            Customize
          </Link>
        </Button>
        <ModeToggle />
      </nav>
    </header>
  )
}
