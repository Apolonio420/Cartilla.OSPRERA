import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Debuggeando prestadores de Catamarca...")

    // 1. Buscar todos los prestadores de Catamarca
    const { data: prestadoresCatamarca, error: errorCatamarca } = await supabase
      .from("Cartilla")
      .select("*")
      .ilike("PROVINCIA", "%catamarca%")
      .limit(100)

    console.log("📊 Prestadores con provincia CATAMARCA:", prestadoresCatamarca?.length || 0)

    // 2. Buscar prestadores con coordenadas válidas en Catamarca
    const { data: prestadoresConCoordenadas, error: errorCoordenadas } = await supabase
      .from("Cartilla")
      .select("*")
      .ilike("PROVINCIA", "%catamarca%")
      .not("Latitud", "is", null)
      .not("Longitud", "is", null)
      .neq("Latitud", 0)
      .neq("Longitud", 0)
      .limit(100)

    console.log("📍 Prestadores de Catamarca con coordenadas:", prestadoresConCoordenadas?.length || 0)

    // 3. Analizar las coordenadas
    const coordenadasAnalisis = prestadoresConCoordenadas?.map((p) => {
      const lat = typeof p.Latitud === "string" ? Number.parseFloat(p.Latitud.replace(",", ".")) : p.Latitud
      const lng = typeof p.Longitud === "string" ? Number.parseFloat(p.Longitud.replace(",", ".")) : p.Longitud

      return {
        nombre: p.NOMBRE_COMPLETO,
        localidad: p.LOCALIDAD,
        latitud: lat,
        longitud: lng,
        latitud_original: p.Latitud,
        longitud_original: p.Longitud,
        es_valida: !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0,
      }
    })

    // 4. Calcular distancias desde la capital de Catamarca
    const capitalCatamarca = { lat: -28.4696, lng: -65.7852 }

    const calcularDistancia = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 6371
      const dLat = ((lat2 - lat1) * Math.PI) / 180
      const dLon = ((lon2 - lon1) * Math.PI) / 180
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      return R * c
    }

    const prestadoresConDistancia = coordenadasAnalisis
      ?.filter((p) => p.es_valida)
      .map((p) => ({
        ...p,
        distancia_km: calcularDistancia(capitalCatamarca.lat, capitalCatamarca.lng, p.latitud, p.longitud),
      }))
      .sort((a, b) => a.distancia_km - b.distancia_km)

    // 5. Buscar prestadores en San Fernando del Valle específicamente
    const { data: prestadoresSanFernando, error: errorSanFernando } = await supabase
      .from("Cartilla")
      .select("*")
      .ilike("LOCALIDAD", "%san fernando%")
      .limit(50)

    return NextResponse.json({
      success: true,
      debug: {
        total_catamarca: prestadoresCatamarca?.length || 0,
        con_coordenadas: prestadoresConCoordenadas?.length || 0,
        coordenadas_validas: prestadoresConDistancia?.length || 0,
        san_fernando: prestadoresSanFernando?.length || 0,
        capital_coordenadas: capitalCatamarca,
      },
      prestadores_catamarca: prestadoresCatamarca?.slice(0, 10) || [],
      prestadores_con_coordenadas: prestadoresConCoordenadas?.slice(0, 10) || [],
      coordenadas_analisis: coordenadasAnalisis?.slice(0, 10) || [],
      prestadores_cercanos: prestadoresConDistancia?.slice(0, 10) || [],
      prestadores_san_fernando: prestadoresSanFernando?.slice(0, 10) || [],
    })
  } catch (error) {
    console.error("❌ Error debuggeando Catamarca:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
