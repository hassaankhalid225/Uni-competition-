// Vercel's Neon integration names the variable after the chosen prefix (DATABASE_URL by default,
// STORAGE_URL, POSTGRES_URL…). Accept the common names so a deploy works whichever was picked.
const CANDIDATES = ["DATABASE_URL", "POSTGRES_URL", "STORAGE_URL", "DATABASE_POSTGRES_URL", "STORAGE_POSTGRES_URL"];

export function getDatabaseUrl(): string {
  for (const name of CANDIDATES) {
    const value = process.env[name];
    if (value) return value;
  }
  throw new Error(`No database connection string found. Set one of: ${CANDIDATES.join(", ")}`);
}
