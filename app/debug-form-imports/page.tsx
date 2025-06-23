"use client"

import { useEffect, useState } from "react"

export default function DebugFormImports() {
  const [importResults, setImportResults] = useState<any>({})
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    async function testImports() {
      const results: any = {}
      const errorList: string[] = []

      // Test 1: Importar CATEGORIAS
      try {
        console.log("🧪 Test 1: Importando CATEGORIAS...")
        const { CATEGORIAS } = await import("@/app/lib/categorias")
        results.CATEGORIAS = {
          success: true,
          type: typeof CATEGORIAS,
          isArray: Array.isArray(CATEGORIAS),
          length: CATEGORIAS?.length || 0,
          sample: CATEGORIAS?.slice(0, 3) || null,
        }
        console.log("✅ CATEGORIAS importado exitosamente:", CATEGORIAS)
      } catch (err: any) {
        console.error("❌ Error importando CATEGORIAS:", err)
        results.CATEGORIAS = { success: false, error: err.message }
        errorList.push(`CATEGORIAS: ${err.message}`)
      }

      // Test 2: Importar SUBCATEGORIAS
      try {
        console.log("🧪 Test 2: Importando SUBCATEGORIAS...")
        const { SUBCATEGORIAS } = await import("@/app/lib/categorias")
        results.SUBCATEGORIAS = {
          success: true,
          type: typeof SUBCATEGORIAS,
          isObject: typeof SUBCATEGORIAS === "object",
          keys: Object.keys(SUBCATEGORIAS || {}),
          sampleKey: Object.keys(SUBCATEGORIAS || {})[0] || null,
        }
        console.log("✅ SUBCATEGORIAS importado exitosamente:", SUBCATEGORIAS)
      } catch (err: any) {
        console.error("❌ Error importando SUBCATEGORIAS:", err)
        results.SUBCATEGORIAS = { success: false, error: err.message }
        errorList.push(`SUBCATEGORIAS: ${err.message}`)
      }

      // Test 3: Importar default
      try {
        console.log("🧪 Test 3: Importando default...")
        const defaultExport = await import("@/app/lib/categorias")
        results.default = {
          success: true,
          type: typeof defaultExport.default,
          hasDefault: "default" in defaultExport,
          defaultValue: defaultExport.default,
        }
        console.log("✅ Default importado exitosamente:", defaultExport.default)
      } catch (err: any) {
        console.error("❌ Error importando default:", err)
        results.default = { success: false, error: err.message }
        errorList.push(`Default: ${err.message}`)
      }

      // Test 4: Importar todo
      try {
        console.log("🧪 Test 4: Importando todo el módulo...")
        const everything = await import("@/app/lib/categorias")
        results.everything = {
          success: true,
          allKeys: Object.keys(everything),
          module: everything,
        }
        console.log("✅ Módulo completo:", everything)
      } catch (err: any) {
        console.error("❌ Error importando módulo completo:", err)
        results.everything = { success: false, error: err.message }
        errorList.push(`Módulo completo: ${err.message}`)
      }

      setImportResults(results)
      setErrors(errorList)
    }

    testImports()
  }, [])

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug de Importaciones del Formulario</h1>

      {errors.length > 0 && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <h3 className="font-semibold mb-2">Errores encontrados:</h3>
          <ul className="list-disc list-inside">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(importResults).map(([key, result]: [string, any]) => (
          <div
            key={key}
            className={`p-4 rounded border ${result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
          >
            <h3 className="font-semibold mb-2 flex items-center">
              {result.success ? "✅" : "❌"} {key.toUpperCase()}
            </h3>

            {result.success ? (
              <div className="space-y-2">
                <p>
                  <strong>Tipo:</strong> {result.type}
                </p>
                {result.isArray !== undefined && (
                  <p>
                    <strong>Es Array:</strong> {result.isArray ? "Sí" : "No"}
                  </p>
                )}
                {result.isObject !== undefined && (
                  <p>
                    <strong>Es Objeto:</strong> {result.isObject ? "Sí" : "No"}
                  </p>
                )}
                {result.length !== undefined && (
                  <p>
                    <strong>Longitud:</strong> {result.length}
                  </p>
                )}
                {result.keys && (
                  <p>
                    <strong>Claves:</strong> {result.keys.join(", ")}
                  </p>
                )}
                {result.allKeys && (
                  <p>
                    <strong>Todas las claves:</strong> {result.allKeys.join(", ")}
                  </p>
                )}

                {result.sample && (
                  <details className="mt-2">
                    <summary className="cursor-pointer font-medium">Ver muestra</summary>
                    <pre className="text-xs mt-2 p-2 bg-white rounded overflow-auto max-h-32">
                      {JSON.stringify(result.sample, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ) : (
              <p className="text-red-600">
                <strong>Error:</strong> {result.error}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded">
        <h3 className="font-semibold mb-2">🔍 Cómo usar esta información:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Si CATEGORIAS y SUBCATEGORIAS fallan, el archivo no tiene esas exportaciones</li>
          <li>Si solo default funciona, el archivo usa exportación por defecto</li>
          <li>Revisa la consola para logs detallados</li>
          <li>Compara las claves disponibles con lo que necesita el formulario</li>
        </ol>
      </div>
    </div>
  )
}
