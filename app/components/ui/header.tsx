"use client"

import type React from "react"

import Image from "next/image"
import Link from "next/link"
import { Phone } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export function Header() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Verificar si el usuario está autenticado
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check-session")
        const data = await response.json()
        setIsAuthenticated(data.authenticated)
      } catch (error) {
        setIsAuthenticated(false)
      }
    }
    checkAuth()
  }, [])

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isAuthenticated) {
      router.push("/dashboard")
    } else {
      router.push("/")
    }
  }

  return (
    <header className="w-full">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center">
          <button onClick={handleLogoClick} className="flex items-center">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-removebg-preview%20%283%29-88U1neg4WhRgcnRXJJYz6I2QAqkKjH.png"
              alt="OSPRERA - Obra Social del Personal Rural y Estibadores de la República Argentina"
              width={350}
              height={70}
              className="h-14 w-auto"
              priority
            />
          </button>
          <nav className="hidden md:flex space-x-6 text-sm font-medium">
            <Link href="#" className="text-[#00613c] hover:text-[#00613c]/80 py-2">
              CONSULTAS Y GESTIONES
            </Link>
            <Link href="#" className="text-[#00613c] hover:text-[#00613c]/80 py-2">
              COMUNIDAD OSPRERA
            </Link>
            <Link href="#" className="text-[#00613c] hover:text-[#00613c]/80 py-2">
              BENEFICIARIOS Y EMPLEADORES
            </Link>
          </nav>
        </div>
      </div>
      <div className="bg-[#ffd100] py-2">
        <div className="container mx-auto px-4 flex justify-end items-center">
          <div className="flex items-center text-[#00613c] font-bold">
            <Phone className="mr-2 h-5 w-5" />
            <span>0800-77-RURAL (78725)</span>
          </div>
        </div>
      </div>
    </header>
  )
}
