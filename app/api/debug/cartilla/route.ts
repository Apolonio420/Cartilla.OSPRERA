import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("🔍 Iniciando diagnóstico de tabla Cartilla...")

    // 1. Verificar conexión y obtener algunos registros
    const { data: sampleData, error: sampleError } = await supabase.from("Cartilla").select("*").limit(5)

    if (sampleError) {
      console.error("❌ Error al obtener muestra de datos:", sampleError)
      return NextResponse.json({
        success: false,
        error: sampleError.message,
        step: "sample_data",
      })
    }

    console.log("✅ Muestra de datos obtenida:", sampleData?.length || 0, "registros")

    // 2. Obtener estructura de columnas
    let columns = []
    if (sampleData && sampleData.length > 0) {
      columns = Object.keys(sampleData[0])
      console.log("📋 Columnas encontradas:", columns)
    }

    // 3. Contar total de registros
    const { count, error: countError } = await supabase.from("Cartilla").select("*", { count: "exact", head: true })

    if (countError) {
      console.error("❌ Error al contar registros:", countError)
    }

    console.log("📊 Total de registros en Cartilla:", count)

    // 4. Buscar registros que contengan "hospital" en cualquier campo de texto
    const { data: hospitalData, error: hospitalError } = await supabase.from("Cartilla").select("*").limit(10)

    let hospitalResults = []
    if (hospitalData && !hospitalError) {
      hospitalResults = hospitalData.filter((item) => {
        const allValues = Object.values(item).join(" ").toLowerCase()
        return allValues.includes("hospital")
      })
    }

    // 5. Verificar si existe la columna NOMBRE_COMPLETO específicamente
    let nombreCompletoSample = []
    if (sampleData && sampleData.length > 0) {
      nombreCompletoSample = sampleData.map((item) => ({
        id: item.Id || item.id,
        nombre_completo: item.NOMBRE_COMPLETO,
        nombre_completo_alt: item.nombre_completo,
        nombre_completo_lower: item.nombre_completo,
        // Intentar diferentes variaciones
        prestador: item.Prestador,
        nombre: item.Nombre,
        razon_social: item.RAZON_SOCIAL || item.razon_social,
      }))
    }

    return NextResponse.json({
      success: true,
      diagnostico: {
        total_registros: count,
        muestra_registros: sampleData?.length || 0,
        columnas_disponibles: columns,
        muestra_datos: sampleData?.slice(0, 2) || [],
        busqueda_hospital: {
          encontrados: hospitalResults.length,
          resultados: hospitalResults.slice(0, 3),
        },
        nombre_completo_analysis: nombreCompletoSample,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("❌ Error general en diagnóstico:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
        step: "general",
      },
      { status: 500 },
    )
  }
}
