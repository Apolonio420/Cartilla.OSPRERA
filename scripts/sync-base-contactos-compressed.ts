import { consultaClient } from "@/app/lib/database/consulta-client"
import { createGunzip } from "zlib"
import { Readable } from "stream"

// URL del archivo comprimido en GitHub
const BASE_CONTACTOS_URL =
  "https://raw.githubusercontent.com/Apolonio420/osprera-datos-csv/refs/heads/main/base_contactos.csv.gz"

// Función para descomprimir contenido gzip
async function descomprimirGzip(buffer: ArrayBuffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    const gunzip = createGunzip()

    gunzip.on("data", (chunk) => chunks.push(chunk))
    gunzip.on("end", () => {
      const result = Buffer.concat(chunks).toString("utf-8")
      resolve(result)
    })
    gunzip.on("error", reject)

    // Convertir ArrayBuffer a Buffer y enviarlo al stream
    const nodeBuffer = Buffer.from(buffer)
    const readable = new Readable()
    readable.push(nodeBuffer)
    readable.push(null)
    readable.pipe(gunzip)
  })
}

// Función para descargar y descomprimir archivo
async function descargarArchivoComprimido(url: string): Promise<string> {
  console.log(`📥 Descargando archivo comprimido desde: ${url}`)

  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      "User-Agent": "OSPRERA-App/1.0",
    },
  })

  if (!response.ok) {
    throw new Error(`Error: ${response.status} - ${response.statusText}`)
  }

  // Obtener como ArrayBuffer para manejar datos binarios
  const compressedData = await response.arrayBuffer()
  console.log(`📦 Archivo comprimido descargado: ${compressedData.byteLength} bytes`)

  // Descomprimir
  console.log(`🔄 Descomprimiendo archivo...`)
  const content = await descomprimirGzip(compressedData)
  console.log(`📄 Archivo descomprimido: ${content.length} caracteres`)

  return content
}

// Función para parsear CSV grande de forma eficiente
function parsearCSVContactos(content: string): any[] {
  console.log(`📋 Parseando CSV de contactos...`)

  const lineas = content.split("\n").filter((line) => line.trim())
  if (lineas.length === 0) {
    throw new Error("El archivo CSV está vacío")
  }

  const headers = lineas[0].split(",").map((h) => h.trim().replace(/"/g, ""))
  console.log(`📊 Headers encontrados:`, headers)
  console.log(`📈 Total de registros: ${lineas.length - 1}`)

  const datos = []
  const batchSize = 1000

  for (let i = 1; i < lineas.length; i += batchSize) {
    const lote = lineas.slice(i, i + batchSize)

    for (const linea of lote) {
      if (!linea.trim()) continue

      const valores = linea.split(",").map((v) => v.trim().replace(/"/g, ""))
      const obj: any = {}

      headers.forEach((header, index) => {
        obj[header] = valores[index] || ""
      })

      // Solo agregar si tiene DNI válido
      const dni = obj.DNI || obj.dni || obj.Dni || ""
      if (dni && dni.length >= 7 && dni.length <= 8) {
        datos.push(obj)
      }
    }

    if (i % 10000 === 0) {
      console.log(`📈 Procesados: ${i} registros...`)
    }
  }

  console.log(`✅ Registros válidos encontrados: ${datos.length}`)
  return datos
}

// Sincronizar base de contactos
async function sincronizarBaseContactos() {
  try {
    console.log("\n👥 === SINCRONIZANDO BASE DE CONTACTOS COMPRIMIDA ===")

    // Descargar y descomprimir
    const contenidoCSV = await descargarArchivoComprimido(BASE_CONTACTOS_URL)

    // Parsear datos
    const contactos = parsearCSVContactos(contenidoCSV)

    if (contactos.length === 0) {
      throw new Error("No se encontraron contactos válidos")
    }

    // Mostrar muestra de datos para verificar estructura
    console.log("📊 Muestra de datos:", contactos[0])

    // Limpiar tabla anterior
    console.log("🗑️ Limpiando datos anteriores...")
    await consultaClient.afiliadoSistema.deleteMany()

    // Insertar en lotes para mejor rendimiento
    const batchSize = 500
    let insertados = 0
    let errores = 0

    for (let i = 0; i < contactos.length; i += batchSize) {
      const lote = contactos.slice(i, i + batchSize)

      try {
        const datosLote = lote
          .map((contacto) => ({
            dni: (contacto.DNI || contacto.dni || contacto.Dni || "").toString().padStart(8, "0"),
            nombre: contacto.NOMBRE || contacto.nombre || contacto.Nombre || "",
            apellido: contacto.APELLIDO || contacto.apellido || contacto.Apellido || "",
            telefono: contacto.TELEFONO || contacto.telefono || contacto.Telefono || "",
            email: contacto.EMAIL || contacto.email || contacto.Email || "",
            plan: contacto.PLAN || contacto.plan || contacto.Plan || "Básico",
            estado_afiliacion: "activo",
          }))
          .filter((item) => item.dni && item.dni.length >= 7)

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

    // Verificar algunos registros
    const muestra = await consultaClient.afiliadoSistema.findMany({ take: 5 })
    console.log("🔍 Muestra de registros insertados:", muestra)
  } catch (error) {
    console.error("💥 Error al sincronizar base de contactos:", error)
    throw error
  }
}

// Función principal
async function main() {
  console.log("🚀 INICIANDO SINCRONIZACIÓN DE BASE DE CONTACTOS COMPRIMIDA")
  console.log("=" * 70)

  try {
    await sincronizarBaseContactos()
    console.log("\n🎉 ¡SINCRONIZACIÓN COMPLETADA EXITOSAMENTE!")
  } catch (error) {
    console.error("\n💥 ERROR GENERAL:", error)
    process.exit(1)
  } finally {
    await consultaClient.$disconnect()
    process.exit(0)
  }
}

// Ejecutar
main().catch(console.error)
