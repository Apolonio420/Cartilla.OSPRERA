"use server"

import { supabase } from "@/lib/supabase"
import { cookies } from "next/headers"

export const obtenerReclamos = async () => {
  try {
    // Obtener el DNI del usuario desde las cookies
    const cookieStore = cookies()
    const dni = cookieStore.get("user_dni")?.value

    if (!dni) {
      console.error("❌ USER ACTIONS - No hay DNI en las cookies")
      return { success: false, reclamos: [], error: "No hay sesión activa" }
    }

    console.log("🔍 USER ACTIONS - Buscando reclamos para DNI:", dni)

    // Usar "Reclamos" con R mayúscula
    const { data: reclamos, error } = await supabase
      .from("Reclamos")
      .select("*")
      .eq("dni", dni)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("❌ USER ACTIONS - Error al obtener reclamos:", error)
      return { success: false, reclamos: [], error: error.message }
    }

    console.log("✅ USER ACTIONS - Reclamos obtenidos:", reclamos?.length || 0)
    return { success: true, reclamos: reclamos || [], error: null }
  } catch (error: any) {
    console.error("❌ USER ACTIONS - Error inesperado:", error)
    return { success: false, reclamos: [], error: error.message }
  }
}

export const obtenerDatosAfiliado = async () => {
  try {
    // Obtener el DNI del usuario desde las cookies
    const cookieStore = cookies()
    const dni = cookieStore.get("user_dni")?.value

    if (!dni) {
      console.error("❌ USER ACTIONS - No hay DNI en las cookies")
      return { success: false, afiliado: null, error: "No hay sesión activa" }
    }

    console.log("🔍 USER ACTIONS - Buscando datos del afiliado para DNI:", dni)

    // Intentar en diferentes tablas con diferentes nombres de columna
    const tablasABuscar = [
      { tabla: "Afiliados", campoDni: "dni" },
      { tabla: "Afiliados", campoDni: "Numero Documento" },
      { tabla: "BaseContactos", campoDni: "dni" },
      { tabla: "BaseContactos", campoDni: "Numero Documento" },
    ]

    let afiliado = null
    let ultimoError = null

    for (const { tabla, campoDni } of tablasABuscar) {
      try {
        console.log(`🔍 USER ACTIONS - Buscando en tabla ${tabla} con campo ${campoDni}`)

        const { data, error } = await supabase.from(tabla).select("*").eq(campoDni, dni).single()

        if (!error && data) {
          console.log(`✅ USER ACTIONS - Encontrado en ${tabla}:`, data)

          // Mapear los campos al formato esperado
          afiliado = {
            dni: data[campoDni] || data.dni,
            nombreCompleto:
              data.nombre_completo ||
              data["Nombre Beneficiario"] ||
              `${data.nombre || data.Nombre || ""} ${data.apellido || data.Apellido || ""}`.trim(),
            telefono: data.telefono || data.celular || data["Numero Celular"] || data["Telefono Fijo"] || "",
            email: data.email || data.mail || data["Mail"] || "",
          }
          break
        } else {
          ultimoError = error
          console.log(`❌ USER ACTIONS - No encontrado en ${tabla} con ${campoDni}:`, error?.message)
        }
      } catch (err) {
        console.log(`❌ USER ACTIONS - Error buscando en ${tabla}:`, err)
        ultimoError = err
      }
    }

    if (!afiliado) {
      console.error("❌ USER ACTIONS - No se encontró el afiliado en ninguna tabla")
      return {
        success: false,
        afiliado: null,
        error: `No se encontraron datos para el DNI ${dni}`,
      }
    }

    console.log("✅ USER ACTIONS - Datos del afiliado obtenidos:", afiliado)
    return { success: true, afiliado, error: null }
  } catch (error: any) {
    console.error("❌ USER ACTIONS - Error inesperado:", error)
    return { success: false, afiliado: null, error: error.message }
  }
}
