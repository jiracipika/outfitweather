import type React from "react";
import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import "./planner.css";
import Navbar from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import AppTransitionShell from "@/components/app-transition-shell";
import { WardrobePreferences } from "@/components/wardrobe-preferences";
import { MotionGate } from "@/components/motion-primitives";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const display = Fraunces({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "Outfit Weather — Plan what to wear",
  description:
    "Check your local forecast, plan what to wear by the hour, and save your favourite outfits.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${display.variable}`}
    >
      <body style={{ fontFamily: "var(--font-body), system-ui, sans-serif" }}>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4128325832827761"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          <WardrobePreferences>
            <MotionGate>
              <div className="flex min-h-screen flex-col">
                <a href="#main-content" className="skip-link">
                  Skip to content
                </a>
                <Navbar />
                <main id="main-content" className="flex flex-1 flex-col">
                  <AppTransitionShell>{children}</AppTransitionShell>
                </main>
                <footer className="app-footer">
                  <span>Outfit Weather</span>
                  <p>Forecast data from <a href="https://www.weatherapi.com/">WeatherAPI</a></p>
                </footer>
              </div>
              <Toaster />
            </MotionGate>
          </WardrobePreferences>
        </ThemeProvider>
      </body>
    </html>
  );
}
