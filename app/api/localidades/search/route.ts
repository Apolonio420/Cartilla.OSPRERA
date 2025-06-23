import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
    const provincia = searchParams.get("provincia") || ""
    const especialidad = searchParams.get("especialidad") || ""
    const prestador = searchParams.get("prestador") || ""
    const region = searchParams.get("region") || ""

    console.log("🔍 API Localidades - Parámetros recibidos:", { query, provincia, especialidad, prestador, region })

    // Función para normalizar texto (quitar acentos, espacios extra, etc.)
    const normalizeText = (text: string): string => {
      return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Quitar acentos
        .replace(/\s+/g, " ") // Normalizar espacios
        .trim()
    }

    // Normalizar términos de búsqueda
    const normalizedQuery = normalizeText(query)

    // Obtener datos de Base Geográfica
    let baseGeograficaQuery = supabase.from("Base Geografica").select("*")

    // Si hay región especificada, filtrar por región
    if (region) {
      baseGeograficaQuery = baseGeograficaQuery.or(`"Region Macro".ilike.%${region}%,"Region Micro".ilike.%${region}%`)
    }

    // Limitar resultados
    baseGeograficaQuery = baseGeograficaQuery.limit(1000)

    const { data: geograficaData, error: geograficaError } = await baseGeograficaQuery

    if (geograficaError) {
      console.error("Error en Base Geográfica:", geograficaError)
      throw geograficaError
    }

    console.log("🏙️ Registros en Base Geográfica:", geograficaData?.length || 0)

    // Si hay especialidad especificada, buscar en Cartilla para filtrar por especialidad
    let localidadesConEspecialidad: string[] = []
    if (especialidad) {
      const { data: cartillaData, error: cartillaError } = await supabase
        .from("Cartilla")
        .select("*")
        .ilike("ESPECIALIDAD", `%${especialidad}%`)
        .limit(1000)

      if (!cartillaError && cartillaData) {
        console.log(`🩺 Encontrados ${cartillaData.length} registros en Cartilla para especialidad: ${especialidad}`)
        localidadesConEspecialidad = cartillaData
          .map((item) => (item.LOCALIDAD || item.localidad || item.Localidad || "").toString())
          .filter(Boolean)

        console.log(`🏙️ Localidades con ${especialidad}: ${localidadesConEspecialidad.length}`)
      }
    }

    // Filtrar localidades usando Base Geografica
    const localidades = (geograficaData || [])
      .filter((item) => {
        const localidad = normalizeText((item.Localidad || "").toString())
        const partido = normalizeText((item.Partido || "").toString())
        const itemProvincia = normalizeText((item.Provincia || "").toString())
        const regionMacro = normalizeText((item["Region Macro"] || "").toString())
        const regionMicro = normalizeText((item["Region Micro"] || "").toString())

        // Verificar si coincide con la consulta
        const matchesQuery =
          query === "*" ||
          query.length < 2 || // Si la consulta es muy corta, no filtrar por ella
          localidad.includes(normalizedQuery) ||
          partido.includes(normalizedQuery) ||
          localidad.replace(/\s+/g, "").includes(normalizedQuery.replace(/\s+/g, ""))

        // Verificar si coincide con la provincia
        const matchesProvincia = !provincia || itemProvincia.includes(normalizeText(provincia))

        // Si hay filtro por especialidad, verificar que la localidad tenga esa especialidad
        const matchesEspecialidad =
          !especialidad || localidadesConEspecialidad.some((loc) => normalizeText(loc).includes(localidad))

        // Verificar si coincide con la región (buscar en ambas columnas)
        const matchesRegion =
          !region || regionMacro.includes(normalizeText(region)) || regionMicro.includes(normalizeText(region))

        return matchesQuery && matchesProvincia && matchesEspecialidad && matchesRegion
      })
      .map((item) => ({
        id: item.LinkIndec || `geo-${Math.random()}`,
        nombre: item.Localidad,
        provincia: item.Provincia || "",
        partido: item.Partido || "",
        region_macro: item["Region Macro"] || "",
        region_micro: item["Region Micro"] || "",
        fuente: "base_geografica",
      }))

    console.log("🎯 Localidades encontradas:", localidades.length)
    if (localidades.length > 0) {
      console.log(
        "📝 Primeras 3:",
        localidades.slice(0, 3).map((l) => l.nombre),
      )
    }

    return NextResponse.json({
      success: true,
      localidades: localidades,
      total: localidades.length,
      query: query,
      filters: { provincia, especialidad, prestador, region },
    })
  } catch (error) {
    console.error("❌ Error general en búsqueda de localidades:", error)
    return NextResponse.json(
      {
        success: false,
        localidades: [],
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
