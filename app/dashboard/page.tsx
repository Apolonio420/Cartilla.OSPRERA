import { Button } from "@/components/ui/button"
import { obtenerReclamos } from "@/app/actions/reclamo-actions"
import { verificarAutenticacion } from "@/app/actions/auth-actions"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ReclamosTable } from "@/app/components/ui/reclamos-table"
import { PlusCircle, LogOut } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  console.log("🔍 DASHBOARD - Verificando autenticación")

  const usuario = await verificarAutenticacion()

  if (!usuario) {
    console.log("🔍 DASHBOARD - Usuario no autenticado, redirigiendo")
    redirect("/")
  }

  console.log("🔍 DASHBOARD - Usuario autenticado:", usuario)

  // Obtener reclamos
  const { success, reclamos = [], error } = await obtenerReclamos()
  console.log("🔍 DASHBOARD - Reclamos:", { success, count: reclamos.length, error })

  return (
    <main className="flex-1 p-4 md:p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto w-full">
        <div className="bg-[#00613c] text-white p-6 rounded-t-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Mis Reclamos</h1>
              <p className="text-gray-200">
                {usuario.nombre && usuario.apellido
                  ? `${usuario.nombre} ${usuario.apellido} - DNI: ${usuario.dni}`
                  : `DNI: ${usuario.dni}`}
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/new-claim">
                <Button className="bg-[#ffd100] text-[#00613c] hover:bg-[#ffd100]/90 font-bold">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Nuevo Reclamo
                </Button>
              </Link>
              <form action="/api/logout" method="POST">
                <Button
                  variant="outline"
                  type="submit"
                  className="border-white text-white hover:bg-white hover:text-[#00613c]"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </Button>
              </form>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-b-lg shadow-sm">
          {error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-4">{error}</div>
          ) : (
            <ReclamosTable reclamos={reclamos} />
          )}
        </div>
      </div>
    </main>
  )
}
