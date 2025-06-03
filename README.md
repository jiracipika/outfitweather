# outfitweather App

*Automatically synced with your [v0.dev](https://v0.dev) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/jiracipikas-projects/v0-weather-wear-app)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/Z28FYxZ60sw)

## Overview

This repository will stay in sync with your deployed chats on [v0.dev](https://v0.dev).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.dev](https://v0.dev).

## Deployment

Your project is live at:

**[https://vercel.com/jiracipikas-projects/v0-weather-wear-app](https://vercel.com/jiracipikas-projects/v0-weather-wear-app)**

## Build your app

Continue building your app on:

**[https://v0.dev/chat/projects/Z28FYxZ60sw](https://v0.dev/chat/projects/Z28FYxZ60sw)**

## ✨ Features

*   **Real-time Weather Data:** Fetches current temperature, conditions, humidity, and wind speed for any city worldwide using WeatherAPI.com.
*   **Dynamic Outfit Recommendations:** Provides personalized outfit suggestions with emojis and short descriptions based on temperature, rain, snow, and wind conditions.
*   **Interactive Weather Animations:** Enjoy subtle, weather-specific animations (rain, snow, fog, sun, clouds, etc.) that dynamically appear based on current conditions.
*   **Favorites Page:** Save your preferred outfit recommendations to `localStorage` and view them on a dedicated "Favorites" page.
*   **Customizable Outfit Logic:** Define your own rules for what to wear under different weather conditions via a user-friendly interface.
*   **Theme Toggle:** Switch between beautiful light and dark modes for a comfortable viewing experience.
*   **Responsive Design:** A clean, mobile-friendly, and visually engaging interface built with Tailwind CSS.
*   **Loading Skeletons:** Provides a smooth user experience during data fetching with animated loading states.

## 🚀 Technologies Used

*   [Next.js](https://nextjs.org/) (App Router)
*   [React](https://react.dev/)
*   [Tailwind CSS](https://tailwindcss.com/)
*   [shadcn/ui](https://ui.shadcn.com/)
*   [Lucide React](https://lucide.dev/icons/) for icons
*   [next-themes](https://github.com/pacocoursey/next-themes) for theme management
*   [WeatherAPI.com](https://www.weatherapi.com/) for weather data

## 🛠️ Setup and Installation

Follow these steps to get your outfitweather app up and running locally.

### 1. Clone the Repository

First, clone this repository to your local machine:

\`\`\`bash
git clone https://github.com/YOUR_USERNAME/outfitweather.git
cd outfitweather
\`\`\`

### 2. Install Dependencies

Install the necessary Node.js packages:

\`\`\`bash
npm install
# or
yarn install
\`\`\`

### 3. Configure Environment Variables (API Key)

This project uses the WeatherAPI.com API. You'll need an API key to fetch weather data.

1.  **Get your API Key:** Sign up at [WeatherAPI.com](https://www.weatherapi.com/) to obtain your free API key.
2.  **Create `.env.local`:** In the root of your project directory, create a file named `.env.local`.
3.  **Add your API Key:** Add the following line to your `.env.local` file, replacing `YOUR_WEATHERAPI_KEY_HERE` with your actual key:

    \`\`\`
    WEATHERAPI_API_KEY=YOUR_WEATHERAPI_KEY_HERE
    \`\`\`

    **Important:** The `.env.local` file is intentionally excluded from Git by default (via `.gitignore`) to prevent your API key from being committed to your public repository.

### 4. Run the Development Server

Start the Next.js development server:

\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 🚀 Deployment to Vercel

This application is designed for seamless deployment on [Vercel](https://vercel.com/), the creators of Next.js. Vercel automatically handles serverless functions (like your `/api/weather` route) and environment variables securely.

1.  **Push to GitHub:** Ensure your project is pushed to a GitHub repository.
2.  **Import Project to Vercel:**
    *   Go to [vercel.com](https://vercel.com/) and log in with your GitHub account.
    *   Click "Add New..." -> "Project" and select your `outfitweather` repository from GitHub.
3.  **Configure Environment Variables on Vercel:**
    *   During the import process, or later in your project's "Settings" -> "Environment Variables" on Vercel, add your `WEATHERAPI_API_KEY`.
    *   Set the `Name` to `WEATHERAPI_API_KEY` and paste your actual API key into the `Value` field.
    *   Ensure it's added for all environments (Development, Preview, Production).
4.  **Deploy:** Vercel will automatically build and deploy your application. Any subsequent pushes to your connected Git branch will trigger new deployments.

## 🤝 Contributing

Contributions are welcome! If you have suggestions for improvements or new features, please feel free to open an issue or submit a pull request.

## 📄 License

This project is open-source and available under the [MIT License](https://opensource.org/licenses/MIT).
\`\`\`

Next, let's update the application code to reflect the new name:

```typescriptreact file="app/layout.tsx"
[v0-no-op-code-block-prefix]import type React from "react"
import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"
import Navbar from "@/components/navbar"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "outfitweather",
  description: "Decide what to wear based on the current weather in your location with outfitweather.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-6">{children}</main>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
