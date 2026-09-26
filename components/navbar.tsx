"use client"

import Link from "next/link"
import { CloudSun, Heart, SlidersHorizontal } from "lucide-react"
import { usePathname } from "next/navigation"
import { ModeToggle } from "./mode-toggle"

export default function Navbar() {
  const pathname = usePathname()
  const links = [
    { href: "/", label: "Forecast", icon: CloudSun },
    { href: "/favorites", label: "Favorites", icon: Heart },
    { href: "/customize", label: "Customize", icon: SlidersHorizontal },
  ]
  return (
    <header className="ow-nav relative z-20 flex min-h-16 items-center justify-between gap-3 px-4 sm:px-8">
      <Link href="/" className="ow-display flex items-center gap-2 text-lg font-bold tracking-tight text-white sm:text-xl"><CloudSun size={22} className="text-amber-200" /><span>outfitweather</span></Link>
      <nav aria-label="Main navigation" className="flex items-center gap-1 sm:gap-2">
        {links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} className={`ow-nav-link ${pathname === href ? "active" : ""}`}><Icon size={17} /><span className="hidden sm:inline">{label}</span><span className="sr-only sm:hidden">{label}</span></Link>)}
        <ModeToggle />
      </nav>
    </header>
  )
}
