import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""

    console.log("🔍 DEBUG - Búsqueda de localidades iniciada")
    console.log("📝 Query recibido:", query)
    console.log("📝 Longitud del query:", query.length)

    if (query.length < 2) {
      console.log("❌ Query muy corto, retornando vacío")
      return NextResponse.json({
        success: true,
        localidades: [],
        debug: "Query muy corto (< 2 caracteres)",
      })
    }

    // Primero, verificar conexión a Supabase
    console.log("🔗 Verificando conexión a Supabase...")

    const { data: testData, error: testError } = await supabase
      .from("Base Geografica")
      .select("count", { count: "exact", head: true })

    if (testError) {
      console.error("❌ Error de conexión a Supabase:", testError)
      return NextResponse.json({
        success: false,
        error: "Error de conexión a Supabase",
        details: testError.message,
        debug: "Fallo en conexión inicial",
      })
    }

    console.log("✅ Conexión a Supabase exitosa")
    console.log("📊 Total de registros en Base Geografica:", testData)

    // Obtener una muestra pequeña primero
    console.log("📋 Obteniendo muestra de datos...")
    const { data: muestraData, error: muestraError } = await supabase.from("Base Geografica").select("*").limit(5)

    if (muestraError) {
      console.error("❌ Error al obtener muestra:", muestraError)
      return NextResponse.json({
        success: false,
        error: "Error al obtener muestra de datos",
        details: muestraError.message,
        debug: "Fallo en obtención de muestra",
      })
    }

    console.log("📋 Muestra obtenida:", muestraData?.length || 0, "registros")
    console.log("📋 Primer registro:", muestraData?.[0])

    // Ahora buscar con el término específico
    console.log("🔍 Buscando con término:", query)

    const { data: geograficaData, error: geograficaError } = await supabase
      .from("Base Geografica")
      .select("*")
      .limit(1000)

    if (geograficaError) {
      console.error("❌ Error en búsqueda principal:", geograficaError)
      return NextResponse.json({
        success: false,
        error: "Error en búsqueda principal",
        details: geograficaError.message,
        debug: "Fallo en búsqueda principal",
      })
    }

    console.log("📊 Datos obtenidos:", geograficaData?.length || 0, "registros")

    // Filtrar manualmente
    const searchLower = query.toLowerCase().trim()
    console.log("🔍 Término de búsqueda normalizado:", searchLower)

    const localidadesFiltradas = (geograficaData || []).filter((item) => {
      const localidad = (item.Localidad || "").toString().toLowerCase()
      const partido = (item.Partido || "").toString().toLowerCase()

      const coincideLocalidad = localidad.includes(searchLower)
      const coincidePartido = partido.includes(searchLower)

      if (coincideLocalidad || coincidePartido) {
        console.log("✅ Coincidencia encontrada:", {
          localidad: item.Localidad,
          partido: item.Partido,
          coincideLocalidad,
          coincidePartido,
        })
      }

      return coincideLocalidad || coincidePartido
    })

    console.log("🎯 Localidades filtradas:", localidadesFiltradas.length)

    const resultados = localidadesFiltradas.map((item) => ({
      id: item.LinkIndec || `geo-${Math.random()}`,
      nombre: item.Localidad,
      provincia: item.Provincia || "",
      partido: item.Partido || "",
      region: item["Region Macro"] || "",
      fuente: "base_geografica",
    }))

    console.log("📝 Resultados finales:", resultados.length)
    console.log("📝 Primeros 3 resultados:", resultados.slice(0, 3))

    return NextResponse.json({
      success: true,
      localidades: resultados,
      total: resultados.length,
      query: query,
      debug: {
        totalRegistros: geograficaData?.length || 0,
        registrosFiltrados: localidadesFiltradas.length,
        queryNormalizado: searchLower,
        muestra: muestraData?.slice(0, 2) || [],
      },
    })
  } catch (error) {
    console.error("❌ Error general:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error general en la búsqueda",
        details: error instanceof Error ? error.message : "Error desconocido",
        debug: "Excepción general capturada",
      },
      { status: 500 },
    )
  }
}
