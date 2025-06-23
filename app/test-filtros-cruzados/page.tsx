"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LocalidadSearch } from "@/app/components/ui/localidad-search"
import { EspecialidadSearch } from "@/app/components/ui/especialidad-search"
import { CartillaSearch } from "@/app/components/ui/cartilla-search"
import { FarmaciaSearch } from "@/app/components/ui/farmacia-search"

export default function TestFiltrosCruzados() {
  const [localidad, setLocalidad] = useState("")
  const [especialidad, setEspecialidad] = useState("")
  const [prestador, setPrestador] = useState("")
  const [farmacia, setFarmacia] = useState("")

  const resetAll = () => {
    setLocalidad("")
    setEspecialidad("")
    setPrestador("")
    setFarmacia("")
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">🔄 Test de Filtros Cruzados</CardTitle>
          <p className="text-center text-gray-600">
            Prueba cómo los filtros se interconectan entre sí. Selecciona cualquier campo y observa cómo filtra los
            demás.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Estado actual */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">📊 Estado Actual:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p>
                <strong>Localidad:</strong> {localidad || "No seleccionada"}
              </p>
              <p>
                <strong>Especialidad:</strong> {especialidad || "No seleccionada"}
              </p>
              <p>
                <strong>Prestador:</strong> {prestador || "No seleccionado"}
              </p>
              <p>
                <strong>Farmacia:</strong> {farmacia || "No seleccionada"}
              </p>
            </div>
            <button
              onClick={resetAll}
              className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
            >
              🔄 Reset Todo
            </button>
          </div>

          {/* Campos de búsqueda */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">🏙️ Localidad</label>
              <LocalidadSearch
                onSelect={(loc) => {
                  console.log("🏙️ Localidad seleccionada:", loc)
                  setLocalidad(loc?.Localidad || loc?.nombre || "")
                }}
                value={localidad}
                especialidad={especialidad}
                prestador={prestador}
              />
              <p className="text-xs text-gray-500">
                Filtros activos:{" "}
                {[especialidad && "Especialidad", prestador && "Prestador"].filter(Boolean).join(", ") || "Ninguno"}
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">🩺 Especialidad</label>
              <EspecialidadSearch
                onSelect={(esp) => {
                  console.log("🩺 Especialidad seleccionada:", esp)
                  setEspecialidad(esp?.nombre || "")
                }}
                value={especialidad}
                localidad={localidad}
                prestador={prestador}
              />
              <p className="text-xs text-gray-500">
                Filtros activos:{" "}
                {[localidad && "Localidad", prestador && "Prestador"].filter(Boolean).join(", ") || "Ninguno"}
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">👨‍⚕️ Prestador</label>
              <CartillaSearch
                onSelect={(prest) => {
                  console.log("👨‍⚕️ Prestador seleccionado:", prest)
                  setPrestador(prest)
                }}
                value={prestador}
                filters={{
                  localidad: localidad,
                  especialidad: especialidad,
                }}
              />
              <p className="text-xs text-gray-500">
                Filtros activos:{" "}
                {[localidad && "Localidad", especialidad && "Especialidad"].filter(Boolean).join(", ") || "Ninguno"}
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">💊 Farmacia</label>
              <FarmaciaSearch
                onSelect={(farm) => {
                  console.log("💊 Farmacia seleccionada:", farm)
                  setFarmacia(farm?.nombre || "")
                }}
                localidad={localidad}
                especialidad={especialidad}
              />
              <p className="text-xs text-gray-500">
                Filtros activos:{" "}
                {[localidad && "Localidad", especialidad && "Especialidad"].filter(Boolean).join(", ") || "Ninguno"}
              </p>
            </div>
          </div>

          {/* Instrucciones */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">📋 Instrucciones de Prueba:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>
                Selecciona una <strong>localidad</strong> (ej: Moreno) y observa cómo se filtran las especialidades y
                prestadores
              </li>
              <li>
                Selecciona una <strong>especialidad</strong> y ve cómo se filtran las localidades y prestadores
              </li>
              <li>
                Selecciona un <strong>prestador</strong> basado en los filtros anteriores
              </li>
              <li>Prueba diferentes combinaciones y usa el botón "Reset Todo" para empezar de nuevo</li>
              <li>Observa los logs en la consola para ver el flujo de datos</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
