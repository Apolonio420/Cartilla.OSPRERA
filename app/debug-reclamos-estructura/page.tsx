"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { reclamosService } from "@/app/lib/services/reclamos-service"

export default function DebugReclamosEstructura() {
  const [resultado, setResultado] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const verificarEstructura = async () => {
    setLoading(true)
    try {
      const result = await reclamosService.verificarEstructuraTabla()
      setResultado(result)
    } catch (error) {
      setResultado({ success: false, error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const verificarReclamo = async () => {
    setLoading(true)
    try {
      // Usar un ID de reclamo que sabemos que existe
      const result = await reclamosService.obtenerReclamoPorId("a59ecee9-9d99-42b5-8173-43e73bb93699")
      setResultado(result)
    } catch (error) {
      setResultado({ success: false, error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const probarActualizacion = async () => {
    setLoading(true)
    try {
      // Intentar actualizar el reclamo específico
      const result = await reclamosService.actualizarReclamo("a59ecee9-9d99-42b5-8173-43e73bb93699", {
        reiteraciones: 1,
        updated_at: new Date().toISOString(),
      })
      setResultado(result)
    } catch (error) {
      setResultado({ success: false, error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const probarActualizacionAPI = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/debug/test-update-reclamo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reclamoId: "a59ecee9-9d99-42b5-8173-43e73bb93699",
        }),
      })
      const result = await response.json()
      setResultado(result)
    } catch (error) {
      setResultado({ success: false, error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Debug - Estructura de Reclamos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <Button onClick={verificarEstructura} disabled={loading}>
              Verificar Estructura de Tabla
            </Button>
            <Button onClick={verificarReclamo} disabled={loading}>
              Verificar Reclamo Específico
            </Button>
            <Button onClick={probarActualizacion} disabled={loading}>
              Probar Actualización (Cliente)
            </Button>
            <Button onClick={probarActualizacionAPI} disabled={loading} variant="secondary">
              Probar Actualización (API)
            </Button>
          </div>

          {loading && <div>Cargando...</div>}

          {resultado && (
            <div className="mt-4">
              <h3 className="font-bold mb-2">Resultado:</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">{JSON.stringify(resultado, null, 2)}</pre>
            </div>
          )}

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <h4 className="font-bold text-yellow-800 mb-2">Pasos para solucionar:</h4>
            <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
              <li>Ejecuta el script SQL para arreglar las políticas RLS</li>
              <li>Prueba la actualización usando el botón "Probar Actualización (API)"</li>
              <li>Si funciona, el problema eran los permisos de Supabase</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
