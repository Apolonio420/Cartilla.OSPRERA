import { consultaClient } from "@/app/lib/database/consulta-client"

// Función para descargar CSV desde URL
async function descargarCSV(url: string): Promise<string> {
  try {
    console.log(`📥 Descargando CSV desde: ${url}`)
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`)
    }

    const content = await response.text()
    console.log(`✅ CSV descargado exitosamente (${content.length} caracteres)`)
    return content
  } catch (error) {
    console.error(`❌ Error al descargar CSV:`, error)
    throw error
  }
}

// Función para parsear CSV
function parseCSV(content: string): any[] {
  const lines = content.split("\n").filter((line) => line.trim())
  if (lines.length === 0) return []

  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

  return lines
    .slice(1)
    .filter((line) => line.trim())
    .map((line) => {
      const values = line.split(",").map((v) => v.trim().replace(/"/g, ""))
      const obj: any = {}
      headers.forEach((header, index) => {
        obj[header] = values[index] || ""
      })
      return obj
    })
}

// URLs de tus archivos CSV (configurable)
const CSV_URLS = {
  farmacias: process.env.CSV_FARMACIAS_URL || "",
  especialidades: process.env.CSV_ESPECIALIDADES_URL || "",
}

// Importar farmacias desde URL
async function importarFarmaciasOnline() {
  try {
    if (!CSV_URLS.farmacias) {
      console.log("⚠️ No se configuró URL para farmacias (CSV_FARMACIAS_URL)")
      return
    }

    console.log("📋 Importando farmacias desde URL...")

    const csvContent = await descargarCSV(CSV_URLS.farmacias)
    const farmacias = parseCSV(csvContent)

    console.log(`📊 Encontradas ${farmacias.length} farmacias`)

    // Limpiar datos existentes
    await consultaClient.farmacia.deleteMany()
    console.log("🗑️ Datos anteriores eliminados")

    // Insertar farmacias
    let insertadas = 0
    for (const farmacia of farmacias) {
      try {
        await consultaClient.farmacia.create({
          data: {
            nombre: farmacia.Nombre || farmacia.nombre || "",
            provincia: farmacia.Region || farmacia.region || "",
            localidad: farmacia.Zona || farmacia.zona || "",
            direccion: farmacia.Domicilio || farmacia.domicilio || "",
            telefono: farmacia.Telefono || farmacia.telefono || "",
            codigo: farmacia.Cod || farmacia.cod || "",
            latitud: farmacia.Latitud ? Number.parseFloat(farmacia.Latitud) : null,
            longitud: farmacia.Longitud ? Number.parseFloat(farmacia.Longitud) : null,
            servicios: [],
            estado: "activo",
          },
        })
        insertadas++
      } catch (error) {
        console.error(`Error al insertar farmacia ${farmacia.Nombre}:`, error)
      }
    }

    console.log(`✅ ${insertadas} farmacias importadas correctamente`)
  } catch (error) {
    console.error("❌ Error al importar farmacias:", error)
  }
}

// Importar especialidades desde URL
async function importarEspecialidadesOnline() {
  try {
    if (!CSV_URLS.especialidades) {
      console.log("⚠️ No se configuró URL para especialidades (CSV_ESPECIALIDADES_URL)")
      return
    }

    console.log("📋 Importando especialidades desde URL...")

    const csvContent = await descargarCSV(CSV_URLS.especialidades)
    const especialidades = parseCSV(csvContent)

    console.log(`📊 Encontradas ${especialidades.length} especialidades`)

    // Insertar especialidades
    let insertadas = 0
    for (const esp of especialidades) {
      try {
        await consultaClient.especialidad.upsert({
          where: { nombre: esp.ESPECIALIDAD || esp.especialidad },
          update: {
            codigo_id: esp.ID || esp.id || "",
            updated_at: new Date(),
          },
          create: {
            nombre: esp.ESPECIALIDAD || esp.especialidad || "",
            codigo_id: esp.ID || esp.id || "",
            descripcion: esp.Descripcion || esp.descripcion || "",
            estado: "activo",
          },
        })
        insertadas++
      } catch (error) {
        console.error(`Error al insertar especialidad ${esp.ESPECIALIDAD}:`, error)
      }
    }

    console.log(`✅ ${insertadas} especialidades procesadas correctamente`)
  } catch (error) {
    console.error("❌ Error al importar especialidades:", error)
  }
}

// Función principal
async function main() {
  console.log("🚀 Iniciando importación desde URLs...")

  try {
    await importarFarmaciasOnline()
    await importarEspecialidadesOnline()

    console.log("🎉 Importación completada exitosamente")
  } catch (error) {
    console.error("💥 Error general en la importación:", error)
  } finally {
    await consultaClient.$disconnect()
    process.exit(0)
  }
}

main().catch(console.error)
