import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { getDatabaseUrl } from "./url";

// Reuse one connection pool across hot reloads in development.
const globalForDb = globalThis as unknown as { sql?: ReturnType<typeof postgres> };

const connectionString = getDatabaseUrl();

// `prepare: false` keeps us compatible with pooled (PgBouncer) URLs such as Neon's.
const sql = globalForDb.sql ?? postgres(connectionString, { prepare: false, max: 5 });
if (process.env.NODE_ENV !== "production") globalForDb.sql = sql;

export const db = drizzle(sql, { schema });
export * from "./schema";
