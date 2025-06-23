"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function QuickTestPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const probar = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-github")
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ success: false, error: "Error de conexión" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">🚀 Prueba Rápida GitHub</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Probar Archivos CSV</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={probar} disabled={loading} className="w-full">
            {loading ? "Probando..." : "Probar Conexión"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">{JSON.stringify(result, null, 2)}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
