"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function RegeneratePrismaPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const regeneratePrisma = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/admin/regenerate-prisma", {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        setResult("✅ Cliente de Prisma regenerado exitosamente")
      } else {
        setResult(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setResult(`❌ Error: ${error instanceof Error ? error.message : "Error desconocido"}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Regenerar Cliente de Prisma</h1>
          <p className="text-gray-600">
            Regenera el cliente de Prisma para sincronizar con los cambios en el esquema de la base de datos
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Regeneración de Cliente</CardTitle>
            <CardDescription>Ejecuta este proceso después de actualizar el esquema de la base de datos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={regeneratePrisma} disabled={isLoading} className="w-full">
              {isLoading ? "Regenerando..." : "Regenerar Cliente de Prisma"}
            </Button>

            {result && (
              <div
                className={`p-4 rounded-md ${
                  result.includes("✅")
                    ? "bg-green-50 border border-green-200 text-green-800"
                    : "bg-red-50 border border-red-200 text-red-800"
                }`}
              >
                <pre className="whitespace-pre-wrap">{result}</pre>
              </div>
            )}

            <div className="text-sm text-gray-600 space-y-2">
              <p>
                <strong>¿Cuándo usar esto?</strong>
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Después de crear o modificar tablas en la base de datos</li>
                <li>Cuando aparecen errores como "Unknown argument"</li>
                <li>Después de actualizar el archivo prisma/schema.prisma</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
