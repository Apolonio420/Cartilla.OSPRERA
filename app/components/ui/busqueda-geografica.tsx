"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, Search, AlertTriangle, Database, X } from "lucide-react"
import { GeoService, type UbicacionEncontrada, type Coordenadas } from "@/app/lib/services/geo-service"

interface BusquedaGeograficaProps {
  onUbicacionSeleccionada: (ubicacion: UbicacionEncontrada | null, coordenadas?: Coordenadas) => void
  placeholder?: string
}

export function BusquedaGeografica({ onUbicacionSeleccionada, placeholder }: BusquedaGeograficaProps) {
  const [termino, setTermino] = useState("")
  const [ubicaciones, setUbicaciones] = useState<UbicacionEncontrada[]>([])
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState<UbicacionEncontrada | null>(null)
  const [radio, setRadio] = useState([50])
  const [cargando, setCargando] = useState(false)
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false)

  const buscarUbicaciones = async (texto: string) => {
    if (texto.length < 2) {
      setUbicaciones([])
      setMostrarSugerencias(false)
      return
    }

    setCargando(true)
    try {
      const resultados = await GeoService.buscarUbicacion(texto)
      setUbicaciones(resultados)
      setMostrarSugerencias(true)
    } catch (error) {
      console.error("Error buscando ubicaciones:", error)
      setUbicaciones([])
      setMostrarSugerencias(false)
    } finally {
      setCargando(false)
    }
  }

  const seleccionarUbicacion = (ubicacion: UbicacionEncontrada) => {
    setUbicacionSeleccionada(ubicacion)
    setTermino(ubicacion.nombre)
    setMostrarSugerencias(false) // ✅ CERRAR DROPDOWN
    setUbicaciones([]) // ✅ LIMPIAR SUGERENCIAS
    onUbicacionSeleccionada(ubicacion, ubicacion.coordenadas)

    console.log("📍 Ubicación seleccionada:", ubicacion)
  }

  const obtenerUbicacionActual = async () => {
    setCargando(true)
    try {
      const coordenadas = await GeoService.obtenerUbicacionActual()
      if (coordenadas) {
        const ubicacionActual: UbicacionEncontrada = {
          nombre: "Mi ubicación actual",
          tipo: "localidad",
          coordenadas,
        }
        seleccionarUbicacion(ubicacionActual)
      }
    } catch (error) {
      console.error("Error obteniendo ubicación actual:", error)
    } finally {
      setCargando(false)
    }
  }

  const limpiarUbicacion = () => {
    setUbicacionSeleccionada(null)
    setTermino("")
    setUbicaciones([])
    setMostrarSugerencias(false)
    onUbicacionSeleccionada(null)
    console.log("🧹 Ubicación limpiada")
  }

  // ✅ CERRAR DROPDOWN AL HACER CLICK FUERA
  const handleInputBlur = () => {
    // Delay para permitir click en sugerencias
    setTimeout(() => {
      setMostrarSugerencias(false)
    }, 200)
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (termino && !ubicacionSeleccionada) {
        buscarUbicaciones(termino)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [termino, ubicacionSeleccionada])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Buscar por ubicación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  placeholder={placeholder || "Buscar ciudad, provincia, localidad, partido..."}
                  value={termino}
                  onChange={(e) => {
                    setTermino(e.target.value)
                    if (ubicacionSeleccionada) {
                      setUbicacionSeleccionada(null) // Reset si cambia el texto
                    }
                  }}
                  onFocus={() => setMostrarSugerencias(ubicaciones.length > 0)}
                  onBlur={handleInputBlur}
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <Button onClick={obtenerUbicacionActual} disabled={cargando} variant="outline" size="sm">
                <MapPin className="h-4 w-4" />
              </Button>
              {ubicacionSeleccionada && (
                <Button
                  onClick={limpiarUbicacion}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Sugerencias */}
            {mostrarSugerencias && ubicaciones.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {ubicaciones.map((ubicacion, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onMouseDown={() => seleccionarUbicacion(ubicacion)} // ✅ onMouseDown en lugar de onClick
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{ubicacion.nombre}</div>
                        <div className="text-sm text-gray-500">
                          {ubicacion.detalles?.provincia && `${ubicacion.detalles.provincia} • `}
                          <Badge variant="secondary" className="text-xs">
                            {ubicacion.tipo}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        {ubicacion.sinDatos ? (
                          <div className="flex items-center gap-1 text-orange-600">
                            <Database className="h-4 w-4" />
                            <span className="text-xs">Sin datos</span>
                          </div>
                        ) : (
                          <div className="text-sm text-green-600">{ubicacion.cantidadPrestadores || 0} prestadores</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ubicación seleccionada */}
          {ubicacionSeleccionada && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-green-800">{ubicacionSeleccionada.nombre}</div>
                  <div className="text-sm text-green-600">
                    {ubicacionSeleccionada.detalles?.provincia && `${ubicacionSeleccionada.detalles.provincia} • `}
                    {ubicacionSeleccionada.coordenadas.fuente}
                  </div>
                </div>
                {ubicacionSeleccionada.sinDatos && (
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    <Database className="h-3 w-3 mr-1" />
                    Sin datos
                  </Badge>
                )}
              </div>

              {/* Alerta para provincias sin datos */}
              {ubicacionSeleccionada.sinDatos && (
                <Alert className="mt-3 border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    <strong>Datos no disponibles:</strong> La cartilla médica para esta provincia aún no está disponible
                    en nuestro sistema. Mostramos los prestadores más cercanos de otras provincias.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* ✅ REMOVIDO EL CONTROL DE RADIO DUPLICADO */}

          {cargando && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
              <div className="text-sm text-gray-500 mt-2">Buscando ubicaciones...</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
