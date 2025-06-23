import { cookies } from "next/headers"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DiagnosticoPage() {
  console.log("🔍 DIAGNOSTICO - Renderizando página de diagnóstico")

  // Verificar cookies directamente
  const cookieStore = cookies()
  const userDniCookie = cookieStore.get("user_dni")
  console.log("🔍 DIAGNOSTICO - Cookie user_dni directa:", userDniCookie?.value)

  // Listar todas las cookies
  const allCookies = cookieStore.getAll()
  console.log(
    "🔍 DIAGNOSTICO - Todas las cookies:",
    allCookies.map((c) => `${c.name}=${c.value}`),
  )

  return (
    <main className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h1 className="text-2xl font-bold mb-4 text-[#00613c]">Diagnóstico</h1>

          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Estado de autenticación</h2>
            <div className="bg-gray-100 p-3 rounded">
              <p>
                <span className="font-medium">Cookie user_dni:</span>{" "}
                {userDniCookie ? userDniCookie.value : "No establecida"}
              </p>
            </div>
          </div>

          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Todas las cookies</h2>
            <div className="bg-gray-100 p-3 rounded">
              {allCookies.length > 0 ? (
                <ul className="list-disc pl-5">
                  {allCookies.map((cookie) => (
                    <li key={cookie.name}>
                      <span className="font-medium">{cookie.name}:</span> {cookie.value}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No hay cookies establecidas</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-6">
            <Link href="/">
              <Button className="w-full bg-[#00613c] hover:bg-[#00613c]/90">Ir al inicio</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">
                Ir al dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
