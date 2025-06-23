import { type NextRequest, NextResponse } from "next/server"
import { reclamosService } from "@/app/lib/services/reclamos-service"

export async function POST(request: NextRequest) {
  try {
    console.log("🧪 API TEST - Iniciando test de inserción")

    const body = await request.json()
    console.log("🧪 API TEST - Datos recibidos:", body)

    // Datos de prueba por defecto
    const datosTest = {
      dni: body.dni || "40207637",
      categoria: body.categoria || "CARTILLA",
      subcategoria: body.subcategoria || "NO ATIENDE",
      detalle: body.detalle || {
        localidad: "ROSARIO",
        especialidad: "CARDIOLOGIA",
        prestador: "HOSPITAL ITALIANO",
        descripcion: "Test desde API",
      },
    }

    console.log("🧪 API TEST - Datos preparados:", datosTest)

    const resultado = await reclamosService.crearReclamo(datosTest)

    console.log("🧪 API TEST - Resultado:", resultado)

    return NextResponse.json({
      success: true,
      test: "insert-reclamo",
      input: datosTest,
      result: resultado,
    })
  } catch (error: any) {
    console.error("🧪 API TEST - Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
