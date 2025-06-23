import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Cartilla Médica - OSPRERA",
  description: "Cartilla médica digital de OSPRERA - Busque prestadores por localidad y especialidad",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es-AR">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">{children}</div>
        <Toaster />
      </body>
    </html>
  )
}
