"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { guardarDatosValidados } from "@/app/actions/validation-actions"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface DatosValidationProps {
  afiliado: {
    dni: string
    nombreCompleto: string
    telefono?: string
    email?: string
    datosValidados?: boolean
    fechaValidacion?: string
  }
  onValidationComplete: () => void
}

export function DatosValidation({ afiliado, onValidationComplete }: DatosValidationProps) {
  const [step, setStep] = useState<"review" | "update">("review")
  const [isLoading, setIsLoading] = useState(false)
  const [nuevoTelefono, setNuevoTelefono] = useState(afiliado.telefono || "")
  const [nuevoEmail, setNuevoEmail] = useState(afiliado.email || "")

  const handleDatosCorrectos = async () => {
    setIsLoading(true)
    try {
      // Guardar que los datos están validados (sin cambios)
      const resultado = await guardarDatosValidados({
        dni: afiliado.dni,
        telefono: afiliado.telefono || null,
        email: afiliado.email || null,
      })

      if (resultado.success) {
        toast({
          title: "¡Datos confirmados!",
          description: "Sus datos han sido validados correctamente",
        })
        onValidationComplete()
      } else {
        toast({
          title: "Error",
          description: resultado.error || "Error al validar los datos",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error inesperado al validar los datos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleActualizarDatos = async () => {
    setIsLoading(true)
    try {
      // Validar que al menos uno de los campos esté completo
      if (!nuevoTelefono && !nuevoEmail) {
        toast({
          title: "Error",
          description: "Debe ingresar al menos un teléfono o email",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Guardar los datos actualizados
      const resultado = await guardarDatosValidados({
        dni: afiliado.dni,
        telefono: nuevoTelefono || null,
        email: nuevoEmail || null,
        datosActualizados: {
          telefono: nuevoTelefono !== afiliado.telefono ? nuevoTelefono : undefined,
          email: nuevoEmail !== afiliado.email ? nuevoEmail : undefined,
        },
      })

      if (resultado.success) {
        toast({
          title: "¡Datos actualizados!",
          description: "Sus datos han sido actualizados y validados correctamente",
        })
        onValidationComplete()
      } else {
        toast({
          title: "Error",
          description: resultado.error || "Error al actualizar los datos",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error inesperado al actualizar los datos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Formatear fecha de validación si existe
  const fechaValidacionFormateada = afiliado.fechaValidacion
    ? format(new Date(afiliado.fechaValidacion), "dd/MM/yyyy HH:mm", { locale: es })
    : null

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-center">Validación de Datos de Contacto</CardTitle>
          {afiliado.datosValidados && <Badge className="bg-green-600">Datos ya validados</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertDescription>
            <strong>¿Por qué necesitamos validar sus datos?</strong>
            <br />
            Necesitamos confirmar su teléfono y email para enviarle las respuestas y actualizaciones de su reclamo.
          </AlertDescription>
        </Alert>

        {step === "review" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Verifique sus datos de contacto:</h3>
              {afiliado.datosValidados && fechaValidacionFormateada && (
                <span className="text-sm text-gray-500">Validados el {fechaValidacionFormateada}</span>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p>
                <strong>Nombre:</strong> {afiliado.nombreCompleto}
              </p>
              <p>
                <strong>DNI:</strong> {afiliado.dni}
              </p>
              <p>
                <strong>Teléfono:</strong> {afiliado.telefono || "No registrado"}
              </p>
              <p>
                <strong>Email:</strong> {afiliado.email || "No registrado"}
              </p>
            </div>

            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">¿Están correctos sus datos de contacto?</p>
              <div className="flex gap-4 justify-center">
                <Button onClick={handleDatosCorrectos} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
                  {isLoading ? "Validando..." : "Sí, están correctos"}
                </Button>
                <Button onClick={() => setStep("update")} variant="outline" disabled={isLoading}>
                  No, necesito actualizarlos
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === "update" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Actualice sus datos de contacto:</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono <span className="text-red-500">*</span>
                </label>
                <Input
                  value={nuevoTelefono}
                  onChange={(e) => setNuevoTelefono(e.target.value)}
                  placeholder="Ingrese su teléfono"
                  type="tel"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <Input
                  value={nuevoEmail}
                  onChange={(e) => setNuevoEmail(e.target.value)}
                  placeholder="Ingrese su email"
                  type="email"
                />
              </div>

              <p className="text-sm text-gray-600">
                <span className="text-red-500">*</span> Debe completar al menos uno de los dos campos
              </p>

              <div className="flex gap-2">
                <Button
                  onClick={handleActualizarDatos}
                  disabled={isLoading || (!nuevoTelefono && !nuevoEmail)}
                  className="flex-1"
                >
                  {isLoading ? "Guardando..." : "Guardar y continuar"}
                </Button>
                <Button onClick={() => setStep("review")} variant="outline" disabled={isLoading}>
                  Volver
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
