"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DiagnosticoTablas() {
  const [tablas, setTablas] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [metodo, setMetodo] = useState("")

  const verificarTablas = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/diagnostico/tablas")
      const data = await response.json()

      if (data.success) {
        setTablas(data.tablas)
        setMetodo(data.metodo)
      } else {
        setError(data.error || "Error al obtener tablas")
      }
    } catch (err) {
      setError("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Diagnóstico de Tablas en Supabase</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={verificarTablas} disabled={loading}>
            {loading ? "Verificando..." : "Verificar Tablas Disponibles"}
          </Button>

          {metodo && (
            <div className="mt-4 p-3 bg-blue-100 text-blue-700 rounded">
              Método usado: {metodo === "alternativo" ? "Consulta directa" : "RPC"}
            </div>
          )}

          {error && <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">Error: {error}</div>}

          {tablas.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Tablas encontradas:</h3>
              <div className="grid gap-4">
                {tablas.map((tabla, index) => (
                  <div key={index} className="p-4 border rounded">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-green-700">{tabla.nombre}</h4>
                      <span className="text-sm text-gray-500">{tabla.totalRegistros} registros</span>
                    </div>
                    <p className="text-sm text-gray-600">Esquema: {tabla.esquema}</p>
                    {tabla.columnas && tabla.columnas.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-2">Columnas ({tabla.columnas.length}):</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {tabla.columnas.map((col: string, i: number) => (
                            <span key={i} className="px-2 py-1 bg-gray-100 text-xs rounded">
                              {col}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
