"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DatosValidation } from "@/app/components/ui/datos-validation"
import { obtenerDatosAfiliado } from "@/app/actions/user-actions"
import { obtenerDatosValidados } from "@/app/actions/validation-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ValidarDatosPage() {
  const [afiliado, setAfiliado] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get("return") || "/dashboard"

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true)
        console.log("🔍 Cargando datos para validación...")

        // Primero intentamos obtener datos validados
        const datosValidados = await obtenerDatosValidados()
        console.log("🔍 Datos validados:", datosValidados)

        // Luego obtenemos datos del afiliado
        const resultadoAfiliado = await obtenerDatosAfiliado()
        console.log("🔍 Datos afiliado:", resultadoAfiliado.afiliado)

        if (!resultadoAfiliado.success || !resultadoAfiliado.afiliado) {
          setError(resultadoAfiliado.error || "No se pudieron cargar los datos del afiliado")
          return
        }

        // Combinamos los datos, priorizando los validados
        const datosCompletos = {
          ...resultadoAfiliado.afiliado,
          // Si hay datos validados, usamos esos para teléfono y email
          telefono: datosValidados?.telefono_validado || resultadoAfiliado.afiliado.telefono,
          email: datosValidados?.email_validado || resultadoAfiliado.afiliado.email,
          // Agregamos flag para saber si son datos validados
          datosValidados: !!datosValidados,
          fechaValidacion: datosValidados?.fecha_validacion,
        }

        console.log("✅ Datos combinados:", datosCompletos)
        setAfiliado(datosCompletos)
      } catch (error) {
        console.error("❌ Error cargando datos:", error)
        setError("Error al cargar los datos")
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
  }, [])

  const handleValidationComplete = () => {
    // Redirigir de vuelta a donde vino
    router.push(returnUrl)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">Cargando datos de contacto...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !afiliado) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center">{error || "No se pudieron cargar los datos"}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <DatosValidation afiliado={afiliado} onValidationComplete={handleValidationComplete} />
      </div>
    </div>
  )
}
