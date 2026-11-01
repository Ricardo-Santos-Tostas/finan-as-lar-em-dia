import { decimal, index, mysqlEnum, mysqlTable, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

export const localFinanceTransactions = mysqlTable("local_finance_transactions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  description: varchar("description", { length: 80 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  type: mysqlEnum("type", ["income", "expense", "upcoming"]).notNull(),
  categoryId: varchar("category_id", { length: 128 }).notNull(),
  date: varchar("date", { length: 10 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => [index("local_finance_transactions_date_idx").on(table.date)]);

export const localFinanceCategories = mysqlTable("local_finance_categories", {
  id: varchar("id", { length: 128 }).primaryKey(),
  label: varchar("label", { length: 32 }).notNull(),
  type: mysqlEnum("type", ["expense"]).default("expense").notNull(),
  color: varchar("color", { length: 16 }).notNull(),
  icon: varchar("icon", { length: 8 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [uniqueIndex("local_finance_categories_label_uq").on(table.label)]);

export const localFinanceSchema = {
  localFinanceTransactions,
  localFinanceCategories,
};