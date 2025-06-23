"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown, MapPin, Building, Loader2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface RedFarmacia {
  id: string
  nombre: string
  zona?: string
  region?: string
  domicilio?: string
  latitud?: number
  longitud?: number
  fuente?: string
  distancia?: string
}

interface RedFarmaciasSearchProps {
  onSelect: (farmacia: RedFarmacia) => void
  placeholder?: string
  value?: string
  localidad?: string
  especialidad?: string
  radio?: number
}

export function RedFarmaciasSearch({
  onSelect,
  placeholder = "Buscar farmacia de la red...",
  value,
  localidad,
  especialidad,
  radio = 20, // Aumentar el radio por defecto a 20km
}: RedFarmaciasSearchProps) {
  const [open, setOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState(value || "")
  const [farmacias, setFarmacias] = useState<RedFarmacia[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [totalResults, setTotalResults] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Agregar useEffect para cargar resultados automáticamente cuando se abre y hay filtros
  useEffect(() => {
    if ((localidad || especialidad) && open) {
      setSearchTerm("*") // Trigger búsqueda automática
    }
  }, [open, localidad, especialidad])

  // Buscar farmacias cuando cambie el término de búsqueda, localidad o especialidad
  useEffect(() => {
    const buscarFarmacias = async () => {
      // Si hay filtros, permitir búsqueda automática
      if ((localidad || especialidad) && searchTerm === "*") {
        // Búsqueda automática con filtros
      } else if (searchTerm.length < 2 && searchTerm !== "*") {
        setFarmacias([])
        setTotalResults(0)
        setError(null)
        return
      }

      setLoading(true)
      setError(null)
      try {
        const searchQuery = searchTerm === "*" ? "a" : searchTerm
        console.log("🔍 Buscando red de farmacias con término:", { searchQuery, localidad, especialidad, radio })

        const params = new URLSearchParams({
          q: searchQuery,
          ...(localidad && { localidad }),
          ...(especialidad && { especialidad }),
          ...(radio && { radio: radio.toString() }),
        })

        const response = await fetch(`/api/red-farmacias/search?${params}`)
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
            fuente: item.fuente,
            distancia: item.distancia,
          }))

          setFarmacias(farmaciasMapeadas)
          setTotalResults(data.total || data.farmacias.length)

          if (farmaciasMapeadas.length === 0) {
            setError(
              `No se encontraron farmacias ${localidad ? `cerca de ${localidad}` : ""} ${especialidad ? `con ${especialidad}` : ""}`,
            )
          }
        } else {
          setFarmacias([])
          setTotalResults(0)
          setError(data.message || "Error al buscar farmacias")
        }
      } catch (error) {
        console.error("❌ Error al buscar red de farmacias:", error)
        setFarmacias([])
        setTotalResults(0)
        setError("Error de conexión al buscar farmacias")
      } finally {
        setLoading(false)
      }
    }

    const timeoutId = setTimeout(buscarFarmacias, 300)
    return () => clearTimeout(timeoutId)
  }, [searchTerm, localidad, especialidad, radio])

  // Reset cuando cambien los filtros
  useEffect(() => {
    setSelectedValue("")
    setFarmacias([])
    setSearchTerm("")
    setError(null)
  }, [localidad, especialidad])

  const displayPlaceholder = () => {
    const filters = []
    if (localidad) filters.push(`${localidad} (${radio}km)`)
    if (especialidad) filters.push(especialidad)

    if (filters.length > 0) {
      return `Buscar farmacia de la red con ${filters.join(" y ")}...`
    }
    return placeholder
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between border-[#00613c]/20 focus:ring-[#00613c]/20"
        >
          {selectedValue || displayPlaceholder()}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
            placeholder="Escriba para buscar (ej: farmacity, del pueblo...)"
            value={searchTerm}
            onValueChange={setSearchTerm}
            className="border-0 focus:ring-0"
          />
          <CommandList>
            <CommandEmpty>
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Buscando farmacias de la red...
                </div>
              ) : error ? (
                <div className="text-center py-4">
                  <div className="flex items-center justify-center text-amber-500 mb-2">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <p>{error}</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Intente con otro término de búsqueda o ajuste los filtros
                  </p>
                </div>
              ) : searchTerm.length < 2 && !(localidad || especialidad) ? (
                "Escriba al menos 2 caracteres para buscar"
              ) : (
                <div className="text-center py-4">
                  <p>No se encontraron farmacias de la red</p>
                  <p className="text-sm text-muted-foreground mt-1">Intente con otro término de búsqueda</p>
                </div>
              )}
            </CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {totalResults > 0 && (
                <div className="px-2 py-1 text-xs text-muted-foreground border-b">
                  {totalResults} farmacia{totalResults !== 1 ? "s" : ""} encontrada{totalResults !== 1 ? "s" : ""}
                  {localidad && (
                    <span className="text-blue-600">
                      {" "}
                      cerca de {localidad} ({radio}km)
                    </span>
                  )}
                  {especialidad && <span className="text-blue-600"> con {especialidad}</span>}
                </div>
              )}
              {farmacias.map((farmacia) => (
                <CommandItem
                  key={farmacia.id}
                  value={farmacia.nombre.toLowerCase()}
                  onSelect={() => {
                    setSelectedValue(`${farmacia.nombre} - ${farmacia.zona || farmacia.region}`)
                    setOpen(false)
                    onSelect(farmacia)
                    console.log("✅ Red de farmacia seleccionada:", farmacia.nombre)
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedValue === `${farmacia.nombre} - ${farmacia.zona || farmacia.region}`
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  <div className="flex flex-col w-full">
                    <span className="font-medium flex items-center">
                      <Building className="mr-2 h-4 w-4 text-[#00613c]" />
                      {farmacia.nombre}
                    </span>
                    <div className="flex justify-between items-center ml-6">
                      <span className="text-sm text-muted-foreground flex items-center">
                        <MapPin className="mr-1 h-3 w-3" />
                        {farmacia.zona || farmacia.region || "Sin ubicación"}
                        {farmacia.distancia && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-1 rounded">
                            {farmacia.distancia}
                          </span>
                        )}
                      </span>
                    </div>
                    {farmacia.domicilio && (
                      <span className="text-xs text-muted-foreground ml-6">{farmacia.domicilio}</span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
