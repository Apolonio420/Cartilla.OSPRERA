import { PrismaClient } from "@prisma/client"

// PrismaClient es adjuntado al objeto global en desarrollo para prevenir
// múltiples instancias del cliente Prisma en desarrollo
declare global {
  var prismaGlobal: PrismaClient | undefined
}

export const prisma =
  global.prismaGlobal ||
  new PrismaClient({
    log: ["query", "info", "warn", "error"],
  })

if (process.env.NODE_ENV !== "production") global.prismaGlobal = prisma
