"use client";

import Link from "next/link";
import { CloudSun, Heart, SlidersHorizontal, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";
import { useWardrobePreferences } from "./wardrobe-preferences";

const links = [
  { href: "/", label: "Today", icon: CloudSun },
  { href: "/favorites", label: "Lookbook", icon: Heart },
  { href: "/customize", label: "Wardrobe", icon: SlidersHorizontal },
];

export default function Navbar() {
  const pathname = usePathname();
  const { motion, toggleMotion } = useWardrobePreferences();
  return (
    <header className="app-nav">
      <div className="nav-inner">
        <Link href="/" className="app-brand" aria-label="Outfit Weather home">
          <span className="brand-icon"><CloudSun size={23} strokeWidth={1.8} /></span>
          <span>outfit<span>weather</span></span>
        </Link>
        <nav aria-label="Main navigation">
          {links.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}>
              <Icon size={16} aria-hidden="true" /> {label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          className="motion-toggle"
          onClick={toggleMotion}
          aria-pressed={motion}
          aria-label="Animations"
          title={motion ? "Turn off animations" : "Turn on animations"}
        >
          <Sparkles size={17} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
