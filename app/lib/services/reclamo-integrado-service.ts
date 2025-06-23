import { transaccionalClient } from "@/app/lib/database/transaccional-client"
import { AfiliadoService } from "./afiliado-service"
import { CartillaService } from "./cartilla-service"
import { FarmaciaService } from "./farmacia-service"
import { AutorizacionService } from "./autorizacion-service"
import type { ReclamoFormData } from "@/app/lib/types"

export class ReclamoIntegradoService {
  // Crear reclamo con validaciones integradas
  static async crearReclamo(data: ReclamoFormData & { dni: string }) {
    try {
      // 1. Verificar estado de afiliación
      const estadoAfiliacion = await AfiliadoService.verificarEstadoAfiliacion(data.dni)
      if (!estadoAfiliacion.valido) {
        return {
          success: false,
          error: `Error de afiliación: ${estadoAfiliacion.motivo}`,
        }
      }

      // 2. Validaciones específicas según la categoría
      const validacionEspecifica = await this.validarSegunCategoria(data)
      if (!validacionEspecifica.valido) {
        return {
          success: false,
          error: validacionEspecifica.mensaje,
        }
      }

      // 3. Enriquecer datos del reclamo con información del sistema
      const datosEnriquecidos = await this.enriquecerDatosReclamo(data)

      // 4. Crear el reclamo en la base transaccional
      const reclamo = await transaccionalClient.reclamo.create({
        data: {
          dni: data.dni,
          categoria: data.categoria,
          subcategoria: data.subcategoria,
          detalle: datosEnriquecidos,
          estado: "nuevo",
          prioridad: this.calcularPrioridad(data),
        },
      })

      // 5. Crear seguimiento inicial
      await transaccionalClient.seguimientoReclamo.create({
        data: {
          reclamo_id: reclamo.id,
          estado_nuevo: "nuevo",
          comentario: "Reclamo creado por el beneficiario",
          tipo: "beneficiario",
        },
      })

      return { success: true, reclamoId: reclamo.id }
    } catch (error) {
      console.error("Error al crear reclamo integrado:", error)
      return { success: false, error: "Error al procesar la solicitud" }
    }
  }

  // Validar según la categoría del reclamo
  private static async validarSegunCategoria(data: ReclamoFormData & { dni: string }) {
    switch (data.categoria) {
      case "Cartilla":
        return await this.validarReclamoCartilla(data)
      case "Red de farmacias":
        return await this.validarReclamoFarmacia(data)
      case "App":
        if (data.subcategoria.includes("Error de aprobación")) {
          return await this.validarNumeroTramite(data)
        }
        break
    }

    return { valido: true }
  }

  // Validar reclamo de cartilla
  private static async validarReclamoCartilla(data: ReclamoFormData & { dni: string }) {
    const detalle = data.detalle || {}

    if (detalle.prestador && detalle.especialidad && detalle.localidad) {
      const prestadorExiste = await CartillaService.verificarPrestador(
        detalle.prestador,
        detalle.especialidad,
        detalle.localidad,
      )

      if (!prestadorExiste) {
        return {
          valido: false,
          mensaje: "El prestador especificado no se encuentra en nuestra cartilla. Verifique los datos ingresados.",
        }
      }
    }

    return { valido: true }
  }

  // Validar reclamo de farmacia
  private static async validarReclamoFarmacia(data: ReclamoFormData & { dni: string }) {
    const detalle = data.detalle || {}

    if (detalle.farmacia && detalle.localidad) {
      const farmaciaExiste = await FarmaciaService.verificarFarmacia(detalle.farmacia, detalle.localidad)

      if (!farmaciaExiste) {
        return {
          valido: false,
          mensaje: "La farmacia especificada no se encuentra en nuestra red. Verifique los datos ingresados.",
        }
      }
    }

    return { valido: true }
  }

  // Validar número de trámite
  private static async validarNumeroTramite(data: ReclamoFormData & { dni: string }) {
    const detalle = data.detalle || {}

    if (detalle.numero_tramite) {
      const estadoAutorizacion = await AutorizacionService.verificarEstadoAutorizacion(detalle.numero_tramite)

      if (!estadoAutorizacion.encontrada) {
        return {
          valido: false,
          mensaje: "El número de trámite especificado no fue encontrado en el sistema.",
        }
      }
    }

    return { valido: true }
  }

  // Enriquecer datos del reclamo con información adicional
  private static async enriquecerDatosReclamo(data: ReclamoFormData & { dni: string }) {
    const datosEnriquecidos = { ...data.detalle }

    // Agregar información del afiliado
    const afiliadoSistema = await AfiliadoService.buscarAfiliadoSistema(data.dni)
    if (afiliadoSistema) {
      datosEnriquecidos._afiliado_info = {
        nombre: afiliadoSistema.nombre,
        apellido: afiliadoSistema.apellido,
        plan: afiliadoSistema.plan,
      }
    }

    // Agregar timestamp de creación
    datosEnriquecidos._timestamp = new Date().toISOString()

    return datosEnriquecidos
  }

  // Calcular prioridad del reclamo
  private static calcularPrioridad(data: ReclamoFormData & { dni: string }): string {
    // Reclamos urgentes
    if (data.categoria === "Diabetes" || data.categoria === "Discapacidad") {
      return "alta"
    }

    // Reclamos de tratamientos especiales
    if (data.categoria === "Tratamientos especiales") {
      return "alta"
    }

    // Reclamos reiterados (esto se verificaría en otra función)
    return "normal"
  }

  // Obtener información completa del reclamo
  static async obtenerReclamoCompleto(reclamoId: string) {
    try {
      const reclamo = await transaccionalClient.reclamo.findUnique({
        where: { id: reclamoId },
        include: {
          seguimientos: {
            orderBy: { created_at: "desc" },
          },
        },
      })

      if (!reclamo) return null

      // Enriquecer con datos del sistema
      const afiliadoSistema = await AfiliadoService.buscarAfiliadoSistema(reclamo.dni)

      return {
        ...reclamo,
        afiliado_sistema: afiliadoSistema,
      }
    } catch (error) {
      console.error("Error al obtener reclamo completo:", error)
      return null
    }
  }
}
