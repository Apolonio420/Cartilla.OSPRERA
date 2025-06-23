import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET() {
  try {
    console.log("🔍 Analizando estructura de tabla Cartilla...")

    // Obtener una muestra de datos para ver la estructura real
    const {
      data: cartillaData,
      error: cartillaError,
      count,
    } = await supabase.from("Cartilla").select("*", { count: "exact" }).limit(5)

    if (cartillaError) {
      console.error("❌ Error al acceder a Cartilla:", cartillaError)
      return NextResponse.json({
        success: false,
        error: cartillaError.message,
        details: cartillaError,
      })
    }

    console.log("✅ Datos obtenidos exitosamente")
    console.log("📊 Total de registros:", count)
    console.log("📝 Muestra obtenida:", cartillaData?.length)

    const structure = {
      totalRecords: count,
      sampleSize: cartillaData?.length || 0,
      columns: cartillaData && cartillaData.length > 0 ? Object.keys(cartillaData[0]) : [],
      sampleData: cartillaData || [],
      columnTypes: {},
    }

    // Analizar tipos de datos en las columnas
    if (cartillaData && cartillaData.length > 0) {
      const firstRecord = cartillaData[0]
      Object.keys(firstRecord).forEach((key) => {
        const value = firstRecord[key]
        structure.columnTypes[key] = {
          type: typeof value,
          sample: value,
          hasData: value !== null && value !== undefined && value !== "",
        }
      })
    }

    return NextResponse.json({
      success: true,
      structure,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Error general:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
