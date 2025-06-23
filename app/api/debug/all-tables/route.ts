import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("🔍 Listando todas las tablas en Supabase...")

    // Intentar listar todas las tablas usando información del esquema
    const { data: schemaData, error: schemaError } = await supabase.rpc("get_all_tables")

    if (schemaError) {
      console.error("❌ Error al listar tablas:", schemaError)

      // Intentar con una consulta SQL directa
      const { data: sqlData, error: sqlError } = await supabase
        .from("pg_tables")
        .select("tablename")
        .eq("schemaname", "public")

      if (sqlError) {
        console.error("❌ Error al listar tablas con SQL:", sqlError)
        throw new Error("No se pudo obtener la lista de tablas")
      }

      return NextResponse.json({
        success: true,
        tables: sqlData?.map((t) => t.tablename) || [],
        method: "sql_query",
        timestamp: new Date().toISOString(),
      })
    }

    // Obtener información detallada de cada tabla
    const tableDetails = []

    if (Array.isArray(schemaData)) {
      for (const tableName of schemaData) {
        try {
          // Obtener recuento y muestra de datos
          const { data, count, error } = await supabase.from(tableName).select("*", { count: "exact" }).limit(3)

          if (!error) {
            const columns = data && data.length > 0 ? Object.keys(data[0]) : []

            tableDetails.push({
              name: tableName,
              count: count || 0,
              columns: columns,
              sample: data || [],
              hasData: (count || 0) > 0,
            })
          }
        } catch (err) {
          console.error(`❌ Error al obtener detalles de ${tableName}:`, err)
        }
      }
    }

    return NextResponse.json({
      success: true,
      tables: schemaData || [],
      details: tableDetails,
      method: "rpc",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Error general listando tablas:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
