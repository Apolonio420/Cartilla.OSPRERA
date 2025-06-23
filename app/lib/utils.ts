import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Función para generar un OTP de 6 dígitos
export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Función para normalizar nombres y apellidos
export function normalizarNombre(nombre: string): string {
  if (!nombre) return ""

  // Palabras que deben ir en minúsculas (excepto al inicio)
  const palabrasMinusculas = ["de", "del", "la", "las", "el", "los", "y", "e", "da", "das", "do", "dos"]

  return nombre
    .trim()
    .replace(/\s+/g, " ") // Reemplazar múltiples espacios por uno solo
    .split(" ")
    .map((palabra, index) => {
      if (!palabra) return ""

      // Convertir a minúsculas manteniendo caracteres especiales
      const palabraLower = palabra.toLowerCase()

      // Si es la primera palabra o no está en la lista de palabras en minúsculas
      if (index === 0 || !palabrasMinusculas.includes(palabraLower)) {
        return palabraLower.charAt(0).toUpperCase() + palabraLower.slice(1)
      }
      return palabraLower
    })
    .join(" ")
}

// Función para separar nombre completo en nombre y apellido
export function separarNombreCompleto(nombreCompleto: string): { nombre: string; apellido: string } {
  if (!nombreCompleto) return { nombre: "", apellido: "" }

  const partes = nombreCompleto.trim().split(" ")

  if (partes.length === 1) {
    return { nombre: normalizarNombre(partes[0]), apellido: "" }
  } else if (partes.length === 2) {
    return {
      nombre: normalizarNombre(partes[0]),
      apellido: normalizarNombre(partes[1]),
    }
  } else {
    // Si hay más de 2 palabras, tomar la primera como nombre y el resto como apellido
    return {
      nombre: normalizarNombre(partes[0]),
      apellido: normalizarNombre(partes.slice(1).join(" ")),
    }
  }
}

// Función para limpiar y normalizar texto con caracteres especiales
export function limpiarTexto(texto: string): string {
  if (!texto) return ""

  // Reemplazar caracteres problemáticos comunes
  return texto
    .replace(/â€™/g, "'") // Apostrofe
    .replace(/â€œ/g, '"') // Comilla izquierda
    .replace(/â€/g, '"') // Comilla derecha
    .replace(/â€"/g, "—") // Em dash
    .replace(/â€"/g, "–") // En dash
    .replace(/Ã±/g, "ñ") // ñ mal codificada
    .replace(/Ã¡/g, "á") // á mal codificada
    .replace(/Ã©/g, "é") // é mal codificada
    .replace(/Ã­/g, "í") // í mal codificada
    .replace(/Ã³/g, "ó") // ó mal codificada
    .replace(/Ãº/g, "ú") // ú mal codificada
    .replace(/Ã/g, "Á") // Á mal codificada
    .replace(/Ã‰/g, "É") // É mal codificada
    .replace(/Ã/g, "Í") // Í mal codificada
    .replace(/Ã"/g, "Ó") // Ó mal codificada
    .replace(/Ãš/g, "Ú") // Ú mal codificada
    .replace(/Ã'/g, "Ñ") // Ñ mal codificada
    .trim()
}
