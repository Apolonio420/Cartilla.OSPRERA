import { cookies } from "next/headers"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function TestAuthPage() {
  const userDni = cookies().get("user_dni")?.value

  return (
    <main className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4 text-[#00613c]">Estado de Autenticación</h1>

        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <p className="text-lg mb-2">
            Estado: <span className="font-bold">{userDni ? "Autenticado" : "No autenticado"}</span>
          </p>
          {userDni && <p className="text-sm text-gray-600">DNI: {userDni}</p>}
        </div>

        <div className="space-y-2">
          {userDni ? (
            <>
              <Link href="/dashboard" className="block">
                <Button className="w-full bg-[#00613c] hover:bg-[#00613c]/90">Ir al Dashboard</Button>
              </Link>
              <form action="/api/logout" method="POST">
                <Button type="submit" variant="outline" className="w-full">
                  Cerrar Sesión
                </Button>
              </form>
            </>
          ) : (
            <Link href="/" className="block">
              <Button className="w-full bg-[#00613c] hover:bg-[#00613c]/90">Iniciar Sesión</Button>
            </Link>
          )}
        </div>
      </div>
    </main>
  )
}
