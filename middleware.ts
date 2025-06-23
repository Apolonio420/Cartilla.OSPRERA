import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  console.log("🔍 MIDDLEWARE - Ejecutándose para:", request.nextUrl.pathname)

  // No hacer nada, solo registrar la solicitud
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
