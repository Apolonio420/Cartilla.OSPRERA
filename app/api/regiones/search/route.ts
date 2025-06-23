import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""

    // Si la consulta es muy corta, devolver vacío
    if (query.length < 2 && query !== "*") {
      return NextResponse.json({ success: true, regiones: [] })
    }

    console.log("🔍 API Regiones - Parámetros recibidos:", { query })

    // Función para normalizar texto
    const normalizeText = (text: string): string => {
      return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Quitar acentos
        .replace(/\s+/g, " ") // Normalizar espacios
        .trim()
    }

    const normalizedQuery = normalizeText(query)

    // Buscar en la tabla "Base Geografica"
    const { data: geograficaData, error: geograficaError } = await supabase
      .from("Base Geografica")
      .select("*")
      .limit(1000)

    if (geograficaError) {
      console.error("Error en Base Geográfica:", geograficaError)
      throw geograficaError
    }

    console.log("🏙️ Registros en Base Geográfica:", geograficaData?.length || 0)

    // Procesar y agrupar regiones
    const regionesMap = new Map<string, any>()

    geograficaData?.forEach((item) => {
      const regionMacro = item["Region Macro"]
      const regionMicro = item["Region Micro"]

      // Procesar Region Macro
      if (regionMacro && regionMacro.trim() !== "" && regionMacro !== "EMPTY") {
        const normalizedMacro = normalizeText(regionMacro)
        if (
          query === "*" ||
          normalizedMacro.includes(normalizedQuery) ||
          normalizedMacro.replace(/\s+/g, "").includes(normalizedQuery.replace(/\s+/g, ""))
        ) {
          const key = `macro_${regionMacro}`
          if (!regionesMap.has(key)) {
            regionesMap.set(key, {
              id: key,
              region: regionMacro,
              tipo: "macro",
              localidades_count: 0,
            })
          }
          regionesMap.get(key).localidades_count++
        }
      }

      // Procesar Region Micro
      if (regionMicro && regionMicro.trim() !== "" && regionMicro !== "EMPTY") {
        const normalizedMicro = normalizeText(regionMicro)
        if (
          query === "*" ||
          normalizedMicro.includes(normalizedQuery) ||
          normalizedMicro.replace(/\s+/g, "").includes(normalizedQuery.replace(/\s+/g, ""))
        ) {
          const key = `micro_${regionMicro}`
          if (!regionesMap.has(key)) {
            regionesMap.set(key, {
              id: key,
              region: regionMicro,
              tipo: "micro",
              localidades_count: 0,
            })
          }
          regionesMap.get(key).localidades_count++
        }
      }
    })

    // Convertir a array y ordenar
    const regiones = Array.from(regionesMap.values())
      .sort((a, b) => {
        // Primero por tipo (macro antes que micro)
        if (a.tipo !== b.tipo) {
          return a.tipo === "macro" ? -1 : 1
        }
        // Luego por nombre
        return a.region.localeCompare(b.region)
      })
      .slice(0, 50) // Limitar resultados

    console.log("🎯 Regiones encontradas:", regiones.length)
    if (regiones.length > 0) {
      console.log(
        "📝 Primeras 3:",
        regiones.slice(0, 3).map((r) => `${r.region} (${r.tipo})`),
      )
    }

    return NextResponse.json({
      success: true,
      regiones: regiones,
      total: regiones.length,
      query: query,
      debug: {
        tablaUsada: "Base Geografica",
        regionesMacro: regiones.filter((r) => r.tipo === "macro").length,
        regionesMicro: regiones.filter((r) => r.tipo === "micro").length,
      },
    })
  } catch (error) {
    console.error("❌ Error general en búsqueda de regiones:", error)
    return NextResponse.json(
      {
        success: false,
        regiones: [],
        error: error instanceof Error ? error.message : "Error desconocido",
        debug: {
          message: "Error en API de regiones",
          originalError: error,
        },
      },
      { status: 500 },
    )
  }
}
