"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown, MapPin, Loader2, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface Localidad {
  id: string
  nombre: string
  provincia?: string
  partido?: string
  region_macro?: string
  region_micro?: string
  fuente?: string
}

interface LocalidadSearchProps {
  onSelect: (localidad: Localidad | null) => void // Permitir null para limpiar
  placeholder?: string
  value?: string
  provincia?: string
  especialidad?: string
  prestador?: string
  region?: string // Nuevo filtro por región
}

export function LocalidadSearch({
  onSelect,
  placeholder = "Buscar localidad...",
  value,
  provincia,
  especialidad,
  prestador,
  region, // Nuevo parámetro
}: LocalidadSearchProps) {
  const [open, setOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState(value || "")
  const [localidades, setLocalidades] = useState<Localidad[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [totalResults, setTotalResults] = useState(0)
  const [showAllFromRegion, setShowAllFromRegion] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)
  const ignoreRegionChangeRef = useRef(false)

  // Actualizar selectedValue cuando cambia el value prop
  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value)
    }
  }, [value])

  // Cargar localidades de la región al abrir el popover
  useEffect(() => {
    if (open && region && (searchTerm.length < 2 || showAllFromRegion)) {
      loadLocalidadesFromRegion()
    }
  }, [open, region, showAllFromRegion])

  // Función para cargar todas las localidades de una región
  const loadLocalidadesFromRegion = async () => {
    if (!region) return

    setLoading(true)
    try {
      console.log("🔍 Cargando localidades de la región:", region)

      const params = new URLSearchParams({
        q: "*", // Comodín para buscar todas
        region: region,
      })

      const response = await fetch(`/api/localidades/search?${params.toString()}`)
      const data = await response.json()

      if (data.success && data.localidades) {
        setLocalidades(data.localidades)
        setTotalResults(data.total || data.localidades.length)
        console.log(`✅ Cargadas ${data.localidades.length} localidades de la región ${region}`)
      } else {
        setLocalidades([])
        setTotalResults(0)
      }
    } catch (error) {
      console.error("❌ Error al cargar localidades de la región:", error)
      setLocalidades([])
      setTotalResults(0)
    } finally {
      setLoading(false)
    }
  }

  // Buscar localidades cuando cambie el término de búsqueda, especialidad, prestador o región
  useEffect(() => {
    // Si estamos mostrando todas las de la región, no hacer búsqueda por término
    if (showAllFromRegion && region) return

    const buscarLocalidades = async () => {
      // Si hay filtros, permitir búsqueda automática
      if (searchTerm.length < 2 && !region) {
        setLocalidades([])
        setTotalResults(0)
        return
      }

      setLoading(true)
      try {
        console.log("🔍 Buscando localidades con término:", { searchTerm, especialidad, prestador, region })

        const params = new URLSearchParams({
          q: searchTerm,
          ...(provincia && { provincia }),
          ...(especialidad && { especialidad }),
          ...(prestador && { prestador }),
          ...(region && { region }), // Agregar filtro por región
        })

        const response = await fetch(`/api/localidades/search?${params.toString()}`)
        const data = await response.json()

        if (data.success && data.localidades) {
          setLocalidades(data.localidades)
          setTotalResults(data.total || data.localidades.length)
        } else {
          setLocalidades([])
          setTotalResults(0)
        }
      } catch (error) {
        console.error("❌ Error al buscar localidades:", error)
        setLocalidades([])
        setTotalResults(0)
      } finally {
        setLoading(false)
      }
    }

    const timeoutId = setTimeout(buscarLocalidades, 300)
    return () => clearTimeout(timeoutId)
  }, [searchTerm, provincia, especialidad, prestador, region, showAllFromRegion])

  // Reset cuando cambien los filtros, pero solo si no estamos ignorando el cambio
  useEffect(() => {
    if (region !== undefined && !ignoreRegionChangeRef.current) {
      // Si hay un valor seleccionado, no lo limpiamos automáticamente
      if (!selectedValue) {
        setLocalidades([])
        setSearchTerm("")
      }
    }
    // Resetear el flag después de cada cambio de región
    ignoreRegionChangeRef.current = false
  }, [region, selectedValue])

  const displayPlaceholder = () => {
    if (region) {
      return `Buscar localidad en ${region}...`
    }
    return placeholder
  }

  const handleClear = () => {
    setSelectedValue("")
    setOpen(false)
    onSelect(null) // Enviar null para limpiar
    console.log("🗑️ Localidad limpiada")
  }

  const handleSelect = (localidad: Localidad) => {
    console.log("🎯 Seleccionando localidad:", localidad.nombre)

    // Establecer el flag para ignorar el próximo cambio de región
    ignoreRegionChangeRef.current = true

    setSelectedValue(localidad.nombre)
    setOpen(false)

    // Notificar al componente padre
    onSelect(localidad)
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen && region) {
      setShowAllFromRegion(true)
    } else {
      setShowAllFromRegion(false)
    }
  }

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between border-[#00613c]/20 focus:ring-[#00613c]/20"
          >
            {selectedValue || displayPlaceholder()}
            <div className="flex items-center gap-1">
              {selectedValue && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleClear()
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          ref={popoverRef}
          className="w-full p-0"
          align="start"
          side="bottom"
          sideOffset={4}
          avoidCollisions={false}
          collisionPadding={0}
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={region ? `Buscar en ${region}...` : "Escriba para buscar (ej: vicente, capital...)"}
              value={searchTerm}
              onValueChange={(value) => {
                setSearchTerm(value)
                setShowAllFromRegion(false)
              }}
              className="border-0 focus:ring-0"
            />
            <CommandList>
              <CommandEmpty>
                {loading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Buscando localidades...
                  </div>
                ) : searchTerm.length < 2 && !region ? (
                  "Escriba al menos 2 caracteres para buscar"
                ) : (
                  <div className="text-center py-4">
                    <p>No se encontraron localidades</p>
                    <p className="text-sm text-muted-foreground mt-1">Intente con otro término de búsqueda</p>
                  </div>
                )}
              </CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                {totalResults > 0 && (
                  <div className="px-2 py-1 text-xs text-muted-foreground border-b">
                    {totalResults} localidad{totalResults !== 1 ? "es" : ""} encontrada{totalResults !== 1 ? "s" : ""}
                    {region && <span className="text-green-600"> en {region}</span>}
                    {especialidad && <span className="text-blue-600"> con {especialidad}</span>}
                  </div>
                )}
                {localidades.map((localidad) => (
                  <CommandItem
                    key={localidad.id}
                    value={localidad.nombre.toLowerCase()}
                    onSelect={() => handleSelect(localidad)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn("mr-2 h-4 w-4", selectedValue === localidad.nombre ? "opacity-100" : "opacity-0")}
                    />
                    <div className="flex flex-col w-full">
                      <span className="font-medium flex items-center">
                        <MapPin className="mr-2 h-4 w-4 text-[#00613c]" />
                        {localidad.nombre}
                      </span>
                      <div className="flex justify-between items-center ml-6">
                        {localidad.provincia && (
                          <span className="text-sm text-muted-foreground">{localidad.provincia}</span>
                        )}
                        {localidad.partido && (
                          <span className="text-xs text-muted-foreground bg-gray-100 px-1 rounded ml-1">
                            {localidad.partido}
                          </span>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
