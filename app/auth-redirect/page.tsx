"use client"

import { useEffect, useState } from "react"
import { verificarDni } from "@/app/actions/auth-actions"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function AuthRedirectPage() {
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const router = useRouter()

  console.log("🔍 AUTH-REDIRECT - Renderizando página de redirección")

  useEffect(() => {
    async function processAuth() {
      console.log("🔍 AUTH-REDIRECT - Iniciando procesamiento de autenticación")
      try {
        // Recuperar datos de sessionStorage
        const authDataStr = sessionStorage.getItem("authData")
        console.log("🔍 AUTH-REDIRECT - Datos recuperados de sessionStorage:", authDataStr)

        if (!authDataStr) {
          setError("No se encontraron datos de autenticación")
          setDebugInfo({ error: "No auth data in sessionStorage" })
          return
        }

        const authData = JSON.parse(authDataStr)
        console.log("🔍 AUTH-REDIRECT - Datos parseados:", authData)
        setDebugInfo({ step: "Datos recuperados", authData })

        // Llamar a la acción del servidor
        try {
          console.log("🔍 AUTH-REDIRECT - Llamando a verificarDni")
          const result = await verificarDni(authData)
          console.log("🔍 AUTH-REDIRECT - Resultado de verificación:", result)
          setDebugInfo((prev) => ({ ...prev, step: "Verificación completada", result }))

          if (result.success) {
            // Limpiar sessionStorage
            sessionStorage.removeItem("authData")
            console.log("🔍 AUTH-REDIRECT - SessionStorage limpiado")
            setDebugInfo((prev) => ({ ...prev, step: "Redirigiendo al dashboard" }))

            // Redirigir al dashboard
            console.log("🔍 AUTH-REDIRECT - Redirigiendo a /dashboard")
            window.location.href = "/dashboard"
          } else {
            console.log("🔍 AUTH-REDIRECT - Error en verificación:", result.error)
            setError(result.error || "Error de autenticación")
            setDebugInfo((prev) => ({ ...prev, step: "Error en verificación", error: result.error }))
          }
        } catch (serverError: any) {
          console.error("🔍 AUTH-REDIRECT - Error en la acción del servidor:", serverError)
          setError(`Error en el servidor: ${serverError.message || "Error desconocido"}`)
          setDebugInfo((prev) => ({
            ...prev,
            step: "Error en acción del servidor",
            error: serverError.message,
            stack: serverError.stack,
          }))
        }
      } catch (error: any) {
        console.error("🔍 AUTH-REDIRECT - Error en la autenticación:", error)
        setError(`Ocurrió un error inesperado: ${error.message || "Error desconocido"}`)
        setDebugInfo({
          step: "Error general",
          error: error.message,
          stack: error.stack,
        })
      }
    }

    processAuth()
  }, [router])

  if (error) {
    console.log("🔍 AUTH-REDIRECT - Mostrando error:", error)
    return (
      <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center p-4 bg-gray-50">
        <div className="text-center max-w-lg">
          <div className="text-red-500 mb-4 text-xl font-semibold">{error}</div>

          {process.env.NODE_ENV !== "production" && debugInfo && (
            <div className="mb-6 text-left bg-gray-100 p-4 rounded-md overflow-auto max-h-60 text-xs">
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          )}

          <button
            onClick={() => (window.location.href = "/")}
            className="px-4 py-2 bg-[#00613c] text-white rounded-md hover:bg-[#00613c]/90"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  console.log("🔍 AUTH-REDIRECT - Mostrando pantalla de carga")
  return (
    <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center p-4 bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#00613c] mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Procesando su solicitud</h2>
        <p className="text-gray-500">Por favor espere mientras verificamos sus datos...</p>
      </div>
    </div>
  )
}
