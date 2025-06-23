import { supabase } from "@/lib/supabase"
import { normalizarNombre, separarNombreCompleto, limpiarTexto } from "@/app/lib/utils"

export class AfiliadoService {
  // Buscar afiliado por DNI - SOLO para datos del afiliado
  static async buscarAfiliado(dni: string) {
    try {
      console.log("🔍 Buscando afiliado con DNI:", dni)

      const { data, error } = await supabase.from("Afiliados").select("*").eq("Numero Documento", dni).single()

      if (error) {
        console.error("Error al buscar afiliado:", error)
        return null
      }

      console.log("✅ Afiliado encontrado (raw):", data)

      // Limpiar y normalizar SOLO los datos del afiliado
      const nombreLimpio = limpiarTexto(data["Nombre Beneficiario"] || "")
      console.log("🧹 Nombre limpio:", nombreLimpio)

      const { nombre, apellido } = separarNombreCompleto(nombreLimpio)

      const afiliadoNormalizado = {
        dni: data["Numero Documento"],
        nombre: nombre,
        apellido: apellido,
        nombreCompleto: normalizarNombre(nombreLimpio),
        domicilio: normalizarNombre(limpiarTexto(data["Domicilio"] || "")),
        provincia: normalizarNombre(limpiarTexto(data["Provincia"] || "")),
        localidad: normalizarNombre(limpiarTexto(data["Localidad"] || "")),
        telefono: data["Numero Celular"] || data["Telefono Fijo"] || "",
        email: data["Mail"] || "",
        plan: "Plan Básico", // Valor por defecto
        estado: "activo",
      }

      console.log("✅ Afiliado normalizado:", afiliadoNormalizado)
      return afiliadoNormalizado
    } catch (error) {
      console.error("Error al buscar afiliado:", error)
      return null
    }
  }

  // Verificar si el afiliado existe y está activo
  static async verificarEstadoAfiliacion(dni: string) {
    try {
      const afiliado = await this.buscarAfiliado(dni)

      if (!afiliado) {
        return { valido: false, motivo: "Afiliado no encontrado en la base de datos" }
      }

      return { valido: true, afiliado }
    } catch (error) {
      console.error("Error al verificar estado de afiliación:", error)
      return { valido: false, motivo: "Error del sistema" }
    }
  }

  // Para mantener compatibilidad con el código existente
  static async crearOActualizarAfiliado(data: {
    dni: string
    telefono?: string
    email?: string
  }) {
    try {
      // Como es una base de datos de consulta, solo devolvemos el afiliado existente
      const afiliado = await this.buscarAfiliado(data.dni)

      if (afiliado) {
        // Actualizar datos de contacto si se proporcionaron
        return {
          ...afiliado,
          telefono: data.telefono || afiliado.telefono,
          email: data.email || afiliado.email,
        }
      }

      return afiliado
    } catch (error) {
      console.error("Error al crear/actualizar afiliado:", error)
      throw error
    }
  }

  // Buscar grupo familiar (mock)
  static async buscarGrupoFamiliar(dni: string) {
    try {
      // Simular grupo familiar
      return []
    } catch (error) {
      console.error("Error al buscar grupo familiar:", error)
      return []
    }
  }
}
