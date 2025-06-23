import { consultaClient } from "@/app/lib/database/consulta-client"
import * as fs from "fs"
import * as path from "path"

// Función para leer CSV
function parseCSV(content: string): any[] {
  const lines = content.split("\n")
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

// Importar farmacias con tu estructura específica
async function importarFarmacias() {
  try {
    console.log("📋 Importando farmacias...")

    const csvPath = path.join(process.cwd(), "data", "farmacias.csv")

    if (!fs.existsSync(csvPath)) {
      console.log("❌ No se encontró el archivo farmacias.csv en la carpeta data/")
      return
    }

    const csvContent = fs.readFileSync(csvPath, "utf-8")
    const farmacias = parseCSV(csvContent)

    console.log(`📊 Encontradas ${farmacias.length} farmacias`)

    // Limpiar datos existentes (opcional)
    await consultaClient.farmacia.deleteMany()

    // Insertar farmacias con tu estructura
    for (const farmacia of farmacias) {
      try {
        await consultaClient.farmacia.create({
          data: {
            nombre: farmacia.Nombre || farmacia.nombre || "",
            provincia: farmacia.Region || farmacia.region || "",
            localidad: farmacia.Zona || farmacia.zona || "",
            direccion: farmacia.Domicilio || farmacia.domicilio || "",
            telefono: "", // No tienes teléfono en tu Excel
            codigo: farmacia.Cod || farmacia.cod || "",
            latitud: farmacia.Latitud ? Number.parseFloat(farmacia.Latitud) : null,
            longitud: farmacia.Longitud ? Number.parseFloat(farmacia.Longitud) : null,
            servicios: [],
            estado: "activo",
          },
        })
      } catch (error) {
        console.error(`Error al insertar farmacia ${farmacia.Nombre}:`, error)
      }
    }

    console.log("✅ Farmacias importadas correctamente")
  } catch (error) {
    console.error("❌ Error al importar farmacias:", error)
  }
}

// Importar especialidades con tu estructura específica
async function importarEspecialidades() {
  try {
    console.log("📋 Importando especialidades...")

    const csvPath = path.join(process.cwd(), "data", "especialidades.csv")

    if (!fs.existsSync(csvPath)) {
      console.log("❌ No se encontró el archivo especialidades.csv en la carpeta data/")
      return
    }

    const csvContent = fs.readFileSync(csvPath, "utf-8")
    const especialidades = parseCSV(csvContent)

    console.log(`📊 Encontradas ${especialidades.length} especialidades`)

    // Insertar especialidades con tu estructura
    for (const esp of especialidades) {
      try {
        await consultaClient.especialidad.upsert({
          where: { nombre: esp.ESPECIALIDAD || esp.especialidad },
          update: {
            codigo_id: esp.ID || esp.id || "",
          },
          create: {
            nombre: esp.ESPECIALIDAD || esp.especialidad || "",
            codigo_id: esp.ID || esp.id || "",
            descripcion: "",
            estado: "activo",
          },
        })
      } catch (error) {
        console.error(`Error al insertar especialidad ${esp.ESPECIALIDAD}:`, error)
      }
    }

    console.log("✅ Especialidades importadas correctamente")
  } catch (error) {
    console.error("❌ Error al importar especialidades:", error)
  }
}

// Crear carpeta data si no existe
function crearCarpetaData() {
  const dataPath = path.join(process.cwd(), "data")
  if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath)
    console.log("📁 Carpeta 'data' creada")
  }
}

// Ejecutar importación
async function main() {
  console.log("🚀 Iniciando importación de datos...")

  crearCarpetaData()

  await importarFarmacias()
  await importarEspecialidades()

  console.log("🎉 Importación completada")
  await consultaClient.$disconnect()
  process.exit(0)
}

main().catch(console.error)
