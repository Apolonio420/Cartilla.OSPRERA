"use server"

import { cookies } from "next/headers"
import { reclamosService } from "@/app/lib/services/reclamos-service"
import type { ReclamoFormData } from "@/app/lib/types"
import { revalidatePath } from "next/cache"

// Función para crear un nuevo reclamo
export async function crearReclamo(data: ReclamoFormData) {
  try {
    console.log("🔍 CREAR RECLAMO - Datos recibidos:", data)

    // Obtener DNI del usuario autenticado
    const cookieStore = await cookies()
    const dni = cookieStore.get("user_dni")?.value
    if (!dni) {
      console.log("❌ CREAR RECLAMO - Usuario no autenticado")
      return { success: false, error: "Usuario no autenticado" }
    }

    console.log("✅ CREAR RECLAMO - Usuario autenticado:", dni)

    // Calcular prioridad basada en la categoría
    const prioridad = calcularPrioridad(data.categoria)
    console.log("🎯 CREAR RECLAMO - Prioridad calculada:", prioridad)

    // Preparar datos para el servicio
    const datosReclamo = {
      dni,
      categoria: data.categoria,
      subcategoria: data.subcategoria,
      subsubcategoria: data.subsubcategoria || null,
      detalle: data.detalle || {},
      estado: "nuevo",
      prioridad,
    }

    console.log("📝 CREAR RECLAMO - Datos preparados para servicio:", datosReclamo)

    // Crear el reclamo usando el servicio de Supabase
    const resultado = await reclamosService.crearReclamo(datosReclamo)

    console.log("📊 CREAR RECLAMO - Resultado del servicio:", resultado)

    if (!resultado.success) {
      console.log("❌ CREAR RECLAMO - Error del servicio:", resultado.error)
      return { success: false, error: resultado.error || "Error desconocido del servicio" }
    }

    console.log("✅ CREAR RECLAMO - Reclamo creado exitosamente:", resultado.data?.id)

    // Revalidar la página del dashboard
    revalidatePath("/dashboard")

    return { success: true, reclamoId: resultado.data?.id, data: resultado.data }
  } catch (error: any) {
    console.error("❌ CREAR RECLAMO - Error inesperado:", error)
    console.error("❌ CREAR RECLAMO - Stack trace:", error.stack)
    return {
      success: false,
      error: error.message || "Error inesperado al procesar la solicitud",
      details: error.toString(),
    }
  }
}

// Función para obtener los reclamos de un usuario
export async function obtenerReclamos() {
  try {
    console.log("🔍 OBTENER RECLAMOS - Iniciando")

    // Obtener DNI del usuario autenticado
    const cookieStore = await cookies()
    const dni = cookieStore.get("user_dni")?.value
    if (!dni) {
      return { success: false, error: "Usuario no autenticado" }
    }

    console.log("✅ OBTENER RECLAMOS - Usuario autenticado:", dni)

    // Buscar reclamos del usuario usando el servicio de Supabase
    const resultado = await reclamosService.obtenerReclamosPorDni(dni)

    if (!resultado.success) {
      console.log("❌ OBTENER RECLAMOS - Error del servicio:", resultado.error)
      return { success: false, error: resultado.error }
    }

    console.log("✅ OBTENER RECLAMOS - Encontrados:", resultado.data?.length || 0)

    return { success: true, reclamos: resultado.data || [] }
  } catch (error: any) {
    console.error("❌ OBTENER RECLAMOS - Error:", error)
    return { success: false, error: error.message || "Error al procesar la solicitud" }
  }
}

// Función para reiterar un reclamo
export async function reiterarReclamo(reclamoId: string) {
  try {
    console.log("🔍 REITERAR RECLAMO - ID:", reclamoId)

    // Obtener DNI del usuario autenticado
    const cookieStore = await cookies()
    const dni = cookieStore.get("user_dni")?.value
    if (!dni) {
      return { success: false, error: "Usuario no autenticado" }
    }

    // Buscar el reclamo
    const resultado = await reclamosService.obtenerReclamoPorId(reclamoId)
    if (!resultado.success || !resultado.data) {
      return { success: false, error: "Reclamo no encontrado" }
    }

    const reclamo = resultado.data
    if (reclamo.dni !== dni) {
      return { success: false, error: "No tiene permisos para este reclamo" }
    }

    if (reclamo.estado === "cerrado") {
      return { success: false, error: "No se puede reiterar un reclamo cerrado" }
    }

    // Actualizar el reclamo (incrementar reiteraciones)
    const actualizacion = await reclamosService.actualizarReclamo(reclamoId, {
      reiteraciones: (reclamo.reiteraciones || 0) + 1,
      updated_at: new Date().toISOString(),
    })

    if (!actualizacion.success) {
      return { success: false, error: actualizacion.error }
    }

    console.log("✅ REITERAR RECLAMO - Reclamo reiterado:", reclamoId)

    // Revalidar la página del dashboard
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error: any) {
    console.error("❌ REITERAR RECLAMO - Error:", error)
    return { success: false, error: error.message || "Error al procesar la solicitud" }
  }
}

// Función auxiliar para calcular prioridad
function calcularPrioridad(categoria: string): string {
  // Categorías de alta prioridad
  const categoriasAltas = ["DIABETES", "DISCAPACIDAD", "TRATAMIENTOS ESPECIALES", "CRÓNICAS"]

  // Categorías de prioridad normal
  const categoriasNormales = ["CARTILLA", "RED DE FARMACIAS", "PLAN MATERNO INFANTIL"]

  if (categoriasAltas.includes(categoria.toUpperCase())) {
    return "alta"
  } else if (categoriasNormales.includes(categoria.toUpperCase())) {
    return "normal"
  } else {
    return "normal" // Por defecto
  }
}

// Función para obtener detalles completos de un reclamo
export async function obtenerDetalleReclamo(reclamoId: string) {
  try {
    const cookieStore = await cookies()
    const dni = cookieStore.get("user_dni")?.value
    if (!dni) {
      return { success: false, error: "Usuario no autenticado" }
    }

    const resultado = await reclamosService.obtenerReclamoPorId(reclamoId)
    if (!resultado.success || !resultado.data) {
      return { success: false, error: "Reclamo no encontrado" }
    }

    const reclamo = resultado.data
    if (reclamo.dni !== dni) {
      return { success: false, error: "No tiene permisos para este reclamo" }
    }

    return { success: true, reclamo }
  } catch (error: any) {
    console.error("Error al obtener detalle del reclamo:", error)
    return { success: false, error: error.message || "Error al procesar la solicitud" }
  }
}
