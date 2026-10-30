import { CATEGORIES } from "./demoData";
import { parseDateKey, transactionsInRange } from "./dates";
import type { DateRange, FinanceCategory, FlowPoint, PeriodMode, Transaction, TransactionType } from "./types";

export const currency = (amount: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount);

export const totalsFor = (transactions: Transaction[]) => {
  const income = transactions.reduce((sum, item) => item.type === "income" ? sum + item.amount : sum, 0);
  const expenses = transactions.reduce((sum, item) => item.type === "expense" ? sum + item.amount : sum, 0);
  return { income, expenses, balance: income - expenses };
};

export const flowForPeriod = (transactions: Transaction[], mode: PeriodMode, range: DateRange): FlowPoint[] => {
  const start = parseDateKey(range.start);
  let points: FlowPoint[];
  if (mode === "day") {
    points = [{ label: "Dia", Receitas: 0, Despesas: 0 }];
  } else if (mode === "week") {
    points = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const day = new Intl.DateTimeFormat("pt-BR", { weekday: "short" }).format(date).replace(".", "");
      return { label: `${day} ${date.getDate()}`, Receitas: 0, Despesas: 0 };
    });
  } else if (mode === "month") {
    points = Array.from({ length: 5 }, (_, index) => ({ label: `${index + 1}ª sem.`, Receitas: 0, Despesas: 0 }));
  } else {
    points = Array.from({ length: 12 }, (_, index) => ({
      label: new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(new Date(start.getFullYear(), index, 1)).replace(".", ""),
      Receitas: 0,
      Despesas: 0,
    }));
  }

  for (const item of transactionsInRange(transactions, range)) {
    const date = parseDateKey(item.date);
    const index = mode === "day" ? 0
      : mode === "week" ? Math.round((date.getTime() - start.getTime()) / 86400000)
        : mode === "month" ? Math.ceil(date.getDate() / 7) - 1
          : date.getMonth();
    const point = points[index];
    if (point) point[item.type === "income" ? "Receitas" : "Despesas"] += item.amount;
  }
  return points;
};

export const categoryBreakdown = (
  transactions: Transaction[],
  type: TransactionType,
  categories: FinanceCategory[] = CATEGORIES,
) => {
  const sums = new Map<string, number>();
  for (const item of transactions) {
    if (item.type === type) sums.set(item.categoryId, (sums.get(item.categoryId) ?? 0) + item.amount);
  }
  return categories.filter((category) => category.type === type)
    .map((category) => ({ ...category, amount: sums.get(category.id) ?? 0 }))
    .filter((category) => category.amount > 0)
    .sort((a, b) => b.amount - a.amount);
};
