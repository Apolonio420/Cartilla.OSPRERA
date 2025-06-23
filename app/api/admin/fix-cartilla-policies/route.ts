import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Usar las credenciales de servicio para operaciones administrativas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function POST() {
  try {
    console.log("🔧 Configurando políticas para tabla Cartilla...")

    // Primero, verificar si la tabla tiene RLS habilitado
    const { data: tableInfo, error: tableError } = await supabaseAdmin.rpc("check_table_rls", {
      table_name: "Cartilla",
    })

    if (tableError) {
      console.log("⚠️ No se pudo verificar RLS, continuando...")
    }

    // Crear política para permitir lectura pública en Cartilla
    const policies = [
      {
        name: "cartilla_select_policy",
        sql: `
          CREATE POLICY IF NOT EXISTS "cartilla_select_policy" 
          ON "public"."Cartilla" 
          FOR SELECT 
          USING (true);
        `,
      },
      {
        name: "disable_rls_cartilla",
        sql: `ALTER TABLE "public"."Cartilla" DISABLE ROW LEVEL SECURITY;`,
      },
    ]

    const results = []

    for (const policy of policies) {
      try {
        console.log(`🔧 Ejecutando: ${policy.name}`)

        const { data, error } = await supabaseAdmin.rpc("exec_sql", {
          sql: policy.sql,
        })

        if (error) {
          console.error(`❌ Error en ${policy.name}:`, error)
          results.push({
            name: policy.name,
            success: false,
            error: error.message,
          })
        } else {
          console.log(`✅ ${policy.name} ejecutado correctamente`)
          results.push({
            name: policy.name,
            success: true,
          })
        }
      } catch (err) {
        console.error(`❌ Error ejecutando ${policy.name}:`, err)
        results.push({
          name: policy.name,
          success: false,
          error: err instanceof Error ? err.message : "Error desconocido",
        })
      }
    }

    // Verificar el resultado
    const { data: testData, error: testError } = await supabaseAdmin
      .from("Cartilla")
      .select("*", { count: "exact" })
      .limit(1)

    console.log("🧪 Prueba después de configurar políticas:")
    console.log(`  - Registros encontrados: ${testData?.length || 0}`)
    console.log(`  - Error: ${testError?.message || "Ninguno"}`)

    return NextResponse.json({
      success: true,
      results,
      testResult: {
        count: testData?.length || 0,
        error: testError?.message,
        sample: testData?.[0] || null,
      },
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
