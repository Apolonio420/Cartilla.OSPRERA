import { supabase } from "@/lib/supabase"

export class FarmaciaService {
  // Buscar farmacias por ubicación
  static async buscarFarmacias(filtros: {
    provincia?: string
    localidad?: string
    servicio?: string
  }) {
    try {
      let query = supabase.from("Red de Farmacias").select("*")

      if (filtros.provincia) {
        query = query.ilike("Region", `%${filtros.provincia}%`)
      }

      if (filtros.localidad) {
        query = query.ilike("Zona", `%${filtros.localidad}%`)
      }

      const { data, error } = await query.limit(50)

      if (error) {
        console.error("Error al buscar farmacias:", error)
        return []
      }

      // Formatear datos para compatibilidad
      return (data || []).map((farmacia) => ({
        id: farmacia.Cod || "",
        nombre: farmacia.Nombre || "",
        direccion: farmacia.Domicilio || "",
        provincia: farmacia.Region || "",
        localidad: farmacia.Zona || "",
        codigo: farmacia.Cod || "",
        latitud: farmacia.Latitud || null,
        longitud: farmacia.Longitud || null,
        estado: "activo",
      }))
    } catch (error) {
      console.error("Error al buscar farmacias:", error)
      return []
    }
  }

  // Verificar si una farmacia existe
  static async verificarFarmacia(nombre: string, localidad: string) {
    try {
      const { data, error } = await supabase
        .from("Red de Farmacias")
        .select("*")
        .ilike("Nombre", `%${nombre}%`)
        .ilike("Zona", `%${localidad}%`)
        .limit(1)

      if (error) {
        console.error("Error al verificar farmacia:", error)
        return false
      }

      return data && data.length > 0
    } catch (error) {
      console.error("Error al verificar farmacia:", error)
      return false
    }
  }
}
