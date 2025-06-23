"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Combobox, ComboboxInput, ComboboxList, ComboboxOption, ComboboxPopover } from "@reach/combobox"
import "@reach/combobox/styles.css"
import { SearchIcon } from "lucide-react"

export interface Farmacia {
  id: string
  nombre: string
  zona: string
  region: string
  domicilio: string
  latitud: number
  longitud: number
}

interface FarmaciaSearchProps {
  onSelect: (farmacia: Farmacia) => void
  placeholder?: string
  value?: string
  localidad?: string
  especialidad?: string
}

export function FarmaciaSearch({
  onSelect,
  placeholder = "Buscar farmacia...",
  value,
  localidad,
  especialidad,
}: FarmaciaSearchProps) {
  const [farmacias, setFarmacias] = useState<Farmacia[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedValue, setSelectedValue] = useState(value || "")
  const [loading, setLoading] = useState(false)
  const [totalResults, setTotalResults] = useState(0)
  const [open, setOpen] = useState(false)

  // Buscar farmacias cuando cambie el término de búsqueda, localidad o especialidad
  useEffect(() => {
    const buscarFarmacias = async () => {
      // Si hay filtros, permitir búsqueda automática
      if ((localidad || especialidad) && searchTerm === "*") {
        // Búsqueda automática con filtros
      } else if (searchTerm.length < 2 && searchTerm !== "*") {
        setFarmacias([])
        setTotalResults(0)
        return
      }

      setLoading(true)
      try {
        const searchQuery = searchTerm === "*" ? "a" : searchTerm
        console.log("🔍 Buscando farmacias con término:", { searchQuery, localidad, especialidad })

        const params = new URLSearchParams({
          q: searchQuery,
          ...(localidad && { localidad }),
          ...(especialidad && { especialidad }),
        })

        const response = await fetch(`/api/farmacias/search?${params}`)
        const data = await response.json()

        if (data.success && data.farmacias) {
          const farmaciasMapeadas = data.farmacias.map((item: any) => ({
            id: item.id,
            nombre: item.nombre,
            zona: item.zona,
            region: item.region,
            domicilio: item.domicilio,
            latitud: item.latitud,
            longitud: item.longitud,
          }))

          setFarmacias(farmaciasMapeadas)
          setTotalResults(data.total || data.farmacias.length)
        } else {
          setFarmacias([])
          setTotalResults(0)
        }
      } catch (error) {
        console.error("❌ Error al buscar farmacias:", error)
        setFarmacias([])
        setTotalResults(0)
      } finally {
        setLoading(false)
      }
    }

    const timeoutId = setTimeout(buscarFarmacias, 300)
    return () => clearTimeout(timeoutId)
  }, [searchTerm, localidad, especialidad])

  // Agregar useEffect para cargar resultados automáticamente cuando se abre y hay filtros
  useEffect(() => {
    if ((localidad || especialidad) && open) {
      setSearchTerm("*") // Trigger búsqueda automática
    }
  }, [open, localidad, especialidad])

  // Reset cuando cambien los filtros
  useEffect(() => {
    setSelectedValue("")
    setFarmacias([])
    setSearchTerm("")
  }, [localidad, especialidad])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOpen(true)
    setSearchTerm(event.target.value)
    setSelectedValue(event.target.value)
  }

  const handleSelect = (value: string) => {
    const farmaciaSeleccionada = farmacias.find((farmacia) => farmacia.nombre === value)
    if (farmaciaSeleccionada) {
      onSelect(farmaciaSeleccionada)
      setSelectedValue(farmaciaSeleccionada.nombre)
    }
  }

  const displayPlaceholder = () => {
    const filters = [localidad, especialidad].filter(Boolean)
    if (filters.length > 0) {
      return `Buscar farmacia con ${filters.join(" y ")}...`
    }
    return placeholder
  }

  return (
    <Combobox onSelect={handleSelect} open={open} onOpenChange={(isOpen) => setOpen(isOpen)}>
      <div className="relative">
        <ComboboxInput
          value={selectedValue}
          onChange={handleChange}
          placeholder={displayPlaceholder()}
          className="w-full rounded-md border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        />
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <SearchIcon className="h-4 w-4 text-gray-400" />
        </div>
      </div>
      {farmacias.length > 0 && (
        <ComboboxPopover className="shadow-md rounded-md mt-1 bg-white">
          {totalResults > 0 ? (
            <ComboboxList>
              {farmacias.map((farmacia) => (
                <ComboboxOption key={farmacia.id} value={farmacia.nombre} />
              ))}
            </ComboboxList>
          ) : (
            <p className="p-2 text-sm text-gray-500">No se encontraron farmacias.</p>
          )}
        </ComboboxPopover>
      )}
      {loading && <p className="mt-2 text-sm text-gray-500">Buscando farmacias...</p>}
    </Combobox>
  )
}
