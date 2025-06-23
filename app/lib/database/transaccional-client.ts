import { PrismaClient } from "@prisma/client"

// PrismaClient es adjuntado al objeto global en desarrollo para prevenir
// múltiples instancias del cliente Prisma en desarrollo
declare global {
  var prismaTransaccionalClient: PrismaClient | undefined
}

export const prismaTransaccional =
  global.prismaTransaccionalClient ||
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    log: ["query", "info", "warn", "error"],
  })

if (process.env.NODE_ENV !== "production") global.prismaTransaccionalClient = prismaTransaccional
