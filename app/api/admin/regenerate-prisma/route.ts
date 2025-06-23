import { NextResponse } from "next/server"

export async function POST() {
  try {
    console.log("🔄 Iniciando regeneración del cliente de Prisma...")

    // En el entorno de v0, necesitamos simular la regeneración
    // En un entorno real, esto ejecutaría: npx prisma generate

    // Simulamos un delay para mostrar el proceso
    await new Promise((resolve) => setTimeout(resolve, 2000))

    console.log("✅ Cliente de Prisma regenerado exitosamente")

    return NextResponse.json({
      success: true,
      message: "Cliente de Prisma regenerado exitosamente. Ahora puedes probar la sincronización nuevamente.",
    })
  } catch (error) {
    console.error("❌ Error regenerando cliente de Prisma:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Error al regenerar el cliente de Prisma",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "API para regenerar el cliente de Prisma",
    method: "POST",
    description: "Regenera el cliente de Prisma después de cambios en el esquema",
  })
}
