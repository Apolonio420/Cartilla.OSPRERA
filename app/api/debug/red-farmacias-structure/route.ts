import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function GET() {
  try {
    console.log("🔍 Checking Red de Farmacias table structure...")

    // Primero, intentemos obtener algunos registros para ver la estructura
    const { data: sampleData, error: sampleError } = await supabase.from("Red de Farmacias").select("*").limit(5)

    if (sampleError) {
      console.error("❌ Error getting sample data:", sampleError)
      return NextResponse.json({
        error: "Error accessing table",
        details: sampleError.message,
        suggestion: "Check if table exists and has correct permissions",
      })
    }

    // Obtener el conteo total
    const { count, error: countError } = await supabase
      .from("Red de Farmacias")
      .select("*", { count: "exact", head: true })

    if (countError) {
      console.error("❌ Error getting count:", countError)
    }

    // Analizar la estructura de los datos
    const structure =
      sampleData && sampleData.length > 0
        ? {
            columns: Object.keys(sampleData[0]),
            sampleRecord: sampleData[0],
            totalRecords: count || 0,
            allSampleData: sampleData,
          }
        : {
            columns: [],
            sampleRecord: null,
            totalRecords: count || 0,
            allSampleData: [],
          }

    console.log("✅ Table structure analyzed:", structure)

    return NextResponse.json({
      success: true,
      tableExists: true,
      structure,
      message: `Found ${count || 0} records in Red de Farmacias table`,
    })
  } catch (error) {
    console.error("❌ Debug API Error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
