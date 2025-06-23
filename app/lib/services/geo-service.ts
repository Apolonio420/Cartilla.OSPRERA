import { supabase } from "@/lib/supabase"

export interface Coordenadas {
  latitud: number
  longitud: number
  fuente?: string
}

export interface UbicacionEncontrada {
  nombre: string
  tipo: "localidad" | "partido" | "provincia" | "region"
  coordenadas: Coordenadas
  detalles?: {
    localidad?: string
    partido?: string
    provincia?: string
    region_macro?: string
    region_micro?: string
  }
  cantidadLocalidades?: number
  cantidadPrestadores?: number
  sinDatos?: boolean // NUEVO: Indica si no hay datos para esta provincia
}

export class GeoService {
  private static prestadoresCache: any[] | null = null
  private static cacheTimestamp = 0
  private static CACHE_DURATION = 0 // Forzar recarga siempre hasta que funcione

  // NUEVO: Provincias que sabemos que NO tienen datos en la DB
  private static PROVINCIAS_SIN_DATOS = new Set([
    "la rioja",
    "santiago del estero",
    "jujuy",
    "salta",
    "tucuman",
    "formosa",
    "chaco",
    "corrientes",
    "misiones",
    "santa fe",
    "cordoba",
    "mendoza",
    "san juan",
    "san luis",
    "neuquen",
    "rio negro",
    "chubut",
    "santa cruz",
    "tierra del fuego",
  ])

  private static CAPITALES_ARGENTINA = {
    "buenos aires": { lat: -34.6118, lng: -58.396 },
    cordoba: { lat: -31.4201, lng: -64.1888 },
    rosario: { lat: -32.9442, lng: -60.6505 },
    mendoza: { lat: -32.8895, lng: -68.8458 },
    tucuman: { lat: -26.8083, lng: -65.2176 },
    "la plata": { lat: -34.9215, lng: -57.9545 },
    "mar del plata": { lat: -38.0055, lng: -57.5426 },
    salta: { lat: -24.7821, lng: -65.4232 },
    "santa fe": { lat: -31.6333, lng: -60.7 },
    "san juan": { lat: -31.5375, lng: -68.5364 },
    resistencia: { lat: -27.4514, lng: -58.9867 },
    neuquen: { lat: -38.9516, lng: -68.0591 },
    corrientes: { lat: -27.4806, lng: -58.8341 },
    posadas: { lat: -27.3621, lng: -55.8969 },
    "san salvador de jujuy": { lat: -24.1858, lng: -65.2995 },
    formosa: { lat: -26.1775, lng: -58.1781 },
    "san luis": { lat: -33.2482, lng: -66.3219 },
    catamarca: { lat: -28.4696, lng: -65.7852 },
    "san fernando del valle de catamarca": { lat: -28.4696, lng: -65.7852 },
    "la rioja": { lat: -29.4331, lng: -66.8558 },
    "santiago del estero": { lat: -27.7951, lng: -64.2615 },
    rawson: { lat: -43.3002, lng: -65.1023 },
    viedma: { lat: -40.8135, lng: -62.9967 },
    "santa rosa": { lat: -36.6167, lng: -64.2833 },
    "rio gallegos": { lat: -51.6226, lng: -69.2181 },
    ushuaia: { lat: -54.8019, lng: -68.303 },
  }

  static normalizarTexto(texto: string): string {
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim()
  }

  static async obtenerUbicacionActual(): Promise<Coordenadas | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.log("Geolocalización no soportada")
        resolve(null)
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitud: position.coords.latitude,
            longitud: position.coords.longitude,
            fuente: "GPS del dispositivo",
          })
        },
        (error) => {
          console.error("Error obteniendo ubicación:", error)
          resolve(null)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        },
      )
    })
  }

  static obtenerCoordenadasCorrectas(nombre: string, latOriginal: number, lngOriginal: number): Coordenadas {
    const nombreNorm = this.normalizarTexto(nombre)

    for (const [ciudad, coords] of Object.entries(this.CAPITALES_ARGENTINA)) {
      if (nombreNorm.includes(ciudad) || ciudad.includes(nombreNorm)) {
        console.log(
          `🔧 Corrigiendo coordenadas de ${nombre}: ${latOriginal},${lngOriginal} → ${coords.lat},${coords.lng}`,
        )
        return {
          latitud: coords.lat,
          longitud: coords.lng,
          fuente: `Coordenadas corregidas (${ciudad})`,
        }
      }
    }

    return {
      latitud: latOriginal,
      longitud: lngOriginal,
      fuente: "Base Geográfica (original)",
    }
  }

  // NUEVO: Verificar si una provincia tiene datos
  static provinciasSinDatos(termino: string): boolean {
    const terminoNorm = this.normalizarTexto(termino)

    for (const provincia of this.PROVINCIAS_SIN_DATOS) {
      if (terminoNorm.includes(provincia) || provincia.includes(terminoNorm)) {
        return true
      }
    }

    return false
  }

  static async obtenerTodosPrestadores(): Promise<any[]> {
    // FORZAR LIMPIEZA DEL CACHE
    this.prestadoresCache = null
    this.cacheTimestamp = 0

    const now = Date.now()

    if (this.prestadoresCache && now - this.cacheTimestamp < this.CACHE_DURATION) {
      console.log("📦 Usando cache de prestadores:", this.prestadoresCache.length)
      return this.prestadoresCache
    }

    try {
      console.log("🔄 Cargando prestadores desde base de datos...")

      const { data: prestadores, error } = await supabase
        .from("Cartilla")
        .select(
          "CUIT, NOMBRE_COMPLETO, ESPECIALIDAD, LOCALIDAD, PROVINCIA, DOMICILIO, TELEFONO, TELEFONO_2, EMAIL, Latitud, Longitud",
        )
        .not("Latitud", "is", null)
        .not("Longitud", "is", null)
        .neq("Latitud", 0)
        .neq("Longitud", 0)
        .limit(20000) // Aumentamos para asegurar que cargue todo

      if (error) {
        console.error("Error obteniendo prestadores:", error)
        return []
      }

      console.log("📊 Prestadores obtenidos de DB:", prestadores?.length || 0)

      const prestadoresProcesados = (prestadores || [])
        .map((p) => {
          const lat = this.parseCoordinate(p.Latitud)
          const lng = this.parseCoordinate(p.Longitud)

          return {
            ...p,
            latitud: lat,
            longitud: lng,
          }
        })
        .filter((p) => {
          const esValido = p.latitud && p.longitud && !isNaN(p.latitud) && !isNaN(p.longitud)
          return esValido
        })

      // DEBUG: Análisis de provincias disponibles
      const porProvincia = new Map<string, number>()
      prestadoresProcesados.forEach((p) => {
        const provincia = (p.PROVINCIA || "").toLowerCase().trim()
        porProvincia.set(provincia, (porProvincia.get(provincia) || 0) + 1)
      })

      console.log("📍 Provincias disponibles en la base de datos:")
      Array.from(porProvincia.entries())
        .sort((a, b) => b[1] - a[1])
        .forEach(([provincia, count]) => {
          console.log(`  ${provincia}: ${count} prestadores`)
        })

      this.prestadoresCache = prestadoresProcesados
      this.cacheTimestamp = now

      console.log("✅ Cache actualizado con", prestadoresProcesados.length, "prestadores")
      return prestadoresProcesados
    } catch (error) {
      console.error("Error cargando prestadores:", error)
      return []
    }
  }

  static async buscarPrestadoresPorTermino(termino: string): Promise<any[]> {
    try {
      const terminoNorm = this.normalizarTexto(termino)

      const { data: prestadores, error } = await supabase
        .from("Cartilla")
        .select("*")
        .or(
          `PROVINCIA.ilike.%${termino}%,LOCALIDAD.ilike.%${termino}%,LOCALIDAD.ilike.%${terminoNorm}%,NOMBRE_COMPLETO.ilike.%${termino}%,DOMICILIO.ilike.%${termino}%`,
        )
        .not("Latitud", "is", null)
        .not("Longitud", "is", null)
        .neq("Latitud", 0)
        .neq("Longitud", 0)
        .limit(100)

      if (error) {
        console.error("Error buscando prestadores por término:", error)
        return []
      }

      const prestadoresProcesados = (prestadores || [])
        .map((p) => ({
          ...p,
          latitud: this.parseCoordinate(p.Latitud),
          longitud: this.parseCoordinate(p.Longitud),
        }))
        .filter((p) => p.latitud && p.longitud && !isNaN(p.latitud) && !isNaN(p.longitud))

      console.log(`🔍 Prestadores encontrados para "${termino}":`, prestadoresProcesados.length)

      return prestadoresProcesados
    } catch (error) {
      console.error("Error en búsqueda por término:", error)
      return []
    }
  }

  static contarPrestadoresCercanos(latitud: number, longitud: number, prestadores: any[], radioKm = 100): number {
    let contador = 0
    const distancias: number[] = []

    for (const prestador of prestadores) {
      const distancia = this.calcularDistancia(latitud, longitud, prestador.latitud, prestador.longitud)
      distancias.push(distancia)
      if (distancia <= radioKm) {
        contador++
      }
    }

    if (distancias.length > 0) {
      const minDistancia = Math.min(...distancias)
      console.log(
        `📏 Distancias desde (${latitud}, ${longitud}): min=${minDistancia.toFixed(1)}km, dentro de ${radioKm}km: ${contador}`,
      )
    }

    return contador
  }

  static validarCoherenciaGeografica(latitud: number, longitud: number, prestadores: any[]): boolean {
    if (prestadores.length === 0) return false

    let distanciaMinima = Number.POSITIVE_INFINITY

    for (const prestador of prestadores.slice(0, 50)) {
      const distancia = this.calcularDistancia(latitud, longitud, prestador.latitud, prestador.longitud)
      if (distancia < distanciaMinima) {
        distanciaMinima = distancia
      }
    }

    const esCoherente = distanciaMinima < 200

    if (!esCoherente) {
      console.log(`⚠️ Coordenadas sospechosas: prestador más cercano a ${distanciaMinima.toFixed(1)}km`)
    } else {
      console.log(`✅ Coordenadas coherentes: prestador más cercano a ${distanciaMinima.toFixed(1)}km`)
    }

    return esCoherente
  }

  static async buscarUbicacion(termino: string): Promise<UbicacionEncontrada[]> {
    try {
      console.log("🔍 Buscando ubicación para:", termino)

      const terminoNormalizado = this.normalizarTexto(termino)
      console.log("🔍 Término normalizado:", terminoNormalizado)

      // NUEVO: Verificar si es una provincia sin datos
      const esProvinciaSinDatos = this.provinciasSinDatos(termino)
      if (esProvinciaSinDatos) {
        console.log("⚠️ Provincia sin datos detectada:", termino)
      }

      const prestadoresDirectos = await this.buscarPrestadoresPorTermino(termino)
      const todosPrestadores = await this.obtenerTodosPrestadores()

      const { data: geograficaData, error: geograficaError } = await supabase
        .from("Base Geografica")
        .select("*")
        .or(
          `Localidad.ilike.%${termino}%,Partido.ilike.%${termino}%,Provincia.ilike.%${termino}%,"Region Macro".ilike.%${termino}%,"Region Micro".ilike.%${termino}%`,
        )
        .order("Provincia", { ascending: true })
        .limit(50)

      if (geograficaError) {
        console.error("Error en Base Geográfica:", geograficaError)
        throw geograficaError
      }

      console.log("📍 Resultados en Base Geográfica:", geograficaData?.length || 0)
      console.log("🏥 Prestadores directos encontrados:", prestadoresDirectos.length)

      const ubicacionesCandidatas: Array<UbicacionEncontrada & { prioridad: number }> = []

      if (geograficaData) {
        for (const item of geograficaData) {
          const localidadNorm = this.normalizarTexto(item.Localidad || "")
          const partidoNorm = this.normalizarTexto(item.Partido || "")
          const provinciaNorm = this.normalizarTexto(item.Provincia || "")

          const latOriginal = this.parseCoordinate(item.Latitud)
          const lngOriginal = this.parseCoordinate(item.Longitud)

          if (!latOriginal || !lngOriginal || isNaN(latOriginal) || isNaN(lngOriginal)) continue

          const coordenadasCorregidas = this.obtenerCoordenadasCorrectas(
            item.Localidad || item.Partido || "",
            latOriginal,
            lngOriginal,
          )

          let prioridad = 0
          let coincideTipo = ""

          if (provinciaNorm.includes(terminoNormalizado)) {
            if (item.Partido === "Capital" || localidadNorm.includes("capital")) {
              prioridad = 1000
              coincideTipo = "capital_provincia"
            } else {
              prioridad = 100
              coincideTipo = "provincia"
            }
          } else if (localidadNorm.includes(terminoNormalizado)) {
            if (localidadNorm === terminoNormalizado) {
              prioridad = 800
            } else {
              prioridad = 400
            }
            coincideTipo = "localidad"
          } else if (partidoNorm.includes(terminoNormalizado)) {
            prioridad = 300
            coincideTipo = "partido"
          }

          if (prioridad > 0) {
            const prestadoresParaContar = prestadoresDirectos.length > 0 ? prestadoresDirectos : todosPrestadores

            const cantidadPrestadores = this.contarPrestadoresCercanos(
              coordenadasCorregidas.latitud,
              coordenadasCorregidas.longitud,
              prestadoresParaContar,
              50,
            )

            const esCoherente = this.validarCoherenciaGeografica(
              coordenadasCorregidas.latitud,
              coordenadasCorregidas.longitud,
              prestadoresParaContar,
            )

            // NUEVO: Marcar como sin datos si es una provincia conocida sin prestadores
            const sinDatos = esProvinciaSinDatos && cantidadPrestadores === 0

            if (esCoherente && !sinDatos) {
              prioridad += 200
            }

            const bonusPrestadores = Math.min(cantidadPrestadores * 10, 500)
            prioridad += bonusPrestadores

            console.log(
              `📊 ${item.Localidad}: ${cantidadPrestadores} prestadores, coherente: ${esCoherente}, sin datos: ${sinDatos}, prioridad: ${prioridad}`,
            )

            ubicacionesCandidatas.push({
              nombre: item.Localidad || item.Partido || item.Provincia || "",
              tipo:
                coincideTipo === "capital_provincia" || coincideTipo === "localidad"
                  ? "localidad"
                  : coincideTipo === "partido"
                    ? "partido"
                    : "provincia",
              coordenadas: coordenadasCorregidas,
              detalles: {
                localidad: item.Localidad,
                partido: item.Partido,
                provincia: item.Provincia,
                region_macro: item["Region Macro"],
                region_micro: item["Region Micro"],
              },
              cantidadPrestadores,
              sinDatos, // NUEVO: Indica si no hay datos
              prioridad,
            })

            if (coincideTipo === "capital_provincia" && cantidadPrestadores > 0 && esCoherente) {
              console.log("🎯 Capital coherente encontrada, terminando búsqueda")
              break
            }
          }
        }
      }

      ubicacionesCandidatas.sort((a, b) => b.prioridad - a.prioridad)
      const mejoresUbicaciones = ubicacionesCandidatas.slice(0, 10).map(({ prioridad, ...ubicacion }) => ubicacion)

      console.log("🎯 Mejores ubicaciones por prioridad:")
      mejoresUbicaciones.forEach((u, i) => {
        const estado = u.sinDatos ? "(SIN DATOS)" : `(${u.cantidadPrestadores} prestadores)`
        console.log(`${i + 1}. ${u.nombre} ${estado} - ${u.coordenadas.fuente}`)
      })

      if (mejoresUbicaciones.length === 0 || mejoresUbicaciones[0].cantidadPrestadores === 0) {
        console.log("🔍 Fallback: usando prestadores encontrados directamente...")

        if (prestadoresDirectos.length > 0) {
          const localidadesConPrestadores = new Map<
            string,
            { lat: number; lng: number; count: number; provincia: string }
          >()

          for (const prestador of prestadoresDirectos) {
            const key = `${prestador.LOCALIDAD}_${prestador.PROVINCIA}`.toLowerCase()

            if (!localidadesConPrestadores.has(key)) {
              localidadesConPrestadores.set(key, {
                lat: prestador.latitud,
                lng: prestador.longitud,
                count: 1,
                provincia: prestador.PROVINCIA || "",
              })
            } else {
              localidadesConPrestadores.get(key)!.count++
            }
          }

          const ubicacionesDirectas = Array.from(localidadesConPrestadores.entries())
            .map(([key, data]) => {
              const [localidad] = key.split("_")
              return {
                nombre: localidad.charAt(0).toUpperCase() + localidad.slice(1),
                tipo: "localidad" as const,
                coordenadas: {
                  latitud: data.lat,
                  longitud: data.lng,
                  fuente: "Prestadores directos",
                },
                detalles: {
                  localidad: localidad.charAt(0).toUpperCase() + localidad.slice(1),
                  provincia: data.provincia,
                },
                cantidadPrestadores: data.count,
                sinDatos: false,
              }
            })
            .sort((a, b) => (b.cantidadPrestadores || 0) - (a.cantidadPrestadores || 0))

          console.log("🏥 Ubicaciones desde prestadores directos:", ubicacionesDirectas.length)
          mejoresUbicaciones.push(...ubicacionesDirectas.slice(0, 5))
        }
      }

      console.log("✅ Total ubicaciones encontradas:", mejoresUbicaciones.length)
      return mejoresUbicaciones
    } catch (error) {
      console.error("❌ Error buscando ubicación:", error)
      return []
    }
  }

  static calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
    try {
      const R = 6371
      const dLat = this.toRad(lat2 - lat1)
      const dLon = this.toRad(lon2 - lon1)
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      const d = R * c
      return Math.round(d * 100) / 100
    } catch (error) {
      console.error("❌ Error calculando distancia:", error)
      return 999999
    }
  }

  private static toRad(value: number): number {
    return (value * Math.PI) / 180
  }

  private static parseCoordinate(value: any): number {
    if (typeof value === "number") return value
    if (typeof value === "string") {
      const normalized = value.replace(",", ".")
      return Number.parseFloat(normalized)
    }
    return 0
  }

  static async buscarPrestadoresCercanos(
    coordenadas: Coordenadas,
    radioKm = 50,
    especialidad?: string,
  ): Promise<any[]> {
    try {
      console.log("🔍 Buscando prestadores cerca de:", coordenadas, "Radio:", radioKm + "km")

      let query = supabase
        .from("Cartilla")
        .select("*")
        .not("Latitud", "is", null)
        .not("Longitud", "is", null)
        .neq("Latitud", 0)
        .neq("Longitud", 0)

      if (especialidad) {
        query = query.ilike("ESPECIALIDAD", `%${especialidad}%`)
      }

      const { data: prestadores, error } = await query.limit(2000)

      if (error) {
        console.error("Error buscando prestadores:", error)
        return []
      }

      if (!prestadores || prestadores.length === 0) {
        console.log("⚠️ No se encontraron prestadores con coordenadas válidas")
        return []
      }

      console.log("📊 Total prestadores con coordenadas:", prestadores.length)

      const prestadoresConDistancia = prestadores
        .map((prestador) => {
          const lat = this.parseCoordinate(prestador.Latitud)
          const lon = this.parseCoordinate(prestador.Longitud)

          if (!lat || !lon || isNaN(lat) || isNaN(lon) || lat === 0 || lon === 0) {
            return null
          }

          const distancia = this.calcularDistancia(coordenadas.latitud, coordenadas.longitud, lat, lon)

          return {
            ...prestador,
            latitud: lat,
            longitud: lon,
            distancia,
          }
        })
        .filter((p) => p !== null && p.distancia <= radioKm)
        .sort((a, b) => a.distancia - b.distancia)

      console.log("✅ Prestadores encontrados en radio de", radioKm + "km:", prestadoresConDistancia.length)

      if (prestadoresConDistancia.length === 0) {
        console.log("🔍 No hay prestadores en el radio, buscando los más cercanos...")

        const todosPrestadores = prestadores
          .map((prestador) => {
            const lat = this.parseCoordinate(prestador.Latitud)
            const lon = this.parseCoordinate(prestador.Longitud)

            if (!lat || !lon || isNaN(lat) || isNaN(lon) || lat === 0 || lon === 0) {
              return null
            }

            const distancia = this.calcularDistancia(coordenadas.latitud, coordenadas.longitud, lat, lon)

            return {
              ...prestador,
              latitud: lat,
              longitud: lon,
              distancia,
            }
          })
          .filter((p) => p !== null)
          .sort((a, b) => a.distancia - b.distancia)
          .slice(0, 20)

        console.log("📍 Prestadores más cercanos encontrados:", todosPrestadores.length)
        if (todosPrestadores.length > 0) {
          console.log("🎯 Distancia del más cercano:", todosPrestadores[0].distancia + "km")
          console.log("📍 Ubicación del más cercano:", todosPrestadores[0].LOCALIDAD, todosPrestadores[0].PROVINCIA)
        }

        return todosPrestadores
      }

      return prestadoresConDistancia
    } catch (error) {
      console.error("❌ Error buscando prestadores cercanos:", error)
      return []
    }
  }
}
