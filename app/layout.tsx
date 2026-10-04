import type React from "react"
import type { Metadata } from "next"
import { Inter, Fraunces } from "next/font/google"
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
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${display.variable}`}>
      <body style={{ fontFamily: "var(--font-body), system-ui, sans-serif" }}>
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
