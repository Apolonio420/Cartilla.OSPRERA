import { consultaClient } from "@/app/lib/database/consulta-client"

// URL del archivo CSV directo
const BASE_CONTACTOS_URL = process.env.CSV_BASE_CONTACTOS_URL || ""

interface ContactoCSV {
  dni: string
  nombre: string
  apellido: string
  telefono?: string
  email?: string
  direccion?: string
}

// Función para descargar CSV
async function descargarCSV(url: string): Promise<string> {
  console.log(`📥 Descargando CSV desde: ${url}`)

  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      "User-Agent": "OSPRERA-App/1.0",
    },
  })

  if (!response.ok) {
    throw new Error(`Error: ${response.status} - ${response.statusText}`)
  }

  const content = await response.text()
  console.log(`📄 CSV descargado: ${content.length} caracteres`)
  return content
}

// Función para parsear CSV de contactos
async function parsearCSVContactos(content: string): Promise<ContactoCSV[]> {
  console.log(`📋 Parseando CSV de contactos...`)

  const lines = content.split("\n").filter((line) => line.trim())
  if (lines.length === 0) {
    throw new Error("El archivo CSV está vacío")
  }

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/"/g, ""))
  console.log(`📊 Headers encontrados:`, headers)

  const contactos: ContactoCSV[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))

    if (values.length >= headers.length) {
      const contacto: ContactoCSV = {
        dni: "",
        nombre: "",
        apellido: "",
      }

      headers.forEach((header, index) => {
        const value = values[index] || ""

        switch (header) {
          case "dni":
          case "documento":
          case "nro_documento":
            contacto.dni = value
            break
          case "nombre":
          case "nombres":
            contacto.nombre = value
            break
          case "apellido":
          case "apellidos":
            contacto.apellido = value
            break
          case "telefono":
          case "teléfono":
          case "celular":
            contacto.telefono = value
            break
          case "email":
          case "correo":
          case "mail":
            contacto.email = value
            break
          case "direccion":
          case "dirección":
            contacto.direccion = value
            break
        }
      })

      // Validar que tenga datos mínimos
      if (contacto.dni && contacto.dni.length >= 7 && contacto.nombre && contacto.apellido) {
        contactos.push(contacto)
      }
    }
  }

  console.log(`✅ Registros válidos encontrados: ${contactos.length}`)
  return contactos
}

// Función principal de sincronización
export async function syncContactos(
  csvUrl?: string,
): Promise<{ success: boolean; message: string; insertados?: number }> {
  try {
    console.log("\n👥 === SINCRONIZANDO BASE DE CONTACTOS ===")

    const url = csvUrl || BASE_CONTACTOS_URL
    if (!url) {
      throw new Error("No se proporcionó URL del CSV")
    }

    // Descargar CSV
    const contenidoCSV = await descargarCSV(url)

    // Parsear datos
    const contactos = await parsearCSVContactos(contenidoCSV)

    if (contactos.length === 0) {
      throw new Error("No se encontraron contactos válidos")
    }

    // Mostrar muestra de datos
    console.log("📊 Muestra de datos:", contactos[0])

    // Limpiar tabla anterior
    console.log("🗑️ Limpiando datos anteriores...")
    await consultaClient.afiliadoSistema.deleteMany()

    // Insertar en lotes
    const batchSize = 500
    let insertados = 0
    let errores = 0

    for (let i = 0; i < contactos.length; i += batchSize) {
      const lote = contactos.slice(i, i + batchSize)

      try {
        const datosLote = lote.map((contacto) => ({
          dni: contacto.dni.padStart(8, "0"),
          nombre: contacto.nombre,
          apellido: contacto.apellido,
          telefono: contacto.telefono || "",
          email: contacto.email || "",
          direccion: contacto.direccion || "",
          plan: "Básico",
          estado_afiliacion: "activo",
        }))

        if (datosLote.length > 0) {
          await consultaClient.afiliadoSistema.createMany({
            data: datosLote,
            skipDuplicates: true,
          })
          insertados += datosLote.length
        }

        console.log(
          `📈 Progreso: ${insertados}/${contactos.length} (${Math.round((insertados / contactos.length) * 100)}%)`,
        )
      } catch (error) {
        console.error(`❌ Error en lote ${i}-${i + batchSize}:`, error)
        errores++
      }
    }

    console.log(`✅ ${insertados} contactos sincronizados exitosamente`)
    if (errores > 0) {
      console.log(`⚠️ ${errores} lotes con errores`)
    }

    return {
      success: true,
      message: `${insertados} contactos sincronizados exitosamente`,
      insertados,
    }
  } catch (error) {
    console.error("💥 Error al sincronizar base de contactos:", error)
    throw error
  }
}

// Función principal para ejecutar desde línea de comandos
async function main() {
  console.log("🚀 INICIANDO SINCRONIZACIÓN DE BASE DE CONTACTOS")
  console.log("=" * 60)

  try {
    const result = await syncContactos()
    console.log("\n🎉 ¡SINCRONIZACIÓN COMPLETADA EXITOSAMENTE!")
    console.log(result.message)
  } catch (error) {
    console.error("\n💥 ERROR GENERAL:", error)
    process.exit(1)
  } finally {
    await consultaClient.$disconnect()
    process.exit(0)
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  main().catch(console.error)
}
