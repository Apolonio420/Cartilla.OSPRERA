"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react"

export default function FixDatabasePage() {
  const [status, setStatus] = useState<"idle" | "checking" | "fixing" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [details, setDetails] = useState<string[]>([])

  const checkDatabase = async () => {
    setStatus("checking")
    setMessage("Verificando estructura de la base de datos...")
    setDetails([])

    try {
      const response = await fetch("/api/admin/check-database", {
        method: "POST",
      })

      const result = await response.json()

      if (result.success) {
        setStatus("success")
        setMessage("✅ Base de datos verificada correctamente")
        setDetails(result.details || [])
      } else {
        setStatus("error")
        setMessage(result.error || "Error al verificar la base de datos")
        setDetails(result.details || [])
      }
    } catch (error) {
      setStatus("error")
      setMessage("Error de conexión al verificar la base de datos")
      setDetails([])
    }
  }

  const fixDatabase = async () => {
    setStatus("fixing")
    setMessage("Actualizando estructura de la base de datos...")
    setDetails([])

    try {
      const response = await fetch("/api/admin/fix-database", {
        method: "POST",
      })

      const result = await response.json()

      if (result.success) {
        setStatus("success")
        setMessage("✅ Base de datos actualizada correctamente")
        setDetails(result.details || [])
      } else {
        setStatus("error")
        setMessage(result.error || "Error al actualizar la base de datos")
        setDetails(result.details || [])
      }
    } catch (error) {
      setStatus("error")
      setMessage("Error de conexión al actualizar la base de datos")
      setDetails([])
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case "checking":
      case "fixing":
        return <Loader2 className="h-4 w-4 animate-spin" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case "success":
        return "border-green-200 bg-green-50"
      case "error":
        return "border-red-200 bg-red-50"
      case "checking":
      case "fixing":
        return "border-blue-200 bg-blue-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Reparar Base de Datos</h1>
        <p className="text-gray-600 mt-2">Herramienta para verificar y actualizar la estructura de la base de datos</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Diagnóstico de Base de Datos</CardTitle>
            <CardDescription>Verifica si la estructura de la base de datos está actualizada</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button onClick={checkDatabase} disabled={status === "checking" || status === "fixing"} variant="outline">
                {status === "checking" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  "Verificar Base de Datos"
                )}
              </Button>

              <Button
                onClick={fixDatabase}
                disabled={status === "checking" || status === "fixing"}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {status === "fixing" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  "Actualizar Base de Datos"
                )}
              </Button>
            </div>

            {message && (
              <Alert className={getStatusColor()}>
                <div className="flex items-center gap-2">
                  {getStatusIcon()}
                  <AlertDescription>{message}</AlertDescription>
                </div>
              </Alert>
            )}

            {details.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Detalles:</h4>
                <ul className="space-y-1">
                  {details.map((detail, index) => (
                    <li key={index} className="text-sm text-gray-700">
                      • {detail}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instrucciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Pasos para solucionar el problema:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                <li>Haz clic en "Verificar Base de Datos" para diagnosticar el problema</li>
                <li>Si hay problemas, haz clic en "Actualizar Base de Datos" para solucionarlos</li>
                <li>Una vez actualizada, prueba la sincronización nuevamente</li>
              </ol>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Importante:</strong> La actualización de la base de datos añadirá los campos faltantes (nombre,
                apellido, domicilio, provincia, localidad, plan, estado) a la tabla Afiliado.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
