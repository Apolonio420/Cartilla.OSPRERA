import { PrismaClient } from "@prisma/client"

// PrismaClient es adjuntado al objeto global en desarrollo para prevenir
// múltiples instancias del cliente Prisma en desarrollo
declare global {
  var prismaConsultaInstance: PrismaClient | undefined
}

export const prismaConsulta =
  global.prismaConsultaInstance ||
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_CONSULTA_URL || process.env.DATABASE_URL,
      },
    },
    log: ["query", "info", "warn", "error"],
  })

if (process.env.NODE_ENV !== "production") global.prismaConsultaInstance = prismaConsulta

// Export alias for compatibility
export const consultaClient = prismaConsulta
