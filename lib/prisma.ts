import { PrismaClient } from "@prisma/client"

// PrismaClient es adjuntado al objeto global en desarrollo para evitar
// agotar el límite de conexiones a la base de datos durante hot-reloading
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query", "info", "warn", "error"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
