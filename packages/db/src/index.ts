// Re-export everything from @prisma/client (types like Prisma, PrismaClient, etc.)
export * from "@prisma/client";

// Export the singleton instance as default + named
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
