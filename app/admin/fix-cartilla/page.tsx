"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Settings, Shield } from "lucide-react"

export default function FixCartillaPage() {
  const [policies, setPolicies] = useState<any>(null)
  const [fixResult, setFixResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkPolicies = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("🔍 Verificando políticas...")
      const response = await fetch("/api/admin/check-policies")
      const data = await response.json()

      console.log("📊 Políticas obtenidas:", data)
      setPolicies(data.results)

      if (!data.success) {
        setError(data.error || "Error al verificar políticas")
      }
    } catch (err) {
      console.error("❌ Error:", err)
      setError("Error al verificar políticas")
    } finally {
      setIsLoading(false)
    }
  }

  const fixCartillaPolicies = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("🔧 Configurando políticas de Cartilla...")
      const response = await fetch("/api/admin/fix-cartilla-policies", {
        method: "POST",
      })
      const data = await response.json()

      console.log("📊 Resultado de configuración:", data)
      setFixResult(data)

      if (!data.success) {
        setError(data.error || "Error al configurar políticas")
      } else {
        // Refrescar verificación de políticas
        setTimeout(checkPolicies, 1000)
      }
    } catch (err) {
      console.error("❌ Error:", err)
      setError("Error al configurar políticas")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Shield className="h-6 w-6" />
        Configuración de Políticas - Tabla Cartilla
      </h1>

      <div className="grid grid-cols-1 gap-6">
        {/* Verificación de Políticas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Verificación de Políticas de Seguridad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={checkPolicies} disabled={isLoading} className="mb-4">
              {isLoading ? "Verificando..." : "Verificar Políticas"}
            </Button>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {policies && (
              <div className="space-y-4">
                <h3 className="font-medium">Estado de acceso por tabla:</h3>

                {Object.entries(policies).map(([tableName, result]: [string, any]) => (
                  <div
                    key={tableName}
                    className={`p-4 border rounded-md ${result.normalAccess?.success ? "bg-green-50" : "bg-red-50"}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {result.normalAccess?.success ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      )}
                      <h4 className="font-medium">{tableName}</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Acceso normal:</strong>
                        <div className={result.normalAccess?.success ? "text-green-600" : "text-red-600"}>
                          {result.normalAccess?.success ? "✅ Exitoso" : "❌ Bloqueado"}
                        </div>
                        <div>Registros: {result.normalAccess?.count || 0}</div>
                        {result.normalAccess?.error && (
                          <div className="text-xs text-red-500">Error: {result.normalAccess.error}</div>
                        )}
                      </div>

                      <div>
                        <strong>Acceso admin:</strong>
                        <div className={result.adminAccess?.success ? "text-green-600" : "text-red-600"}>
                          {result.adminAccess?.success ? "✅ Exitoso" : "❌ Bloqueado"}
                        </div>
                        <div>Registros: {result.adminAccess?.count || 0}</div>
                        {result.adminAccess?.error && (
                          <div className="text-xs text-red-500">Error: {result.adminAccess.error}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configuración de Cartilla */}
        <Card>
          <CardHeader>
            <CardTitle>Configurar Políticas de Cartilla</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Esta acción configurará las políticas necesarias para permitir el acceso público de lectura a la tabla
                Cartilla.
              </p>
              <ul className="text-xs text-gray-500 list-disc list-inside space-y-1">
                <li>Deshabilitará Row Level Security (RLS) en la tabla Cartilla</li>
                <li>Creará una política de lectura pública si es necesario</li>
                <li>Verificará que los datos sean accesibles después de la configuración</li>
              </ul>
            </div>

            <Button onClick={fixCartillaPolicies} disabled={isLoading} className="mb-4">
              {isLoading ? "Configurando..." : "Configurar Políticas de Cartilla"}
            </Button>

            {fixResult && (
              <div className="space-y-4">
                <h3 className="font-medium">Resultado de la configuración:</h3>

                <div className="space-y-2">
                  {fixResult.results?.map((result: any, index: number) => (
                    <div
                      key={index}
                      className={`p-3 border rounded-md ${result.success ? "bg-green-50" : "bg-red-50"}`}
                    >
                      <div className="flex items-center gap-2">
                        {result.success ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="font-medium">{result.name}</span>
                      </div>
                      {result.error && <div className="text-sm text-red-600 mt-1">Error: {result.error}</div>}
                    </div>
                  ))}
                </div>

                {fixResult.testResult && (
                  <div className="p-4 border rounded-md bg-blue-50">
                    <h4 className="font-medium mb-2">Prueba después de la configuración:</h4>
                    <div className="text-sm">
                      <div>Registros encontrados: {fixResult.testResult.count}</div>
                      {fixResult.testResult.error && (
                        <div className="text-red-600">Error: {fixResult.testResult.error}</div>
                      )}
                      {fixResult.testResult.sample && (
                        <details className="mt-2">
                          <summary className="cursor-pointer">Ver muestra de datos</summary>
                          <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                            {JSON.stringify(fixResult.testResult.sample, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
