"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown, User, Search } from "lucide-react"

interface Prestador {
  id: string
  nombre: string
  especialidad?: string
  localidad?: string
}

interface CartillaSearchProps {
  value?: string
  onSelect: (prestador: string) => void
  placeholder?: string
  disabled?: boolean
  filters?: {
    localidad?: string
    especialidad?: string
  }
}

// Usando export function para crear una exportación nombrada
export function CartillaSearch({
  value,
  onSelect,
  placeholder = "Seleccionar prestador...",
  disabled = false,
  filters = {},
}: CartillaSearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [prestadores, setPrestadores] = useState<Prestador[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [searchCount, setSearchCount] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Debug: mostrar filtros recibidos
  useEffect(() => {
    console.log("🔧 CartillaSearch - Filtros recibidos:", filters)
  }, [filters])

  // Función para normalizar texto
  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
  }

  // Buscar prestadores
  const searchPrestadores = async (query = "") => {
    if (loading) return

    // Limitar búsquedas para evitar ciclos infinitos
    if (searchCount > 5 && !isOpen) {
      console.log("🛑 Demasiadas búsquedas, deteniendo para evitar ciclo infinito")
      return
    }

    setSearchCount((prev) => prev + 1)
    setLoading(true)

    try {
      const params = new URLSearchParams()

      // Agregar query si existe y no es el comodín
      if (query && query !== "*") {
        params.append("q", query)
      } else {
        // Usar un comodín para búsqueda sin término
        params.append("q", "*")
      }

      // Agregar filtros si existen
      if (filters?.localidad) {
        params.append("localidad", filters.localidad)
        console.log("🏠 Agregando filtro localidad:", filters.localidad)
      }

      if (filters?.especialidad) {
        params.append("especialidad", filters.especialidad)
        console.log("🩺 Agregando filtro especialidad:", filters.especialidad)
      }

      const url = `/api/cartilla/search?${params.toString()}`
      console.log("🔍 URL de búsqueda:", url)
      console.log("🔍 Buscando prestadores con:", { query, filters })

      const response = await fetch(url)
      const data = await response.json()

      console.log("👨‍⚕️ Resultados prestadores:", data)

      if (data.success) {
        setPrestadores(data.prestadores || [])
      } else {
        console.error("❌ Error en respuesta:", data.error)
        setPrestadores([])
      }
    } catch (error) {
      console.error("❌ Error buscando prestadores:", error)
      setPrestadores([])
    } finally {
      setLoading(false)
      setHasSearched(true)
    }
  }

  // Efecto para búsqueda con debounce
  useEffect(() => {
    if (!isOpen) return

    const timeoutId = setTimeout(() => {
      searchPrestadores(searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, isOpen, filters?.especialidad])

  // Cargar resultados al abrir si hay filtros
  useEffect(() => {
    if (isOpen && !hasSearched && (filters?.localidad || filters?.especialidad)) {
      console.log("🚀 Cargando prestadores automáticamente con filtros:", filters)
      searchPrestadores("*")
    }
  }, [isOpen, hasSearched, filters?.localidad, filters?.especialidad])

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

  const handleSelect = (prestador: Prestador) => {
    console.log("✅ Prestador seleccionado:", prestador.nombre)
    onSelect(prestador.nombre)
    setIsOpen(false)
    setSearchQuery("")
    setHasSearched(false)
    setSearchCount(0)
  }

  const handleToggle = () => {
    if (disabled) return
    console.log("🔄 Toggle dropdown, filtros actuales:", filters)
    setIsOpen(!isOpen)
    if (!isOpen) {
      setSearchQuery("")
      setHasSearched(false)
      setSearchCount(0)
    }
  }

  const hasFilters = filters?.localidad || filters?.especialidad

  // Generar placeholder dinámico
  const getDynamicPlaceholder = () => {
    if (filters?.localidad && filters?.especialidad) {
      return `Buscar prestador en ${filters.localidad} (${filters.especialidad})...`
    } else if (filters?.localidad) {
      return `Buscar prestador en ${filters.localidad}...`
    } else if (filters?.especialidad) {
      return `Buscar prestador de ${filters.especialidad}...`
    }
    return placeholder
  }

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
          <User className="h-4 w-4 text-gray-400" />
          <span className={value ? "text-gray-900" : "text-gray-500"}>{value || getDynamicPlaceholder()}</span>
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
                placeholder={hasFilters ? `Buscar en prestadores filtrados...` : "Buscar prestador..."}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="p-3 text-center text-gray-500">
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                Buscando prestadores...
              </div>
            ) : prestadores.length > 0 ? (
              prestadores.map((prestador) => (
                <button
                  key={prestador.id}
                  onClick={() => handleSelect(prestador)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                >
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="font-medium">{prestador.nombre}</div>
                      {(prestador.especialidad || prestador.localidad) && (
                        <div className="text-sm text-gray-500">
                          {[prestador.especialidad, prestador.localidad].filter(Boolean).join(" • ")}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))
            ) : hasSearched ? (
              <div className="p-3 text-center text-gray-500">
                <User className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="font-medium">No se encontraron prestadores</p>
                <p className="text-sm">Intente con otro término o revise los filtros aplicados</p>
                {hasFilters && (
                  <div className="mt-2 text-xs bg-gray-100 p-2 rounded">
                    Filtros activos: {filters?.localidad && `Localidad: ${filters.localidad}`}{" "}
                    {filters?.especialidad && `Especialidad: ${filters.especialidad}`}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 text-center text-gray-500">
                <Search className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p>Escriba para buscar prestadores</p>
                {hasFilters && (
                  <p className="text-xs mt-1">Filtrado por: {filters?.localidad || filters?.especialidad}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
