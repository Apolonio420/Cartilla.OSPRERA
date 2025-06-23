import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const localidad = searchParams.get("localidad")
    const especialidad = searchParams.get("especialidad")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    console.log("🔍 Cartilla Search Request:", { query, localidad, especialidad, limit })

    // Si no hay query pero hay filtros, permitimos la búsqueda
    if (!query && !localidad && !especialidad) {
      return NextResponse.json({
        success: true,
        prestadores: [],
        message: "Se requiere al menos un criterio de búsqueda",
      })
    }

    // Incluir las nuevas columnas de coordenadas
    let supabaseQuery = supabase
      .from("Cartilla")
      .select(
        "NOMBRE_COMPLETO, CUIT, ESPECIALIDAD, DOMICILIO, LOCALIDAD, PROVINCIA, TELEFONO, TELEFONO_2, EMAIL, Latitud, Longitud",
      )
      .limit(limit)

    // Buscar por nombre completo si hay query
    if (query && query !== "*") {
      supabaseQuery = supabaseQuery.ilike("NOMBRE_COMPLETO", `%${query}%`)
    }

    // Filtrar por localidad si se proporciona
    if (localidad) {
      supabaseQuery = supabaseQuery.ilike("LOCALIDAD", `%${localidad}%`)
    }

    // Filtrar por especialidad si se proporciona
    if (especialidad) {
      supabaseQuery = supabaseQuery.ilike("ESPECIALIDAD", `%${especialidad}%`)
    }

    console.log("🔍 Ejecutando consulta a Cartilla...")

    const { data: prestadores, error } = await supabaseQuery

    if (error) {
      console.error("❌ Error de Supabase:", error)
      return NextResponse.json(
        {
          success: false,
          prestadores: [],
          error: error.message,
        },
        { status: 500 },
      )
    }

    console.log("✅ Prestadores encontrados:", prestadores?.length || 0)

    // Transformar los datos incluyendo las coordenadas
    const transformedPrestadores = (prestadores || []).map((prestador) => ({
      id: prestador.CUIT?.toString() || Math.random().toString(),
      nombre: prestador.NOMBRE_COMPLETO || "",
      especialidad: prestador.ESPECIALIDAD || "",
      localidad: prestador.LOCALIDAD || "",
      provincia: prestador.PROVINCIA || "",
      domicilio: prestador.DOMICILIO || "",
      telefono: prestador.TELEFONO || "",
      telefono2: prestador.TELEFONO_2 || "",
      email: prestador.EMAIL || "",
      cuit: prestador.CUIT?.toString() || "",
      latitud: prestador.Latitud ? Number(prestador.Latitud) : undefined,
      longitud: prestador.Longitud ? Number(prestador.Longitud) : undefined,
    }))

    console.log("✅ Resultados transformados:", transformedPrestadores.length, "prestadores")
    if (transformedPrestadores.length > 0) {
      console.log("📋 Primer resultado:", transformedPrestadores[0])
      const conCoordenadas = transformedPrestadores.filter((p) => p.latitud && p.longitud).length
      console.log("🗺️ Prestadores con coordenadas:", conCoordenadas)
    }

    return NextResponse.json({
      success: true,
      prestadores: transformedPrestadores,
      total: transformedPrestadores.length,
      query: query,
      filters: { localidad, especialidad },
      debug: {
        fieldsUsed: [
          "NOMBRE_COMPLETO",
          "CUIT",
          "ESPECIALIDAD",
          "DOMICILIO",
          "LOCALIDAD",
          "PROVINCIA",
          "TELEFONO",
          "TELEFONO_2",
          "EMAIL",
          "Latitud",
          "Longitud",
        ],
        searchStrategy: query ? "ilike_NOMBRE_COMPLETO" : "filtros_aplicados",
      },
    })
  } catch (error) {
    console.error("❌ Error en API:", error)
    return NextResponse.json(
      {
        success: false,
        prestadores: [],
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
