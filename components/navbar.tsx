"use client";

import Link from "next/link";
import { CloudSun, Heart, SlidersHorizontal, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";
import { useWardrobePreferences } from "./wardrobe-preferences";

export default function Navbar() {
  const pathname = usePathname();
  const { motion, toggleMotion } = useWardrobePreferences();
  return (
    <header className="diary-nav">
      <Link href="/" className="diary-brand" aria-label="Outfit Weather home">
        <span className="brand-icon">
          <CloudSun size={25} strokeWidth={1.6} />
        </span>
        outfit<span>weather</span>
        <i>✳︎</i>
      </Link>
      <nav aria-label="Main navigation">
        {[
          { href: "/", label: "Daily outfit", icon: CloudSun },
          { href: "/favorites", label: "Saved looks", icon: Heart },
          { href: "/customize", label: "My wardrobe", icon: SlidersHorizontal },
        ].map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={pathname === href ? "page" : undefined}
          >
            <Icon size={16} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
      <button
        type="button"
        className="motion-toggle"
        onClick={toggleMotion}
        aria-pressed={motion}
        aria-label={`Turn ${motion ? "off" : "on"} animations`}
      >
        <Sparkles size={16} />
        <span>A little magic</span>
        <i>{motion ? "on" : "off"}</i>
      </button>
    </header>
  );
}
