export type TransactionType = "income" | "expense";
export type PeriodMode = "day" | "week" | "month" | "year";
export type DateRange = { start: string; end: string };

export type FinanceCategory = {
  id: string;
  label: string;
  type: TransactionType;
  color: string;
  icon: string;
};

export type Transaction = {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  date: string;
};

export type TransactionInput = Omit<Transaction, "id">;
export type FlowPoint = { label: string; Receitas: number; Despesas: number };
