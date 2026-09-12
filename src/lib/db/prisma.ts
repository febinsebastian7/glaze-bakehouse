import "server-only";

import { Prisma, PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const unconfiguredDatabaseUrl = "postgresql://placeholder:placeholder@127.0.0.1:5432/placeholder?sslmode=disable";

export const databaseConfigured = Boolean(process.env.DATABASE_URL);

/**
 * Database connectivity is transient with serverless Postgres providers. Keep
 * provider diagnostics on the server rather than exposing them to the admin UI.
 */
export function isDatabaseConnectionError(error: unknown) {
  if (error instanceof Prisma.PrismaClientInitializationError) return true;

  return (
    typeof error === "object" &&
    error !== null &&
    "errorCode" in error &&
    ["P1000", "P1001", "P1002", "P1017"].includes(String(error.errorCode))
  );
}

function createPrismaClient() {
  // The public catalogue may run without a database in local preview. It never
  // queries this client because `databaseConfigured` guards that code path.
  const connectionString = process.env.DATABASE_URL ?? unconfiguredDatabaseUrl;
  return new PrismaClient({ datasources: { db: { url: connectionString } } });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
