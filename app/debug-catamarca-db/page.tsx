"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Database, Search, CheckCircle, XCircle } from "lucide-react"

export default function DebugCatamarcaDB() {
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<any>(null)

  const verificarCatamarca = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/debug/verificar-catamarca-db")
      const data = await response.json()
      setResultado(data)
      console.log("🔍 Resultado verificación Catamarca:", data)
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
          <h1 className="text-3xl font-bold text-[#00613c] mb-2">🔍 Debug: Catamarca en Base de Datos</h1>
          <p className="text-gray-600">Verificar si los datos de Catamarca están en Supabase</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Verificación de Datos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={verificarCatamarca} disabled={loading} className="bg-[#00613c] hover:bg-[#004d30]">
              <Search className="mr-2 h-4 w-4" />
              {loading ? "Verificando..." : "Verificar Catamarca en DB"}
            </Button>
          </CardContent>
        </Card>

        {resultado && (
          <div className="space-y-6">
            {/* Resumen General */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {resultado.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  Resumen General
                </CardTitle>
              </CardHeader>
              <CardContent>
                {resultado.success ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{resultado.resumen?.total_registros || 0}</div>
                      <div className="text-sm text-blue-800">Total Registros</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {resultado.resumen?.prestadores_catamarca || 0}
                      </div>
                      <div className="text-sm text-green-800">Prestadores Catamarca</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {resultado.resumen?.provincias_disponibles?.length || 0}
                      </div>
                      <div className="text-sm text-purple-800">Provincias Únicas</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>Error: {resultado.error}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Prestadores de Catamarca Encontrados */}
            {resultado.success && resultado.resumen?.catamarca_encontrados && (
              <Card>
                <CardHeader>
                  <CardTitle>🏥 Prestadores de Catamarca Encontrados</CardTitle>
                </CardHeader>
                <CardContent>
                  {resultado.resumen.catamarca_encontrados.length > 0 ? (
                    <div className="space-y-3">
                      {resultado.resumen.catamarca_encontrados.slice(0, 10).map((prestador: any, index: number) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="font-semibold">{prestador.NOMBRE_COMPLETO}</div>
                          <div className="text-sm text-gray-600">
                            {prestador.ESPECIALIDAD} - {prestador.LOCALIDAD}, {prestador.PROVINCIA}
                          </div>
                          <div className="text-xs text-gray-500">CUIT: {prestador.CUIT}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <AlertCircle className="h-12 w-12 mx-auto mb-2 text-yellow-500" />
                      <p className="font-semibold">No se encontraron prestadores de Catamarca</p>
                      <p className="text-sm">Los datos pueden no estar importados en la tabla Cartilla</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Variaciones de Búsqueda */}
            {resultado.success && resultado.resumen?.variaciones_catamarca && (
              <Card>
                <CardHeader>
                  <CardTitle>🔍 Búsquedas por Variaciones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(resultado.resumen.variaciones_catamarca).map(([variacion, count]) => (
                      <div key={variacion} className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-gray-800">{count as number}</div>
                        <div className="text-xs text-gray-600 capitalize">{variacion}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Provincias Disponibles */}
            {resultado.success && resultado.resumen?.provincias_disponibles && (
              <Card>
                <CardHeader>
                  <CardTitle>📍 Provincias en la Base de Datos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {resultado.resumen.provincias_disponibles.map((provincia: string, index: number) => (
                      <Badge key={index} variant="secondary" className="capitalize">
                        {provincia}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Estructura de la Tabla */}
            {resultado.success && resultado.resumen?.columnas_tabla && (
              <Card>
                <CardHeader>
                  <CardTitle>📋 Estructura de la Tabla Cartilla</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {resultado.resumen.columnas_tabla.map((columna: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {columna}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Datos de Muestra */}
            {resultado.debug?.sample_data && (
              <Card>
                <CardHeader>
                  <CardTitle>📄 Muestra de Datos</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto">
                    {JSON.stringify(resultado.debug.sample_data, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
