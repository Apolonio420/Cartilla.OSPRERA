"use client"

import { useState } from "react"
import { CartillaSearch } from "@/app/components/ui/cartilla-search"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export default function TestCartillaPage() {
  const [selectedPrestador, setSelectedPrestador] = useState<any>(null)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [structure, setStructure] = useState<any>(null)
  const [compareResults, setCompareResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (query: string) => {
    if (query.length < 2) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/cartilla/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()

      console.log("🔍 Respuesta de búsqueda:", data)

      if (data.success) {
        setSearchResults(data.prestadores || [])
      } else {
        setError(data.error || "Error al buscar prestadores")
        setSearchResults([])
      }
    } catch (err) {
      console.error("❌ Error de búsqueda:", err)
      setError("Error de conexión")
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const analyzeStructure = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("🔧 Analizando estructura...")
      const response = await fetch("/api/debug/cartilla-structure")
      const data = await response.json()

      console.log("📊 Estructura obtenida:", data)
      setStructure(data.structure)

      if (!data.success) {
        setError(data.error || "Error al analizar estructura")
      }
    } catch (err) {
      console.error("❌ Error:", err)
      setError("Error al analizar estructura")
    } finally {
      setIsLoading(false)
    }
  }

  const compareTables = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("🔧 Comparando tablas...")
      const response = await fetch("/api/debug/compare-tables")
      const data = await response.json()

      console.log("📊 Comparación de tablas:", data)
      setCompareResults(data.results)

      if (!data.success) {
        setError(data.error || "Error al comparar tablas")
      }
    } catch (err) {
      console.error("❌ Error:", err)
      setError("Error al comparar tablas")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Test de Búsqueda en Cartilla</h1>

      <div className="grid grid-cols-1 gap-6">
        {/* Comparación de Tablas */}
        <Card>
          <CardHeader>
            <CardTitle>Comparación de Acceso a Tablas</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={compareTables} disabled={isLoading} className="mb-4">
              {isLoading ? "Comparando..." : "Comparar Acceso a Tablas"}
            </Button>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {compareResults && (
              <div className="space-y-4">
                <h3 className="font-medium">Resultados de comparación:</h3>

                {Object.entries(compareResults)
                  .filter(([key]) => !key.startsWith("_"))
                  .map(([tableName, result]: [string, any]) => (
                    <div
                      key={tableName}
                      className={`p-4 border rounded-md ${result.success ? "bg-green-50" : "bg-red-50"}`}
                    >
                      <div className="flex items-center gap-2">
                        {result.success ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-600" />
                        )}
                        <h4 className="font-medium">{tableName}</h4>
                      </div>

                      {result.success ? (
                        <div className="mt-2 space-y-2">
                          <p>Registros: {result.count}</p>
                          {result.columns && (
                            <div>
                              <p>Columnas: {result.columns.length}</p>
                              <div className="mt-1 text-xs text-gray-600">{result.columns.join(", ")}</div>
                            </div>
                          )}
                          {result.sample && (
                            <details>
                              <summary className="text-sm cursor-pointer">Ver muestra</summary>
                              <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                                {JSON.stringify(result.sample, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      ) : (
                        <div className="mt-2 text-red-600">
                          <p>Error: {result.error}</p>
                          {result.details && (
                            <details>
                              <summary className="text-sm cursor-pointer">Ver detalles</summary>
                              <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                                {JSON.stringify(result.details, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                {/* Información de permisos */}
                {compareResults._permissions && (
                  <details>
                    <summary className="font-medium cursor-pointer">Información de permisos</summary>
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                      {JSON.stringify(compareResults._permissions, null, 2)}
                    </pre>
                  </details>
                )}

                {/* Lista de tablas */}
                {compareResults._tables && (
                  <details>
                    <summary className="font-medium cursor-pointer">Lista de tablas disponibles</summary>
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                      {JSON.stringify(compareResults._tables, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Análisis de Estructura */}
        <Card>
          <CardHeader>
            <CardTitle>Análisis de Estructura de Cartilla</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={analyzeStructure} disabled={isLoading} className="mb-4">
              {isLoading ? "Analizando..." : "Analizar Estructura"}
            </Button>

            {structure && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <strong>Total de registros:</strong> {structure.totalRecords}
                  </div>
                  <div>
                    <strong>Muestra obtenida:</strong> {structure.sampleSize}
                  </div>
                  <div>
                    <strong>Columnas:</strong> {structure.columns?.length || 0}
                  </div>
                </div>

                <div>
                  <strong>Columnas disponibles:</strong>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    {structure.columns?.map((col: string) => (
                      <div key={col} className="p-2 bg-gray-100 rounded">
                        <span className="font-medium">{col}</span>
                        {structure.columnTypes?.[col] && (
                          <div className="text-xs text-gray-600">
                            Tipo: {structure.columnTypes[col].type} |{" "}
                            {structure.columnTypes[col].hasData ? "Con datos" : "Sin datos"}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <strong>Muestra de datos:</strong>
                  <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
                    {JSON.stringify(structure.sampleData?.[0], null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Búsqueda */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Componente CartillaSearch</CardTitle>
            </CardHeader>
            <CardContent>
              <CartillaSearch
                onSelect={(prestador) => {
                  console.log("Prestador seleccionado:", prestador)
                  setSelectedPrestador(prestador)
                }}
                placeholder="Buscar prestador (ej: hospital, clinica, dr...)"
              />

              {selectedPrestador && (
                <div className="mt-4 p-4 border rounded-md">
                  <h3 className="font-medium">Prestador seleccionado:</h3>
                  <pre className="mt-2 bg-gray-100 p-2 rounded text-sm overflow-auto">
                    {JSON.stringify(selectedPrestador, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Búsqueda Manual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <Button onClick={() => handleSearch("hospital")} className="w-full">
                  Buscar "hospital"
                </Button>
                <Button onClick={() => handleSearch("clinica")} className="w-full">
                  Buscar "clinica"
                </Button>
                <Button onClick={() => handleSearch("centro")} className="w-full">
                  Buscar "centro"
                </Button>
              </div>

              <input
                type="text"
                placeholder="Término de búsqueda personalizado"
                className="w-full px-3 py-2 border rounded mb-2"
                onChange={(e) => {
                  if (e.target.value.length >= 2) {
                    handleSearch(e.target.value)
                  }
                }}
              />

              {isLoading && <p>Cargando...</p>}

              <div className="mt-2">
                <p>Resultados: {searchResults.length}</p>
                <div className="mt-2 max-h-96 overflow-y-auto border rounded-md">
                  {searchResults.map((prestador, index) => (
                    <div key={prestador.id || index} className="p-2 border-b hover:bg-gray-50">
                      <p className="font-medium">{prestador.nombre_completo}</p>
                      <p className="text-sm text-gray-600">
                        {prestador.especialidad} - {prestador.localidad}, {prestador.provincia}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
