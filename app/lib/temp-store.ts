// Almacenamiento temporal en memoria para pruebas
interface AfiliadoTemp {
  dni: string
  telefono?: string
  email?: string
  otp_verified_at: Date
}

interface ReclamoTemp {
  id: string
  dni: string
  telefono?: string
  email?: string
  categoria: string
  subcategoria: string
  detalle: Record<string, any>
  estado: "nuevo" | "en proceso" | "cerrado"
  reiteraciones: number
  created_at: Date
  updated_at: Date
}

// Almacenamiento en memoria
const afiliados: Record<string, AfiliadoTemp> = {}
const reclamos: ReclamoTemp[] = []

// Funciones de utilidad
export const tempStore = {
  // Afiliados
  getAfiliado: (dni: string): AfiliadoTemp | null => {
    // Si el afiliado no existe, crearlo automáticamente
    if (!afiliados[dni]) {
      console.log("🔍 TEMP-STORE - Afiliado no encontrado, creando automáticamente:", dni)
      afiliados[dni] = {
        dni,
        otp_verified_at: new Date(),
      }
    }
    return afiliados[dni]
  },

  createAfiliado: (data: { dni: string; telefono?: string; email?: string }): AfiliadoTemp => {
    const afiliado: AfiliadoTemp = {
      ...data,
      otp_verified_at: new Date(),
    }
    afiliados[data.dni] = afiliado
    return afiliado
  },

  updateAfiliado: (dni: string, data: Partial<AfiliadoTemp>): AfiliadoTemp | null => {
    if (!afiliados[dni]) return null

    afiliados[dni] = {
      ...afiliados[dni],
      ...data,
    }

    return afiliados[dni]
  },

  // Reclamos
  getReclamos: (dni: string): ReclamoTemp[] => {
    return reclamos.filter((r) => r.dni === dni)
  },

  createReclamo: (data: {
    dni: string
    telefono?: string
    email?: string
    categoria: string
    subcategoria: string
    detalle: Record<string, any>
  }): ReclamoTemp => {
    const now = new Date()
    const reclamo: ReclamoTemp = {
      id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      dni: data.dni,
      telefono: data.telefono,
      email: data.email,
      categoria: data.categoria,
      subcategoria: data.subcategoria,
      detalle: data.detalle,
      estado: "nuevo",
      reiteraciones: 0,
      created_at: now,
      updated_at: now,
    }

    reclamos.push(reclamo)
    return reclamo
  },

  updateReclamo: (id: string, data: Partial<ReclamoTemp>): ReclamoTemp | null => {
    const index = reclamos.findIndex((r) => r.id === id)
    if (index === -1) return null

    reclamos[index] = {
      ...reclamos[index],
      ...data,
      updated_at: new Date(),
    }

    return reclamos[index]
  },

  // Para pruebas: crear algunos datos iniciales
  initTestData: () => {
    // Crear un afiliado de prueba
    if (!afiliados["12345678"]) {
      afiliados["12345678"] = {
        dni: "12345678",
        telefono: "1122334455",
        email: "test@example.com",
        otp_verified_at: new Date(),
      }

      // Crear algunos reclamos de prueba
      reclamos.push({
        id: "rec_test_1",
        dni: "12345678",
        telefono: "1122334455",
        email: "test@example.com",
        categoria: "App",
        subcategoria: "Error de acceso / app caída",
        detalle: {},
        estado: "nuevo",
        reiteraciones: 0,
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 días atrás
        updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      })

      reclamos.push({
        id: "rec_test_2",
        dni: "12345678",
        telefono: "1122334455",
        email: "test@example.com",
        categoria: "Cartilla",
        subcategoria: "No atiende",
        detalle: {
          localidad: "Buenos Aires",
          prestador: "Dr. Ejemplo",
          especialidad: "Cardiología",
        },
        estado: "en proceso",
        reiteraciones: 1,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 días atrás
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 día atrás
      })
    }
  },
}

// Inicializar datos de prueba
tempStore.initTestData()
