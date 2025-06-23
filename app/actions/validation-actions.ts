"use server"

import { supabase } from "@/lib/supabase"
import { cookies } from "next/headers"

export async function guardarDatosValidados(data: {
  dni: string
  telefono: string | null
  email: string | null
  datosActualizados?: { telefono?: string; email?: string }
}) {
  try {
    console.log("💾 Guardando datos validados:", data)

    // Preparar datos para guardar
    const datosParaGuardar = {
      dni: data.dni,
      telefono_validado: data.telefono,
      email_validado: data.email,
      metodo_verificacion: "manual", // Validación manual sin código
      fecha_validacion: new Date().toISOString(),
    }

    console.log("💾 Guardando en DatosValidados:", datosParaGuardar)

    // Guardar en la tabla DatosValidados (upsert)
    const { error: upsertError } = await supabase.from("DatosValidados").upsert(datosParaGuardar, {
      onConflict: "dni",
      ignoreDuplicates: false,
    })

    if (upsertError) {
      console.error("Error guardando datos validados:", upsertError)
      return { success: false, error: "Error al guardar los datos validados" }
    }

    // Si hay datos actualizados, también actualizar la tabla de Afiliados
    if (data.datosActualizados) {
      console.log("💾 Actualizando datos del afiliado:", data.datosActualizados)

      const updateData: any = {}
      if (data.datosActualizados.telefono) {
        updateData["Numero Celular"] = data.datosActualizados.telefono
      }
      if (data.datosActualizados.email) {
        updateData["Mail"] = data.datosActualizados.email
      }

      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from("Afiliados")
          .update(updateData)
          .eq("Numero Documento", data.dni)

        if (updateError) {
          console.error("Error actualizando datos del afiliado:", updateError)
          // No fallar aquí, los datos validados ya se guardaron
        }
      }
    }

    console.log("✅ Datos validados y guardados correctamente")
    return { success: true }
  } catch (error) {
    console.error("Error guardando datos validados:", error)
    return { success: false, error: "Error al guardar los datos validados" }
  }
}

export async function verificarDatosValidados() {
  try {
    // Obtener DNI del usuario autenticado
    const cookieStore = await cookies()
    const dni = cookieStore.get("user_dni")?.value

    if (!dni) {
      console.log("❌ No hay DNI en cookies")
      return false
    }

    console.log("🔍 Verificando si los datos están validados para DNI:", dni)

    const { data, error } = await supabase.from("DatosValidados").select("*").eq("dni", dni).single()

    if (error) {
      if (error.code === "PGRST116") {
        // No se encontró registro, datos no validados
        console.log("❌ Datos no validados para DNI:", dni)
        return false
      }
      console.error("Error verificando validación:", error)
      return false
    }

    console.log("✅ Datos validados encontrados:", data)
    return true
  } catch (error) {
    console.error("Error verificando validación:", error)
    return false
  }
}

export async function obtenerDatosValidados() {
  try {
    // Obtener DNI del usuario autenticado
    const cookieStore = await cookies()
    const dni = cookieStore.get("user_dni")?.value

    if (!dni) {
      return null
    }

    const { data, error } = await supabase.from("DatosValidados").select("*").eq("dni", dni).single()

    if (error) {
      if (error.code === "PGRST116") {
        return null // No se encontró registro
      }
      console.error("Error obteniendo datos validados:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error obteniendo datos validados:", error)
    return null
  }
}
