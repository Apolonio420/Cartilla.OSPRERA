"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, MapPin, Target } from "lucide-react"

export default function DebugCoordenadasCatamarca() {
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<any>(null)

  const analizarCoordenadas = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/debug/catamarca-coordenadas")
      const data = await response.json()
      setResultado(data)
      console.log("🔍 Análisis coordenadas Catamarca:", data)
    } catch (error) {
      console.error("❌ Error:", error)
      setResultado({ success: false, error: "Error de conexión" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#00613c] mb-2">🗺️ Debug: Coordenadas de Catamarca</h1>
          <p className="text-gray-600">Analizar por qué no aparecen en la búsqueda por proximidad</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Análisis de Coordenadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={analizarCoordenadas} disabled={loading} className="bg-[#00613c] hover:bg-[#004d30]">
              <Target className="mr-2 h-4 w-4" />
              {loading ? "Analizando..." : "Analizar Coordenadas de Catamarca"}
            </Button>
          </CardContent>
        </Card>

        {resultado && resultado.success && (
          <div className="space-y-6">
            {/* Estadísticas */}
            <Card>
              <CardHeader>
                <CardTitle>📊 Estadísticas de Distancia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{resultado.estadisticas?.total_catamarca}</div>
                    <div className="text-sm text-blue-800">Total Catamarca</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {resultado.estadisticas?.con_coordenadas_validas}
                    </div>
                    <div className="text-sm text-green-800">Coords Válidas</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{resultado.estadisticas?.dentro_50km}</div>
                    <div className="text-sm text-yellow-800">Dentro 50km</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{resultado.estadisticas?.dentro_100km}</div>
                    <div className="text-sm text-purple-800">Dentro 100km</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {resultado.estadisticas?.distancia_minima?.toFixed(1)}km
                    </div>
                    <div className="text-sm text-red-800">Más Cercano</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Coordenadas de Búsqueda */}
            <Card>
              <CardHeader>
                <CardTitle>🎯 Punto de Búsqueda</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-lg font-semibold">San Fernando del Valle de Catamarca</div>
                  <div className="text-gray-600">
                    📍 {resultado.coordenadas_busqueda?.latitud}, {resultado.coordenadas_busqueda?.longitud}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prestadores Más Cercanos */}
            <Card>
              <CardHeader>
                <CardTitle>🏆 Los 5 Más Cercanos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {resultado.mas_cercanos?.map((prestador: any, index: number) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold">{prestador.nombre}</div>
                        <div className="flex gap-2">
                          <Badge variant={prestador.dentro_50km ? "default" : "secondary"}>
                            {prestador.distancia_km}km
                          </Badge>
                          {prestador.dentro_50km && <Badge className="bg-green-600">Dentro 50km</Badge>}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mb-1">{prestador.localidad}</div>
                      <div className="text-xs text-gray-500">
                        📍 {prestador.latitud_parseada}, {prestador.longitud_parseada}
                      </div>
                      <div className="text-xs text-gray-500">
                        Válidas: Lat {prestador.latitud_valida ? "✅" : "❌"}, Lng{" "}
                        {prestador.longitud_valida ? "✅" : "❌"}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Verificación de Búsqueda */}
            <Card>
              <CardHeader>
                <CardTitle>🔍 Verificación de Búsqueda Original</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {resultado.verificacion_busqueda?.total_con_coordenadas}
                    </div>
                    <div className="text-sm text-blue-800">Total con Coordenadas</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {resultado.verificacion_busqueda?.catamarca_en_busqueda}
                    </div>
                    <div className="text-sm text-green-800">Catamarca en Búsqueda</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Diagnóstico */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Diagnóstico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {resultado.estadisticas?.dentro_50km === 0 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="font-semibold text-red-800">❌ Problema Identificado</div>
                      <div className="text-red-700 text-sm">
                        Ningún prestador de Catamarca está dentro de 50km del punto de búsqueda
                      </div>
                    </div>
                  )}

                  {resultado.estadisticas?.distancia_minima > 50 && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="font-semibold text-yellow-800">⚠️ Radio Insuficiente</div>
                      <div className="text-yellow-700 text-sm">
                        El prestador más cercano está a {resultado.estadisticas.distancia_minima}km. Aumentar radio a{" "}
                        {Math.ceil(resultado.estadisticas.distancia_minima) + 10}km
                      </div>
                    </div>
                  )}

                  {resultado.estadisticas?.con_coordenadas_validas < resultado.estadisticas?.total_catamarca && (
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="font-semibold text-orange-800">⚠️ Coordenadas Inválidas</div>
                      <div className="text-orange-700 text-sm">
                        {resultado.estadisticas.total_catamarca - resultado.estadisticas.con_coordenadas_validas}{" "}
                        prestadores tienen coordenadas inválidas
                      </div>
                    </div>
                  )}

                  {resultado.estadisticas?.dentro_100km > 0 && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="font-semibold text-green-800">✅ Solución</div>
                      <div className="text-green-700 text-sm">
                        Hay {resultado.estadisticas.dentro_100km} prestadores dentro de 100km. Aumentar el radio de
                        búsqueda.
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {resultado && !resultado.success && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span>Error: {resultado.error}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
