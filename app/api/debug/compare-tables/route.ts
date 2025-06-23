import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Crear cliente Supabase con las variables de entorno correctas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET() {
  try {
    console.log("🔍 Comparando acceso a todas las tablas...")
    console.log("🔑 URL:", supabaseUrl)
    console.log("🔑 Key (primeros 5 caracteres):", supabaseKey?.substring(0, 5))

    // Lista de tablas a verificar
    const tables = ["Cartilla", "Especialidades", "Red de Farmacias", "Base Geografica", "Afiliados"]

    const results = {}

    // Verificar cada tabla
    for (const table of tables) {
      console.log(`\n📋 Verificando tabla: ${table}`)

      try {
        const { data, error, count } = await supabase.from(table).select("*", { count: "exact" }).limit(1)

        if (error) {
          console.error(`❌ Error en tabla ${table}:`, error)
          results[table] = {
            success: false,
            error: error.message,
            details: error,
            count: 0,
          }
        } else {
          console.log(`✅ Tabla ${table}: ${count} registros`)
          results[table] = {
            success: true,
            count: count,
            sample: data && data.length > 0 ? data[0] : null,
            columns: data && data.length > 0 ? Object.keys(data[0]) : [],
          }
        }
      } catch (err) {
        console.error(`❌ Error al acceder a tabla ${table}:`, err)
        results[table] = {
          success: false,
          error: err instanceof Error ? err.message : "Error desconocido",
        }
      }
    }

    // Verificar también la lista de tablas disponibles
    try {
      const { data: tablesData, error: tablesError } = await supabase.from("_tables").select("*")

      if (tablesError) {
        console.error("❌ Error al listar tablas:", tablesError)
        results["_tables"] = {
          success: false,
          error: tablesError.message,
        }
      } else {
        console.log("📋 Tablas disponibles:", tablesData)
        results["_tables"] = {
          success: true,
          tables: tablesData,
        }
      }
    } catch (err) {
      console.error("❌ Error al listar tablas:", err)
      results["_tables"] = {
        success: false,
        error: err instanceof Error ? err.message : "Error desconocido",
      }
    }

    // Verificar permisos
    try {
      const { data: permsData, error: permsError } = await supabase.rpc("get_my_claims")

      if (permsError) {
        console.error("❌ Error al verificar permisos:", permsError)
        results["_permissions"] = {
          success: false,
          error: permsError.message,
        }
      } else {
        console.log("🔒 Permisos:", permsData)
        results["_permissions"] = {
          success: true,
          permissions: permsData,
        }
      }
    } catch (err) {
      console.error("❌ Error al verificar permisos:", err)
      results["_permissions"] = {
        success: false,
        error: err instanceof Error ? err.message : "Error desconocido",
      }
    }

    return NextResponse.json({
      success: true,
      results,
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
