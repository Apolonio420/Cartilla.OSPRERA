"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestLocalidadesDebug() {
  const [query, setQuery] = useState("vicente")
  const [resultado, setResultado] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const buscarLocalidades = async () => {
    setLoading(true)
    try {
      console.log("🔍 Iniciando búsqueda debug con:", query)

      const response = await fetch(`/api/debug/localidades?q=${encodeURIComponent(query)}`)
      const data = await response.json()

      console.log("📊 Respuesta completa:", data)
      setResultado(data)
    } catch (error) {
      console.error("❌ Error en búsqueda:", error)
      setResultado({ error: "Error de red", details: error })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Debug de Búsqueda de Localidades</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Probar Búsqueda</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Término de búsqueda"
              className="flex-1"
            />
            <Button onClick={buscarLocalidades} disabled={loading}>
              {loading ? "Buscando..." : "Buscar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {resultado && (
        <Card>
          <CardHeader>
            <CardTitle>Resultado de la Búsqueda</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
              {JSON.stringify(resultado, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
