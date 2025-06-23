import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const provincia = searchParams.get("provincia")
    const especialidad = searchParams.get("especialidad")
    const prestador = searchParams.get("prestador")

    if (!provincia) {
      return NextResponse.json(
        {
          success: false,
          prestadores: [],
          error: "Provincia requerida",
        },
        { status: 400 },
      )
    }

    console.log("🏛️➡️👥 Buscar prestadores en provincia:", {
      provincia,
      especialidad,
      prestador,
    })

    // ✅ CONSULTA PARA OBTENER TODOS LOS PRESTADORES DE UNA PROVINCIA
    let query = supabase
      .from("Cartilla")
      .select("*")
      .ilike("PROVINCIA", `%${provincia}%`)
      .not("Latitud", "is", null)
      .not("Longitud", "is", null)

    // ✅ FILTROS ADICIONALES
    if (especialidad && especialidad.trim() !== "") {
      query = query.ilike("ESPECIALIDAD", `%${especialidad}%`)
    }

    if (prestador && prestador.trim() !== "") {
      query = query.ilike("NOMBRE_COMPLETO", `%${prestador}%`)
    }

    const { data: prestadores, error } = await query

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

    console.log(`📊 Prestadores encontrados en ${provincia}:`, prestadores?.length || 0)

    if (!prestadores || prestadores.length === 0) {
      return NextResponse.json({
        success: true,
        prestadores: [],
        total: 0,
        message: `No se encontraron prestadores en ${provincia}`,
      })
    }

    // ✅ FORMATEAR PRESTADORES
    const prestadoresFormateados = prestadores.map((p) => ({
      id: p.id || `${p.CUIT}-${Math.random()}`,
      nombre: p.NOMBRE_COMPLETO || "Sin nombre",
      especialidad: p.ESPECIALIDAD || "Sin especialidad",
      localidad: p.LOCALIDAD || "Sin localidad",
      provincia: p.PROVINCIA || provincia,
      domicilio: p.DOMICILIO || "",
      telefono: p.TELEFONO || "",
      telefono2: p.TELEFONO2 || "",
      email: p.EMAIL || "",
      cuit: p.CUIT || "",
      latitud: Number(p.Latitud),
      longitud: Number(p.Longitud),
    }))

    return NextResponse.json({
      success: true,
      prestadores: prestadoresFormateados,
      total: prestadoresFormateados.length,
      provincia: provincia,
      filtros: {
        especialidad: especialidad || null,
        prestador: prestador || null,
      },
    })
  } catch (error) {
    console.error("❌ Error en buscar-en-provincia:", error)
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
