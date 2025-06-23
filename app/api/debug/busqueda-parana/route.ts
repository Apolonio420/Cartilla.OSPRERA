import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { GeoService } from "@/app/lib/services/geo-service"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 DEBUG: Investigando búsqueda de Paraná")

    // 1. Verificar coordenadas de Paraná en Base Geográfica
    const { data: geoParana, error: geoError } = await supabase
      .from("Base Geografica")
      .select("*")
      .ilike("Localidad", "%parana%")
      .eq("Provincia", "ENTRE RIOS")

    console.log("📍 Coordenadas de Paraná en Base Geográfica:", geoParana)

    // 2. Verificar prestadores en Paraná directamente
    const { data: prestadoresParana, error: prestError } = await supabase
      .from("Cartilla")
      .select("NOMBRE_COMPLETO, ESPECIALIDAD, LOCALIDAD, PROVINCIA, Latitud, Longitud")
      .ilike("LOCALIDAD", "%parana%")
      .eq("PROVINCIA", "ENTRE RIOS")
      .not("Latitud", "is", null)
      .not("Longitud", "is", null)
      .limit(10)

    console.log("🏥 Prestadores en Paraná:", prestadoresParana?.length)

    // 3. Usar las coordenadas correctas de Paraná
    const coordenadasParana = { latitud: -31.7330145, longitud: -60.5298511 }
    console.log("🎯 Coordenadas de búsqueda:", coordenadasParana)

    // 4. Buscar prestadores cercanos con diferentes radios
    const radios = [10, 25, 50, 100, 200]
    const resultadosPorRadio: any = {}

    for (const radio of radios) {
      const prestadoresCercanos = await GeoService.buscarPrestadoresCercanos(
        coordenadasParana,
        radio,
        undefined, // sin filtro de especialidad
      )

      resultadosPorRadio[`${radio}km`] = {
        total: prestadoresCercanos.length,
        porProvincia: prestadoresCercanos.reduce((acc: any, p: any) => {
          const prov = p.PROVINCIA || "Sin provincia"
          acc[prov] = (acc[prov] || 0) + 1
          return acc
        }, {}),
        primeros5: prestadoresCercanos.slice(0, 5).map((p: any) => ({
          nombre: p.NOMBRE_COMPLETO,
          localidad: p.LOCALIDAD,
          provincia: p.PROVINCIA,
          distancia: p.distancia,
          coordenadas: { lat: p.latitud, lng: p.longitud },
        })),
      }
    }

    // 5. Verificar qué pasa con la búsqueda normal
    const ubicacionesEncontradas = await GeoService.buscarUbicacion("Paraná")
    console.log("🔍 Ubicaciones encontradas para 'Paraná':", ubicacionesEncontradas)

    // 6. Calcular distancias manualmente para verificar
    const distanciasManual = prestadoresParana?.slice(0, 5).map((p) => {
      const lat = typeof p.Latitud === "number" ? p.Latitud : Number.parseFloat(p.Latitud?.toString() || "0")
      const lng = typeof p.Longitud === "number" ? p.Longitud : Number.parseFloat(p.Longitud?.toString() || "0")

      const distancia = GeoService.calcularDistancia(coordenadasParana.latitud, coordenadasParana.longitud, lat, lng)

      return {
        nombre: p.NOMBRE_COMPLETO,
        coordenadas: { lat, lng },
        distancia,
      }
    })

    return NextResponse.json({
      debug: "Investigación de búsqueda en Paraná",
      coordenadasParana,
      geoParana: geoParana?.slice(0, 3),
      prestadoresEnParana: {
        total: prestadoresParana?.length || 0,
        muestra: prestadoresParana?.slice(0, 5),
      },
      resultadosPorRadio,
      ubicacionesEncontradas,
      distanciasManual,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Error en debug:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error desconocido" }, { status: 500 })
  }
}
