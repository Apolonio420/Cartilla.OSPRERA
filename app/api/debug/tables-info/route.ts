import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET() {
  try {
    console.log("🔍 Verificando tablas disponibles...")

    const tablesToCheck = [
      "Cartilla",
      "Base Geografica",
      "Especialidades",
      "Red de Farmacias",
      "Red de Farmacias (Ambulatorio)",
      "Farmacias",
    ]

    const results = []

    for (const tableName of tablesToCheck) {
      try {
        console.log(`🔍 Verificando tabla: ${tableName}`)

        const { data, error } = await supabase.from(tableName).select("*").limit(1)

        if (error) {
          results.push({
            table: tableName,
            exists: false,
            error: error.message,
            fields: [],
          })
        } else {
          const fields = data && data.length > 0 ? Object.keys(data[0]) : []
          results.push({
            table: tableName,
            exists: true,
            recordCount: data?.length || 0,
            fields: fields,
          })
        }
      } catch (err) {
        results.push({
          table: tableName,
          exists: false,
          error: err instanceof Error ? err.message : "Error desconocido",
          fields: [],
        })
      }
    }

    return NextResponse.json({
      success: true,
      tables: results,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Error verificando tablas:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
