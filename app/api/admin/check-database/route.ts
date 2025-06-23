import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function POST() {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    console.log("🔍 Verificando estructura de la tabla Afiliado...")

    // Verificar si la tabla existe y obtener su estructura
    const tableInfo = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'Afiliado' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `

    if (tableInfo.length === 0) {
      return NextResponse.json({
        success: false,
        error: "La tabla Afiliado no existe",
        details: ["La tabla Afiliado no se encontró en la base de datos"],
      })
    }

    const columns = tableInfo.map((col) => col.column_name)
    const requiredColumns = ["nombre", "apellido", "domicilio", "provincia", "localidad", "plan", "estado"]
    const missingColumns = requiredColumns.filter((col) => !columns.includes(col))

    const details = [
      `Tabla Afiliado encontrada con ${columns.length} columnas`,
      `Columnas existentes: ${columns.join(", ")}`,
      ...missingColumns.map((col) => `❌ Falta columna: ${col}`),
    ]

    if (missingColumns.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Faltan ${missingColumns.length} columnas en la tabla Afiliado`,
        details,
        missingColumns,
      })
    }

    return NextResponse.json({
      success: true,
      message: "La estructura de la base de datos está correcta",
      details: [...details, "✅ Todas las columnas requeridas están presentes"],
    })
  } catch (error) {
    console.error("Error verificando base de datos:", error)
    return NextResponse.json({
      success: false,
      error: "Error al verificar la base de datos: " + (error as Error).message,
    })
  }
}
