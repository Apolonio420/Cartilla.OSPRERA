"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugTables() {
  const [loading, setLoading] = useState(false)
  const [tablesInfo, setTablesInfo] = useState<any>(null)

  const checkTables = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/debug/tables-info")
      const data = await response.json()
      console.log("📊 Info de tablas:", data)
      setTablesInfo(data)
    } catch (error) {
      console.error("❌ Error:", error)
      setTablesInfo({ error: error instanceof Error ? error.message : "Error desconocido" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkTables()
  }, [])

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>🔍 Debug - Información de Tablas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={checkTables} disabled={loading} className="w-full">
            {loading ? "Verificando..." : "🔄 Verificar Tablas"}
          </Button>

          {tablesInfo && (
            <div className="space-y-4">
              {tablesInfo.success ? (
                <div className="space-y-3">
                  {tablesInfo.tables.map((table: any, index: number) => (
                    <Card key={index} className={table.exists ? "border-green-200" : "border-red-200"}>
                      <CardHeader className="pb-2">
                        <CardTitle className={`text-lg ${table.exists ? "text-green-700" : "text-red-700"}`}>
                          {table.exists ? "✅" : "❌"} {table.table}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {table.exists ? (
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Registros encontrados: {table.recordCount}</p>
                            <div className="bg-gray-50 p-2 rounded">
                              <p className="text-xs font-medium mb-1">Campos disponibles:</p>
                              <p className="text-xs text-gray-700">{table.fields.join(", ") || "Sin campos"}</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-red-600">Error: {table.error}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-red-200">
                  <CardContent className="pt-6">
                    <p className="text-red-600">Error: {tablesInfo.error}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
