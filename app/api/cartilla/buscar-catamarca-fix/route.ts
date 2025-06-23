import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = Number.parseFloat(searchParams.get("lat") || "0")
    const lng = Number.parseFloat(searchParams.get("lng") || "0")
    const radio = Number.parseInt(searchParams.get("radio") || "50")

    console.log("🚀 ENDPOINT FIX - Iniciando búsqueda:", { lat, lng, radio })

    // CARGAR TODOS LOS REGISTROS
    console.log("📊 Cargando prestadores DIRECTAMENTE desde Supabase...")

    const { data: todosPrestadores, error } = await supabase.from("Cartilla").select("*").limit(20000)

    if (error) {
      console.error("❌ Error Supabase:", error)
      return NextResponse.json({ success: false, error: error.message })
    }

    console.log("📊 TOTAL CARGADO DIRECTAMENTE:", todosPrestadores?.length || 0)

    if (!todosPrestadores || todosPrestadores.length === 0) {
      console.log("❌ No se cargaron prestadores")
      return NextResponse.json({
        success: false,
        error: "No se pudieron cargar los prestadores",
        debug: { total_cargado: 0 },
      })
    }

    // FILTRAR CATAMARCA
    const catamarca = todosPrestadores.filter((p) => {
      const provincia = (p.PROVINCIA || "").toLowerCase()
      return provincia.includes("catamarca")
    })

    console.log("🏥 Prestadores de Catamarca encontrados DIRECTAMENTE:", catamarca.length)

    // Mostrar los primeros 3 prestadores de Catamarca
    catamarca.slice(0, 3).forEach((p, i) => {
      console.log(`${i + 1}. ${p.NOMBRE_COMPLETO} - ${p.LOCALIDAD} (${p.Latitud}, ${p.Longitud})`)
    })

    // CALCULAR DISTANCIAS
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

    const prestadoresConDistancia = catamarca
      .map((prestador) => {
        const prestadorLat = Number.parseFloat(prestador.Latitud)
        const prestadorLng = Number.parseFloat(prestador.Longitud)

        if (isNaN(prestadorLat) || isNaN(prestadorLng)) {
          console.log(`⚠️ Coordenadas inválidas: ${prestador.NOMBRE_COMPLETO}`)
          return null
        }

        const distancia = calcularDistancia(lat, lng, prestadorLat, prestadorLng)

        return {
          id: prestador.CUIT?.toString() || Math.random().toString(),
          nombre: prestador.NOMBRE_COMPLETO || "",
          especialidad: prestador.ESPECIALIDAD || "",
          localidad: prestador.LOCALIDAD || "",
          provincia: prestador.PROVINCIA || "",
          domicilio: prestador.DOMICILIO || "",
          telefono: prestador.TELEFONO || "",
          email: prestador.EMAIL || "",
          cuit: prestador.CUIT?.toString() || "",
          latitud: prestadorLat,
          longitud: prestadorLng,
          distancia: Math.round(distancia * 100) / 100,
        }
      })
      .filter((p) => p !== null)
      .sort((a, b) => (a?.distancia || 0) - (b?.distancia || 0))

    console.log("🎯 Prestadores de Catamarca con distancias:", prestadoresConDistancia.length)

    // Mostrar los 5 más cercanos
    prestadoresConDistancia.slice(0, 5).forEach((p, i) => {
      if (p) {
        console.log(`${i + 1}. ${p.nombre} - ${p.distancia}km - ${p.localidad}`)
      }
    })

    const prestadoresEnRadio = prestadoresConDistancia.filter((p) => p && p.distancia <= radio)
    console.log(`📍 Prestadores de Catamarca dentro de ${radio}km:`, prestadoresEnRadio.length)

    return NextResponse.json({
      success: true,
      prestadores: prestadoresConDistancia,
      total: prestadoresConDistancia.length,
      debug: {
        total_db: todosPrestadores.length,
        catamarca_total: catamarca.length,
        catamarca_con_coordenadas: prestadoresConDistancia.length,
        catamarca_en_radio: prestadoresEnRadio.length,
        coordenadas_busqueda: { lat, lng },
        radio,
        mas_cercano: prestadoresConDistancia[0] || null,
      },
    })
  } catch (error) {
    console.error("❌ Error en endpoint fix:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
      debug: { error_detalle: error },
    })
  }
}
