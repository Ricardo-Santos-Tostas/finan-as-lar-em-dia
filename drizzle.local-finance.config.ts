import { defineConfig } from "drizzle-kit";

const connectionString = process.env.FINANCE_DATABASE_URL;

export default defineConfig({
  schema: "./drizzle/local-finance-schema.ts",
  out: "./drizzle/local-finance",
  dialect: "mysql",
  ...(connectionString ? { dbCredentials: { url: connectionString } } : {}),
});
