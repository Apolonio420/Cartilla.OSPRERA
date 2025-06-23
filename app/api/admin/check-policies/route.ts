import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Usar las credenciales de servicio para operaciones administrativas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function GET() {
  try {
    console.log("🔍 Verificando políticas de seguridad...")

    // Verificar RLS en todas las tablas
    const tables = ["Cartilla", "Especialidades", "Red de Farmacias", "Base Geografica", "Afiliados"]
    const results = {}

    for (const table of tables) {
      console.log(`\n📋 Verificando tabla: ${table}`)

      try {
        // Verificar si RLS está habilitado
        const { data: rlsData, error: rlsError } = await supabaseAdmin
          .from("pg_tables")
          .select("*")
          .eq("tablename", table)
          .eq("schemaname", "public")

        if (rlsError) {
          console.error(`❌ Error verificando RLS para ${table}:`, rlsError)
          results[table] = {
            success: false,
            error: rlsError.message,
          }
          continue
        }

        // Intentar acceder con cliente normal
        const supabaseNormal = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        )

        const { data: normalData, error: normalError } = await supabaseNormal
          .from(table)
          .select("*", { count: "exact" })
          .limit(1)

        // Intentar acceder con cliente admin
        const { data: adminData, error: adminError } = await supabaseAdmin
          .from(table)
          .select("*", { count: "exact" })
          .limit(1)

        results[table] = {
          success: true,
          normalAccess: {
            success: !normalError,
            count: normalData?.length || 0,
            error: normalError?.message,
          },
          adminAccess: {
            success: !adminError,
            count: adminData?.length || 0,
            error: adminError?.message,
          },
          rlsEnabled: rlsData && rlsData.length > 0,
        }

        console.log(`📊 ${table}:`)
        console.log(`  - Acceso normal: ${!normalError ? "✅" : "❌"} (${normalData?.length || 0} registros)`)
        console.log(`  - Acceso admin: ${!adminError ? "✅" : "❌"} (adminData?.length || 0} registros)`)
      } catch (err) {
        console.error(`❌ Error general para ${table}:`, err)
        results[table] = {
          success: false,
          error: err instanceof Error ? err.message : "Error desconocido",
        }
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
