import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
    const localidad = searchParams.get("localidad") || ""
    const prestador = searchParams.get("prestador") || ""

    console.log("🔍 API Especialidades - Parámetros recibidos:", { query, localidad, prestador })

    // Si no hay filtros y la consulta es muy corta, devolver vacío
    const hasFilters = localidad || prestador
    if (!hasFilters && query.length < 2) {
      return NextResponse.json({ success: true, especialidades: [] })
    }

    // Función para normalizar texto
    const normalizeText = (text: string): string => {
      return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim()
    }

    const normalizedQuery = normalizeText(query)

    // Construir filtros para la consulta usando los campos correctos de Cartilla
    let cartillaQuery = supabase.from("Cartilla").select("ESPECIALIDAD, NOMBRE_COMPLETO, LOCALIDAD")

    // Aplicar filtros
    if (localidad) {
      cartillaQuery = cartillaQuery.ilike("LOCALIDAD", `%${localidad}%`)
    }

    // NUEVO: Filtrar por prestador específico si está seleccionado
    if (prestador) {
      console.log("🎯 Filtrando por prestador específico:", prestador)
      cartillaQuery = cartillaQuery.ilike("NOMBRE_COMPLETO", `%${prestador}%`)
    }

    const { data: cartillaData, error: cartillaError } = await cartillaQuery.limit(1000)

    if (cartillaError) {
      console.error("Error en Cartilla:", cartillaError)
      throw cartillaError
    }

    console.log("🩺 Registros en Cartilla:", cartillaData?.length || 0)

    // Extraer especialidades únicas
    const especialidadesSet = new Set<string>()

    cartillaData?.forEach((item) => {
      const especialidad = (item.ESPECIALIDAD || "").toString().trim()
      if (especialidad) {
        especialidadesSet.add(especialidad)
      }
    })

    // Convertir a array y filtrar por query si existe
    const especialidades = Array.from(especialidadesSet)
      .filter((esp) => {
        if (query === "*") return true
        const normalizedEsp = normalizeText(esp)
        return normalizedEsp.includes(normalizedQuery)
      })
      .sort()
      .map((esp, index) => ({
        id: `esp-${index}`,
        nombre: esp,
        Especialidad: esp,
      }))

    console.log("🎯 Especialidades encontradas:", especialidades.length)
    if (especialidades.length > 0) {
      console.log(
        "📝 Especialidades:",
        especialidades.slice(0, 5).map((e) => e.nombre),
      )
    }

    // Mensaje específico cuando se filtra por prestador
    let message = ""
    if (prestador && especialidades.length > 0) {
      message = `Especialidades de ${prestador}`
    } else if (prestador && especialidades.length === 0) {
      message = `No se encontraron especialidades para ${prestador}`
    }

    return NextResponse.json({
      success: true,
      especialidades: especialidades,
      total: especialidades.length,
      query: query,
      filters: { localidad, prestador },
      message: message,
      debug: {
        hasFilters,
        cartillaRecords: cartillaData?.length || 0,
        filteredByPrestador: !!prestador,
      },
    })
  } catch (error) {
    console.error("❌ Error general en búsqueda de especialidades:", error)
    return NextResponse.json(
      {
        success: false,
        especialidades: [],
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
