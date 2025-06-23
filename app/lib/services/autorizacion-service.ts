import { consultaClient } from "@/app/lib/database/consulta-client"

export class AutorizacionService {
  // Buscar autorizaciones por DNI
  static async buscarAutorizaciones(dni: string) {
    try {
      const autorizaciones = await consultaClient.autorizacionMedica.findMany({
        where: { dni_beneficiario: dni },
        orderBy: { created_at: "desc" },
        take: 20,
      })

      return autorizaciones
    } catch (error) {
      console.error("Error al buscar autorizaciones:", error)
      return []
    }
  }

  // Buscar autorización por número de trámite
  static async buscarPorNumeroTramite(numeroTramite: string) {
    try {
      const autorizacion = await consultaClient.autorizacionMedica.findUnique({
        where: { numero_tramite: numeroTramite },
      })

      return autorizacion
    } catch (error) {
      console.error("Error al buscar autorización por número:", error)
      return null
    }
  }

  // Verificar estado de autorización
  static async verificarEstadoAutorizacion(numeroTramite: string) {
    try {
      const autorizacion = await this.buscarPorNumeroTramite(numeroTramite)

      if (!autorizacion) {
        return { encontrada: false, motivo: "Número de trámite no encontrado" }
      }

      return {
        encontrada: true,
        estado: autorizacion.estado,
        fecha_solicitud: autorizacion.fecha_solicitud,
        fecha_autorizacion: autorizacion.fecha_autorizacion,
        observaciones: autorizacion.observaciones,
      }
    } catch (error) {
      console.error("Error al verificar estado de autorización:", error)
      return { encontrada: false, motivo: "Error del sistema" }
    }
  }
}
