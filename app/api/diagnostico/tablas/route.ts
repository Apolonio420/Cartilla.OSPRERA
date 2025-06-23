import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("🔍 Iniciando diagnóstico de tablas...")

    // Lista ampliada de tablas conocidas
    const tablasConocidas = [
      "Afiliados",
      "Especialidades",
      "Red de Farmacias",
      "Base Geografica", // Agregamos la tabla geográfica
      "Localidades",
      "Provincias",
    ]

    const resultados = []

    for (const nombreTabla of tablasConocidas) {
      try {
        console.log(`🔍 Verificando tabla: ${nombreTabla}`)

        // Obtener una muestra de datos para ver las columnas
        const { data: muestra, error: muestraError } = await supabase.from(nombreTabla).select("*").limit(1)

        if (!muestraError && muestra && muestra.length > 0) {
          const columnas = Object.keys(muestra[0])
          console.log(`✅ ${nombreTabla} - Columnas:`, columnas)

          resultados.push({
            nombre: nombreTabla,
            esquema: "public",
            columnas: columnas,
            totalRegistros: "Verificando...",
          })
        } else if (!muestraError && muestra && muestra.length === 0) {
          // Tabla existe pero está vacía
          console.log(`⚠️ ${nombreTabla} - Tabla vacía`)
          resultados.push({
            nombre: nombreTabla,
            esquema: "public",
            columnas: ["Tabla vacía"],
            totalRegistros: 0,
          })
        } else {
          console.log(`❌ ${nombreTabla} - Error:`, muestraError)
        }
      } catch (error) {
        console.log(`❌ Error al verificar ${nombreTabla}:`, error)
      }
    }

    // Obtener conteos de registros
    for (const tabla of resultados) {
      try {
        const { count, error: countError } = await supabase
          .from(tabla.nombre)
          .select("*", { count: "exact", head: true })

        if (!countError) {
          tabla.totalRegistros = count || 0
        }
      } catch (error) {
        console.log(`❌ Error al contar registros de ${tabla.nombre}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      tablas: resultados,
      metodo: "consulta directa",
    })
  } catch (error) {
    console.error("❌ Error en diagnóstico:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
        tablas: [],
      },
      { status: 500 },
    )
  }
}
