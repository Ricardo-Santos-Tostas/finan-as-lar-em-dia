import path from "node:path";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";

let db: ReturnType<typeof drizzle> | null = null;

export async function initializeLocalFinanceDatabase(): Promise<boolean> {
  const connectionString = process.env.FINANCE_DATABASE_URL;
  if (!connectionString) return false;

  db = drizzle(connectionString);
  try {
    await migrate(db, { migrationsFolder: path.resolve(process.cwd(), "drizzle/local-finance") });
    await db.execute(sql`SELECT 1`);
    return true;
  } catch (error) {
    await closeLocalFinanceDatabase();
    throw error;
  }
}

export function localFinanceDatabaseEnabled(): boolean {
  return Boolean(process.env.FINANCE_DATABASE_URL && db);
}

export function getLocalFinanceDatabase() {
  if (!db) throw new Error("Local finance database is not initialized");
  return db;
}

export async function closeLocalFinanceDatabase(): Promise<void> {
  const currentDb = db;
  db = null;
  if (!currentDb) return;
  await new Promise<void>((resolve, reject) => {
    currentDb.$client.end((error?: Error | null) => error ? reject(error) : resolve());
  });
}
