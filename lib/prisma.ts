import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Configure connection for Supabase to avoid prepared statement errors
// Supabase's connection pooler (pgBouncer) doesn't support prepared statements in transaction mode
// Solution: Use direct connection (port 5432) instead of pooler (port 6543)
const connectionString = process.env.DATABASE_URL || "";
const isSupabase = connectionString.includes("supabase");

let finalConnectionString = connectionString;

if (isSupabase) {
  try {
    const url = new URL(connectionString);
    
    // If using pooler port (6543), switch to direct connection (5432)
    if (url.port === "6543" || url.hostname.includes("pooler")) {
      url.port = "5432";
      url.hostname = url.hostname.replace(".pooler", "");
    }
    
    // Set connection_limit=1 to prevent connection reuse issues with prepared statements
    url.searchParams.set("connection_limit", "1");
    
    // Ensure schema is set
    if (!url.searchParams.has("schema")) {
      url.searchParams.set("schema", "public");
    }
    
    finalConnectionString = url.toString();
  } catch (error) {
    // If URL parsing fails, use original connection string
    console.warn("Failed to parse DATABASE_URL, using original:", error);
    finalConnectionString = connectionString;
  }
}

// Prisma 7: Create PostgreSQL adapter with connection pool
const pool = new Pool({ connectionString: finalConnectionString });
const adapter = new PrismaPg(pool);

const prismaOptions: Prisma.PrismaClientOptions = {
  adapter,
  log: process.env.NODE_ENV === "development"
    ? ["query", "error", "warn"]
    : ["error"],
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(prismaOptions);

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
