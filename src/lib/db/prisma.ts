import "server-only";

import { Prisma, PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const databaseConfigured = Boolean(process.env.DATABASE_URL);

/**
 * Database connectivity is transient with serverless Postgres providers.
 * Keep provider diagnostics on the server rather than exposing them to the admin UI.
 */
export function isDatabaseConnectionError(error: unknown) {
  if (error instanceof Prisma.PrismaClientInitializationError) return true;

  return (
    typeof error === "object" &&
    error !== null &&
    "errorCode" in error &&
    ["P1000", "P1001", "P1002", "P1017"].includes(
      String(error.errorCode)
    )
  );
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return new PrismaClient({
    datasources: {
      db: {
        url: connectionString,
      },
    },
  });
}

/**
 * Creates the Prisma client only when it is actually used.
 * This prevents Prisma from connecting/initializing during
 * Next.js build-time module evaluation.
 */
function getPrismaClient() {
  if (!databaseConfigured) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }

  return globalForPrisma.prisma;
}

/**
 * Lazy Prisma proxy.
 *
 * Existing code can continue using:
 *   prisma.product.findMany()
 *   prisma.order.findUnique()
 *   prisma.$transaction()
 *
 * Prisma itself is only initialized when one of those properties
 * is accessed at runtime.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = getPrismaClient();

    return Reflect.get(client, property);
  },
});