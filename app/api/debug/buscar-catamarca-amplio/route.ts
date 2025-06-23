import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Búsqueda amplia de datos de Catamarca...")

    // 1. Buscar cualquier mención de "catamarca" en cualquier campo
    const { data: busquedaAmplia, error: errorAmplia } = await supabase
      .from("Cartilla")
      .select("*")
      .or(
        `NOMBRE_COMPLETO.ilike.%catamarca%,LOCALIDAD.ilike.%catamarca%,PROVINCIA.ilike.%catamarca%,DOMICILIO.ilike.%catamarca%`,
      )
      .limit(100)

    console.log("📊 Resultados con 'catamarca' en cualquier campo:", busquedaAmplia?.length || 0)

    // 2. Buscar variaciones de "San Fernando del Valle"
    const { data: sanFernandoVariaciones, error: errorSanFernando } = await supabase
      .from("Cartilla")
      .select("*")
      .or(`LOCALIDAD.ilike.%san fernando del valle%,LOCALIDAD.ilike.%valle de catamarca%,LOCALIDAD.ilike.%catamarca%`)
      .limit(100)

    console.log("📊 Resultados con variaciones de San Fernando:", sanFernandoVariaciones?.length || 0)

    // 3. Buscar todas las provincias únicas para ver qué hay
    const { data: provinciasUnicas, error: errorProvincias } = await supabase
      .from("Cartilla")
      .select("PROVINCIA")
      .not("PROVINCIA", "is", null)
      .neq("PROVINCIA", "")

    const provinciasSet = new Set(provinciasUnicas?.map((p) => p.PROVINCIA?.trim().toUpperCase()) || [])
    const provinciasArray = Array.from(provinciasSet).sort()

    console.log("📊 Total provincias únicas:", provinciasArray.length)

    // 4. Buscar localidades que contengan "fernando"
    const { data: localidadesFernando, error: errorLocalidades } = await supabase
      .from("Cartilla")
      .select("LOCALIDAD, PROVINCIA, COUNT(*)")
      .ilike("LOCALIDAD", "%fernando%")
      .not("LOCALIDAD", "is", null)
      .neq("LOCALIDAD", "")
      .limit(50)

    console.log("📊 Localidades con 'fernando':", localidadesFernando?.length || 0)

    // 5. Contar prestadores por provincia (top 20)
    const { data: conteoProvincias, error: errorConteo } = await supabase
      .from("Cartilla")
      .select("PROVINCIA, COUNT(*)")
      .not("PROVINCIA", "is", null)
      .neq("PROVINCIA", "")
      .limit(50)

    // 6. Buscar patrones similares a "CATAMARCA"
    const patronesCatamarca = ["CATAMAR%", "CATAMA%", "CATA%", "%TAMARCA%", "%AMARCA%"]
    const resultadosPatrones = []

    for (const patron of patronesCatamarca) {
      const { data, error } = await supabase
        .from("Cartilla")
        .select("PROVINCIA, LOCALIDAD, NOMBRE_COMPLETO")
        .or(`PROVINCIA.ilike.${patron},LOCALIDAD.ilike.${patron}`)
        .limit(10)

      if (!error && data && data.length > 0) {
        resultadosPatrones.push({
          patron,
          resultados: data.length,
          ejemplos: data.slice(0, 3),
        })
      }
    }

    return NextResponse.json({
      success: true,
      debug: {
        busqueda_amplia: busquedaAmplia?.length || 0,
        san_fernando_variaciones: sanFernandoVariaciones?.length || 0,
        total_provincias_unicas: provinciasArray.length,
        localidades_fernando: localidadesFernando?.length || 0,
      },
      resultados: {
        busqueda_amplia: busquedaAmplia?.slice(0, 5) || [],
        san_fernando_variaciones: sanFernandoVariaciones?.slice(0, 5) || [],
        provincias_unicas: provinciasArray.slice(0, 30),
        localidades_fernando: localidadesFernando?.slice(0, 10) || [],
        conteo_provincias: conteoProvincias?.slice(0, 20) || [],
        patrones_catamarca: resultadosPatrones,
      },
    })
  } catch (error) {
    console.error("❌ Error en búsqueda amplia:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
