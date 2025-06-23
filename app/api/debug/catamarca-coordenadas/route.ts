import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 ANALIZANDO COORDENADAS DE CATAMARCA...")

    // 1. Obtener TODOS los prestadores de Catamarca con coordenadas
    const { data: catamarcaData, error: catamarcaError } = await supabase
      .from("Cartilla")
      .select("*")
      .ilike("PROVINCIA", "%catamarca%")
      .not("Latitud", "is", null)
      .not("Longitud", "is", null)

    if (catamarcaError) {
      console.error("❌ Error obteniendo Catamarca:", catamarcaError)
      return NextResponse.json({ success: false, error: catamarcaError.message })
    }

    console.log("🏥 Prestadores de Catamarca con coordenadas:", catamarcaData?.length || 0)

    // 2. Analizar las coordenadas
    const coordenadasCatamarca = catamarcaData?.map((p) => ({
      nombre: p.NOMBRE_COMPLETO,
      localidad: p.LOCALIDAD,
      latitud: p.Latitud,
      longitud: p.Longitud,
      latitud_tipo: typeof p.Latitud,
      longitud_tipo: typeof p.Longitud,
      latitud_valida: !isNaN(Number(p.Latitud)) && Number(p.Latitud) !== 0,
      longitud_valida: !isNaN(Number(p.Longitud)) && Number(p.Longitud) !== 0,
    }))

    // 3. Coordenadas de búsqueda de Catamarca
    const catamarcaBusqueda = {
      latitud: -28.4696,
      longitud: -65.7852,
    }

    // 4. Calcular distancias manualmente
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

    const parseCoordinate = (value: any): number => {
      if (typeof value === "number") return value
      if (typeof value === "string") {
        const normalized = value.replace(",", ".")
        return Number.parseFloat(normalized)
      }
      return 0
    }

    const distancias = coordenadasCatamarca?.map((p) => {
      const lat = parseCoordinate(p.latitud)
      const lng = parseCoordinate(p.longitud)
      const distancia = calcularDistancia(catamarcaBusqueda.latitud, catamarcaBusqueda.longitud, lat, lng)

      return {
        ...p,
        latitud_parseada: lat,
        longitud_parseada: lng,
        distancia_km: Math.round(distancia * 100) / 100,
        dentro_50km: distancia <= 50,
        dentro_100km: distancia <= 100,
      }
    })

    // 5. Estadísticas
    const estadisticas = {
      total_catamarca: catamarcaData?.length || 0,
      con_coordenadas_validas: distancias?.filter((d) => d.latitud_valida && d.longitud_valida).length || 0,
      dentro_50km: distancias?.filter((d) => d.dentro_50km).length || 0,
      dentro_100km: distancias?.filter((d) => d.dentro_100km).length || 0,
      distancia_minima: distancias?.length ? Math.min(...distancias.map((d) => d.distancia_km)) : null,
      distancia_maxima: distancias?.length ? Math.max(...distancias.map((d) => d.distancia_km)) : null,
    }

    console.log("📊 Estadísticas Catamarca:")
    console.log("  - Total:", estadisticas.total_catamarca)
    console.log("  - Con coordenadas válidas:", estadisticas.con_coordenadas_validas)
    console.log("  - Dentro de 50km:", estadisticas.dentro_50km)
    console.log("  - Dentro de 100km:", estadisticas.dentro_100km)
    console.log("  - Distancia mínima:", estadisticas.distancia_minima + "km")
    console.log("  - Distancia máxima:", estadisticas.distancia_maxima + "km")

    // 6. Mostrar los más cercanos
    const masCercanos = distancias?.sort((a, b) => a.distancia_km - b.distancia_km).slice(0, 5)
    console.log("🎯 Los 5 más cercanos a Catamarca capital:")
    masCercanos?.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.nombre} - ${p.localidad} (${p.distancia_km}km)`)
      console.log(`     Coords: ${p.latitud_parseada}, ${p.longitud_parseada}`)
    })

    // 7. Verificar por qué no aparecen en la búsqueda original
    const { data: busquedaOriginal, error: busquedaError } = await supabase
      .from("Cartilla")
      .select("*")
      .not("Latitud", "is", null)
      .not("Longitud", "is", null)
      .neq("Latitud", 0)
      .neq("Longitud", 0)
      .limit(10000)

    const totalConCoordenadas = busquedaOriginal?.length || 0
    const catamarcaEnBusqueda = busquedaOriginal?.filter((p) =>
      (p.PROVINCIA || "").toLowerCase().includes("catamarca"),
    ).length

    console.log("🔍 Verificación búsqueda original:")
    console.log("  - Total con coordenadas:", totalConCoordenadas)
    console.log("  - Catamarca en búsqueda:", catamarcaEnBusqueda)

    return NextResponse.json({
      success: true,
      coordenadas_busqueda: catamarcaBusqueda,
      estadisticas,
      prestadores_catamarca: distancias,
      mas_cercanos: masCercanos,
      verificacion_busqueda: {
        total_con_coordenadas: totalConCoordenadas,
        catamarca_en_busqueda: catamarcaEnBusqueda,
      },
      debug: {
        catamarca_raw: catamarcaData,
        coordenadas_parseadas: coordenadasCatamarca,
      },
    })
  } catch (error) {
    console.error("❌ Error analizando coordenadas Catamarca:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
