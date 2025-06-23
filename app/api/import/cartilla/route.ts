import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const startTime = Date.now()
    const { csvUrl } = await request.json()

    if (!csvUrl) {
      return NextResponse.json({ success: false, error: "URL de CSV no proporcionada" }, { status: 400 })
    }

    console.log(`🔄 Importando datos de cartilla desde: ${csvUrl}`)

    // Descargar el CSV
    const csvResponse = await fetch(csvUrl)
    if (!csvResponse.ok) {
      return NextResponse.json(
        { success: false, error: `Error al descargar CSV: ${csvResponse.statusText}` },
        { status: 500 },
      )
    }

    const csvText = await csvResponse.text()
    console.log(`📄 CSV descargado: ${csvText.length} caracteres`)

    // Parsear el CSV
    const rows = parseCSV(csvText)
    console.log(`📊 Filas parseadas: ${rows.length}`)

    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: "El CSV no contiene datos" }, { status: 400 })
    }

    // Obtener encabezados
    const headers = rows[0]
    console.log(`🏷️ Encabezados: ${headers.join(", ")}`)

    // Crear la tabla si no existe
    const { error: createError } = await supabase.rpc("create_cartilla_table_if_not_exists")
    if (createError) {
      console.error("❌ Error al crear tabla:", createError)

      // Intentar crear la tabla manualmente
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS "Cartilla" (
          "id" SERIAL PRIMARY KEY,
          "NOMBRE_COMPLETO" TEXT,
          "CUIT" TEXT,
          "ESPECIALIDAD" TEXT,
          "DOMICILIO" TEXT,
          "LOCALIDAD" TEXT,
          "PROVINCIA" TEXT,
          "TELEFONO" TEXT,
          "TELEFONO_2" TEXT,
          "EMAIL" TEXT,
          "Nivel_Atencion" TEXT,
          "Gerenciada" TEXT,
          "Visible" TEXT,
          "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `

      const { error: manualCreateError } = await supabase.rpc("run_sql", { sql: createTableSQL })
      if (manualCreateError) {
        console.error("❌ Error al crear tabla manualmente:", manualCreateError)
        return NextResponse.json(
          { success: false, error: `Error al crear tabla: ${manualCreateError.message}` },
          { status: 500 },
        )
      }
    }

    // Preparar datos para inserción
    const dataToInsert = rows.slice(1).map((row) => {
      const record: Record<string, string> = {}
      headers.forEach((header, index) => {
        // Normalizar nombres de columnas
        const normalizedHeader = header.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "")

        record[normalizedHeader] = row[index] || ""
      })
      return record
    })

    console.log(`🔄 Insertando ${dataToInsert.length} registros...`)
    console.log(`📝 Muestra de registro:`, dataToInsert[0])

    // Insertar datos en lotes para evitar límites de tamaño
    const BATCH_SIZE = 100
    let importedCount = 0

    for (let i = 0; i < dataToInsert.length; i += BATCH_SIZE) {
      const batch = dataToInsert.slice(i, i + BATCH_SIZE)
      const { error: insertError } = await supabase.from("Cartilla").insert(batch)

      if (insertError) {
        console.error(`❌ Error al insertar lote ${i / BATCH_SIZE + 1}:`, insertError)
        return NextResponse.json(
          { success: false, error: `Error al insertar datos: ${insertError.message}` },
          { status: 500 },
        )
      }

      importedCount += batch.length
      console.log(`✅ Lote ${i / BATCH_SIZE + 1} insertado: ${batch.length} registros`)
    }

    const timeElapsed = Date.now() - startTime

    return NextResponse.json({
      success: true,
      importedCount,
      timeElapsed,
      message: `Se importaron ${importedCount} registros exitosamente`,
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

// Función para parsear CSV
function parseCSV(text: string): string[][] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "")

  return lines.map((line) => {
    // Manejar campos entre comillas con comas
    const result = []
    let inQuotes = false
    let currentField = ""

    for (let i = 0; i < line.length; i++) {
      const char = line[i]

      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === "," && !inQuotes) {
        result.push(currentField)
        currentField = ""
      } else {
        currentField += char
      }
    }

    result.push(currentField)
    return result
  })
}
