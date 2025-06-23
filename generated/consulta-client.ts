// Archivo temporal para el cliente de consulta
// En producción, este archivo será generado por Prisma

export class PrismaClient {
  farmacia = {
    findMany: async () => [],
    findFirst: async () => null,
    findUnique: async () => null,
    create: async () => ({}),
    update: async () => ({}),
    upsert: async () => ({}),
    delete: async () => ({}),
    deleteMany: async () => ({ count: 0 }),
  }

  especialidad = {
    findMany: async () => [],
    findFirst: async () => null,
    findUnique: async () => null,
    create: async () => ({}),
    update: async () => ({}),
    upsert: async () => ({}),
    delete: async () => ({}),
    deleteMany: async () => ({ count: 0 }),
  }

  cartillaMedica = {
    findMany: async () => [],
    findFirst: async () => null,
    findUnique: async () => null,
  }

  afiliadoSistema = {
    findUnique: async () => null,
    findMany: async () => [],
  }

  grupoFamiliar = {
    findMany: async () => [],
  }

  autorizacionMedica = {
    findMany: async () => [],
    findUnique: async () => null,
  }

  async $disconnect() {
    // No-op para compatibilidad
  }

  async $queryRaw(query: any) {
    return []
  }
}
