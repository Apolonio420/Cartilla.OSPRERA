"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix para los iconos de Leaflet en Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

interface Prestador {
  id: string
  nombre: string
  especialidad: string
  localidad: string
  provincia: string
  domicilio: string
  telefono: string
  latitud: number
  longitud: number
  distancia?: number
  cluster?: boolean
  count?: number
}

interface MapaPrestadoresProps {
  prestadores: Prestador[]
  centroInicial?: { latitud: number; longitud: number } | null
  zoomInicial?: number
  onProvinciaClick?: (provincia: any) => void
}

export default function MapaPrestadores({
  prestadores,
  centroInicial,
  zoomInicial = 5,
  onProvinciaClick,
}: MapaPrestadoresProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current) return

    // Limpiar mapa anterior si existe
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    // Coordenadas por defecto (Buenos Aires)
    const defaultCenter: [number, number] = [-34.6037, -58.3816]
    const center: [number, number] = centroInicial
      ? [centroInicial.latitud, centroInicial.longitud]
      : prestadores.length > 0
        ? [prestadores[0].latitud, prestadores[0].longitud]
        : defaultCenter

    // Crear el mapa
    const map = L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      boxZoom: true,
      keyboard: true,
      dragging: true,
      touchZoom: true,
      maxBoundsViscosity: 0,
    }).setView(center, zoomInicial)

    // Agregar tiles de OpenStreetMap
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map)

    // Agregar marcadores para cada prestador
    const markers: L.Marker[] = []
    prestadores.forEach((prestador, index) => {
      if (prestador.latitud && prestador.longitud) {
        // ✅ DETECTAR SI ES CLUSTER DE PROVINCIA O PRESTADOR INDIVIDUAL
        const esCluster = prestador.cluster && prestador.count

        const marker = L.marker([prestador.latitud, prestador.longitud], {
          icon: L.divIcon({
            html: `
              <div style="
                background-color: ${esCluster ? "#00613c" : "#00613c"};
                color: white;
                border-radius: 50%;
                width: ${esCluster ? "40px" : "30px"};
                height: ${esCluster ? "40px" : "30px"};
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: ${esCluster ? "14px" : "12px"};
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                cursor: pointer;
                ${esCluster ? "border: 3px solid #004d30;" : ""}
              ">
                ${esCluster ? prestador.count : index + 1}
              </div>
            `,
            className: esCluster ? "provincia-cluster-icon" : "prestador-icon",
            iconSize: esCluster ? [40, 40] : [30, 30],
            iconAnchor: esCluster ? [20, 20] : [15, 15],
          }),
        })

        // ✅ MANEJAR CLICKS DIFERENTES PARA CLUSTERS VS PRESTADORES
        if (esCluster && onProvinciaClick) {
          // CLUSTER: Ejecutar drill-down AL HACER CLICK EN EL MARCADOR
          marker.on("click", (e) => {
            e.originalEvent?.stopPropagation()
            console.log("🏛️ Click en cluster:", prestador.nombre || prestador.provincia)
            onProvinciaClick({
              id: prestador.id,
              nombre: prestador.nombre || prestador.provincia,
              count: prestador.count,
              latitud: prestador.latitud,
              longitud: prestador.longitud,
              prestadores: [],
            })
          })

          // Popup informativo para clusters (SIN BOTÓN CLICKEABLE)
          const clusterPopup = `
    <div style="min-width: 200px; text-align: center;">
      <h3 style="margin: 0 0 8px 0; color: #00613c; font-size: 16px; font-weight: bold;">
        ${prestador.nombre || prestador.provincia}
      </h3>
      <p style="margin: 4px 0; font-size: 14px; color: #00613c; font-weight: bold;">
        ${prestador.count} prestadores
      </p>
      <div style="margin-top: 8px; font-size: 12px; color: #666;">
        💡 Haz click en el marcador para explorar
      </div>
    </div>
  `
          marker.bindPopup(clusterPopup)
        } else {
          // PRESTADOR INDIVIDUAL: Popup con información completa
          const popupContent = `
    <div style="min-width: 200px;">
      <h3 style="margin: 0 0 8px 0; color: #00613c; font-size: 14px; font-weight: bold;">
        ${prestador.nombre}
      </h3>
      <p style="margin: 4px 0; font-size: 12px;">
        <strong>Especialidad:</strong> ${prestador.especialidad}
      </p>
      <p style="margin: 4px 0; font-size: 12px;">
        <strong>Ubicación:</strong> ${prestador.localidad}, ${prestador.provincia}
      </p>
      ${
        prestador.domicilio
          ? `<p style="margin: 4px 0; font-size: 12px;"><strong>Dirección:</strong> ${prestador.domicilio}</p>`
          : ""
      }
      <p style="margin: 4px 0; font-size: 12px;">
        <strong>Teléfono:</strong> ${prestador.telefono}
      </p>
      ${
        prestador.distancia
          ? `<p style="margin: 4px 0; font-size: 12px; color: #00613c;"><strong>Distancia:</strong> ${prestador.distancia} km</p>`
          : ""
      }
      <div style="margin-top: 8px;">
        <a href="tel:${prestador.telefono}" 
           style="background-color: #00613c; color: white; padding: 4px 8px; text-decoration: none; border-radius: 4px; font-size: 12px;">
          📞 Llamar
        </a>
      </div>
    </div>
  `
          marker.bindPopup(popupContent)
        }

        marker.addTo(map)
        markers.push(marker)
      }
    })

    // Ajustar vista para mostrar todos los marcadores
    if (markers.length > 1 && !centroInicial) {
      const group = new L.FeatureGroup(markers)
      map.fitBounds(group.getBounds(), {
        padding: [20, 20],
        maxZoom: 15,
      })
    } else if (markers.length === 1) {
      map.setView([prestadores[0].latitud, prestadores[0].longitud], zoomInicial)
    }

    // Forzar redimensionamiento
    setTimeout(() => {
      map.invalidateSize()
    }, 100)

    mapInstanceRef.current = map

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [prestadores, centroInicial, zoomInicial, onProvinciaClick])

  return (
    <div
      ref={mapRef}
      className="w-full h-full"
      style={{
        width: "100%",
        height: "100%",
        margin: 0,
        padding: 0,
        border: "none",
        outline: "none",
      }}
    />
  )
}
