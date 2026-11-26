// Applies SQL migrations from ./drizzle to DATABASE_URL. Run: npm run db:migrate
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { getDatabaseUrl } from "./url";

async function main() {
  const url = getDatabaseUrl();
  const sql = postgres(url, { max: 1, prepare: false });
  await migrate(drizzle(sql), { migrationsFolder: "./drizzle" });
  console.log("Migrations applied");
  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
