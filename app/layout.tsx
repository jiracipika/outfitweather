import type React from "react"
import type { Metadata } from "next"
import Script from "next/script"
import { Inter, Fraunces, Cormorant_Garamond, UnifrakturCook } from "next/font/google"
import "./globals.css"
import "./studio.css"
import "./her.css"
import Navbar from "@/components/navbar"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import AppTransitionShell from "@/components/app-transition-shell"
import { WardrobePreferences } from "@/components/wardrobe-preferences"

const inter = Inter({ subsets: ["latin"], variable: "--font-body" })
const display = Fraunces({ subsets: ["latin"], variable: "--font-display" })
const herSerif = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], style: ["normal", "italic"], variable: "--font-her-serif" })
const herGothic = UnifrakturCook({ subsets: ["latin"], weight: "700", variable: "--font-her-gothic" })

export const metadata: Metadata = {
  title: "outfitweather",
  description:
    "Decide what to wear based on the current weather in your location — with full-screen animated skies and a few sheep.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${display.variable} ${herSerif.variable} ${herGothic.variable}`}>
      <body style={{ fontFamily: "var(--font-body), system-ui, sans-serif" }}>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4128325832827761"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <WardrobePreferences><div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex flex-1 flex-col items-center justify-center p-0 md:p-0">
              <AppTransitionShell>{children}</AppTransitionShell>
            </main>
          </div><Toaster /></WardrobePreferences>
        </ThemeProvider>
      </body>
    </html>
  )
}
