// Migrate + seed over HTTPS (Neon's SQL-over-HTTP endpoint) for networks that block Postgres port
// 5432, such as many campus Wi-Fi networks. Run: DATABASE_URL=<neon url> npm run db:setup:http
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";
import * as schema from "./schema";
import { seedDatabase } from "./seed";
import { getDatabaseUrl } from "./url";

async function main() {
  const db = drizzle(neon(getDatabaseUrl()), { schema });
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migrations applied");
  await seedDatabase(db as unknown as Parameters<typeof seedDatabase>[0]);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
