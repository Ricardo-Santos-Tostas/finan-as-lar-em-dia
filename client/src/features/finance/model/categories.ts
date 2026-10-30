import { CATEGORIES } from "./demoData";
import type { FinanceCategory } from "./types";

const customCategoryColors = ["#b58468", "#7f91ae", "#a18c67", "#779c91", "#b47f8a", "#8d89aa"];

export const categoryById = (categoryId: string, categories: FinanceCategory[] = CATEGORIES) =>
  categories.find((category) => category.id === categoryId)
  ?? CATEGORIES.find((category) => category.id === "other-expense")!;

export const createCustomExpenseCategory = (label: string, categories: FinanceCategory[] = CATEGORIES): FinanceCategory | null => {
  const normalizedLabel = label.trim();
  const normalizedKey = normalizedLabel.toLocaleLowerCase("pt-BR");
  if (!normalizedLabel || categories.some((category) => category.type === "expense" && category.label.toLocaleLowerCase("pt-BR") === normalizedKey)) return null;

  const slug = normalizedLabel.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "categoria";
  const suffix = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const customCount = categories.filter((category) => category.type === "expense" && category.id.startsWith("custom-")).length;
  return {
    id: `custom-${slug}-${suffix}`,
    label: normalizedLabel,
    type: "expense",
    color: customCategoryColors[customCount % customCategoryColors.length],
    icon: "✦",
  };
};
