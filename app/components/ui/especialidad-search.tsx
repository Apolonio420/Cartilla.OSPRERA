"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown, Stethoscope, Loader2, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface Especialidad {
  id: string
  nombre: string
  descripcion?: string
}

interface EspecialidadSearchProps {
  onSelect: (especialidad: Especialidad) => void
  onClear?: () => void
  placeholder?: string
  value?: string
  localidad?: string
  prestador?: string // Nuevo filtro
}

export function EspecialidadSearch({
  onSelect,
  onClear,
  placeholder = "Buscar especialidad...",
  value,
  localidad,
  prestador,
}: EspecialidadSearchProps) {
  const [open, setOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState(value || "")
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [totalResults, setTotalResults] = useState(0)
  const [searchCount, setSearchCount] = useState(0)
  const [lastFilters, setLastFilters] = useState<string>("")

  // Sincronizar valor externo
  useEffect(() => {
    setSelectedValue(value || "")
  }, [value])

  // Verificar si hay cambios en los filtros
  useEffect(() => {
    const currentFilters = JSON.stringify({ localidad, prestador })
    if (currentFilters !== lastFilters) {
      console.log("🔄 EspecialidadSearch - Filtros cambiados:", { localidad, prestador })
      setLastFilters(currentFilters)

      // Reset cuando cambian los filtros
      setEspecialidades([])
      setSearchTerm("")
      setSearchCount(0)
    }
  }, [localidad, prestador, lastFilters])

  // Cargar resultados automáticamente cuando se abre y hay filtros
  useEffect(() => {
    if ((localidad || prestador) && open && searchCount === 0) {
      console.log("🔍 EspecialidadSearch - Cargando especialidades automáticamente con filtros:", {
        localidad,
        prestador,
      })
      setSearchTerm("*") // Trigger búsqueda automática
      setSearchCount((prev) => prev + 1)
    }
  }, [open, localidad, prestador, searchCount])

  // Buscar especialidades cuando cambie el término de búsqueda, localidad o prestador
  useEffect(() => {
    const buscarEspecialidades = async () => {
      // Limitar búsquedas para evitar ciclos infinitos
      if (searchCount > 5) {
        console.log("⚠️ EspecialidadSearch - Demasiadas búsquedas, deteniendo")
        return
      }

      // Si hay filtros, permitir búsqueda automática
      if ((localidad || prestador) && searchTerm === "*") {
        // Búsqueda automática con filtros
      } else if (searchTerm.length < 2 && searchTerm !== "*") {
        setEspecialidades([])
        setTotalResults(0)
        return
      }

      setLoading(true)
      try {
        const searchQuery = searchTerm === "*" ? "a" : searchTerm
        console.log("🔍 EspecialidadSearch - Buscando especialidades con término:", {
          searchQuery,
          localidad,
          prestador,
        })

        const params = new URLSearchParams({
          q: searchQuery,
          ...(localidad && { localidad }),
          ...(prestador && { prestador }),
        })

        const response = await fetch(`/api/especialidades/search?${params.toString()}`)
        const data = await response.json()

        console.log("🔍 EspecialidadSearch - Resultados:", data)

        if (data.success && data.especialidades) {
          const especialidadesMapeadas = data.especialidades.map((item: any) => ({
            id: item.id,
            nombre: item.nombre,
            descripcion: item.descripcion || "",
            fuente: item.fuente,
          }))

          setEspecialidades(especialidadesMapeadas)
          setTotalResults(data.total || data.especialidades.length)
          console.log("✅ EspecialidadSearch - Especialidades encontradas:", especialidadesMapeadas.length)
        } else {
          console.log("⚠️ EspecialidadSearch - No se encontraron especialidades")
          setEspecialidades([])
          setTotalResults(0)
        }
      } catch (error) {
        console.error("❌ EspecialidadSearch - Error al buscar especialidades:", error)
        setEspecialidades([])
        setTotalResults(0)
      } finally {
        setLoading(false)
        setSearchCount((prev) => prev + 1)
      }
    }

    const timeoutId = setTimeout(buscarEspecialidades, 300)
    return () => clearTimeout(timeoutId)
  }, [searchTerm, localidad, prestador, searchCount])

  // Reset al cerrar el dropdown
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      setSearchCount(0) // Reset contador al cerrar
    }
  }

  const handleClear = () => {
    setSelectedValue("")
    if (onClear) {
      onClear()
    }
  }

  const displayPlaceholder = () => {
    const filters = []
    if (localidad) filters.push(`en ${localidad}`)
    if (prestador) {
      // Extraer solo el nombre del prestador (antes del " - ")
      const nombrePrestador = prestador.split(" - ")[0]
      filters.push(`de ${nombrePrestador}`)
    }

    return filters.length > 0 ? `Buscar especialidad ${filters.join(" ")}...` : placeholder
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
            <div className="flex items-center flex-1 min-w-0">
              <Stethoscope className="mr-2 h-4 w-4 text-[#00613c] flex-shrink-0" />
              <span className="truncate">{selectedValue || displayPlaceholder()}</span>
            </div>
            <div className="flex items-center gap-1 ml-2">
              {selectedValue && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleClear()
                  }}
                  className="p-1 hover:bg-red-100 rounded-full transition-colors"
                  title="Quitar especialidad"
                >
                  <X className="h-3 w-3 text-red-500" />
                </button>
              )}
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-full p-0"
          align="start"
          side="bottom"
          sideOffset={4}
          avoidCollisions={false}
          collisionPadding={0}
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={
                prestador
                  ? "Ver especialidades del prestador..."
                  : "Escriba para buscar (ej: alergia, cardio, trauma...)"
              }
              value={searchTerm}
              onValueChange={setSearchTerm}
              className="border-0 focus:ring-0"
            />
            <CommandList>
              <CommandEmpty>
                {loading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Buscando especialidades...
                  </div>
                ) : searchTerm.length < 2 && !localidad && !prestador && searchTerm !== "*" ? (
                  "Escriba al menos 2 caracteres para buscar"
                ) : (
                  <div className="text-center py-4">
                    <p>No se encontraron especialidades</p>
                    {prestador && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Este prestador no tiene especialidades registradas
                      </p>
                    )}
                  </div>
                )}
              </CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                {totalResults > 0 && (
                  <div className="px-2 py-1 text-xs text-muted-foreground border-b">
                    {totalResults} especialidad{totalResults !== 1 ? "es" : ""} encontrada
                    {totalResults !== 1 ? "s" : ""}
                    {localidad && <span className="text-blue-600"> en {localidad}</span>}
                    {prestador && <span className="text-green-600"> de {prestador.split(" - ")[0]}</span>}
                  </div>
                )}
                {especialidades.map((especialidad) => (
                  <CommandItem
                    key={especialidad.id}
                    value={especialidad.nombre.toLowerCase()}
                    onSelect={() => {
                      setSelectedValue(especialidad.nombre)
                      setOpen(false)
                      onSelect(especialidad)
                      setSearchCount(0) // Reset contador al seleccionar
                      console.log("✅ EspecialidadSearch - Especialidad seleccionada:", especialidad.nombre)
                    }}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedValue === especialidad.nombre ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <div className="flex flex-col w-full">
                      <span className="font-medium flex items-center">
                        <Stethoscope className="mr-2 h-4 w-4 text-[#00613c]" />
                        {especialidad.nombre}
                      </span>
                      {especialidad.descripcion && (
                        <span className="text-sm text-muted-foreground ml-6">{especialidad.descripcion}</span>
                      )}
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
