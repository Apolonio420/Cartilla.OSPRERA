"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export default function DebugSupabaseTables() {
  const [tablas, setTablas] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [testReclamos, setTestReclamos] = useState<any>(null)

  const verificarTablas = async () => {
    setLoading(true)
    try {
      // Intentar obtener información de las tablas
      const { data, error } = await supabase.rpc("get_table_names")

      if (error) {
        console.log("Error con RPC, intentando método alternativo...")
        // Método alternativo: intentar acceder a diferentes nombres de tabla
        const posiblesNombres = ["reclamos", "Reclamos", "RECLAMOS", "reclamo", "Reclamo", "RECLAMO"]
        const resultados = []

        for (const nombre of posiblesNombres) {
          try {
            const { data, error } = await supabase.from(nombre).select("*").limit(1)
            resultados.push({
              nombre,
              existe: !error,
              error: error?.message,
              data: data?.length || 0,
            })
          } catch (e) {
            resultados.push({
              nombre,
              existe: false,
              error: "Error de conexión",
            })
          }
        }

        setTablas({ method: "manual", resultados })
      } else {
        setTablas({ method: "rpc", data })
      }
    } catch (error) {
      console.error("Error:", error)
      setTablas({ error: error.toString() })
    } finally {
      setLoading(false)
    }
  }

  const probarTablaReclamos = async (nombreTabla: string) => {
    setLoading(true)
    try {
      console.log(`🧪 Probando tabla: ${nombreTabla}`)

      // Intentar SELECT
      const { data: selectData, error: selectError } = await supabase.from(nombreTabla).select("*").limit(5)

      // Intentar INSERT de prueba
      const datosTest = {
        dni: "12345678",
        categoria: "TEST",
        subcategoria: "TEST",
        detalle: { test: true },
      }

      const { data: insertData, error: insertError } = await supabase.from(nombreTabla).insert([datosTest]).select()

      setTestReclamos({
        tabla: nombreTabla,
        select: {
          success: !selectError,
          error: selectError?.message,
          data: selectData,
          count: selectData?.length || 0,
        },
        insert: {
          success: !insertError,
          error: insertError?.message,
          data: insertData,
        },
      })
    } catch (error) {
      setTestReclamos({
        tabla: nombreTabla,
        error: error.toString(),
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    verificarTablas()
  }, [])

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Debug: Tablas de Supabase</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={verificarTablas} disabled={loading}>
              {loading ? "Verificando..." : "Verificar Tablas"}
            </Button>

            {tablas && (
              <div className="space-y-4">
                <h3 className="font-semibold">Resultados:</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">{JSON.stringify(tablas, null, 2)}</pre>

                {tablas.resultados && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Tablas encontradas:</h4>
                    {tablas.resultados.map((resultado: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span className={resultado.existe ? "text-green-600" : "text-red-600"}>
                          {resultado.nombre}: {resultado.existe ? "✅ Existe" : "❌ No existe"}
                        </span>
                        {resultado.existe && (
                          <Button size="sm" onClick={() => probarTablaReclamos(resultado.nombre)}>
                            Probar
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {testReclamos && (
          <Card>
            <CardHeader>
              <CardTitle>Test de Tabla: {testReclamos.tabla}</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(testReclamos, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Información de Conexión</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>
                <strong>URL:</strong> {supabaseUrl}
              </div>
              <div>
                <strong>Key:</strong> {supabaseKey.substring(0, 20)}...
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
