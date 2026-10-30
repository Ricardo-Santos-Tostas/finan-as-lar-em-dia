import { describe, expect, it } from "vitest";
import { categoryBreakdown, flowForPeriod, totalsFor } from "./calculations";
import { categoryById, createCustomExpenseCategory } from "./categories";
import { CATEGORIES } from "./demoData";
import { normalizePickerValue, periodRange } from "./dates";
import type { Transaction } from "./types";

describe("finance date ranges", () => {
  it("uses Monday through Sunday, including a week that crosses a year", () => {
    expect(periodRange("2025-01-01", "week")).toEqual({ start: "2024-12-30", end: "2025-01-05" });
  });

  it("includes leap day in a monthly range", () => {
    expect(periodRange("2024-02-12", "month")).toEqual({ start: "2024-02-01", end: "2024-02-29" });
  });

  it("normalizes month/year picker values and preserves day/week dates", () => {
    expect(normalizePickerValue("2026-07", "month")).toBe("2026-07-01");
    expect(normalizePickerValue("2026", "year")).toBe("2026-01-01");
    expect(normalizePickerValue("2026-07-14", "day")).toBe("2026-07-14");
    expect(normalizePickerValue("", "week")).toBeNull();
  });
});

describe("finance calculations", () => {
  const transactions: Transaction[] = [
    { id: "a", description: "Salário", amount: 100, type: "income", categoryId: "salary", date: "2024-12-31" },
    { id: "b", description: "Mercado", amount: 30, type: "expense", categoryId: "food", date: "2025-01-01" },
    { id: "c", description: "Fora da semana", amount: 25, type: "income", categoryId: "salary", date: "2025-01-06" },
  ];

  it("aggregates only the selected week into the matching chart days", () => {
    const range = periodRange("2025-01-01", "week");
    const flow = flowForPeriod(transactions, "week", range);
    expect(flow).toHaveLength(7);
    expect(flow[1]).toMatchObject({ Receitas: 100, Despesas: 0 });
    expect(flow[2]).toMatchObject({ Receitas: 0, Despesas: 30 });
    expect(flow.reduce((sum, point) => sum + point.Receitas + point.Despesas, 0)).toBe(130);
    expect(totalsFor(transactions.filter((item) => item.date >= range.start && item.date <= range.end))).toEqual({ income: 100, expenses: 30, balance: 70 });
  });

  it("rejects blank or duplicate custom expense categories and includes valid ones in summaries", () => {
    expect(createCustomExpenseCategory("   ", CATEGORIES)).toBeNull();
    const category = createCustomExpenseCategory("Veterinário", CATEGORIES);
    expect(category).toMatchObject({ label: "Veterinário", type: "expense" });
    expect(createCustomExpenseCategory(" VETERINÁRIO ", [...CATEGORIES, category!])).toBeNull();

    const items: Transaction[] = [{ id: "pet-1", description: "Consulta", amount: 120, type: "expense", categoryId: category!.id, date: "2025-01-01" }];
    const breakdown = categoryBreakdown(items, "expense", [...CATEGORIES, category!]);
    expect(breakdown).toHaveLength(1);
    expect(breakdown[0]).toMatchObject({ id: category!.id, label: "Veterinário", amount: 120 });
    expect(categoryById(category!.id, [...CATEGORIES, category!])).toEqual(category);
  });
});
