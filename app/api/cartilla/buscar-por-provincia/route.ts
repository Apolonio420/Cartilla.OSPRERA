import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const especialidad = searchParams.get("especialidad")
    const prestador = searchParams.get("prestador")
    const provincia = searchParams.get("provincia") // Para drill-down específico

    console.log("🏛️ Buscar por Provincia - Parámetros:", {
      especialidad,
      prestador,
      provincia,
    })

    // ✅ CONSULTA PARA OBTENER TODOS LOS PRESTADORES CON COORDENADAS
    let query = supabase
      .from("Cartilla")
      .select("PROVINCIA, LOCALIDAD, Latitud, Longitud, NOMBRE_COMPLETO, ESPECIALIDAD")
      .not("Latitud", "is", null)
      .not("Longitud", "is", null)
      .not("PROVINCIA", "is", null)
      .not("PROVINCIA", "eq", "")

    // ✅ FILTRAR POR ESPECIALIDAD SI SE PROPORCIONA
    if (especialidad && especialidad.trim() !== "") {
      console.log("🩺 Aplicando filtro de especialidad:", especialidad)
      query = query.ilike("ESPECIALIDAD", `%${especialidad}%`)
    }

    // ✅ FILTRAR POR PRESTADOR SI SE PROPORCIONA
    if (prestador && prestador.trim() !== "") {
      console.log("👨‍⚕️ Aplicando filtro de prestador:", prestador)
      query = query.ilike("NOMBRE_COMPLETO", `%${prestador}%`)
    }

    // ✅ FILTRAR POR PROVINCIA ESPECÍFICA (para drill-down)
    if (provincia && provincia.trim() !== "") {
      console.log("🏛️ Aplicando filtro de provincia:", provincia)
      query = query.ilike("PROVINCIA", `%${provincia}%`)
    }

    // ✅ SIN LÍMITE - OBTENER TODOS LOS DATOS
    const { data: prestadores, error } = await query

    if (error) {
      console.error("❌ Error de Supabase:", error)
      return NextResponse.json(
        {
          success: false,
          provincias: [],
          error: error.message,
        },
        { status: 500 },
      )
    }

    console.log("📊 Total prestadores obtenidos de DB:", prestadores?.length || 0)

    if (!prestadores || prestadores.length === 0) {
      return NextResponse.json({
        success: true,
        provincias: [],
        total: 0,
        message: "No se encontraron prestadores",
      })
    }

    // ✅ AGRUPAR POR PROVINCIA Y CALCULAR CENTROS
    const provinciaMap = new Map()

    prestadores.forEach((prestador) => {
      const provinciaName = prestador.PROVINCIA?.trim()?.toUpperCase()
      if (!provinciaName) return

      const lat = Number(prestador.Latitud)
      const lng = Number(prestador.Longitud)

      if (isNaN(lat) || isNaN(lng)) return

      if (!provinciaMap.has(provinciaName)) {
        provinciaMap.set(provinciaName, {
          nombre: provinciaName,
          count: 0,
          latitudes: [],
          longitudes: [],
          localidades: new Set(),
          prestadores: [], // Para drill-down
        })
      }

      const provinciaData = provinciaMap.get(provinciaName)
      provinciaData.count++
      provinciaData.latitudes.push(lat)
      provinciaData.longitudes.push(lng)

      if (prestador.LOCALIDAD) {
        provinciaData.localidades.add(prestador.LOCALIDAD.trim())
      }

      // Guardar prestador para drill-down
      provinciaData.prestadores.push(prestador)
    })

    console.log("🏛️ Provincias encontradas:", Array.from(provinciaMap.keys()))

    // ✅ CALCULAR CENTROS Y CREAR CLUSTERS
    const provinciasConCentros = Array.from(provinciaMap.values()).map((provincia) => {
      // Calcular centro geográfico promedio
      const latPromedio =
        provincia.latitudes.reduce((sum: number, lat: number) => sum + lat, 0) / provincia.latitudes.length
      const lngPromedio =
        provincia.longitudes.reduce((sum: number, lng: number) => sum + lng, 0) / provincia.longitudes.length

      return {
        id: provincia.nombre.toLowerCase().replace(/\s+/g, "-"),
        nombre: provincia.nombre,
        count: provincia.count,
        latitud: Math.round(latPromedio * 10000) / 10000,
        longitud: Math.round(lngPromedio * 10000) / 10000,
        localidades: Array.from(provincia.localidades).slice(0, 5), // Top 5 localidades
        tipo: "provincia",
      }
    })

    // ✅ ORDENAR POR CANTIDAD DE PRESTADORES
    provinciasConCentros.sort((a, b) => b.count - a.count)

    const totalPrestadores = provinciasConCentros.reduce((sum, p) => sum + p.count, 0)

    console.log("🏛️ Provincias procesadas:", provinciasConCentros.length)
    console.log("📊 Total prestadores agrupados:", totalPrestadores)
    console.log(
      "🔝 Top 5 provincias:",
      provinciasConCentros.slice(0, 5).map((p) => `${p.nombre}: ${p.count}`),
    )

    return NextResponse.json({
      success: true,
      provincias: provinciasConCentros,
      total: totalPrestadores,
      filtros: {
        especialidad: especialidad || null,
        prestador: prestador || null,
        provincia: provincia || null,
      },
      debug: {
        totalPrestadores: totalPrestadores,
        provinciasEncontradas: provinciasConCentros.length,
        filtrosAplicados: {
          especialidad: !!especialidad,
          prestador: !!prestador,
          provincia: !!provincia,
        },
      },
    })
  } catch (error) {
    console.error("❌ Error en buscar-por-provincia:", error)
    return NextResponse.json(
      {
        success: false,
        provincias: [],
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
