import { describe, expect, it } from "vitest";
import { categoryInputSchema, transactionInputSchema } from "./validation";

describe("local finance API validation", () => {
  it("accepts a valid transaction input", () => {
    expect(transactionInputSchema.safeParse({
      description: "Mercado",
      amount: 129.9,
      type: "upcoming",
      categoryId: "food",
      date: "2026-10-29",
    }).success).toBe(true);
  });

  it("rejects invalid dates, non-positive values, over-precision, and empty descriptions", () => {
    const base = { description: "Conta", amount: 10, type: "expense", categoryId: "home", date: "2026-10-29" };
    expect(transactionInputSchema.safeParse({ ...base, date: "2026-02-30" }).success).toBe(false);
    expect(transactionInputSchema.safeParse({ ...base, amount: 0 }).success).toBe(false);
    expect(transactionInputSchema.safeParse({ ...base, amount: 0.001 }).success).toBe(false);
    expect(transactionInputSchema.safeParse({ ...base, amount: 1.005 }).success).toBe(false);
    expect(transactionInputSchema.safeParse({ ...base, amount: 1.23 }).success).toBe(true);
    expect(transactionInputSchema.safeParse({ ...base, description: " " }).success).toBe(false);
  });

  it("trims and bounds custom category names", () => {
    expect(categoryInputSchema.parse({ label: "  Jardinagem  " })).toEqual({ label: "Jardinagem" });
    expect(categoryInputSchema.safeParse({ label: "   " }).success).toBe(false);
    expect(categoryInputSchema.safeParse({ label: "x".repeat(33) }).success).toBe(false);
  });
});
