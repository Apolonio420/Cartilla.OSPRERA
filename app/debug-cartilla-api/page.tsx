"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugCartillaAPI() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [localidad, setLocalidad] = useState("Moreno")
  const [query, setQuery] = useState("a")

  const testAPI = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        q: query,
        localidad: localidad,
      })

      console.log("🔍 Probando API con:", { query, localidad })
      const response = await fetch(`/api/cartilla/search?${params.toString()}`)
      const data = await response.json()

      console.log("📊 Respuesta completa:", data)
      setResult(data)
    } catch (error) {
      console.error("❌ Error:", error)
      setResult({ error: error instanceof Error ? error.message : "Error desconocido" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>🔧 Debug API Cartilla</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Localidad:</label>
              <Input value={localidad} onChange={(e) => setLocalidad(e.target.value)} placeholder="Ej: Moreno" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Query:</label>
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ej: a" />
            </div>
          </div>

          <Button onClick={testAPI} disabled={loading} className="w-full">
            {loading ? "Probando..." : "🔍 Probar API"}
          </Button>

          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📊 Resultado:</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
                  {JSON.stringify(result, null, 2)}
                </pre>

                {result.success && result.prestadores && (
                  <div className="mt-4">
                    <h4 className="font-medium">✅ Prestadores encontrados: {result.total}</h4>
                    {result.prestadores.slice(0, 3).map((prestador: any, index: number) => (
                      <div key={index} className="border-l-2 border-blue-500 pl-2 mt-2">
                        <p className="font-medium">{prestador.nombre}</p>
                        <p className="text-sm text-gray-600">
                          {prestador.especialidad} - {prestador.localidad}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {result.debug && (
                  <div className="mt-4 p-2 bg-yellow-50 rounded">
                    <h4 className="font-medium">🔍 Debug Info:</h4>
                    <p className="text-sm">Campos disponibles: {result.debug.sampleFields?.join(", ")}</p>
                    <p className="text-sm">Registros en DB: {result.debug.cartillaRecords}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
