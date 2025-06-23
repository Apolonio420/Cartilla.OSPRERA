"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Importar las categorías de forma segura
let CATEGORIAS_SAFE: string[] = []
let SUBCATEGORIAS_SAFE: Record<string, any[]> = {}

try {
  const { CATEGORIAS, SUBCATEGORIAS } = require("@/app/lib/categorias")
  CATEGORIAS_SAFE = CATEGORIAS || []
  SUBCATEGORIAS_SAFE = SUBCATEGORIAS || {}
} catch (error) {
  console.error("Error importing categories:", error)
}

export function ReclamoFormSimple() {
  const [categoria, setCategoria] = useState("")
  const [subcategoria, setSubcategoria] = useState("")
  const [subcategorias, setSubcategorias] = useState<any[]>([])

  useEffect(() => {
    if (categoria && SUBCATEGORIAS_SAFE[categoria]) {
      setSubcategorias(SUBCATEGORIAS_SAFE[categoria] || [])
      setSubcategoria("")
    } else {
      setSubcategorias([])
      setSubcategoria("")
    }
  }, [categoria])

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Nuevo Reclamo (Modo Debug)</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Categoría</label>
          <Select value={categoria} onValueChange={setCategoria}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccione una categoría" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIAS_SAFE && CATEGORIAS_SAFE.length > 0 ? (
                CATEGORIAS_SAFE.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-data" disabled>
                  No hay categorías disponibles
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {categoria && (
          <div>
            <label className="block text-sm font-medium mb-2">Subcategoría</label>
            <Select value={subcategoria} onValueChange={setSubcategoria}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione una subcategoría" />
              </SelectTrigger>
              <SelectContent>
                {subcategorias && subcategorias.length > 0 ? (
                  subcategorias.map((subcat) => (
                    <SelectItem key={subcat.label} value={subcat.label}>
                      {subcat.label}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-data" disabled>
                    No hay subcategorías disponibles
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="mt-6">
          <h3 className="font-medium mb-2">Debug Info:</h3>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
            {JSON.stringify(
              {
                categorias_count: CATEGORIAS_SAFE.length,
                categoria_selected: categoria,
                subcategorias_count: subcategorias.length,
                subcategoria_selected: subcategoria,
              },
              null,
              2,
            )}
          </pre>
        </div>

        <Button className="w-full bg-[#00613c] hover:bg-[#00613c]/90">Continuar (Debug Mode)</Button>
      </div>
    </div>
  )
}
