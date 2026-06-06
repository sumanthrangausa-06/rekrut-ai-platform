import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client Singleton
 * Prevents multiple instances in development (hot reload)
 */
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
