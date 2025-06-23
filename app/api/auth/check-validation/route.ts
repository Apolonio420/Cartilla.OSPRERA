import { type NextRequest, NextResponse } from "next/server"
import { verificarAutenticacion } from "@/app/actions/auth-actions"
import { verificarDatosValidados } from "@/app/actions/validation-actions"

export async function GET(request: NextRequest) {
  try {
    const usuario = await verificarAutenticacion()

    if (!usuario) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const validado = await verificarDatosValidados(usuario.dni)

    return NextResponse.json({
      validated: validado,
      dni: usuario.dni,
    })
  } catch (error) {
    console.error("Error verificando validación:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
