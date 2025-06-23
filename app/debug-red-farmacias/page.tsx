"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function DebugRedFarmaciasPage() {
  const [tableInfo, setTableInfo] = useState<any>(null)
  const [sampleData, setSampleData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTest, setSearchTest] = useState("")
  const [searchResults, setSearchResults] = useState<any>(null)

  const checkTableStructure = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/debug/red-farmacias-structure")
      const data = await response.json()
      setTableInfo(data)
    } catch (error) {
      console.error("Error checking table structure:", error)
    } finally {
      setLoading(false)
    }
  }

  const testSearch = async () => {
    if (!searchTest) return

    setLoading(true)
    try {
      const response = await fetch(`/api/red-farmacias/search?q=${encodeURIComponent(searchTest)}`)
      const data = await response.json()
      setSearchResults(data)
    } catch (error) {
      console.error("Error testing search:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkTableStructure()
  }, [])

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Debug Red de Farmacias</h1>

      <div className="space-y-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Estructura de la Tabla</h2>
          <Button onClick={checkTableStructure} disabled={loading}>
            {loading ? "Verificando..." : "Verificar Estructura"}
          </Button>

          {tableInfo && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Información de la tabla:</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">{JSON.stringify(tableInfo, null, 2)}</pre>
            </div>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Test de Búsqueda</h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={searchTest}
              onChange={(e) => setSearchTest(e.target.value)}
              placeholder="Término de búsqueda (ej: farmacity, san)"
              className="flex-1 px-3 py-2 border rounded"
            />
            <Button onClick={testSearch} disabled={loading || !searchTest}>
              {loading ? "Buscando..." : "Buscar"}
            </Button>
          </div>

          {searchResults && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Resultados de búsqueda:</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(searchResults, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
