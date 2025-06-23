"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestBusquedas() {
  const [loading, setLoading] = useState(false)
  const [resultados, setResultados] = useState<any>(null)
  const [termino, setTermino] = useState("vicente")

  const probarEspecialidades = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/test/especialidades?q=${termino}`)
      const data = await response.json()
      setResultados({ tipo: "especialidades", data })
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const probarLocalidades = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/test/localidades?q=${termino}`)
      const data = await response.json()
      setResultados({ tipo: "localidades", data })
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const probarFarmacias = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/test/farmacias?q=${termino}`)
      const data = await response.json()
      setResultados({ tipo: "farmacias", data })
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Test de Búsquedas</h1>

      <div className="mb-6">
        <Input
          placeholder="Término de búsqueda"
          value={termino}
          onChange={(e) => setTermino(e.target.value)}
          className="mb-4"
        />

        <div className="flex gap-4">
          <Button onClick={probarEspecialidades} disabled={loading}>
            Probar Especialidades
          </Button>
          <Button onClick={probarLocalidades} disabled={loading}>
            Probar Localidades
          </Button>
          <Button onClick={probarFarmacias} disabled={loading}>
            Probar Farmacias
          </Button>
        </div>
      </div>

      {resultados && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados de {resultados.tipo}</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(resultados.data, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
