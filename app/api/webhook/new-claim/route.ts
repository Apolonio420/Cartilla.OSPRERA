import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Aquí se procesaría la notificación
    // En un entorno real, podríamos enviar un email, una notificación push, etc.
    console.log("Nuevo reclamo recibido:", data)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error en webhook:", error)
    return NextResponse.json({ success: false, error: "Error al procesar la solicitud" }, { status: 500 })
  }
}
