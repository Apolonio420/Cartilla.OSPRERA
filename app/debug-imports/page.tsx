"use client"

import { useEffect, useState } from "react"

export default function DebugImports() {
  const [moduleInfo, setModuleInfo] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function checkImports() {
      try {
        console.log("🔍 Intentando importar desde @/app/lib/categorias...")

        // Intentar importar todo el módulo
        const module = await import("@/app/lib/categorias")
        console.log("📦 Módulo completo:", module)

        // Verificar qué exportaciones están disponibles
        const exports = Object.keys(module)
        console.log("📋 Exportaciones disponibles:", exports)

        // Verificar cada exportación específica
        const info = {
          moduleKeys: exports,
          hasCATEGORIAS: "CATEGORIAS" in module,
          hasSUBCATEGORIAS: "SUBCATEGORIAS" in module,
          hasDefault: "default" in module,
          CATEGORIAS: module.CATEGORIAS,
          SUBCATEGORIAS: module.SUBCATEGORIAS,
          default: module.default,
          fullModule: module,
        }

        console.log("🔍 Información detallada:", info)
        setModuleInfo(info)
      } catch (err: any) {
        console.error("❌ Error al importar:", err)
        setError(err.message)
      }
    }

    checkImports()
  }, [])

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug de Importaciones</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {moduleInfo && (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded">
            <h3 className="font-semibold mb-2">Exportaciones disponibles:</h3>
            <pre className="text-sm">{JSON.stringify(moduleInfo.moduleKeys, null, 2)}</pre>
          </div>

          <div className="bg-green-50 p-4 rounded">
            <h3 className="font-semibold mb-2">Verificaciones:</h3>
            <ul className="space-y-1">
              <li>✅ Tiene CATEGORIAS: {moduleInfo.hasCATEGORIAS ? "SÍ" : "NO"}</li>
              <li>✅ Tiene SUBCATEGORIAS: {moduleInfo.hasSUBCATEGORIAS ? "SÍ" : "NO"}</li>
              <li>✅ Tiene default: {moduleInfo.hasDefault ? "SÍ" : "NO"}</li>
            </ul>
          </div>

          {moduleInfo.CATEGORIAS && (
            <div className="bg-yellow-50 p-4 rounded">
              <h3 className="font-semibold mb-2">CATEGORIAS:</h3>
              <pre className="text-sm overflow-auto max-h-40">{JSON.stringify(moduleInfo.CATEGORIAS, null, 2)}</pre>
            </div>
          )}

          {moduleInfo.SUBCATEGORIAS && (
            <div className="bg-purple-50 p-4 rounded">
              <h3 className="font-semibold mb-2">SUBCATEGORIAS:</h3>
              <pre className="text-sm overflow-auto max-h-40">
                {JSON.stringify(Object.keys(moduleInfo.SUBCATEGORIAS), null, 2)}
              </pre>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold mb-2">Módulo completo:</h3>
            <pre className="text-sm overflow-auto max-h-60">{JSON.stringify(moduleInfo.fullModule, null, 2)}</pre>
          </div>
        </div>
      )}

      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">Instrucciones:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Abre la consola del navegador (F12)</li>
          <li>Revisa los logs que empiezan con 🔍, 📦, 📋</li>
          <li>Verifica qué exportaciones están realmente disponibles</li>
          <li>Compara con lo que el formulario está intentando importar</li>
        </ol>
      </div>
    </div>
  )
}
