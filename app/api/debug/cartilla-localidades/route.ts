import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET() {
  try {
    console.log("🔍 Obteniendo todas las localidades de Cartilla...")

    const { data: cartillaData, error } = await supabase.from("Cartilla").select("*").limit(100)

    if (error) {
      console.error("❌ Error:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // Extraer todas las localidades únicas
    const localidades = new Set()
    const localidadesDetalle = []

    cartillaData?.forEach((item, index) => {
      const localidad = item.LOCALIDAD || item.localidad || item.Localidad || ""
      if (localidad) {
        localidades.add(localidad)
        if (index < 20) {
          // Solo los primeros 20 para debug
          localidadesDetalle.push({
            index,
            original: localidad,
            normalized: localidad
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .replace(/\s+/g, " ")
              .trim(),
            prestador: item.NOMBRE_COMPLETO || item.nombre_completo || "Sin nombre",
          })
        }
      }
    })

    const localidadesArray = Array.from(localidades).sort()

    return NextResponse.json({
      success: true,
      totalRegistros: cartillaData?.length || 0,
      totalLocalidades: localidadesArray.length,
      localidades: localidadesArray,
      localidadesDetalle,
      vicenteLopezVariants: localidadesArray.filter(
        (loc) => loc.toString().toLowerCase().includes("vicente") || loc.toString().toLowerCase().includes("lopez"),
      ),
    })
  } catch (error) {
    console.error("❌ Error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 },
    )
  }
}
