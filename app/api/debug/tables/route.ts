import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("🔍 Verificando tablas disponibles en Supabase...")

    // Intentar diferentes nombres de tabla que podrían existir
    const possibleTableNames = [
      "Cartilla",
      "cartilla",
      "CARTILLA",
      "Prestadores",
      "prestadores",
      "PRESTADORES",
      "Base Cartilla",
      "base_cartilla",
      "CartillaPrestadores",
      "cartilla_prestadores",
    ]

    const results = []

    for (const tableName of possibleTableNames) {
      try {
        console.log(`🔍 Probando tabla: ${tableName}`)

        // Intentar obtener un registro de la tabla
        const { data, error, count } = await supabase.from(tableName).select("*", { count: "exact" }).limit(1)

        if (!error && data !== null) {
          console.log(`✅ Tabla encontrada: ${tableName} con ${count} registros`)

          // Obtener estructura de columnas
          let columns = []
          if (data.length > 0) {
            columns = Object.keys(data[0])
          }

          results.push({
            name: tableName,
            exists: true,
            count: count,
            columns: columns,
            sampleData: data[0] || null,
          })
        } else {
          console.log(`❌ Tabla no encontrada: ${tableName}`)
          results.push({
            name: tableName,
            exists: false,
            error: error?.message || "No existe",
          })
        }
      } catch (err) {
        console.log(`❌ Error probando tabla ${tableName}:`, err)
        results.push({
          name: tableName,
          exists: false,
          error: err instanceof Error ? err.message : "Error desconocido",
        })
      }
    }

    // También intentar listar todas las tablas usando información del esquema
    let schemaInfo = null
    try {
      const { data: schemaData, error: schemaError } = await supabase
        .from("information_schema.tables")
        .select("table_name")
        .eq("table_schema", "public")

      if (!schemaError && schemaData) {
        schemaInfo = schemaData.map((t) => t.table_name)
        console.log("📋 Tablas en esquema público:", schemaInfo)
      }
    } catch (err) {
      console.log("❌ No se pudo obtener información del esquema")
    }

    return NextResponse.json({
      success: true,
      results: results,
      existingTables: results.filter((r) => r.exists),
      schemaInfo: schemaInfo,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Error general verificando tablas:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
