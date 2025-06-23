"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BusquedaGeografica } from "@/app/components/ui/busqueda-geografica"
import { EspecialidadSearch } from "@/app/components/ui/especialidad-search"
import { CartillaSearch } from "@/app/components/ui/cartilla-search"
import { MapPin, Stethoscope, Phone, Mail, Search, User, RotateCcw, Navigation, Map, ArrowLeft } from "lucide-react"
import type { UbicacionEncontrada, Coordenadas } from "@/app/lib/services/geo-service"
import dynamic from "next/dynamic"

// Importar el mapa dinámicamente para evitar problemas de SSR
const MapaPrestadores = dynamic(() => import("@/app/components/ui/mapa-prestadores"), {
  ssr: false,
  loading: () => (
    <div className="h-full bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00613c] mx-auto mb-2"></div>
        <p className="text-gray-500 text-sm">Cargando mapa...</p>
      </div>
    </div>
  ),
})

interface Prestador {
  id: string
  nombre: string
  especialidad: string
  localidad: string
  provincia: string
  domicilio: string
  telefono: string
  telefono2?: string
  email: string
  cuit: string
  latitud?: number
  longitud?: number
  distancia?: number
}

interface ClusterGeografico {
  id: string
  nombre: string
  count: number
  latitud: number
  longitud: number
  prestadores: Prestador[]
  provincia: string
}

export default function CartillaPage() {
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState<UbicacionEncontrada | null>(null)
  const [coordenadasBusqueda, setCoordenadasBusqueda] = useState<Coordenadas | null>(null)
  const [especialidad, setEspecialidad] = useState("")
  const [prestadorSeleccionado, setPrestadorSeleccionado] = useState("")
  const [nombrePrestador, setNombrePrestador] = useState("")
  const [prestadores, setPrestadores] = useState<Prestador[]>([])
  const [todosPrestadores, setTodosPrestadores] = useState<Prestador[]>([])
  const [provincias, setProvincias] = useState<ClusterGeografico[]>([])
  const [clustersActuales, setClustersActuales] = useState<ClusterGeografico[]>([])
  const [loading, setLoading] = useState(false)
  const [radioBusqueda, setRadioBusqueda] = useState(50)
  const [vistaActual, setVistaActual] = useState<"provincias" | "clusters" | "prestadores">("provincias")
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState<string | null>(null)
  const [clusterSeleccionado, setClusterSeleccionado] = useState<ClusterGeografico | null>(null)

  // ✅ FUNCIÓN PARA VALIDAR COHERENCIA GEOGRÁFICA
  const validarCoherenciaGeografica = (prestadores: Prestador[], provincia: string): void => {
    console.log(`🔍 Validando coherencia geográfica para ${provincia}...`)

    const prestadoresConCoordenadas = prestadores.filter(
      (p) => p.latitud && p.longitud && !isNaN(p.latitud) && !isNaN(p.longitud),
    )

    if (prestadoresConCoordenadas.length === 0) return

    // Verificar si hay prestadores con localidades que no coinciden con la provincia
    const localidadesSospechosas: string[] = []
    const provinciasSospechosas: string[] = []

    prestadoresConCoordenadas.forEach((prestador) => {
      const localidad = prestador.localidad?.toLowerCase() || ""
      const provinciaOriginal = prestador.provincia?.toLowerCase() || ""
      const provinciaEsperada = provincia.toLowerCase()

      // Detectar localidades que claramente no pertenecen a la provincia
      if (provincia.toUpperCase().includes("CIUDAD AUTONOMA") || provincia.toUpperCase().includes("CABA")) {
        // Para CABA, verificar que no haya localidades de otras provincias
        if (
          localidad.includes("tucuman") ||
          localidad.includes("san miguel") ||
          localidad.includes("cordoba") ||
          localidad.includes("rosario")
        ) {
          localidadesSospechosas.push(`${prestador.localidad} (${prestador.nombre})`)
        }
      }

      // Verificar inconsistencias en nombres de provincia
      if (!provinciaOriginal.includes(provinciaEsperada.split(" ")[0])) {
        provinciasSospechosas.push(`${prestador.provincia} vs ${provincia} (${prestador.nombre})`)
      }
    })

    if (localidadesSospechosas.length > 0) {
      console.warn(`⚠️ Localidades sospechosas en ${provincia}:`, localidadesSospechosas)
    }

    if (provinciasSospechosas.length > 0) {
      console.warn(`⚠️ Provincias inconsistentes en ${provincia}:`, provinciasSospechosas)
    }

    // Verificar dispersión geográfica
    const latitudes = prestadoresConCoordenadas.map((p) => p.latitud!)
    const longitudes = prestadoresConCoordenadas.map((p) => p.longitud!)

    const latMin = Math.min(...latitudes)
    const latMax = Math.max(...latitudes)
    const lngMin = Math.min(...longitudes)
    const lngMax = Math.max(...longitudes)

    const dispersiónLat = latMax - latMin
    const dispersiónLng = lngMax - lngMin

    console.log(`📊 Dispersión geográfica en ${provincia}:`, {
      latitud: `${latMin.toFixed(2)} a ${latMax.toFixed(2)} (${dispersiónLat.toFixed(2)}°)`,
      longitud: `${lngMin.toFixed(2)} a ${lngMax.toFixed(2)} (${dispersiónLng.toFixed(2)}°)`,
    })

    // Para CABA, la dispersión debería ser muy pequeña
    if (provincia.toUpperCase().includes("CIUDAD AUTONOMA") && (dispersiónLat > 2 || dispersiónLng > 2)) {
      console.warn(
        `⚠️ CABA tiene dispersión geográfica sospechosa: ${dispersiónLat.toFixed(2)}° lat, ${dispersiónLng.toFixed(2)}° lng`,
      )
    }
  }

  // ✅ FUNCIÓN MEJORADA PARA AGRUPAR POR PROVINCIA CON FILTROS
  const agruparPorProvincia = (prestadores: Prestador[]): ClusterGeografico[] => {
    console.log("🔄 Agrupando", prestadores.length, "prestadores por provincia...")

    const grupos: { [key: string]: Prestador[] } = {}

    // ✅ NORMALIZAR NOMBRES DE PROVINCIAS
    const normalizarProvincia = (provincia: string): string => {
      const prov = provincia?.trim().toUpperCase() || "SIN PROVINCIA"

      const mapeoProvincias: { [key: string]: string } = {
        "CIUDAD AUTONOMA DE BUENOS AIRES": "CIUDAD AUTONOMA DE BUENOS AIRES",
        CABA: "CIUDAD AUTONOMA DE BUENOS AIRES",
        "CAPITAL FEDERAL": "CIUDAD AUTONOMA DE BUENOS AIRES",
        "C.A.B.A.": "CIUDAD AUTONOMA DE BUENOS AIRES",
        "BUENOS AIRES": "BUENOS AIRES",
        "PROV. BUENOS AIRES": "BUENOS AIRES",
        "PROVINCIA DE BUENOS AIRES": "BUENOS AIRES",
        "ENTRE RIOS": "ENTRE RIOS",
        "ENTRE RÍOS": "ENTRE RIOS",
        TUCUMAN: "TUCUMAN",
        TUCUMÁN: "TUCUMAN",
        CORDOBA: "CORDOBA",
        CÓRDOBA: "CORDOBA",
      }

      return mapeoProvincias[prov] || prov
    }

    // ✅ AGRUPAR POR PROVINCIA (SIN IMPORTAR COORDENADAS INDIVIDUALES)
    prestadores.forEach((prestador) => {
      const provinciaOriginal = prestador.provincia?.trim() || "Sin Provincia"
      const provinciaNormalizada = normalizarProvincia(provinciaOriginal)

      if (!grupos[provinciaNormalizada]) {
        grupos[provinciaNormalizada] = []
      }
      grupos[provinciaNormalizada].push(prestador)
    })

    // ✅ COORDENADAS DEL CENTRO GEOGRÁFICO REAL DE CADA PROVINCIA
    const coordenadasProvincias: { [key: string]: { lat: number; lng: number } } = {
      "BUENOS AIRES": { lat: -36.6167, lng: -59.3833 }, // Centro geográfico real
      "CIUDAD AUTONOMA DE BUENOS AIRES": { lat: -34.6118, lng: -58.396 }, // Centro de CABA
      CORDOBA: { lat: -32.1423, lng: -63.8016 }, // Centro geográfico real
      "SANTA FE": { lat: -30.7069, lng: -60.9498 }, // Centro geográfico real
      MENDOZA: { lat: -34.6297, lng: -68.5845 }, // Centro geográfico real
      TUCUMAN: { lat: -26.9478, lng: -65.3647 }, // Centro geográfico real
      "ENTRE RIOS": { lat: -32.0588, lng: -59.2014 }, // Centro geográfico real
      SALTA: { lat: -24.2912, lng: -65.7692 }, // Centro geográfico real
      MISIONES: { lat: -26.8753, lng: -54.6516 }, // Centro geográfico real
      CORRIENTES: { lat: -28.7743, lng: -57.8017 }, // Centro geográfico real
      "SANTIAGO DEL ESTERO": { lat: -27.7824, lng: -63.2523 }, // Centro geográfico real
      "SAN JUAN": { lat: -30.8653, lng: -68.8894 }, // Centro geográfico real
      JUJUY: { lat: -23.8187, lng: -65.6956 }, // Centro geográfico real
      "RIO NEGRO": { lat: -40.1591, lng: -67.9927 }, // Centro geográfico real
      NEUQUEN: { lat: -38.6443, lng: -70.1109 }, // Centro geográfico real
      FORMOSA: { lat: -24.8951, lng: -59.9324 }, // Centro geográfico real
      CHACO: { lat: -26.3864, lng: -60.7658 }, // Centro geográfico real
      CHUBUT: { lat: -44.0806, lng: -68.9064 }, // Centro geográfico real
      "SAN LUIS": { lat: -33.8688, lng: -66.1517 }, // Centro geográfico real
      CATAMARCA: { lat: -27.3358, lng: -66.9476 }, // Centro geográfico real
      "LA RIOJA": { lat: -29.6816, lng: -66.8456 }, // Centro geográfico real
      "SANTA CRUZ": { lat: -48.8064, lng: -69.9592 }, // Centro geográfico real
      "LA PAMPA": { lat: -37.1316, lng: -64.8663 }, // Centro geográfico real
      "TIERRA DEL FUEGO": { lat: -54.0792, lng: -67.9194 }, // Centro geográfico real
    }

    // ✅ CREAR UN SOLO CLUSTER POR PROVINCIA
    const resultado = Object.entries(grupos).map(([provincia, prestadores]) => {
      const coords = coordenadasProvincias[provincia] || { lat: -34.6037, lng: -58.3816 }

      console.log(`📍 ${provincia}: ${prestadores.length} prestadores en (${coords.lat}, ${coords.lng})`)

      return {
        id: provincia,
        nombre: provincia,
        count: prestadores.length,
        latitud: coords.lat,
        longitud: coords.lng,
        prestadores: prestadores,
        provincia: provincia,
      }
    })

    console.log("✅ UN CLUSTER POR PROVINCIA:")
    resultado
      .sort((a, b) => b.count - a.count)
      .forEach((grupo) => {
        console.log(`  ${grupo.nombre}: ${grupo.count} prestadores`)
      })

    return resultado
  }

  // ✅ FUNCIÓN MEJORADA PARA CREAR CLUSTERS GEOGRÁFICOS
  const crearClustersGeograficos = (prestadores: Prestador[], provincia: string): ClusterGeografico[] => {
    console.log(`🗺️ Creando clusters geográficos para ${provincia} con ${prestadores.length} prestadores`)

    // ✅ VALIDAR ANTES DE CREAR CLUSTERS
    validarCoherenciaGeografica(prestadores, provincia)

    // Filtrar prestadores con coordenadas válidas
    const prestadoresConCoordenadas = prestadores.filter(
      (p) => p.latitud && p.longitud && !isNaN(p.latitud) && !isNaN(p.longitud),
    )

    console.log(`📍 Prestadores con coordenadas válidas: ${prestadoresConCoordenadas.length}`)

    if (prestadoresConCoordenadas.length === 0) {
      console.log("❌ No hay prestadores con coordenadas válidas")
      return []
    }

    // ✅ MOSTRAR MUESTRA DE PRESTADORES PARA DEBUG
    console.log(`🔍 Muestra de prestadores en ${provincia}:`)
    prestadoresConCoordenadas.slice(0, 5).forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.nombre} - ${p.localidad} (${p.latitud}, ${p.longitud})`)
    })

    // ✅ DEFINIR PUNTOS DE REFERENCIA SEGÚN LA PROVINCIA
    let puntosReferencia: { nombre: string; lat: number; lng: number }[] = []

    if (provincia.toUpperCase().includes("BUENOS AIRES") && !provincia.toUpperCase().includes("CIUDAD")) {
      puntosReferencia = [
        { nombre: "BUENOS AIRES - NORTE", lat: -34.0, lng: -58.5 },
        { nombre: "BUENOS AIRES - SUR", lat: -35.5, lng: -58.0 },
        { nombre: "BUENOS AIRES - OESTE", lat: -34.6, lng: -59.5 },
        { nombre: "BUENOS AIRES - CENTRO", lat: -36.0, lng: -60.0 },
        { nombre: "BUENOS AIRES - COSTA", lat: -38.0, lng: -57.5 },
      ]
    } else if (provincia.toUpperCase().includes("ENTRE RIOS")) {
      puntosReferencia = [
        { nombre: "ENTRE RIOS - NORTE", lat: -30.5, lng: -59.5 },
        { nombre: "ENTRE RIOS - CENTRO", lat: -31.7, lng: -60.5 },
        { nombre: "ENTRE RIOS - SUR", lat: -33.0, lng: -58.5 },
      ]
    } else if (provincia.toUpperCase().includes("TUCUMAN")) {
      puntosReferencia = [
        { nombre: "TUCUMAN - NORTE", lat: -26.5, lng: -65.0 },
        { nombre: "TUCUMAN - CENTRO", lat: -26.8, lng: -65.2 },
        { nombre: "TUCUMAN - SUR", lat: -27.2, lng: -65.5 },
      ]
    } else {
      // Para otras provincias, crear clusters automáticamente
      const latitudes = prestadoresConCoordenadas.map((p) => p.latitud!)
      const longitudes = prestadoresConCoordenadas.map((p) => p.longitud!)

      const latMin = Math.min(...latitudes)
      const latMax = Math.max(...latitudes)
      const lngMin = Math.min(...longitudes)
      const lngMax = Math.max(...longitudes)

      puntosReferencia = [
        { nombre: `${provincia} - NORTE`, lat: latMax - (latMax - latMin) * 0.25, lng: (lngMin + lngMax) / 2 },
        { nombre: `${provincia} - SUR`, lat: latMin + (latMax - latMin) * 0.25, lng: (lngMin + lngMax) / 2 },
        { nombre: `${provincia} - ESTE`, lat: (latMin + latMax) / 2, lng: lngMax - (lngMax - lngMin) * 0.25 },
        { nombre: `${provincia} - OESTE`, lat: (latMin + latMax) / 2, lng: lngMin + (lngMax - lngMin) * 0.25 },
      ]
    }

    // ✅ ASIGNAR PRESTADORES AL CLUSTER MÁS CERCANO
    const clusters: { [key: string]: Prestador[] } = {}
    puntosReferencia.forEach((punto) => {
      clusters[punto.nombre] = []
    })

    prestadoresConCoordenadas.forEach((prestador) => {
      let clusterMasCercano = puntosReferencia[0].nombre
      let distanciaMinima = Number.POSITIVE_INFINITY

      puntosReferencia.forEach((punto) => {
        const distancia = Math.sqrt(
          Math.pow(prestador.latitud! - punto.lat, 2) + Math.pow(prestador.longitud! - punto.lng, 2),
        )

        if (distancia < distanciaMinima) {
          distanciaMinima = distancia
          clusterMasCercano = punto.nombre
        }
      })

      clusters[clusterMasCercano].push(prestador)
    })

    // ✅ CREAR CLUSTERS FINALES
    const clustersFinales: ClusterGeografico[] = []

    Object.entries(clusters).forEach(([nombreCluster, prestadores]) => {
      if (prestadores.length === 0) return

      if (prestadores.length > 1500) {
        const subClusters = Math.ceil(prestadores.length / 1200)
        for (let i = 0; i < subClusters; i++) {
          const inicio = i * 1200
          const fin = Math.min((i + 1) * 1200, prestadores.length)
          const subPrestadores = prestadores.slice(inicio, fin)

          if (subPrestadores.length > 0) {
            const latPromedio = subPrestadores.reduce((sum, p) => sum + p.latitud!, 0) / subPrestadores.length
            const lngPromedio = subPrestadores.reduce((sum, p) => sum + p.longitud!, 0) / subPrestadores.length

            clustersFinales.push({
              id: `${nombreCluster}-${i + 1}`,
              nombre: `${nombreCluster} (${i + 1})`,
              count: subPrestadores.length,
              latitud: latPromedio,
              longitud: lngPromedio,
              prestadores: subPrestadores,
              provincia: provincia,
            })
          }
        }
      } else {
        const latPromedio = prestadores.reduce((sum, p) => sum + p.latitud!, 0) / prestadores.length
        const lngPromedio = prestadores.reduce((sum, p) => sum + p.longitud!, 0) / prestadores.length

        clustersFinales.push({
          id: nombreCluster,
          nombre: nombreCluster,
          count: prestadores.length,
          latitud: latPromedio,
          longitud: lngPromedio,
          prestadores: prestadores,
          provincia: provincia,
        })
      }
    })

    console.log(`✅ Clusters creados para ${provincia}:`)
    clustersFinales.forEach((cluster) => {
      console.log(`  ${cluster.nombre}: ${cluster.count} prestadores (${cluster.latitud}, ${cluster.longitud})`)
    })

    return clustersFinales.filter((c) => c.count > 0)
  }

  // ✅ CARGAR TODOS LOS PRESTADORES (VISTA INICIAL) CON FILTROS
  const cargarTodosPrestadores = async () => {
    console.log("🌍 Cargando TODOS los prestadores con filtros:", { especialidad, prestadorSeleccionado })
    setLoading(true)

    try {
      const params = new URLSearchParams()
      params.append("lat", "-34.6037")
      params.append("lng", "-58.3816")
      params.append("radio", "5000")
      params.append("todos", "true")

      if (especialidad && especialidad.trim() !== "") {
        params.append("especialidad", especialidad)
        console.log("🩺 Aplicando filtro de especialidad:", especialidad)
      }
      if (prestadorSeleccionado && prestadorSeleccionado.trim() !== "") {
        params.append("prestador", prestadorSeleccionado)
        console.log("👨‍⚕️ Aplicando filtro de prestador:", prestadorSeleccionado)
      }

      const response = await fetch(`/api/cartilla/buscar-cercanos?${params}`)
      const data = await response.json()

      if (data.success) {
        const prestadores = data.prestadores || []
        setTodosPrestadores(prestadores)

        console.log("✅ Prestadores cargados:", prestadores.length)

        const provinciasClusters = agruparPorProvincia(prestadores)
        setProvincias(provinciasClusters)
        setPrestadores([])
        setClustersActuales([])
        setVistaActual("provincias")
        setProvinciaSeleccionada(null)
        setClusterSeleccionado(null)

        console.log("🏛️ Provincias finales:", provinciasClusters.length)
      }
    } catch (error) {
      console.error("❌ Error cargando prestadores:", error)
    } finally {
      setLoading(false)
    }
  }

  // ✅ BUSCAR PRESTADORES POR UBICACIÓN ESPECÍFICA
  const buscarPrestadoresPorUbicacion = async (coordenadas: Coordenadas) => {
    console.log("🔍 Buscando prestadores por ubicación específica:", coordenadas)
    setLoading(true)

    try {
      const params = new URLSearchParams()
      params.append("lat", coordenadas.latitud.toString())
      params.append("lng", coordenadas.longitud.toString())
      params.append("radio", radioBusqueda.toString())

      if (especialidad && especialidad.trim() !== "") {
        params.append("especialidad", especialidad)
      }
      if (prestadorSeleccionado && prestadorSeleccionado.trim() !== "") {
        params.append("prestador", prestadorSeleccionado)
      }

      const response = await fetch(`/api/cartilla/buscar-cercanos?${params}`)
      const data = await response.json()

      if (data.success) {
        const prestadoresEncontrados = data.prestadores || []
        console.log("✅ Prestadores encontrados:", prestadoresEncontrados.length)

        setPrestadores(prestadoresEncontrados)
        setProvincias([])
        setClustersActuales([])
        setVistaActual("prestadores")
        setProvinciaSeleccionada(null)
        setClusterSeleccionado(null)
      }
    } catch (error) {
      console.error("❌ Error buscando prestadores por ubicación:", error)
    } finally {
      setLoading(false)
    }
  }

  // ✅ HANDLE CLICK EN PROVINCIA CON FILTROS MANTENIDOS
  const handleProvinciaClick = (provinciaData: any) => {
    console.log("🏛️ Click en provincia:", provinciaData.nombre, "con filtros:", { especialidad, prestadorSeleccionado })

    const provinciaCompleta = provincias.find((p) => p.nombre === provinciaData.nombre)
    if (!provinciaCompleta) return

    // ✅ APLICAR FILTROS A LOS PRESTADORES DE LA PROVINCIA
    let prestadoresFiltrados = provinciaCompleta.prestadores

    if (especialidad && especialidad.trim() !== "") {
      prestadoresFiltrados = prestadoresFiltrados.filter((p) =>
        p.especialidad?.toLowerCase().includes(especialidad.toLowerCase()),
      )
      console.log(`🩺 Filtrado por especialidad "${especialidad}": ${prestadoresFiltrados.length} prestadores`)
    }

    if (prestadorSeleccionado && prestadorSeleccionado.trim() !== "") {
      prestadoresFiltrados = prestadoresFiltrados.filter((p) =>
        p.nombre?.toLowerCase().includes(prestadorSeleccionado.toLowerCase()),
      )
      console.log(`👨‍⚕️ Filtrado por prestador "${prestadorSeleccionado}": ${prestadoresFiltrados.length} prestadores`)
    }

    // ✅ SOLO BUENOS AIRES Y ENTRE RÍOS TIENEN SUB-CLUSTERS
    const provinciasSinSubClusters = ["BUENOS AIRES", "ENTRE RIOS"]

    const debeCrearSubClusters =
      provinciasSinSubClusters.includes(provinciaCompleta.nombre.toUpperCase()) && prestadoresFiltrados.length > 1000

    if (debeCrearSubClusters) {
      console.log(
        `📊 ${provinciaCompleta.nombre} tiene ${prestadoresFiltrados.length} prestadores filtrados → Creando sub-clusters`,
      )

      const clusters = crearClustersGeograficos(prestadoresFiltrados, provinciaCompleta.nombre)

      if (clusters.length > 1) {
        setClustersActuales(clusters)
        setVistaActual("clusters")
        setProvinciaSeleccionada(provinciaCompleta.nombre)
        setClusterSeleccionado(null)
        setPrestadores([])

        setCoordenadasBusqueda({ latitud: provinciaCompleta.latitud, longitud: provinciaCompleta.longitud })
        setUbicacionSeleccionada({
          nombre: provinciaCompleta.nombre,
          coordenadas: { latitud: provinciaCompleta.latitud, longitud: provinciaCompleta.longitud },
        })
      } else {
        // Si solo hay un cluster, mostrar prestadores directamente
        const prestadoresConCoordenadas = prestadoresFiltrados.filter(
          (p) => p.latitud && p.longitud && !isNaN(p.latitud) && !isNaN(p.longitud),
        )

        setPrestadores(prestadoresConCoordenadas)
        setVistaActual("prestadores")
        setProvinciaSeleccionada(provinciaCompleta.nombre)
        setClusterSeleccionado(null)
        setClustersActuales([])

        setCoordenadasBusqueda({ latitud: provinciaCompleta.latitud, longitud: provinciaCompleta.longitud })
        setUbicacionSeleccionada({
          nombre: provinciaCompleta.nombre,
          coordenadas: { latitud: provinciaCompleta.latitud, longitud: provinciaCompleta.longitud },
        })
      }
    } else {
      // ✅ TODAS LAS DEMÁS PROVINCIAS: MOSTRAR PRESTADORES DIRECTAMENTE
      console.log(
        `📊 ${provinciaCompleta.nombre} tiene ${prestadoresFiltrados.length} prestadores filtrados → Mostrando directamente`,
      )

      const prestadoresConCoordenadas = prestadoresFiltrados.filter(
        (p) => p.latitud && p.longitud && !isNaN(p.latitud) && !isNaN(p.longitud),
      )

      setPrestadores(prestadoresConCoordenadas)
      setVistaActual("prestadores")
      setProvinciaSeleccionada(provinciaCompleta.nombre)
      setClusterSeleccionado(null)
      setClustersActuales([])

      setCoordenadasBusqueda({ latitud: provinciaCompleta.latitud, longitud: provinciaCompleta.longitud })
      setUbicacionSeleccionada({
        nombre: provinciaCompleta.nombre,
        coordenadas: { latitud: provinciaCompleta.latitud, longitud: provinciaCompleta.longitud },
      })
    }
  }

  // ✅ HANDLE CLICK EN CLUSTER CON FILTROS MANTENIDOS
  const handleClusterClick = (clusterData: any) => {
    console.log("🎯 Click en cluster:", clusterData.nombre, "con filtros:", { especialidad, prestadorSeleccionado })

    const cluster = clustersActuales.find((c) => c.nombre === clusterData.nombre)
    if (!cluster) return

    // ✅ APLICAR FILTROS A LOS PRESTADORES DEL CLUSTER
    let prestadoresFiltrados = cluster.prestadores

    if (especialidad && especialidad.trim() !== "") {
      prestadoresFiltrados = prestadoresFiltrados.filter((p) =>
        p.especialidad?.toLowerCase().includes(especialidad.toLowerCase()),
      )
    }

    if (prestadorSeleccionado && prestadorSeleccionado.trim() !== "") {
      prestadoresFiltrados = prestadoresFiltrados.filter((p) =>
        p.nombre?.toLowerCase().includes(prestadorSeleccionado.toLowerCase()),
      )
    }

    const prestadoresConCoordenadas = prestadoresFiltrados.filter(
      (p) => p.latitud && p.longitud && !isNaN(p.latitud) && !isNaN(p.longitud),
    )

    setPrestadores(prestadoresConCoordenadas)
    setVistaActual("prestadores")
    setClusterSeleccionado(cluster)

    setCoordenadasBusqueda({ latitud: cluster.latitud, longitud: cluster.longitud })
    setUbicacionSeleccionada({
      nombre: cluster.nombre,
      coordenadas: { latitud: cluster.latitud, longitud: cluster.longitud },
    })

    console.log(`📍 Mostrando ${prestadoresConCoordenadas.length} prestadores filtrados del cluster ${cluster.nombre}`)
  }

  // ✅ VOLVER A VISTA ANTERIOR
  const volverAtras = () => {
    if (vistaActual === "prestadores" && clusterSeleccionado) {
      setVistaActual("clusters")
      setClusterSeleccionado(null)
      setPrestadores([])
      setCoordenadasBusqueda({
        latitud: clustersActuales[0]?.latitud || -34.6037,
        longitud: clustersActuales[0]?.longitud || -58.3816,
      })
    } else if (vistaActual === "prestadores" || vistaActual === "clusters") {
      setVistaActual("provincias")
      setProvinciaSeleccionada(null)
      setClusterSeleccionado(null)
      setPrestadores([])
      setClustersActuales([])
      setCoordenadasBusqueda(null)
      setUbicacionSeleccionada(null)
    }
  }

  // ✅ FUNCIÓN PRINCIPAL DE BÚSQUEDA
  const buscarPrestadores = async () => {
    if (coordenadasBusqueda) {
      // ✅ BÚSQUEDA POR UBICACIÓN ESPECÍFICA
      await buscarPrestadoresPorUbicacion(coordenadasBusqueda)
    } else {
      // ✅ VISTA INICIAL: CLUSTERS PROVINCIALES
      await cargarTodosPrestadores()
    }
  }

  // ✅ LIMPIAR FILTROS Y VOLVER A VISTA INICIAL
  const limpiarFiltros = () => {
    setUbicacionSeleccionada(null)
    setCoordenadasBusqueda(null)
    setEspecialidad("")
    setPrestadorSeleccionado("")
    setNombrePrestador("")
    setProvinciaSeleccionada(null)
    setClusterSeleccionado(null)
    cargarTodosPrestadores()
  }

  // ✅ HANDLE UBICACIÓN SELECCIONADA
  const handleUbicacionSeleccionada = (ubicacion: UbicacionEncontrada | null, coordenadas?: Coordenadas) => {
    console.log("📍 Ubicación seleccionada:", ubicacion)
    setUbicacionSeleccionada(ubicacion)
    setCoordenadasBusqueda(coordenadas || ubicacion?.coordenadas || null)

    if (ubicacion && (coordenadas || ubicacion.coordenadas)) {
      // ✅ SI HAY UBICACIÓN ESPECÍFICA, BUSCAR AUTOMÁTICAMENTE
      const coords = coordenadas || ubicacion.coordenadas
      buscarPrestadoresPorUbicacion(coords)
    } else if (!ubicacion) {
      // ✅ SI SE QUITA LA UBICACIÓN, VOLVER A VISTA PROVINCIAL
      console.log("🧹 Ubicación quitada, volviendo a vista provincial")
      cargarTodosPrestadores()
    }
  }

  const handleEspecialidadSeleccionada = (esp: any) => {
    setEspecialidad(esp?.nombre || "")
  }

  const handleEspecialidadClear = () => {
    setEspecialidad("")
  }

  const handlePrestadorSeleccionado = (prestador: any) => {
    setPrestadorSeleccionado(prestador?.nombre || "")
  }

  const handlePrestadorClear = () => {
    setPrestadorSeleccionado("")
  }

  // ✅ CARGAR AL INICIO
  useEffect(() => {
    cargarTodosPrestadores()
  }, [])

  // ✅ RECARGAR CUANDO CAMBIAN FILTROS
  useEffect(() => {
    if (coordenadasBusqueda) {
      buscarPrestadoresPorUbicacion(coordenadasBusqueda)
    } else {
      cargarTodosPrestadores()
    }
  }, [especialidad, prestadorSeleccionado])

  // ✅ DATOS PARA EL MAPA
  const datosParaMapa =
    vistaActual === "provincias"
      ? provincias.map((p) => ({
          id: p.id,
          nombre: p.nombre,
          especialidad: `${p.count} prestadores`,
          localidad: "",
          provincia: p.nombre,
          domicilio: "",
          telefono: "",
          email: "",
          cuit: "",
          latitud: p.latitud,
          longitud: p.longitud,
          cluster: true,
          count: p.count,
        }))
      : vistaActual === "clusters"
        ? clustersActuales.map((c) => ({
            id: c.id,
            nombre: c.nombre,
            especialidad: `${c.count} prestadores`,
            localidad: "",
            provincia: c.provincia,
            domicilio: "",
            telefono: "",
            email: "",
            cuit: "",
            latitud: c.latitud,
            longitud: c.longitud,
            cluster: true,
            count: c.count,
          }))
        : prestadores.filter((p) => p.latitud && p.longitud && !isNaN(p.latitud) && !isNaN(p.longitud))

  const mapaKey = `${vistaActual}-${datosParaMapa.length}-${provinciaSeleccionada || "todas"}-${clusterSeleccionado?.nombre || "todos"}-${coordenadasBusqueda ? `${coordenadasBusqueda.latitud}-${coordenadasBusqueda.longitud}` : "sin-coords"}-${especialidad}-${prestadorSeleccionado}`
  const centroMapa = coordenadasBusqueda || { latitud: -34.6037, longitud: -58.3816 }
  const totalResultados =
    vistaActual === "provincias"
      ? provincias.reduce((sum, p) => sum + p.count, 0)
      : vistaActual === "clusters"
        ? clustersActuales.reduce((sum, c) => sum + c.count, 0)
        : prestadores.length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#00613c] text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-2">Cartilla Médica</h1>
          <p className="text-xl opacity-90">Encontrá prestadores cerca tuyo</p>
        </div>
      </div>

      <div className="container mx-auto p-6 max-w-7xl">
        {/* Layout principal */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8 h-[700px]">
          {/* Panel de búsqueda */}
          <div className="lg:col-span-2 h-full">
            <Card className="shadow-lg h-full">
              <CardContent className="p-4 h-full flex flex-col">
                <div className="space-y-4 flex-1 overflow-y-auto">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-[#00613c] flex items-center">
                      <Navigation className="mr-2 h-5 w-5" />
                      Buscar por Ubicación
                    </h2>
                    {(vistaActual === "clusters" || vistaActual === "prestadores") && (
                      <Button
                        onClick={volverAtras}
                        variant="outline"
                        size="sm"
                        className="text-[#00613c] border-[#00613c] hover:bg-[#00613c] hover:text-white"
                      >
                        <ArrowLeft className="mr-1 h-3 w-3" />
                        {vistaActual === "prestadores" && clusterSeleccionado ? "Clusters" : "Provincias"}
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium mb-1 text-gray-700">
                        📍 Ubicación (región, provincia, localidad, partido)
                      </label>
                      <BusquedaGeografica
                        onUbicacionSeleccionada={handleUbicacionSeleccionada}
                        placeholder="Ej: Paraná, Entre Ríos, CABA, etc..."
                      />
                    </div>

                    {coordenadasBusqueda && vistaActual === "prestadores" && !clusterSeleccionado && (
                      <div>
                        <label className="block text-xs font-medium mb-1 text-gray-700">
                          📏 Radio: {radioBusqueda} km
                        </label>
                        <input
                          type="range"
                          min="10"
                          max="200"
                          step="10"
                          value={radioBusqueda}
                          onChange={(e) => {
                            setRadioBusqueda(Number(e.target.value))
                            // ✅ RECARGAR AUTOMÁTICAMENTE AL CAMBIAR RADIO
                            if (coordenadasBusqueda) {
                              setTimeout(() => buscarPrestadoresPorUbicacion(coordenadasBusqueda), 300)
                            }
                          }}
                          className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-medium mb-1 text-gray-700">🩺 Especialidad</label>
                      <EspecialidadSearch
                        onSelect={handleEspecialidadSeleccionada}
                        onClear={handleEspecialidadClear}
                        value={especialidad}
                        placeholder="Buscar especialidad..."
                        localidad={ubicacionSeleccionada?.nombre}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-1 text-gray-700">👨‍⚕️ Prestador</label>
                      <CartillaSearch
                        onSelect={handlePrestadorSeleccionado}
                        onClear={handlePrestadorClear}
                        value={prestadorSeleccionado}
                        filters={{
                          especialidad,
                          localidad: ubicacionSeleccionada?.nombre,
                        }}
                        placeholder="Buscar prestador..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-1 text-gray-700">🔍 O buscar por nombre</label>
                      <Input
                        placeholder="Nombre del prestador..."
                        value={nombrePrestador}
                        onChange={(e) => setNombrePrestador(e.target.value)}
                        className="h-9"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={buscarPrestadores}
                      className="bg-[#00613c] hover:bg-[#004d30] flex-1 h-9"
                      disabled={loading}
                    >
                      <Search className="mr-1 h-3 w-3" />
                      {loading ? "Buscando..." : "Buscar"}
                    </Button>
                    <Button onClick={limpiarFiltros} variant="outline" size="sm" title="Limpiar todos los filtros">
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  </div>

                  {totalResultados > 0 && (
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                      <h3 className="font-semibold text-[#00613c] text-sm flex items-center">
                        <Map className="mr-1 h-3 w-3" />
                        {vistaActual === "provincias" && (
                          <>
                            {provincias.length} provincia{provincias.length !== 1 ? "s" : ""} con {totalResultados}{" "}
                            prestadores
                            {(especialidad || prestadorSeleccionado) && (
                              <span className="text-blue-600 ml-1">
                                (filtrado{especialidad && ` por ${especialidad}`}
                                {prestadorSeleccionado && ` por ${prestadorSeleccionado}`})
                              </span>
                            )}
                          </>
                        )}
                        {vistaActual === "clusters" && (
                          <>
                            {clustersActuales.length} cluster{clustersActuales.length !== 1 ? "s" : ""} en{" "}
                            {provinciaSeleccionada} con {totalResultados} prestadores
                            {(especialidad || prestadorSeleccionado) && (
                              <span className="text-blue-600 ml-1">(filtrado)</span>
                            )}
                          </>
                        )}
                        {vistaActual === "prestadores" && (
                          <>
                            {prestadores.length} prestador{prestadores.length !== 1 ? "es" : ""}{" "}
                            {ubicacionSeleccionada
                              ? `cerca de ${ubicacionSeleccionada.nombre}`
                              : clusterSeleccionado
                                ? `en ${clusterSeleccionado.nombre}`
                                : provinciaSeleccionada
                                  ? `en ${provinciaSeleccionada}`
                                  : ""}
                          </>
                        )}
                      </h3>
                      <div className="text-xs text-blue-600 font-medium mt-1">
                        {vistaActual === "provincias" && "💡 Hacé click en una provincia para explorar"}
                        {vistaActual === "clusters" && "💡 Hacé click en un cluster para ver prestadores"}
                        {vistaActual === "prestadores" &&
                          (ubicacionSeleccionada
                            ? `📍 Prestadores en radio de ${radioBusqueda}km`
                            : "📍 Prestadores individuales")}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel del mapa */}
          <div className="lg:col-span-3 h-full">
            <div className="w-full h-full rounded-lg overflow-hidden shadow-lg bg-white">
              <MapaPrestadores
                key={mapaKey}
                prestadores={datosParaMapa}
                centroInicial={centroMapa}
                zoomInicial={
                  vistaActual === "prestadores" && ubicacionSeleccionada
                    ? 12
                    : vistaActual === "prestadores"
                      ? 10
                      : vistaActual === "clusters"
                        ? 8
                        : 5
                }
                onProvinciaClick={
                  vistaActual === "provincias"
                    ? handleProvinciaClick
                    : vistaActual === "clusters"
                      ? handleClusterClick
                      : undefined
                }
              />
            </div>
          </div>
        </div>

        {/* Lista de provincias */}
        {vistaActual === "provincias" && provincias.length > 0 && (
          <div className="space-y-4 mt-12">
            <div className="border-t border-gray-200 pt-8"></div>
            <h2 className="text-2xl font-bold text-[#00613c] flex items-center">
              <Map className="mr-3 h-6 w-6" />
              Prestadores por Provincia ({totalResultados} total)
              {(especialidad || prestadorSeleccionado) && (
                <span className="text-lg text-blue-600 ml-2">
                  - Filtrado{especialidad && ` por ${especialidad}`}
                  {prestadorSeleccionado && ` por ${prestadorSeleccionado}`}
                </span>
              )}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {provincias
                .sort((a, b) => b.count - a.count)
                .map((provincia) => (
                  <Card
                    key={provincia.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleProvinciaClick(provincia)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-[#00613c]">{provincia.nombre}</h3>
                        <div className="bg-[#00613c] text-white px-2 py-1 rounded-full text-sm font-bold">
                          {provincia.count}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="mr-1 h-3 w-3" />
                          <span>
                            {provincia.count} prestadores
                            {(provincia.nombre === "BUENOS AIRES" || provincia.nombre === "ENTRE RIOS") &&
                            provincia.count > 1000
                              ? " • Se divide en sub-clusters"
                              : " • Click para ver prestadores"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {/* Lista de clusters */}
        {vistaActual === "clusters" && clustersActuales.length > 0 && (
          <div className="space-y-4 mt-12">
            <div className="border-t border-gray-200 pt-8"></div>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#00613c] flex items-center">
                <Map className="mr-3 h-6 w-6" />
                Clusters en {provinciaSeleccionada} ({totalResultados} prestadores)
                {(especialidad || prestadorSeleccionado) && (
                  <span className="text-lg text-blue-600 ml-2">- Filtrado</span>
                )}
              </h2>
              <Button
                onClick={volverAtras}
                variant="outline"
                className="text-[#00613c] border-[#00613c] hover:bg-[#00613c] hover:text-white"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Ver todas las provincias
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clustersActuales
                .sort((a, b) => b.count - a.count)
                .map((cluster) => (
                  <Card
                    key={cluster.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleClusterClick(cluster)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-[#00613c]">{cluster.nombre}</h3>
                        <div className="bg-[#00613c] text-white px-2 py-1 rounded-full text-sm font-bold">
                          {cluster.count}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="mr-1 h-3 w-3" />
                          <span>{cluster.count} prestadores</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {/* Lista de prestadores */}
        {vistaActual === "prestadores" && prestadores.length > 0 && (
          <div className="space-y-4 mt-12">
            <div className="border-t border-gray-200 pt-8"></div>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#00613c] flex items-center">
                <User className="mr-3 h-6 w-6" />
                Prestadores
                {ubicacionSeleccionada
                  ? ` cerca de ${ubicacionSeleccionada.nombre}`
                  : clusterSeleccionado
                    ? ` en ${clusterSeleccionado.nombre}`
                    : provinciaSeleccionada
                      ? ` en ${provinciaSeleccionada}`
                      : ""}{" "}
                ({prestadores.length})
              </h2>
              <Button
                onClick={volverAtras}
                variant="outline"
                className="text-[#00613c] border-[#00613c] hover:bg-[#00613c] hover:text-white"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {clusterSeleccionado ? "Ver clusters" : "Ver provincias"}
              </Button>
            </div>
            <div className="grid gap-4">
              {prestadores.slice(0, 20).map((prestador) => (
                <Card key={prestador.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <h3 className="text-xl font-bold text-[#00613c] mb-2">{prestador.nombre}</h3>
                        <div className="space-y-2 text-gray-600">
                          <div className="flex items-center">
                            <Stethoscope className="mr-2 h-4 w-4 text-[#00613c]" />
                            <span className="font-medium">{prestador.especialidad}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="mr-2 h-4 w-4 text-[#00613c]" />
                            <span>
                              {prestador.localidad}, {prestador.provincia}
                              {prestador.distancia && ` • ${prestador.distancia.toFixed(1)}km`}
                            </span>
                          </div>
                          {prestador.domicilio && (
                            <div className="flex items-start">
                              <MapPin className="mr-2 h-4 w-4 text-[#00613c] mt-0.5" />
                              <span className="text-sm">{prestador.domicilio}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-3">
                        {prestador.telefono && (
                          <div className="flex items-center">
                            <Phone className="mr-2 h-4 w-4 text-[#00613c]" />
                            <span className="font-medium">{prestador.telefono}</span>
                          </div>
                        )}
                        {prestador.email && (
                          <div className="flex items-center">
                            <Mail className="mr-2 h-4 w-4 text-[#00613c]" />
                            <span className="text-sm">{prestador.email}</span>
                          </div>
                        )}
                        <Button
                          className="bg-[#00613c] hover:bg-[#004d30] w-full mt-4"
                          onClick={() => window.open(`tel:${prestador.telefono}`, "_self")}
                        >
                          <Phone className="mr-2 h-4 w-4" />
                          Llamar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {prestadores.length > 20 && (
              <div className="text-center py-4">
                <p className="text-gray-600">Mostrando los primeros 20 de {prestadores.length} resultados.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
