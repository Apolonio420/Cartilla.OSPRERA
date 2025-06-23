import { ReclamoForm } from "@/app/components/ui/reclamo-form"
import { verificarAutenticacion } from "@/app/actions/auth-actions"
import { redirect } from "next/navigation"

// Forzar modo dinámico para evitar error de cookies
export const dynamic = "force-dynamic"

export default async function NewClaimPage() {
  const afiliado = await verificarAutenticacion()
  if (!afiliado) {
    redirect("/")
  }

  return (
    <main className="flex min-h-[calc(100vh-200px)] flex-col p-4 md:p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto w-full">
        <div className="bg-[#00613c] text-white p-6 rounded-t-lg">
          <h1 className="text-3xl font-bold">Nuevo Reclamo</h1>
          <p className="text-gray-200">Complete el formulario para registrar su reclamo</p>
        </div>

        <div className="bg-white p-6 rounded-b-lg shadow-sm">
          <ReclamoForm />
        </div>
      </div>
    </main>
  )
}
