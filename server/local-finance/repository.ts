import { randomUUID } from "node:crypto";
import { desc, eq } from "drizzle-orm";
import { localFinanceCategories, localFinanceTransactions } from "../../drizzle/local-finance-schema";
import type { FinanceCategory, Transaction, TransactionInput } from "../../client/src/features/finance/model/types";
import { getLocalFinanceDatabase } from "./database";

const toTransaction = (row: typeof localFinanceTransactions.$inferSelect): Transaction => ({
  id: row.id,
  description: row.description,
  amount: Number(row.amount),
  type: row.type,
  categoryId: row.categoryId,
  date: row.date,
});

const toCategory = (row: typeof localFinanceCategories.$inferSelect): FinanceCategory => ({
  id: row.id,
  label: row.label,
  type: "expense",
  color: row.color,
  icon: row.icon,
});

export async function listLocalTransactions(): Promise<Transaction[]> {
  const rows = await getLocalFinanceDatabase()
    .select()
    .from(localFinanceTransactions)
    .orderBy(desc(localFinanceTransactions.date), desc(localFinanceTransactions.createdAt));
  return rows.map(toTransaction);
}

export async function listLocalCategories(): Promise<FinanceCategory[]> {
  const rows = await getLocalFinanceDatabase()
    .select()
    .from(localFinanceCategories)
    .orderBy(localFinanceCategories.label);
  return rows.map(toCategory);
}

export async function createLocalTransaction(input: TransactionInput): Promise<Transaction> {
  const id = randomUUID();
  await getLocalFinanceDatabase().insert(localFinanceTransactions).values({
    id,
    description: input.description,
    amount: input.amount.toFixed(2),
    type: input.type,
    categoryId: input.categoryId,
    date: input.date,
  });
  const [created] = await getLocalFinanceDatabase().select().from(localFinanceTransactions).where(eq(localFinanceTransactions.id, id)).limit(1);
  if (!created) throw new Error("Could not read the created finance transaction");
  return toTransaction(created);
}

export async function updateLocalTransaction(id: string, input: TransactionInput): Promise<Transaction | null> {
  const database = getLocalFinanceDatabase();
  const [existing] = await database.select({ id: localFinanceTransactions.id }).from(localFinanceTransactions).where(eq(localFinanceTransactions.id, id)).limit(1);
  if (!existing) return null;
  await database.update(localFinanceTransactions).set({
    description: input.description,
    amount: input.amount.toFixed(2),
    type: input.type,
    categoryId: input.categoryId,
    date: input.date,
  }).where(eq(localFinanceTransactions.id, id));
  const [updated] = await database.select().from(localFinanceTransactions).where(eq(localFinanceTransactions.id, id)).limit(1);
  return updated ? toTransaction(updated) : null;
}

export async function deleteLocalTransaction(id: string): Promise<boolean> {
  const database = getLocalFinanceDatabase();
  const [existing] = await database.select({ id: localFinanceTransactions.id }).from(localFinanceTransactions).where(eq(localFinanceTransactions.id, id)).limit(1);
  if (!existing) return false;
  await database.delete(localFinanceTransactions).where(eq(localFinanceTransactions.id, id));
  return true;
}

export async function createLocalCategory(category: FinanceCategory): Promise<FinanceCategory> {
  await getLocalFinanceDatabase().insert(localFinanceCategories).values({
    id: category.id,
    label: category.label,
    type: "expense",
    color: category.color,
    icon: category.icon,
  });
  return category;
}
