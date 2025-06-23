"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugCartillaLocalidades() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/debug/cartilla-localidades")
      const result = await response.json()
      setData(result)
      console.log("🔍 Datos de localidades:", result)
    } catch (error) {
      console.error("❌ Error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Debug: Localidades en Cartilla</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchData} disabled={loading}>
            {loading ? "Cargando..." : "Obtener Localidades"}
          </Button>

          {data && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Estadísticas</h3>
                  <p>Total registros: {data.totalRegistros}</p>
                  <p>Total localidades: {data.totalLocalidades}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Vicente López variants</h3>
                  <div className="text-sm">
                    {data.vicenteLopezVariants?.map((loc: string, i: number) => (
                      <div key={i} className="bg-yellow-100 p-1 rounded mb-1">
                        {loc}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold">Primeras 20 localidades (detalle)</h3>
                <div className="max-h-60 overflow-y-auto text-sm">
                  {data.localidadesDetalle?.map((item: any, i: number) => (
                    <div key={i} className="border-b p-2">
                      <div>
                        <strong>Original:</strong> "{item.original}"
                      </div>
                      <div>
                        <strong>Normalizada:</strong> "{item.normalized}"
                      </div>
                      <div>
                        <strong>Prestador:</strong> {item.prestador}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold">Todas las localidades</h3>
                <div className="max-h-40 overflow-y-auto text-xs grid grid-cols-3 gap-1">
                  {data.localidades?.map((loc: string, i: number) => (
                    <div key={i} className="bg-gray-100 p-1 rounded">
                      {loc}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
