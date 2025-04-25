import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { FirebaseClientInit } from "./firebase-init"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "AI Desktop Assistant",
  description: "Your intelligent desktop companion",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster />
          <FirebaseClientInit />
        </ThemeProvider>
      </body>
    </html>
  )
}
