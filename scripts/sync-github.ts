import { consultaClient } from "@/app/lib/database/consulta-client"

// 🔧 TUS URLs DE GITHUB
const GITHUB_URLS = {
  farmacias:
    "https://raw.githubusercontent.com/Apolonio420/osprera-datos-csv/refs/heads/main/Red%20de%20Farmacias%20(Ambulatorio).csv",
  especialidades: "https://raw.githubusercontent.com/Apolonio420/osprera-datos-csv/refs/heads/main/Especialidades.csv",
}

// Función para descargar CSV desde GitHub
async function descargarCSV(url: string): Promise<any[]> {
  console.log(`📥 Descargando desde: ${url}`)

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
  console.log(`📄 Contenido descargado: ${content.length} caracteres`)

  const lines = content.split("\n").filter((line) => line.trim())

  if (lines.length === 0) {
    throw new Error("El archivo CSV está vacío")
  }

  // Parsear CSV
  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
  console.log(`📋 Headers encontrados:`, headers)

  const data = lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/"/g, ""))
    const obj: any = {}
    headers.forEach((header, index) => {
      obj[header] = values[index] || ""
    })
    return obj
  })

  console.log(`✅ Descargado: ${data.length} registros`)
  return data
}

// Sincronizar farmacias
async function sincronizarFarmacias() {
  try {
    console.log("\n🏥 === SINCRONIZANDO FARMACIAS ===")

    const farmacias = await descargarCSV(GITHUB_URLS.farmacias)

    // Mostrar una muestra de los datos para debug
    if (farmacias.length > 0) {
      console.log("📊 Muestra de datos:", farmacias[0])
    }

    // Limpiar datos anteriores
    await consultaClient.farmacia.deleteMany()
    console.log("🗑️ Datos anteriores eliminados")

    // Insertar nuevos datos
    let insertadas = 0
    for (const farmacia of farmacias) {
      try {
        await consultaClient.farmacia.create({
          data: {
            nombre: farmacia.Nombre || farmacia.nombre || "",
            provincia: farmacia.Region || farmacia.region || farmacia.Provincia || "",
            localidad: farmacia.Zona || farmacia.zona || farmacia.Localidad || "",
            direccion: farmacia.Domicilio || farmacia.domicilio || farmacia.Direccion || "",
            codigo: farmacia.Cod || farmacia.cod || farmacia.Codigo || "",
            latitud: farmacia.Latitud ? Number.parseFloat(farmacia.Latitud) : null,
            longitud: farmacia.Longitud ? Number.parseFloat(farmacia.Longitud) : null,
            telefono: farmacia.Telefono || farmacia.telefono || "",
            servicios: [],
            estado: "activo",
          },
        })
        insertadas++

        if (insertadas % 100 === 0) {
          console.log(`📈 Progreso: ${insertadas} farmacias insertadas...`)
        }
      } catch (error) {
        console.error(`❌ Error con farmacia ${farmacia.Nombre || farmacia.nombre}:`, error)
      }
    }

    console.log(`✅ ${insertadas} farmacias sincronizadas exitosamente`)
  } catch (error) {
    console.error("💥 Error al sincronizar farmacias:", error)
  }
}

// Sincronizar especialidades
async function sincronizarEspecialidades() {
  try {
    console.log("\n🩺 === SINCRONIZANDO ESPECIALIDADES ===")

    const especialidades = await descargarCSV(GITHUB_URLS.especialidades)

    // Mostrar una muestra de los datos para debug
    if (especialidades.length > 0) {
      console.log("📊 Muestra de datos:", especialidades[0])
    }

    // Insertar/actualizar especialidades
    let procesadas = 0
    for (const esp of especialidades) {
      try {
        const nombreEspecialidad = esp.ESPECIALIDAD || esp.especialidad || esp.Especialidad || ""
        const codigoId = esp.ID || esp.id || esp.Id || ""

        if (!nombreEspecialidad) {
          console.log("⚠️ Especialidad sin nombre, saltando...")
          continue
        }

        await consultaClient.especialidad.upsert({
          where: { nombre: nombreEspecialidad },
          update: {
            codigo_id: codigoId,
            updated_at: new Date(),
          },
          create: {
            nombre: nombreEspecialidad,
            codigo_id: codigoId,
            descripcion: "",
            estado: "activo",
          },
        })
        procesadas++
      } catch (error) {
        console.error(`❌ Error con especialidad ${esp.ESPECIALIDAD || esp.especialidad}:`, error)
      }
    }

    console.log(`✅ ${procesadas} especialidades sincronizadas exitosamente`)
  } catch (error) {
    console.error("💥 Error al sincronizar especialidades:", error)
  }
}

// Función principal
async function main() {
  console.log("🚀 INICIANDO SINCRONIZACIÓN DESDE GITHUB")
  console.log("=" * 50)
  console.log("📂 Repositorio: Apolonio420/osprera-datos-csv")
  console.log("=" * 50)

  try {
    await sincronizarFarmacias()
    await sincronizarEspecialidades()

    console.log("\n🎉 ¡SINCRONIZACIÓN COMPLETADA EXITOSAMENTE!")
  } catch (error) {
    console.error("\n💥 ERROR GENERAL:", error)
  } finally {
    await consultaClient.$disconnect()
    process.exit(0)
  }
}

// Ejecutar
main().catch(console.error)
