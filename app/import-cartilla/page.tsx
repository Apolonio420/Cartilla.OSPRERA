"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

export default function ImportCartillaPage() {
  const [csvUrl, setCsvUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [tables, setTables] = useState<any[]>([])
  const [isLoadingTables, setIsLoadingTables] = useState(false)

  const handleImport = async () => {
    if (!csvUrl) {
      setError("Por favor ingrese una URL de CSV válida")
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/import/cartilla", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ csvUrl }),
      })

      const data = await response.json()

      if (data.success) {
        setResult(data)
      } else {
        setError(data.error || "Error al importar datos")
      }
    } catch (err) {
      console.error("❌ Error:", err)
      setError("Error de conexión")
    } finally {
      setIsLoading(false)
    }
  }

  const loadTables = async () => {
    setIsLoadingTables(true)
    setError(null)

    try {
      const response = await fetch("/api/debug/all-tables")
      const data = await response.json()

      if (data.success) {
        setTables(data.details || [])
      } else {
        setError(data.error || "Error al cargar tablas")
      }
    } catch (err) {
      console.error("❌ Error:", err)
      setError("Error de conexión")
    } finally {
      setIsLoadingTables(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Importar Datos de Cartilla</h1>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tablas Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={loadTables} disabled={isLoadingTables} className="mb-4">
              {isLoadingTables ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando...
                </>
              ) : (
                "Cargar Tablas"
              )}
            </Button>

            {tables.length > 0 && (
              <div className="space-y-4">
                <p>Se encontraron {tables.length} tablas:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tables.map((table) => (
                    <div
                      key={table.name}
                      className={`p-4 rounded-md border ${
                        table.hasData ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{table.name}</h3>
                        <span
                          className={`text-sm px-2 py-1 rounded-full ${
                            table.hasData ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {table.count} registros
                        </span>
                      </div>
                      {table.columns.length > 0 && (
                        <div className="mt-2 text-xs text-gray-600">
                          <strong>Columnas:</strong> {table.columns.join(", ")}
                        </div>
                      )}
                      {table.sample && table.sample.length > 0 && (
                        <details className="mt-2">
                          <summary className="text-xs cursor-pointer text-blue-600">Ver muestra de datos</summary>
                          <pre className="mt-1 bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
                            {JSON.stringify(table.sample[0], null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Importar CSV a Cartilla</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="csvUrl" className="text-sm font-medium">
                  URL del archivo CSV
                </label>
                <Input
                  id="csvUrl"
                  placeholder="https://ejemplo.com/cartilla.csv"
                  value={csvUrl}
                  onChange={(e) => setCsvUrl(e.target.value)}
                />
              </div>

              <Button onClick={handleImport} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Importando...
                  </>
                ) : (
                  "Importar Datos"
                )}
              </Button>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              {result && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <p className="text-green-800 font-medium">Importación exitosa</p>
                  </div>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Se importaron {result.importedCount} registros a la tabla Cartilla.</p>
                    <p className="mt-1">Tiempo de procesamiento: {result.timeElapsed}ms</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
