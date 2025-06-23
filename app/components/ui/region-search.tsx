"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"

interface Region {
  id: string
  region: string
  tipo: string // 'macro' o 'micro'
  localidades_count: number
}

interface RegionSearchProps {
  onSelect: (region: Region | null) => void
  placeholder?: string
  value?: string
}

export function RegionSearch({ onSelect, placeholder = "Buscar región...", value }: RegionSearchProps) {
  const [searchTerm, setSearchTerm] = useState(value || "")
  const [results, setResults] = useState<Region[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null)

  useEffect(() => {
    if (value && !selectedRegion) {
      setSearchTerm(value)
    }
  }, [value, selectedRegion])

  const searchRegiones = async (term: string) => {
    if (term.length < 2) {
      setResults([])
      setShowResults(false)
      return
    }

    setIsLoading(true)
    try {
      console.log("🔍 RegionSearch - Buscando:", term)
      const response = await fetch(`/api/regiones/search?q=${encodeURIComponent(term)}`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("📊 RegionSearch - Respuesta:", data)

      if (data.success && data.regiones) {
        setResults(data.regiones)
        setShowResults(true)
        console.log("✅ RegionSearch - Regiones encontradas:", data.regiones.length)
      } else {
        console.error("❌ RegionSearch - Error en respuesta:", data.error)
        setResults([])
        setShowResults(false)
      }
    } catch (error) {
      console.error("❌ RegionSearch - Error buscando regiones:", error)
      setResults([])
      setShowResults(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
    setSearchTerm(term)

    if (selectedRegion) {
      setSelectedRegion(null)
      onSelect(null)
    }

    searchRegiones(term)
  }

  const handleSelect = (region: Region) => {
    setSelectedRegion(region)
    setSearchTerm(region.region)
    setShowResults(false)
    onSelect(region)
    console.log("✅ RegionSearch - Región seleccionada:", region.region)
  }

  const handleClear = () => {
    setSearchTerm("")
    setSelectedRegion(null)
    setResults([])
    setShowResults(false)
    onSelect(null)
    console.log("🗑️ RegionSearch - Región limpiada")
  }

  return (
    <div className="relative">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => {
            if (results.length > 0) {
              setShowResults(true)
            }
          }}
          className="border-[#00613c]/20 focus:ring-[#00613c]/20"
        />
        {(searchTerm || selectedRegion) && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClear}
            className="border-[#00613c]/20 text-[#00613c] hover:bg-[#00613c] hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {results.map((region, index) => (
            <div
              key={`${region.id}-${index}`}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
              onClick={() => handleSelect(region)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium text-gray-900">{region.region}</div>
                  <div className="text-sm text-gray-500">
                    {region.tipo === "macro" ? "Región Macro" : "Región Micro"}
                  </div>
                </div>
                <div className="text-sm text-gray-400">{region.localidades_count} localidades</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isLoading && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="px-4 py-2 text-center text-gray-500">Buscando regiones...</div>
        </div>
      )}

      {showResults && results.length === 0 && searchTerm.length >= 2 && !isLoading && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="px-4 py-2 text-center text-gray-500">No se encontraron regiones</div>
        </div>
      )}
    </div>
  )
}
