import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    // Eliminar la cookie de sesión
    cookies().delete("user_dni")

    // Devolver respuesta exitosa
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Error al cerrar sesión" }, { status: 500 })
  }
}
