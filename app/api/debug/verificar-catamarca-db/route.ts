import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 VERIFICANDO DATOS DE CATAMARCA EN SUPABASE...")

    // 1. Contar total de registros
    const { count: totalCount, error: countError } = await supabase
      .from("Cartilla")
      .select("*", { count: "exact", head: true })

    if (countError) {
      console.error("❌ Error contando registros:", countError)
      return NextResponse.json({ success: false, error: countError.message })
    }

    console.log("📊 Total registros en Cartilla:", totalCount)

    // 2. Buscar específicamente Catamarca
    const { data: catamarcaData, error: catamarcaError } = await supabase
      .from("Cartilla")
      .select("*")
      .ilike("PROVINCIA", "%catamarca%")
      .limit(100)

    if (catamarcaError) {
      console.error("❌ Error buscando Catamarca:", catamarcaError)
      return NextResponse.json({ success: false, error: catamarcaError.message })
    }

    console.log("🏥 Prestadores de Catamarca encontrados:", catamarcaData?.length || 0)

    // 3. Analizar provincias disponibles
    const { data: todasProvincias, error: provinciasError } = await supabase
      .from("Cartilla")
      .select("PROVINCIA")
      .not("PROVINCIA", "is", null)
      .limit(5000)

    if (provinciasError) {
      console.error("❌ Error obteniendo provincias:", provinciasError)
    } else {
      const provinciaCount = new Map<string, number>()
      todasProvincias?.forEach((p) => {
        const provincia = (p.PROVINCIA || "").toLowerCase().trim()
        provinciaCount.set(provincia, (provinciaCount.get(provincia) || 0) + 1)
      })

      console.log("📍 Provincias en la base de datos:")
      Array.from(provinciaCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .forEach(([provincia, count]) => {
          console.log(`  ${provincia}: ${count} prestadores`)
        })
    }

    // 4. Buscar variaciones de Catamarca
    const variacionesCatamarca = [
      "catamarca",
      "san fernando del valle de catamarca",
      "capital catamarca",
      "valle de catamarca",
    ]

    const resultadosVariaciones: any = {}

    for (const variacion of variacionesCatamarca) {
      const { data, error } = await supabase
        .from("Cartilla")
        .select("CUIT, NOMBRE_COMPLETO, PROVINCIA, LOCALIDAD")
        .or(`PROVINCIA.ilike.%${variacion}%,LOCALIDAD.ilike.%${variacion}%`)
        .limit(10)

      if (!error && data) {
        resultadosVariaciones[variacion] = data.length
        if (data.length > 0) {
          console.log(`🎯 Encontrados ${data.length} con "${variacion}":`)
          data.slice(0, 3).forEach((p) => {
            console.log(`  - ${p.NOMBRE_COMPLETO} (${p.LOCALIDAD}, ${p.PROVINCIA})`)
          })
        }
      }
    }

    // 5. Verificar estructura de la tabla
    const { data: sampleData, error: sampleError } = await supabase.from("Cartilla").select("*").limit(3)

    let columnasDisponibles: string[] = []
    if (!sampleError && sampleData && sampleData.length > 0) {
      columnasDisponibles = Object.keys(sampleData[0])
      console.log("📋 Columnas disponibles en Cartilla:", columnasDisponibles)
    }

    return NextResponse.json({
      success: true,
      resumen: {
        total_registros: totalCount,
        prestadores_catamarca: catamarcaData?.length || 0,
        catamarca_encontrados: catamarcaData || [],
        variaciones_catamarca: resultadosVariaciones,
        provincias_disponibles: todasProvincias
          ? Array.from(
              new Map(
                todasProvincias.map((p) => [
                  (p.PROVINCIA || "").toLowerCase().trim(),
                  (p.PROVINCIA || "").toLowerCase().trim(),
                ]),
              ).entries(),
            )
              .sort()
              .slice(0, 20)
          : [],
        columnas_tabla: columnasDisponibles,
      },
      debug: {
        catamarca_directos: catamarcaData,
        sample_data: sampleData,
      },
    })
  } catch (error) {
    console.error("❌ Error verificando Catamarca:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
