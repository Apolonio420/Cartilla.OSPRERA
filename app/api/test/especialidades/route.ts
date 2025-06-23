import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""

    console.log("🔍 Test Especialidades - Término:", query)

    // Primero obtener una muestra de datos para ver la estructura
    const { data: muestra, error: errorMuestra } = await supabase.from("Especialidades").select("*").limit(5)

    if (errorMuestra) {
      console.error("Error obteniendo muestra:", errorMuestra)
    }

    console.log("📊 Muestra de especialidades:", muestra)

    // Ahora hacer la búsqueda
    const { data, error } = await supabase.from("Especialidades").select("*").limit(100)

    if (error) {
      console.error("Error en búsqueda:", error)
      return NextResponse.json({ error: error.message, muestra })
    }

    console.log("📈 Total especialidades:", data?.length)

    // Filtrar si hay término de búsqueda
    let resultados = data || []
    if (query.length >= 2) {
      resultados =
        data?.filter((esp) => {
          const especialidad = esp.ESPECIALIDAD || esp.especialidad || esp.nombre || ""
          return especialidad.toLowerCase().includes(query.toLowerCase())
        }) || []
    }

    return NextResponse.json({
      success: true,
      muestra,
      total: data?.length || 0,
      filtrados: resultados.length,
      resultados: resultados.slice(0, 10),
      query,
    })
  } catch (error) {
    console.error("Error general:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error desconocido" })
  }
}
