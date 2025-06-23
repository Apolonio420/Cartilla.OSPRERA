"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { crearReclamo } from "@/app/actions/reclamo-actions"
import { reclamosService } from "@/app/lib/services/reclamos-service"

export default function TestReclamosPage() {
  const [resultado, setResultado] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [conexionTest, setConexionTest] = useState<any>(null)
  const [dniTest, setDniTest] = useState<string>("")

  useEffect(() => {
    // Verificar conexión al cargar la página
    verificarConexion()
    // Verificar si hay DNI en cookies
    verificarDNI()
  }, [])

  const verificarConexion = async () => {
    try {
      const resultado = await reclamosService.verificarConexion()
      setConexionTest(resultado)
    } catch (error) {
      setConexionTest({ success: false, error: "Error al verificar conexión" })
    }
  }

  const verificarDNI = async () => {
    try {
      const response = await fetch("/api/auth/check-session")
      const data = await response.json()
      if (data.authenticated && data.dni) {
        setDniTest(data.dni)
      }
    } catch (error) {
      console.log("No se pudo verificar el DNI")
    }
  }

  const probarEnvio = async () => {
    setLoading(true)
    setResultado(null)

    try {
      // Datos de prueba
      const datosTest = {
        categoria: "CARTILLA",
        subcategoria: "NO ATIENDE",
        subsubcategoria: null,
        detalle: {
          localidad: "ROSARIO",
          especialidad: "CARDIOLOGIA",
          prestador: "HOSPITAL ITALIANO",
          descripcion: "Reclamo de prueba desde la aplicación",
        },
      }

      console.log("🧪 TEST - Enviando reclamo de prueba:", datosTest)

      const resultado = await crearReclamo(datosTest)

      console.log("🧪 TEST - Resultado completo:", resultado)
      setResultado(resultado)
    } catch (error) {
      console.error("🧪 TEST - Error:", error)
      setResultado({ success: false, error: "Error inesperado: " + error })
    } finally {
      setLoading(false)
    }
  }

  const probarConexionDirecta = async () => {
    setLoading(true)
    try {
      // Probar inserción directa con el servicio
      const datosTest = {
        dni: dniTest || "12345678", // Usar DNI de prueba si no hay uno autenticado
        categoria: "CARTILLA",
        subcategoria: "NO ATIENDE",
        detalle: {
          localidad: "ROSARIO",
          especialidad: "CARDIOLOGIA",
          prestador: "HOSPITAL ITALIANO",
          descripcion: "Reclamo de prueba directo",
        },
      }

      console.log("🧪 TEST DIRECTO - Enviando:", datosTest)
      const resultado = await reclamosService.crearReclamo(datosTest)
      console.log("🧪 TEST DIRECTO - Resultado:", resultado)
      setResultado(resultado)
    } catch (error) {
      console.error("🧪 TEST DIRECTO - Error:", error)
      setResultado({ success: false, error: "Error en test directo: " + error })
    } finally {
      setLoading(false)
    }
  }

  const probarAPI = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test/insert-reclamo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dni: dniTest,
          categoria: "CARTILLA",
          subcategoria: "NO ATIENDE",
          detalle: {
            localidad: "ROSARIO",
            especialidad: "CARDIOLOGIA",
            prestador: "HOSPITAL ITALIANO",
            descripcion: "Test desde API endpoint",
          },
        }),
      })

      const resultado = await response.json()
      console.log("🧪 TEST API - Resultado:", resultado)
      setResultado(resultado)
    } catch (error) {
      console.error("🧪 TEST API - Error:", error)
      setResultado({ success: false, error: "Error en test API: " + error })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Estado de conexión */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Conexión</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <strong>Conexión a Supabase:</strong>{" "}
                <span className={conexionTest?.success ? "text-green-600" : "text-red-600"}>
                  {conexionTest?.success ? "✅ Conectado" : "❌ Error"}
                </span>
              </div>
              <div>
                <strong>DNI en sesión:</strong>{" "}
                <span className={dniTest ? "text-green-600" : "text-red-600"}>
                  {dniTest ? `✅ ${dniTest}` : "❌ No autenticado"}
                </span>
              </div>
              {conexionTest?.error && <div className="text-red-600 text-sm">Error: {conexionTest.error}</div>}
              {conexionTest?.message && <div className="text-green-600 text-sm">{conexionTest.message}</div>}
            </div>
          </CardContent>
        </Card>

        {/* Test principal */}
        <Card>
          <CardHeader>
            <CardTitle>Test de Envío de Reclamos (con autenticación)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={probarEnvio} disabled={loading} className="w-full">
              {loading ? "Enviando..." : "Enviar Reclamo (con autenticación)"}
            </Button>
          </CardContent>
        </Card>

        {/* Test directo */}
        <Card>
          <CardHeader>
            <CardTitle>Test Directo (servicio)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={probarConexionDirecta} disabled={loading} variant="outline" className="w-full">
              {loading ? "Enviando..." : "Enviar Reclamo (servicio directo)"}
            </Button>
          </CardContent>
        </Card>

        {/* Test API */}
        <Card>
          <CardHeader>
            <CardTitle>Test API Endpoint</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={probarAPI} disabled={loading} variant="secondary" className="w-full">
              {loading ? "Enviando..." : "Enviar Reclamo (API endpoint)"}
            </Button>
          </CardContent>
        </Card>

        {/* Resultado */}
        {resultado && (
          <Card>
            <CardHeader>
              <CardTitle>Resultado del Test</CardTitle>
            </CardHeader>
            <CardContent>
              <pre
                className={`p-3 rounded text-sm ${
                  resultado.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}
              >
                {JSON.stringify(resultado, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
