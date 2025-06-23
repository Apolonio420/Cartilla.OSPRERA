"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown, MapPin, Search } from "lucide-react"

interface Localidad {
  id: string
  Localidad: string
  Provincia?: string
  Partido?: string
}

interface LocalidadSearchProps {
  value?: string
  onSelect: (localidad: { nombre: string; id?: string }) => void // Cambiar la interfaz
  placeholder?: string
  disabled?: boolean
  filters?: {
    especialidad?: string
  }
}

export function LocalidadSearch({
  value,
  onSelect,
  placeholder = "Seleccionar localidad...",
  disabled = false,
  filters = {},
}: LocalidadSearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [localidades, setLocalidades] = useState<Localidad[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Buscar localidades
  const searchLocalidades = async (query = "") => {
    if (loading) return

    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (query && query !== "*") params.append("q", query)
      if (filters.especialidad) params.append("especialidad", filters.especialidad)

      console.log("🔍 Buscando localidades con:", { query, filters })

      const response = await fetch(`/api/localidades/search?${params}`)
      const data = await response.json()

      console.log("📍 Resultados localidades:", data)
      console.log("📍 Primera localidad:", data.localidades?.[0])

      if (data.success) {
        setLocalidades(data.localidades || [])
      }
    } catch (error) {
      console.error("Error buscando localidades:", error)
    } finally {
      setLoading(false)
      setHasSearched(true)
    }
  }

  // Efecto para búsqueda con debounce
  useEffect(() => {
    if (!isOpen) return

    const timeoutId = setTimeout(() => {
      searchLocalidades(searchQuery || "*")
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, isOpen, filters.especialidad])

  // Cargar resultados al abrir
  useEffect(() => {
    if (isOpen && !hasSearched) {
      searchLocalidades("*")
    }
  }, [isOpen, hasSearched])

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = (localidad: Localidad) => {
    console.log("🎯 Localidad clickeada:", localidad)
    console.log("🎯 Localidad.Localidad:", localidad.Localidad)

    if (localidad && localidad.Localidad) {
      console.log("✅ Enviando localidad:", localidad.Localidad)
      onSelect({ nombre: localidad.Localidad, id: localidad.id })
      setIsOpen(false)
      setSearchQuery("")
      setHasSearched(false)
    } else {
      console.error("❌ Localidad inválida:", localidad)
    }
  }

  const handleToggle = () => {
    if (disabled) return
    setIsOpen(!isOpen)
    if (!isOpen) {
      setSearchQuery("")
      setHasSearched(false)
    }
  }

  const displayValue = value || placeholder
  const hasFilters = filters.especialidad

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
          flex items-center justify-between
          ${isOpen ? "ring-2 ring-blue-500 border-blue-500" : ""}
        `}
      >
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span className={value ? "text-gray-900" : "text-gray-500"}>{displayValue}</span>
          {hasFilters && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Filtrado</span>}
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={hasFilters ? `Buscar en localidades filtradas...` : "Buscar localidad..."}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="p-3 text-center text-gray-500">
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                Buscando localidades...
              </div>
            ) : localidades.length > 0 ? (
              localidades.map((localidad, index) => {
                console.log(`📍 Renderizando localidad ${index}:`, localidad)
                return (
                  <button
                    key={localidad.id || index}
                    onClick={() => handleSelect(localidad)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none flex items-center gap-2 border-b border-gray-100 last:border-b-0"
                  >
                    <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{localidad.Localidad || "Sin nombre"}</div>
                      {localidad.Partido && (
                        <div className="text-sm text-gray-500">
                          {localidad.Partido}, {localidad.Provincia}
                        </div>
                      )}
                    </div>
                  </button>
                )
              })
            ) : hasSearched ? (
              <div className="p-3 text-center text-gray-500">
                <MapPin className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="font-medium">No se encontraron localidades</p>
                <p className="text-sm">Intente con otro término o revise los filtros aplicados</p>
              </div>
            ) : (
              <div className="p-3 text-center text-gray-500">
                <Search className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p>Escriba para buscar localidades</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
