import { NextResponse, type NextRequest } from "next/server"
import { supabase } from "@/utils/supabaseClient"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const localidad = searchParams.get("localidad")
    const especialidad = searchParams.get("especialidad")

    console.log("🔍 Farmacias Search Request:", { query, localidad, especialidad, limit })

    if (!query || query.length < 2) {
      return NextResponse.json({
        farmacias: [],
        message: "Query too short",
        debug: { query, length: query?.length || 0 },
      })
    }

    // Construir la consulta usando los nombres de columnas correctos
    let supabaseQuery = supabase.from("Farmacias").select("*").limit(limit)

    // Buscar por nombre (case insensitive)
    supabaseQuery = supabaseQuery.ilike("Nombre", `%${query}%`)

    // Filtrar por localidad si se proporciona
    if (localidad) {
      supabaseQuery = supabaseQuery.or(`Localidad.ilike.%${localidad}%,Zona.ilike.%${localidad}%`)
    }

    // Ordenar por nombre
    supabaseQuery = supabaseQuery.order("Nombre")

    console.log("🔍 Executing farmacias query with filters...")

    const { data: farmacias, error } = await supabaseQuery

    if (error) {
      console.error("❌ Supabase error:", error)
      return NextResponse.json(
        {
          error: "Database error",
          details: error.message,
        },
        { status: 500 },
      )
    }

    console.log("✅ Found farmacias:", farmacias?.length || 0)

    // Transformar los datos
    const transformedFarmacias = (farmacias || []).map((farmacia) => ({
      id: farmacia.id?.toString() || Math.random().toString(),
      nombre: farmacia.Nombre || "",
      zona: farmacia.Zona || farmacia.Localidad || "",
      region: farmacia.Region || "",
      domicilio: farmacia.Domicilio || "",
      latitud: farmacia.Latitud || null,
      longitud: farmacia.Longitud || null,
    }))

    console.log("✅ Transformed farmacias results:", transformedFarmacias.length)
    if (transformedFarmacias.length > 0) {
      console.log("📋 First farmacia result:", transformedFarmacias[0])
    }

    return NextResponse.json({
      success: true,
      farmacias: transformedFarmacias,
      total: transformedFarmacias.length,
      query: query,
      debug: {
        usedStrategy: "ilike_Nombre_with_localidad_filter",
        originalQuery: query,
        localidadFilter: localidad,
        especialidadFilter: especialidad,
      },
    })
  } catch (error) {
    console.error("❌ API Error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
