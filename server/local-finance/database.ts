import path from "node:path";
import mysql from "mysql2";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";

let db: ReturnType<typeof drizzle> | null = null;

const TEST_FINANCE_DATABASE_URL =
  "mysql://faDocUscFUz5Mq6.root:P92R754OEWId3GGE@gateway01.ap-northeast-1.prod.aws.tidbcloud.com:4000/lar_em_dia?ssl=true";

function financeDatabaseUrl(): string {
  const configured = process.env.FINANCE_DATABASE_URL?.trim();
  return configured || TEST_FINANCE_DATABASE_URL;
}

function openFinanceDatabase(connectionString: string) {
  const url = new URL(connectionString);
  const sslParam = url.searchParams.get("ssl");
  const sslIsBoolean = sslParam === "true" || sslParam === "1" || sslParam === "false" || sslParam === "0";
  const hostNeedsTls = url.hostname.endsWith(".tidbcloud.com");
  if (!sslParam && !hostNeedsTls) return drizzle(connectionString);
  if (sslParam && !sslIsBoolean) return drizzle(connectionString);

  url.searchParams.delete("ssl");
  const database = decodeURIComponent(url.pathname.replace(/^\//, ""));
  const pool = mysql.createPool({
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: url.username,
    password: url.password,
    database: database || undefined,
    ssl: sslParam === "false" || sslParam === "0" ? undefined : { rejectUnauthorized: true },
  });
  return drizzle(pool);
}

export async function initializeLocalFinanceDatabase(): Promise<boolean> {
  db = openFinanceDatabase(financeDatabaseUrl());
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
  return Boolean(db);
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
