import type React from "react"
import type { Metadata } from "next"
import { Inter, Literata } from 'next/font/google'
import "./globals.css"
import { AuthProvider } from "@/components/auth-context"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const literata = Literata({
  subsets: ["latin"],
  variable: "--font-literata",
})

export const metadata: Metadata = {
  title: "BetterReads - Your Digital Bookshelf",
  description:
    "A beautifully animated, bookshelf-inspired app for book lovers to visually catalog and emotionally rate their reads.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${literata.variable} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
