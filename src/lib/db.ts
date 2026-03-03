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
      min: 2,           // always keep 2 warm connections — zero cold start
      max: 10,          // burst up to 10 under load
      idleTimeoutMillis: 60_000,       // keep idle connections for 60s
      connectionTimeoutMillis: 5_000,  // fail fast if DB is unreachable
      allowExitOnIdle: false,          // don't let pool die in dev
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
