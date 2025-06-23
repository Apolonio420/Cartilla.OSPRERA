"use client"

import { useState } from "react"
import { CartillaSearch } from "@/components/ui/cartilla-search"

export default function TestDropdownReal() {
  const [localidad, setLocalidad] = useState<string>("Moreno")
  const [prestador, setPrestador] = useState<string>("")

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Test Dropdown con Datos Reales</h1>
      <p className="mb-4">Localidades disponibles: Moreno, MERLO, MONTE, Miramar, Mercedes, etc.</p>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Localidad</label>
          <input
            type="text"
            value={localidad}
            onChange={(e) => setLocalidad(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Prestador</label>
          <CartillaSearch
            onSelect={(nombre) => setPrestador(nombre)}
            placeholder="Buscar prestador..."
            value={prestador}
            filters={{ localidad }}
          />
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Instrucciones:</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Selecciona una localidad que existe (ej: "Moreno")</li>
            <li>Haz clic en el dropdown de Prestador</li>
            <li>Deberías ver todos los prestadores de esa localidad</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
