// Prisma 7 config — connection URLs live here, not in schema.prisma
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    // Use DATABASE_URL for queries. For Supabase with pgBouncer (pooled connection),
    // Prisma Migrate needs the direct connection — set DATABASE_URL to the direct URL
    // (port 5432) when running migrations, and to the pooler URL (port 6543) at runtime.
    url: process.env["DATABASE_URL"]!,
  },
});
