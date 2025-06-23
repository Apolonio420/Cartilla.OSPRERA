import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { GeoService } from "@/app/lib/services/geo-service"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const limit = Number.parseInt(searchParams.get("limit") || "50") // Aumentar el límite por defecto
    const localidad = searchParams.get("localidad")
    const radio = Number.parseInt(searchParams.get("radio") || "20") // Aumentar el radio por defecto a 20km

    console.log("🔍 Red Farmacias Search Request:", { query, localidad, limit, radio })

    // Obtener coordenadas de la localidad si se proporciona
    let coordenadasLocalidad = null
    if (localidad) {
      coordenadasLocalidad = await GeoService.obtenerCoordenadasLocalidad(localidad)
      console.log("🌍 Coordenadas de localidad:", coordenadasLocalidad)
    }

    // Si no hay query o es muy corto y no hay filtros de localidad, retornar vacío
    if ((!query || query.length < 2) && query !== "*" && !coordenadasLocalidad) {
      return NextResponse.json({
        farmacias: [],
        success: false,
        message: "Query too short and no location filter",
        debug: { query, length: query?.length || 0 },
      })
    }

    // Construir la consulta usando los nombres de columnas correctos (mayúsculas)
    let supabaseQuery = supabase
      .from("Red de Farmacias")
      .select("Region, Zona, Cod, Nombre, Domicilio, Latitud, Longitud")
      .limit(limit)

    // Si hay un término de búsqueda válido, aplicar filtro por nombre
    if (query && query !== "*") {
      supabaseQuery = supabaseQuery.ilike("Nombre", `%${query}%`)
    }

    // Filtrar por localidad si se proporciona (buscar en Zona y Region) y no tenemos coordenadas
    if (localidad && !coordenadasLocalidad) {
      supabaseQuery = supabaseQuery.or(`Zona.ilike.%${localidad}%,Region.ilike.%${localidad}%`)
    }

    // Ordenar por nombre
    supabaseQuery = supabaseQuery.order("Nombre")

    console.log("🔍 Executing query with correct column names...")

    const { data: farmacias, error } = await supabaseQuery

    if (error) {
      console.error("❌ Supabase error:", error)
      return NextResponse.json(
        {
          error: "Database error",
          details: error.message,
          success: false,
        },
        { status: 500 },
      )
    }

    console.log("✅ Found farmacias:", farmacias?.length || 0)

    // Filtrar por distancia si tenemos coordenadas de la localidad
    let farmaciasFiltradas = farmacias || []
    if (coordenadasLocalidad) {
      console.log("🌍 Filtrando farmacias por distancia (radio:", radio, "km)")

      // Verificar si las farmacias tienen coordenadas
      const farmaciasSinCoordenadas = farmaciasFiltradas.filter((f) => !f.Latitud || !f.Longitud).length
      console.log(`⚠️ Farmacias sin coordenadas: ${farmaciasSinCoordenadas} de ${farmaciasFiltradas.length}`)

      // Filtrar por distancia
      farmaciasFiltradas = farmaciasFiltradas.filter((farmacia) => {
        // Verificar que la farmacia tenga coordenadas
        if (!farmacia.Latitud || !farmacia.Longitud) {
          return false
        }

        try {
          // Parsear coordenadas
          const latFarmacia = GeoService["parseCoordinate"](farmacia.Latitud)
          const lonFarmacia = GeoService["parseCoordinate"](farmacia.Longitud)

          if (isNaN(latFarmacia) || isNaN(lonFarmacia)) {
            console.log("⚠️ Coordenadas inválidas para farmacia:", farmacia.Nombre, farmacia.Latitud, farmacia.Longitud)
            return false
          }

          // Calcular distancia
          const distancia = GeoService.calcularDistancia(
            coordenadasLocalidad!.latitud,
            coordenadasLocalidad!.longitud,
            latFarmacia,
            lonFarmacia,
          )

          // Guardar la distancia para ordenar después
          farmacia.distancia = distancia

          // Filtrar por radio
          return distancia <= radio
        } catch (error) {
          console.error("❌ Error calculando distancia para farmacia:", farmacia.Nombre, error)
          return false
        }
      })

      // Ordenar por distancia
      farmaciasFiltradas.sort((a, b) => (a.distancia || 999) - (b.distancia || 999))

      console.log("✅ Farmacias filtradas por distancia:", farmaciasFiltradas.length)

      // Mostrar las primeras 3 farmacias encontradas para debug
      if (farmaciasFiltradas.length > 0) {
        console.log("📋 Primeras farmacias encontradas:")
        farmaciasFiltradas.slice(0, 3).forEach((f, i) => {
          console.log(`${i + 1}. ${f.Nombre} - ${f.Zona || f.Region} - Distancia: ${f.distancia?.toFixed(1)}km`)
        })
      }
    }

    // Si no hay resultados con filtro geoespacial, intentar con filtro textual
    if (farmaciasFiltradas.length === 0 && coordenadasLocalidad) {
      console.log("⚠️ No se encontraron farmacias por distancia, intentando con filtro textual")

      const { data: farmaciasPorTexto, error: errorTexto } = await supabase
        .from("Red de Farmacias")
        .select("Region, Zona, Cod, Nombre, Domicilio, Latitud, Longitud")
        .or(`Zona.ilike.%${localidad}%,Region.ilike.%${localidad}%`)
        .limit(limit)
        .order("Nombre")

      if (!errorTexto && farmaciasPorTexto && farmaciasPorTexto.length > 0) {
        console.log("✅ Encontradas farmacias por filtro textual:", farmaciasPorTexto.length)
        farmaciasFiltradas = farmaciasPorTexto
      }
    }

    // Transformar los datos usando los nombres de columnas correctos
    const transformedFarmacias = farmaciasFiltradas.map((farmacia) => ({
      id: farmacia.Cod?.toString() || Math.random().toString(),
      nombre: farmacia.Nombre || "",
      zona: farmacia.Zona || "",
      region: farmacia.Region || "",
      domicilio: farmacia.Domicilio || "",
      latitud: farmacia.Latitud || null,
      longitud: farmacia.Longitud || null,
      codigo: farmacia.Cod?.toString() || "",
      distancia: farmacia.distancia ? `${farmacia.distancia.toFixed(1)} km` : undefined,
    }))

    console.log("✅ Transformed results:", transformedFarmacias.length, "farmacias")
    if (transformedFarmacias.length > 0) {
      console.log("📋 First result:", transformedFarmacias[0])
    }

    return NextResponse.json({
      farmacias: transformedFarmacias,
      total: transformedFarmacias.length,
      query: query,
      success: true,
      debug: {
        totalRecordsInTable: 4490,
        usedStrategy: coordenadasLocalidad ? "geo_distance" : "ilike_Nombre",
        searchStrategiesAttempted: coordenadasLocalidad ? 2 : 1,
        originalQuery: query,
        localidadFilter: localidad,
        coordenadasLocalidad: coordenadasLocalidad,
        radioKm: radio,
        columnNamesUsed: ["Region", "Zona", "Cod", "Nombre", "Domicilio", "Latitud", "Longitud"],
      },
    })
  } catch (error) {
    console.error("❌ API Error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        success: false,
      },
      { status: 500 },
    )
  }
}
