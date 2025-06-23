import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export interface ReclamoData {
  dni: string
  categoria: string
  subcategoria: string
  subsubcategoria?: string | null
  detalle?: any
  estado?: string
  prioridad?: string
  reiteraciones?: number
}

export interface ReclamoCompleto extends ReclamoData {
  id: string
  created_at: string
  updated_at: string
}

class ReclamosService {
  async crearReclamo(data: ReclamoData) {
    try {
      console.log("🔍 RECLAMOS SERVICE - Creando reclamo:", data)

      // Verificar que el DNI esté presente
      if (!data.dni) {
        console.error("❌ RECLAMOS SERVICE - Error: DNI es requerido")
        return { success: false, error: "DNI es requerido" }
      }

      // Crear reclamo con reiteraciones inicializadas en 0
      const { data: reclamo, error } = await supabase
        .from("Reclamos")
        .insert([
          {
            dni: data.dni,
            categoria: data.categoria,
            subcategoria: data.subcategoria,
            subsubcategoria: data.subsubcategoria,
            detalle: data.detalle || {},
            estado: data.estado || "nuevo",
            prioridad: data.prioridad || "normal",
            reiteraciones: 0, // Inicializar en 0
          },
        ])
        .select()

      if (error) {
        console.error("❌ RECLAMOS SERVICE - Error al crear:", error)
        return { success: false, error: error.message }
      }

      console.log("✅ RECLAMOS SERVICE - Reclamo creado:", reclamo?.[0]?.id)
      return { success: true, data: reclamo?.[0] }
    } catch (error: any) {
      console.error("❌ RECLAMOS SERVICE - Error inesperado:", error)
      return { success: false, error: error.message || "Error inesperado al crear el reclamo" }
    }
  }

  async obtenerReclamosPorDni(dni: string) {
    try {
      console.log("🔍 RECLAMOS SERVICE - Obteniendo reclamos para DNI:", dni)

      const { data: reclamos, error } = await supabase
        .from("Reclamos")
        .select("*")
        .eq("dni", dni)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("❌ RECLAMOS SERVICE - Error al obtener:", error)
        return { success: false, error: error.message }
      }

      console.log("✅ RECLAMOS SERVICE - Reclamos obtenidos:", reclamos?.length || 0)
      return { success: true, data: reclamos || [] }
    } catch (error: any) {
      console.error("❌ RECLAMOS SERVICE - Error inesperado:", error)
      return { success: false, error: error.message || "Error inesperado al obtener reclamos" }
    }
  }

  async obtenerReclamoPorId(id: string) {
    try {
      console.log("🔍 RECLAMOS SERVICE - Obteniendo reclamo por ID:", id)

      const { data: reclamo, error } = await supabase.from("Reclamos").select("*").eq("id", id).single()

      if (error) {
        console.error("❌ RECLAMOS SERVICE - Error al obtener por ID:", error)
        return { success: false, error: error.message }
      }

      console.log("✅ RECLAMOS SERVICE - Reclamo obtenido:", reclamo.id)
      console.log("📊 RECLAMOS SERVICE - Datos del reclamo:", reclamo)
      return { success: true, data: reclamo }
    } catch (error: any) {
      console.error("❌ RECLAMOS SERVICE - Error inesperado:", error)
      return { success: false, error: error.message || "Error inesperado al obtener reclamo" }
    }
  }

  async actualizarReclamo(id: string, updates: Partial<ReclamoData & { updated_at: string; reiteraciones: number }>) {
    try {
      console.log("🔍 RECLAMOS SERVICE - Actualizando reclamo:", id, updates)

      // Primero verificar que el reclamo existe
      const { data: reclamoExistente, error: errorVerificacion } = await supabase
        .from("Reclamos")
        .select("*")
        .eq("id", id)
        .single()

      if (errorVerificacion) {
        console.error("❌ RECLAMOS SERVICE - Error al verificar reclamo:", errorVerificacion)
        return { success: false, error: `Reclamo no encontrado: ${errorVerificacion.message}` }
      }

      console.log("✅ RECLAMOS SERVICE - Reclamo encontrado para actualizar:", reclamoExistente)

      // Realizar la actualización
      const { data: reclamo, error } = await supabase.from("Reclamos").update(updates).eq("id", id).select()

      if (error) {
        console.error("❌ RECLAMOS SERVICE - Error al actualizar:", error)
        return { success: false, error: error.message }
      }

      if (!reclamo || reclamo.length === 0) {
        console.error("❌ RECLAMOS SERVICE - No se actualizó ningún registro")
        return { success: false, error: "No se pudo actualizar el reclamo" }
      }

      console.log("✅ RECLAMOS SERVICE - Reclamo actualizado exitosamente:", reclamo[0])
      return { success: true, data: reclamo[0] }
    } catch (error: any) {
      console.error("❌ RECLAMOS SERVICE - Error inesperado:", error)
      return { success: false, error: error.message || "Error inesperado al actualizar reclamo" }
    }
  }

  async verificarEstructuraTabla() {
    try {
      console.log("🔍 RECLAMOS SERVICE - Verificando estructura de tabla")

      // Intentar obtener un reclamo para ver la estructura
      const { data, error } = await supabase.from("Reclamos").select("*").limit(1)

      if (error) {
        console.error("❌ RECLAMOS SERVICE - Error al verificar estructura:", error)
        return { success: false, error: error.message }
      }

      console.log("✅ RECLAMOS SERVICE - Estructura de tabla:", data?.[0] ? Object.keys(data[0]) : "No hay registros")
      return { success: true, data: data?.[0] ? Object.keys(data[0]) : [] }
    } catch (error: any) {
      console.error("❌ RECLAMOS SERVICE - Error inesperado:", error)
      return { success: false, error: error.message }
    }
  }

  async verificarConexion() {
    try {
      const { count, error } = await supabase.from("Reclamos").select("*", { count: "exact", head: true })

      if (error) {
        console.error("❌ RECLAMOS SERVICE - Error de conexión:", error)
        return { success: false, error: error.message }
      }

      console.log("✅ RECLAMOS SERVICE - Conexión exitosa, registros:", count)
      return {
        success: true,
        message: `Conexión exitosa con la tabla Reclamos. Total registros: ${count}`,
      }
    } catch (error: any) {
      console.error("❌ RECLAMOS SERVICE - Error inesperado:", error)
      return { success: false, error: error.message || "Error de conexión" }
    }
  }
}

// Exportar una instancia del servicio
export const reclamosService = new ReclamosService()

// Exportar la clase también por si se necesita
export default ReclamosService
