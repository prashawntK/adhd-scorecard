import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!globalForPrisma.pgPool) {
    globalForPrisma.pgPool = new Pool({
      connectionString: connectionString ?? "postgresql://localhost/nodb",
      min: 0,            // serverless: don't keep idle connections
      max: 3,            // limit connections per function instance
      idleTimeoutMillis: 10_000,       // close idle connections quickly
      connectionTimeoutMillis: 5_000,  // fail fast if DB is unreachable
      allowExitOnIdle: true,           // let pool die when idle (serverless)
    });
  }

  const adapter = new PrismaPg(globalForPrisma.pgPool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
