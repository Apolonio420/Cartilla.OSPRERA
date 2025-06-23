import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = Number.parseFloat(searchParams.get("lat") || "0")
    const lng = Number.parseFloat(searchParams.get("lng") || "0")
    const radio = Number.parseInt(searchParams.get("radio") || "50")
    const especialidad = searchParams.get("especialidad")
    const prestador = searchParams.get("prestador")
    const cargarTodos = searchParams.get("todos") === "true" // ✅ NUEVO PARÁMETRO

    console.log("🔍 Buscar Cercanos - Parámetros:", {
      lat,
      lng,
      radio,
      especialidad,
      prestador,
      cargarTodos,
    })

    // ✅ SI PIDE CARGAR TODOS, NO VALIDAR COORDENADAS
    if (!cargarTodos && (!lat || !lng)) {
      return NextResponse.json({
        success: false,
        prestadores: [],
        error: "Coordenadas requeridas",
      })
    }

    // ✅ OBTENER TODOS LOS PRESTADORES EN LOTES
    let todosPrestadores: any[] = []
    let desde = 0
    const tamañoLote = 1000
    let hayMasDatos = true

    console.log("📦 Cargando prestadores en lotes...")

    while (hayMasDatos) {
      // Construir la consulta base para cada lote
      let query = supabase
        .from("Cartilla")
        .select(
          "NOMBRE_COMPLETO, CUIT, ESPECIALIDAD, DOMICILIO, LOCALIDAD, PROVINCIA, TELEFONO, TELEFONO_2, EMAIL, Latitud, Longitud",
        )
        .not("Latitud", "is", null)
        .not("Longitud", "is", null)

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

      // ✅ USAR RANGE PARA OBTENER LOTES
      const { data: lote, error } = await query.range(desde, desde + tamañoLote - 1)

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

      if (!lote || lote.length === 0) {
        hayMasDatos = false
        break
      }

      todosPrestadores = [...todosPrestadores, ...lote]
      console.log(
        `📦 Lote ${Math.floor(desde / tamañoLote) + 1}: ${lote.length} prestadores (Total: ${todosPrestadores.length})`,
      )

      // Si el lote es menor al tamaño esperado, no hay más datos
      if (lote.length < tamañoLote) {
        hayMasDatos = false
      } else {
        desde += tamañoLote
      }

      // ✅ LÍMITE DE SEGURIDAD PARA EVITAR BUCLES INFINITOS
      if (desde > 20000) {
        console.log("⚠️ Límite de seguridad alcanzado")
        break
      }
    }

    console.log("📊 TOTAL prestadores obtenidos de DB:", todosPrestadores.length)

    if (todosPrestadores.length === 0) {
      return NextResponse.json({
        success: true,
        prestadores: [],
        total: 0,
        message: "No se encontraron prestadores con los filtros aplicados",
      })
    }

    // ✅ SI PIDE CARGAR TODOS, DEVOLVER SIN FILTRAR POR DISTANCIA
    if (cargarTodos) {
      const prestadoresFormateados = todosPrestadores.map((prestador) => ({
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
        latitud: Number(prestador.Latitud),
        longitud: Number(prestador.Longitud),
      }))

      return NextResponse.json({
        success: true,
        prestadores: prestadoresFormateados,
        total: prestadoresFormateados.length,
        message: `${prestadoresFormateados.length} prestadores cargados`,
      })
    }

    // ✅ FILTRAR POR DISTANCIA SOLO SI NO ES CARGA TOTAL
    const prestadoresConDistancia = todosPrestadores
      .map((prestador) => {
        const prestadorLat = Number(prestador.Latitud)
        const prestadorLng = Number(prestador.Longitud)

        if (isNaN(prestadorLat) || isNaN(prestadorLng)) {
          return null
        }

        // Fórmula de Haversine para calcular distancia
        const R = 6371 // Radio de la Tierra en km
        const dLat = ((prestadorLat - lat) * Math.PI) / 180
        const dLng = ((prestadorLng - lng) * Math.PI) / 180
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat * Math.PI) / 180) *
            Math.cos((prestadorLat * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        const distancia = R * c

        return {
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
          latitud: prestadorLat,
          longitud: prestadorLng,
          distancia: Math.round(distancia * 10) / 10, // Redondear a 1 decimal
        }
      })
      .filter((prestador) => prestador !== null && prestador.distancia <= radio)
      .sort((a, b) => a.distancia - b.distancia)

    console.log("✅ Prestadores filtrados por radio:", prestadoresConDistancia.length)

    return NextResponse.json({
      success: true,
      prestadores: prestadoresConDistancia,
      total: prestadoresConDistancia.length,
      filtros: {
        especialidad: especialidad || null,
        prestador: prestador || null,
        radio: radio,
        coordenadas: { lat, lng },
      },
      debug: {
        prestadoresEnDB: todosPrestadores.length,
        prestadoresFiltrados: prestadoresConDistancia.length,
        filtrosAplicados: {
          especialidad: !!especialidad,
          prestador: !!prestador,
          radio: true,
        },
      },
    })
  } catch (error) {
    console.error("❌ Error en buscar-cercanos:", error)
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
