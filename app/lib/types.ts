export interface Afiliado {
  dni: string
  nombre?: string
  apellido?: string
  telefono?: string
  email?: string
  otp_verified_at?: Date
}

export interface Reclamo {
  id: string
  dni: string
  categoria: string
  subcategoria: string
  subsubcategoria?: string | null
  detalle: Record<string, any>
  estado: "nuevo" | "en_proceso" | "cerrado"
  prioridad: "baja" | "normal" | "alta" | "urgente"
  reiteraciones: number
  created_at: Date
  updated_at: Date
}

export interface SeguimientoReclamo {
  id: string
  reclamo_id: string
  estado_anterior?: string | null
  estado_nuevo: string
  comentario?: string | null
  tipo: "sistema" | "beneficiario" | "operador"
  created_at: Date
}

export interface AuthFormData {
  dni: string
  telefono?: string
  email?: string
}

export interface OtpFormData {
  otp: string
}

export interface ReclamoFormData {
  categoria: string
  subcategoria: string
  subsubcategoria?: string // Opcional
  detalle: Record<string, any>
}

export type CategoriaReclamo =
  | "APP"
  | "CONSULTA AFILIATORIA"
  | "0800 Call Center"
  | "DIABETES"
  | "DISCAPACIDAD"
  | "SALUD SEXUAL"
  | "CRÓNICAS"
  | "TRATAMIENTOS ESPECIALES"
  | "PRÓTESIS"
  | "RED DE FARMACIAS"
  | "CARTILLA"
  | "PLAN MATERNO INFANTIL"

// ✅ Estructura flexible para soportar 2 o más niveles
export interface Campo {
  nombre: string
  tipo:
    | "text"
    | "select"
    | "radio"
    | "search_localidad"
    | "search_especialidad"
    | "search_farmacia"
    | "search_cartilla"
    | "search_red_farmacias"
    | "search_region" // Nuevo tipo de campo
  label: string
  required: boolean
  opciones?: string[]
}

export interface Subcategoria {
  label: string
  campos?: Campo[]
  subsubcategorias?: Subcategoria[]
}

export interface SubcategoriasMap {
  [key: string]: Subcategoria[]
}

export interface Localidad {
  id: string
  nombre: string
  provincia?: string
  codigo_postal?: string
  fuente?: string
}

export interface Especialidad {
  id: string
  nombre: string
  codigo?: string
  fuente?: string
}

export interface Prestador {
  id: string
  nombre: string
  especialidad?: string
  localidad?: string
  provincia?: string
  direccion?: string
  telefono?: string
  fuente?: string
}

export interface FarmaciaRed {
  id: string
  nombre: string
  zona?: string
  region?: string
  domicilio?: string
  latitud?: number
  longitud?: number
  codigo?: string
  fuente?: string
}

// Nueva interfaz para regiones
export interface Region {
  id: string
  nombre: string
  tipo: "macro" | "micro"
  region_macro?: string
  region_micro?: string
  localidades_count?: number
}

export interface ReclamoData {
  categoria: string
  subcategoria: string
  detalle: Record<string, any>
}
