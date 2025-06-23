import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Verificar si la tabla Afiliado existe
    console.log("🔄 Verificando tabla Afiliado...")

    // En lugar de crear la tabla directamente, usamos Prisma para verificar
    // si podemos acceder a la tabla
    try {
      await prisma.afiliado.findFirst()
      console.log("✅ Tabla Afiliado existe y es accesible")
    } catch (error) {
      console.log("⚠️ Error al acceder a la tabla Afiliado:", error)

      // Informamos del error pero no intentamos crear la tabla directamente
      // ya que esto debería hacerse con migraciones de Prisma
      return NextResponse.json(
        {
          message:
            "Error al acceder a la tabla Afiliado. Por favor ejecute prisma db push para crear las tablas necesarias.",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({ message: "Base de datos verificada correctamente" })
  } catch (error) {
    console.error("Error general:", error)
    return NextResponse.json({ message: "Error al verificar la base de datos" }, { status: 500 })
  }
}
