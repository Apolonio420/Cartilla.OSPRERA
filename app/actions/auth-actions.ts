"use server"

import { cookies } from "next/headers"
import { AfiliadoService } from "@/app/lib/services/afiliado-service"

// Función simplificada para verificar solo el DNI
export async function verificarDni(data: { dni: string }) {
  console.log("🔍 AUTH - Verificando DNI:", data.dni)

  try {
    // Validar DNI
    if (!data.dni || data.dni.length < 7 || data.dni.length > 8) {
      return { success: false, error: "DNI inválido" }
    }

    // Buscar afiliado en Supabase
    console.log("🔍 AUTH - Buscando en Supabase...")
    const afiliado = await AfiliadoService.buscarAfiliado(data.dni)

    if (!afiliado) {
      console.log("🔍 AUTH - DNI no encontrado")
      return { success: false, error: "DNI no encontrado en la base de datos" }
    }

    console.log("✅ AUTH - Afiliado encontrado:", afiliado)

    // Establecer cookie de sesión
    const cookieStore = cookies()
    cookieStore.set("auth", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 semana
      path: "/",
    })

    cookieStore.set("user_dni", data.dni, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 semana
      path: "/",
    })

    console.log("✅ AUTH - Autenticación exitosa")
    return { success: true }
  } catch (error: any) {
    console.error("🔍 AUTH - Error:", error)
    return { success: false, error: "Error al procesar la solicitud" }
  }
}

// Función para verificar si el usuario está autenticado
export async function verificarAutenticacion() {
  console.log("🔍 AUTH - Verificando autenticación")

  try {
    const cookieStore = cookies()
    const authCookie = cookieStore.get("auth")?.value
    const dni = cookieStore.get("user_dni")?.value

    if (!authCookie || !dni) {
      console.log("🔍 AUTH - No hay cookies de sesión")
      return null
    }

    console.log("🔍 AUTH - Buscando afiliado con DNI:", dni)
    const afiliado = await AfiliadoService.buscarAfiliado(dni)

    if (!afiliado) {
      console.log("🔍 AUTH - Afiliado no encontrado")
      return null
    }

    console.log("✅ AUTH - Afiliado encontrado:", afiliado)
    return afiliado
  } catch (error: any) {
    console.error("🔍 AUTH - Error:", error)
    return null
  }
}

// Función para verificar el OTP (simplificada)
export async function verificarOtp(otp: string) {
  console.log("🔍 AUTH - Verificando OTP:", otp)

  try {
    // Obtener DNI de la cookie temporal
    const cookieStore = cookies()
    const dni = cookieStore.get("temp_dni")?.value

    if (!dni) {
      console.log("🔍 AUTH - No hay cookie temp_dni, sesión expirada")
      return { success: false, error: "Sesión expirada" }
    }

    // En modo simplificado, cualquier OTP es válido
    console.log("🔍 AUTH - OTP válido, estableciendo cookie de sesión")

    // Establecer cookies de sesión
    cookieStore.set("auth", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 semana
      path: "/",
    })

    cookieStore.set("user_dni", dni, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 semana
      path: "/",
    })

    // Eliminar cookie temporal
    cookieStore.delete("temp_dni")

    console.log("✅ AUTH - Verificación OTP exitosa")
    return { success: true }
  } catch (error: any) {
    console.error("🔍 AUTH - Error al verificar OTP:", error)
    return { success: false, error: "Error al procesar la solicitud" }
  }
}

// Función para cerrar sesión
export async function cerrarSesion() {
  console.log("🔍 AUTH - Cerrando sesión")
  const cookieStore = cookies()
  cookieStore.delete("auth")
  cookieStore.delete("user_dni")
  return { success: true }
}
