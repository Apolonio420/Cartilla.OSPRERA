import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const dni = cookieStore.get("user_dni")?.value

    if (dni) {
      return NextResponse.json({
        authenticated: true,
        dni: dni,
      })
    } else {
      return NextResponse.json({
        authenticated: false,
        dni: null,
      })
    }
  } catch (error) {
    return NextResponse.json(
      {
        authenticated: false,
        dni: null,
        error: "Error al verificar sesión",
      },
      { status: 500 },
    )
  }
}
