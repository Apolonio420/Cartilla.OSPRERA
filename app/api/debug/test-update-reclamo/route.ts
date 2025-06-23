import { type NextRequest, NextResponse } from "next/server"
import { reclamosService } from "@/app/lib/services/reclamos-service"

export async function POST(request: NextRequest) {
  try {
    const { reclamoId } = await request.json()

    console.log("🔍 API DEBUG - Probando actualización de reclamo:", reclamoId)

    // Primero obtener el reclamo
    const reclamo = await reclamosService.obtenerReclamoPorId(reclamoId)
    console.log("📊 API DEBUG - Reclamo obtenido:", reclamo)

    if (!reclamo.success) {
      return NextResponse.json({ success: false, error: "Reclamo no encontrado" })
    }

    // Intentar actualizar
    const resultado = await reclamosService.actualizarReclamo(reclamoId, {
      reiteraciones: (reclamo.data.reiteraciones || 0) + 1,
      updated_at: new Date().toISOString(),
    })

    console.log("✅ API DEBUG - Resultado actualización:", resultado)

    return NextResponse.json(resultado)
  } catch (error: any) {
    console.error("❌ API DEBUG - Error:", error)
    return NextResponse.json({ success: false, error: error.message })
  }
}
